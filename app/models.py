"""Typed models used across the review ingestion pipeline."""

from dataclasses import asdict
from dataclasses import dataclass
from dataclasses import field
from typing import Dict
from typing import List
from typing import Optional


@dataclass
class ReviewInput:
    user_name: str
    user_profile_photo_url: str
    content: str
    review_date: str
    property_name: str
    amenities: List[str] = field(default_factory=list)
    verdicts: Dict[str, str] = field(default_factory=dict)  # category → 'like'|'dislike'|'na'
    followup_answers: Dict[str, List[str]] = field(default_factory=dict)  # category → [reasons]
    voice_note_url: Optional[str] = None


@dataclass
class ReviewTags:
    review_tag: str

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class ReviewAnalysis:
    sentiment_label: str
    sentiment_score: float
    review_tag: str
    recent_review: bool

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class StoredReview:
    id: int
    created_at: str
    analysis: ReviewAnalysis
    user_name: str
    user_profile_photo_url: str
    content: str
    review_date: str
    property_name: str
    amenities: List[str] = field(default_factory=list)
    verdicts: Dict[str, str] = field(default_factory=dict)
    followup_answers: Dict[str, List[str]] = field(default_factory=dict)
    voice_note_url: Optional[str] = None

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class ActionableCandidate:
    canonical_text: str
    category: str
    dedupe_key: str
    source_excerpt: str = ""


@dataclass
class LinkedReview:
    review_id: int
    link_tag: str

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class ActionableItem:
    id: int
    canonical_text: str
    category: str
    dedupe_key: str
    status: str
    created_at: str
    resolved_at: Optional[str] = None
    resolution_notes: Optional[str] = None
    listing_update_text: Optional[str] = None
    listing_updated_at: Optional[str] = None
    linked_review_ids: List[int] = field(default_factory=list)
    linked_reviews: List[LinkedReview] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class HiddenGemAmenity:
    amenity: str
    mention_count: int
    total_reviews: int
    mention_rate: float
    hidden_gem: bool

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


@dataclass
class ListingUpdateResult:
    actionable_item: ActionableItem
    updated_listing: str

    def to_dict(self) -> Dict[str, object]:
        return {
            "actionable_item": self.actionable_item.to_dict(),
            "updated_listing": self.updated_listing,
        }


@dataclass
class ReviewProcessingResult:
    review: StoredReview
    actionable_items: List[ActionableItem]
    hidden_gem_amenities: List[HiddenGemAmenity] = field(default_factory=list)

    def to_dict(self) -> Dict[str, object]:
        return {
            "review": self.review.to_dict(),
            "actionable_items": [item.to_dict() for item in self.actionable_items],
            "hidden_gem_amenities": [
                amenity.to_dict() for amenity in self.hidden_gem_amenities
            ],
        }
