"""Prompt helpers for Cerebras and OpenAI structured generation."""

from typing import Iterable
from typing import List

from .models import ActionableCandidate
from .models import ActionableItem
from .models import ReviewAnalysis
from .models import ReviewInput


def build_amenity_mentions_messages(review: ReviewInput, amenities: List[str]) -> List[dict]:
    amenities_blob = "\n".join("- {0}".format(amenity) for amenity in amenities)
    return [
        {
            "role": "system",
            "content": (
                "You identify which amenities from a provided allowed list are "
                "explicitly mentioned or clearly referred to in a property review. "
                "Return JSON with a single key named mentioned_amenities containing "
                "an array of amenity names. Only return names from the provided list. "
                "Do not infer amenities that are not present in the review text."
            ),
        },
        {
            "role": "user",
            "content": (
                "Allowed amenities:\n"
                "{amenities}\n\n"
                "Property: {property_name}\n"
                "Review: {content}\n\n"
                "Return only amenities from the allowed list that are mentioned in "
                "this review."
            ).format(
                amenities=amenities_blob,
                property_name=review.property_name,
                content=review.content,
            ),
        },
    ]


def build_review_tags_messages(review: ReviewInput) -> List[dict]:
    return [
        {
            "role": "system",
            "content": (
                "You analyze hospitality and property reviews for downstream "
                "matching. Return JSON with a single key named review_tags. "
                "That object must contain exactly one key named review_tag. "
                "review_tag must be exactly one of these four values: Couples, "
                "Business Professionals, Solos, or Families. Choose the best "
                "segment for the reviewer based only on the review text. If the "
                "review does not provide enough evidence, choose Solos as the "
                "default."
            ),
        },
        {
            "role": "user",
            "content": (
                "Generate review tags for this review.\n"
                "Property: {property_name}\n"
                "Reviewer: {user_name}\n"
                "Date: {review_date}\n"
                "Review: {content}"
            ).format(
                property_name=review.property_name,
                user_name=review.user_name,
                review_date=review.review_date,
                content=review.content,
            ),
        },
    ]


def build_actionable_messages(
    review: ReviewInput, analysis: ReviewAnalysis
) -> List[dict]:
    return [
        {
            "role": "system",
            "content": (
                "You extract actionable items from hospitality or property reviews. "
                "Your job is to find concrete follow-up work that an operator, host, "
                "or property manager could act on. Return JSON with a single key "
                "named actionables containing an array. Each actionable must include "
                "canonical_text, category, dedupe_key, and source_excerpt.\n\n"
                "Only create an actionable item when the review implies at least one "
                "of these:\n"
                "- something is broken, missing, dirty, unsafe, unreliable, too slow, "
                "or otherwise not working properly\n"
                "- staff service or operations need correction or follow-up\n"
                "- a guest clearly requests an improvement, addition, or change\n"
                "- a recurring pain point is described in a way that suggests a fix\n\n"
                "Do not create an actionable item for:\n"
                "- praise-only comments\n"
                "- vague emotions without a fixable issue\n"
                "- general sentiment that does not point to an operational action\n"
                "- duplicate phrasings of the same issue within one review\n\n"
                "category rules:\n"
                "- major: broken core amenities, cleanliness failures, safety issues, "
                "serious service failures, missing essentials, unusable room features, "
                "or issues causing strong dissatisfaction\n"
                "- minor: improvement requests, moderate inconveniences, comfort "
                "upgrades, small maintenance items, or non-critical service changes\n\n"
                "canonical_text rules:\n"
                "- write one concise operator-facing sentence fragment\n"
                "- describe the underlying task, not the guest emotion\n"
                "- examples: Repair broken shower knob; Improve WiFi reliability; "
                "Extend breakfast hours; Improve room cleanliness consistency\n\n"
                "dedupe_key rules:\n"
                "- 2 to 6 words in snake_case\n"
                "- stable across equivalent wording\n"
                "- focus on the underlying issue, not the specific room number or guest\n\n"
                "source_excerpt rules:\n"
                "- quote or closely restate the exact review text that justifies the item\n"
                "- keep it short and specific\n\n"
                "Use the provided sentiment as supporting context only. A more "
                "negative sentiment can indicate stronger urgency, but never invent "
                "an issue that is not clearly present in the review. The review text "
                "is always the source of truth."
            ),
        },
        {
            "role": "user",
            "content": (
                "Extract actionable items from this review.\n"
                "Property: {property_name}\n"
                "Reviewer: {user_name}\n"
                "Date: {review_date}\n"
                "Sentiment label: {sentiment_label}\n"
                "Sentiment score: {sentiment_score}\n"
                "Review tag: {review_tag}\n"
                "Review: {content}\n\n"
                "Return every distinct actionable item described in the review. "
                "If a complaint clearly points to a fix, include it. If the guest "
                "asks for something to be added, changed, extended, improved, repaired, "
                "cleaned, or addressed, include it. If there is no real action to take, "
                "return an empty array."
            ).format(
                property_name=review.property_name,
                user_name=review.user_name,
                review_date=review.review_date,
                sentiment_label=analysis.sentiment_label,
                sentiment_score=analysis.sentiment_score,
                review_tag=analysis.review_tag,
                content=review.content,
            ),
        },
    ]


def build_match_messages(
    candidate: ActionableCandidate, existing_items: Iterable[ActionableItem]
) -> List[dict]:
    existing_lines = []
    for item in existing_items:
        existing_lines.append(
            "#{item_id} | {dedupe_key} | {category} | {status} | {text}".format(
                item_id=item.id,
                dedupe_key=item.dedupe_key,
                category=item.category,
                status=item.status,
                text=item.canonical_text,
            )
        )
    existing_blob = "\n".join(existing_lines) if existing_lines else "None"
    return [
        {
            "role": "system",
            "content": (
                "You decide whether a newly extracted actionable item matches an "
                "existing canonical actionable item. Return JSON with keys "
                "match_found and actionable_item_id. match_found must be true only "
                "when the candidate clearly represents the same underlying issue or "
                "improvement request as an existing item."
            ),
        },
        {
            "role": "user",
            "content": (
                "Candidate actionable item:\n"
                "canonical_text: {text}\n"
                "category: {category}\n"
                "dedupe_key: {dedupe_key}\n"
                "source_excerpt: {excerpt}\n\n"
                "Existing actionable items:\n"
                "{existing_blob}\n\n"
                "Return actionable_item_id only when there is a real semantic match."
            ).format(
                text=candidate.canonical_text,
                category=candidate.category,
                dedupe_key=candidate.dedupe_key,
                excerpt=candidate.source_excerpt,
                existing_blob=existing_blob,
            ),
        },
    ]


def build_listing_update_messages(
    current_listing: str, actionable_item: ActionableItem, resolution_notes: str
) -> List[dict]:
    return [
        {
            "role": "system",
            "content": (
                "You update property listing copy after an operational issue has "
                "been resolved. Return JSON with exactly one key named "
                "updated_listing. Preserve the listing's original tone, structure, "
                "and factual claims as much as possible. Add the resolved improvement "
                "naturally and concisely. Do not mention internal reviews, complaint "
                "tracking, action items, or that there was a previous problem unless "
                "the current listing already says that. Do not exaggerate."
            ),
        },
        {
            "role": "user",
            "content": (
                "Current listing:\n"
                "{current_listing}\n\n"
                "Resolved actionable insight:\n"
                "{actionable_text}\n\n"
                "Severity category: {category}\n"
                "Resolution notes: {resolution_notes}\n\n"
                "Rewrite the listing so the resolved improvement is reflected for "
                "future guests."
            ).format(
                current_listing=current_listing,
                actionable_text=actionable_item.canonical_text,
                category=actionable_item.category,
                resolution_notes=resolution_notes or "Resolved.",
            ),
        },
    ]
