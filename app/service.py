"""Core review-processing service."""

from typing import List

from .models import ActionableCandidate
from .models import ActionableItem
from .models import HiddenGemAmenity
from .models import ListingUpdateResult
from .models import ReviewInput
from .models import ReviewProcessingResult
from .models import StoredReview
from .repository import ReviewRepository
from .sentiment import DeterministicSentimentAnalyzer


class ReviewProcessingService:
    """Coordinates persistence, review analysis, extraction, and deduping."""

    def __init__(
        self,
        repository: ReviewRepository,
        review_tagger,
        openai_client,
        hidden_gem_repository=None,
        amenity_analyzer=None,
        sentiment_analyzer=None,
    ):
        self._repository = repository
        self._review_tagger = review_tagger
        self._openai_client = openai_client
        self._hidden_gem_repository = hidden_gem_repository
        self._amenity_analyzer = amenity_analyzer
        self._sentiment_analyzer = sentiment_analyzer or DeterministicSentimentAnalyzer()

    def process_review(self, review: ReviewInput) -> ReviewProcessingResult:
        review_tags = self._review_tagger.generate_review_tags(review)
        analysis = self._sentiment_analyzer.analyze(review, review_tags)
        stored_review = self._repository.create_review(review, analysis)

        candidates = self._dedupe_candidates(
            self._openai_client.extract_actionables(review, analysis)
        )
        actionable_items = []
        for candidate in candidates:
            actionable_item = self._match_or_create_actionable(candidate)
            self._repository.link_review_to_actionable_item(
                stored_review.id,
                actionable_item.id,
                candidate.dedupe_key,
                candidate.source_excerpt,
            )
            refreshed = self._repository.get_actionable_by_id(actionable_item.id)
            if refreshed:
                actionable_items.append(refreshed)

        hidden_gem_amenities = self._process_hidden_gem_amenities(stored_review)

        return ReviewProcessingResult(
            review=stored_review,
            actionable_items=actionable_items,
            hidden_gem_amenities=hidden_gem_amenities,
        )

    def resolve_actionable_item(
        self, actionable_item_id: int, resolution_notes: str = ""
    ) -> ActionableItem:
        resolved = self._repository.resolve_actionable_item(
            actionable_item_id, resolution_notes
        )
        if not resolved:
            raise ValueError("Actionable item {0} was not found.".format(actionable_item_id))
        return resolved

    def resolve_actionable_item_and_update_listing(
        self,
        actionable_item_id: int,
        current_listing: str,
        resolution_notes: str = "",
    ) -> ListingUpdateResult:
        resolved = self.resolve_actionable_item(actionable_item_id, resolution_notes)
        updated_listing = self._openai_client.generate_updated_listing(
            current_listing=current_listing,
            actionable_item=resolved,
            resolution_notes=resolution_notes,
        )
        refreshed = self._repository.save_listing_update(
            actionable_item_id, updated_listing
        )
        if not refreshed:
            raise ValueError("Actionable item {0} was not found.".format(actionable_item_id))
        return ListingUpdateResult(
            actionable_item=refreshed,
            updated_listing=updated_listing,
        )

    def list_actionable_items(self) -> List[ActionableItem]:
        return self._repository.list_actionable_items()

    def _process_hidden_gem_amenities(
        self, review: StoredReview
    ) -> List[HiddenGemAmenity]:
        if (
            not self._hidden_gem_repository
            or not self._amenity_analyzer
            or not review.amenities
        ):
            return []
        mentioned_amenities = self._amenity_analyzer.extract_mentioned_amenities(
            review, review.amenities
        )
        return self._hidden_gem_repository.record_review_amenities(
            review_id=review.id,
            amenity_catalog=review.amenities,
            mentioned_amenities=mentioned_amenities,
        )

    def _dedupe_candidates(
        self, candidates: List[ActionableCandidate]
    ) -> List[ActionableCandidate]:
        unique_candidates = {}
        for candidate in candidates:
            if candidate.dedupe_key not in unique_candidates:
                unique_candidates[candidate.dedupe_key] = candidate
        return list(unique_candidates.values())

    def _match_or_create_actionable(
        self, candidate: ActionableCandidate
    ) -> ActionableItem:
        exact_match = self._repository.get_actionable_by_dedupe_key(candidate.dedupe_key)
        if exact_match:
            return exact_match

        existing_items = self._repository.list_actionable_items()
        matched_id = self._openai_client.match_existing_actionable(
            candidate, existing_items
        )
        if matched_id:
            matched_item = self._repository.get_actionable_by_id(matched_id)
            if matched_item:
                return matched_item

        return self._repository.create_actionable_item(
            canonical_text=candidate.canonical_text,
            category=candidate.category,
            dedupe_key=candidate.dedupe_key,
        )
