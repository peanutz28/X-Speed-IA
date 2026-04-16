"""Minimal HTTP clients for Cerebras and OpenAI JSON generation."""

import json
from typing import Dict
from typing import List
from urllib.error import HTTPError
from urllib.request import Request
from urllib.request import urlopen

from .config import Settings
from .models import ActionableCandidate
from .models import ActionableItem
from .models import ReviewAnalysis
from .models import ReviewInput
from .models import ReviewTags
from .prompts import build_actionable_messages
from .prompts import build_amenity_mentions_messages
from .prompts import build_listing_update_messages
from .prompts import build_match_messages
from .prompts import build_review_tags_messages

ALLOWED_REVIEW_TAGS = {
    "Couples",
    "Business Professionals",
    "Solos",
    "Families",
}


class AIClientError(RuntimeError):
    """Raised when a provider returns an invalid or failed response."""


class AIRateLimitError(AIClientError):
    """Raised when a provider rejects a request because of rate limits."""


def _post_json(
    provider_name: str, url: str, api_key: str, payload: Dict[str, object]
) -> Dict[str, object]:
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": "Bearer {0}".format(api_key),
            "Content-Type": "application/json",
            "Accept": "application/json",
            "User-Agent": "X-Speed-IA/1.0 (+https://github.com/srao/X-Speed-IA)",
        },
        method="POST",
    )
    try:
        with urlopen(request, timeout=60) as response:
            raw = response.read().decode("utf-8")
    except HTTPError as exc:
        message = exc.read().decode("utf-8", errors="replace")
        if exc.code == 429 or "rate limit" in message.lower() or "rate_limit" in message.lower():
            raise AIRateLimitError(
                "{provider} request hit a rate limit with status {status}: {message}".format(
                    provider=provider_name, status=exc.code, message=message
                )
            )
        raise AIClientError(
            "{provider} request failed with status {status}: {message}".format(
                provider=provider_name, status=exc.code, message=message
            )
        )
    return json.loads(raw)


def _extract_message_json(response: Dict[str, object]) -> Dict[str, object]:
    choices = response.get("choices", [])
    if not choices:
        raise AIClientError("Provider response did not include choices.")
    message = choices[0].get("message", {})
    content = message.get("content", "")
    if not content:
        raise AIClientError("Provider response did not include message content.")
    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise AIClientError("Provider did not return valid JSON: {0}".format(exc))


class CerebrasReviewAnalyzer:
    """Generates structured review tags via Cerebras' chat completions API."""

    def __init__(self, settings: Settings):
        self._settings = settings

    def generate_review_tags(self, review: ReviewInput) -> ReviewTags:
        if not self._settings.cerebras_api_key:
            raise AIClientError("CEREBRAS_API_KEY is not set.")
        payload = {
            "model": self._settings.cerebras_model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": build_review_tags_messages(review),
        }
        response = _post_json(
            "Cerebras",
            "https://api.cerebras.ai/v1/chat/completions",
            self._settings.cerebras_api_key,
            payload,
        )
        parsed = _extract_message_json(response)
        return _parse_review_tags(parsed, "Cerebras")


class OpenAIReviewTagAnalyzer:
    """Fallback review tag generator using OpenAI."""

    def __init__(self, settings: Settings):
        self._settings = settings

    def generate_review_tags(self, review: ReviewInput) -> ReviewTags:
        if not self._settings.openai_api_key:
            raise AIClientError("OPENAI_API_KEY is not set.")
        payload = {
            "model": self._settings.openai_model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": build_review_tags_messages(review),
        }
        response = _post_json(
            "OpenAI",
            "https://api.openai.com/v1/chat/completions",
            self._settings.openai_api_key,
            payload,
        )
        parsed = _extract_message_json(response)
        return _parse_review_tags(parsed, "OpenAI")


class FallbackReviewTagAnalyzer:
    """Uses a fallback tag provider only when the primary provider is rate-limited."""

    def __init__(self, primary, fallback):
        self._primary = primary
        self._fallback = fallback

    def generate_review_tags(self, review: ReviewInput) -> ReviewTags:
        try:
            return self._primary.generate_review_tags(review)
        except AIRateLimitError:
            return self._fallback.generate_review_tags(review)


class CerebrasAmenityMentionAnalyzer:
    """Uses Cerebras to find which provided amenities are mentioned in a review."""

    def __init__(self, settings: Settings):
        self._settings = settings

    def extract_mentioned_amenities(
        self, review: ReviewInput, amenities: List[str]
    ) -> List[str]:
        if not amenities:
            return []
        if not self._settings.cerebras_api_key:
            raise AIClientError("CEREBRAS_API_KEY is not set.")

        normalized_lookup = {
            _normalize_amenity_name(amenity): amenity.strip()
            for amenity in amenities
            if amenity.strip()
        }
        payload = {
            "model": self._settings.cerebras_model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": build_amenity_mentions_messages(
                review, list(normalized_lookup.values())
            ),
        }
        response = _post_json(
            "Cerebras",
            "https://api.cerebras.ai/v1/chat/completions",
            self._settings.cerebras_api_key,
            payload,
        )
        parsed = _extract_message_json(response)
        raw_mentions = parsed.get("mentioned_amenities", [])
        if not isinstance(raw_mentions, list):
            raise AIClientError("Cerebras returned invalid mentioned_amenities.")

        mentioned = []
        for raw_amenity in raw_mentions:
            normalized = _normalize_amenity_name(str(raw_amenity))
            if normalized in normalized_lookup:
                mentioned.append(normalized_lookup[normalized])
        return sorted(set(mentioned))


def _parse_review_tags(parsed: Dict[str, object], provider_name: str) -> ReviewTags:
    raw_tags = parsed.get("review_tags", {})
    if not isinstance(raw_tags, dict):
        raise AIClientError(
            "{0} returned an invalid review_tags payload.".format(provider_name)
        )
    return ReviewTags(review_tag=_normalize_review_tag(raw_tags.get("review_tag")))


def _normalize_review_tag(value: object) -> str:
    normalized = str(value or "").strip().lower()
    for allowed_tag in ALLOWED_REVIEW_TAGS:
        if normalized == allowed_tag.lower():
            return allowed_tag
    return "Solos"


def _normalize_amenity_name(value: str) -> str:
    return " ".join(value.strip().lower().split())


class OpenAIActionableClient:
    """Extracts and matches actionable items with OpenAI."""

    def __init__(self, settings: Settings):
        self._settings = settings

    def extract_actionables(
        self, review: ReviewInput, analysis: ReviewAnalysis
    ) -> List[ActionableCandidate]:
        if not self._settings.openai_api_key:
            raise AIClientError("OPENAI_API_KEY is not set.")
        payload = {
            "model": self._settings.openai_model,
            "temperature": 0.1,
            "response_format": {"type": "json_object"},
            "messages": build_actionable_messages(review, analysis),
        }
        response = _post_json(
            "OpenAI",
            "https://api.openai.com/v1/chat/completions",
            self._settings.openai_api_key,
            payload,
        )
        parsed = _extract_message_json(response)
        candidates = []
        for raw_item in parsed.get("actionables", []):
            candidates.append(
                ActionableCandidate(
                    canonical_text=str(raw_item.get("canonical_text", "")).strip(),
                    category=str(raw_item.get("category", "")).strip().lower(),
                    dedupe_key=str(raw_item.get("dedupe_key", "")).strip().lower(),
                    source_excerpt=str(raw_item.get("source_excerpt", "")).strip(),
                )
            )
        return [
            candidate
            for candidate in candidates
            if candidate.canonical_text
            and candidate.dedupe_key
            and candidate.category in ("major", "minor")
        ]

    def match_existing_actionable(
        self, candidate: ActionableCandidate, existing_items: List[ActionableItem]
    ) -> int:
        if not existing_items:
            return 0
        if not self._settings.openai_api_key:
            raise AIClientError("OPENAI_API_KEY is not set.")
        payload = {
            "model": self._settings.openai_model,
            "temperature": 0,
            "response_format": {"type": "json_object"},
            "messages": build_match_messages(candidate, existing_items),
        }
        response = _post_json(
            "OpenAI",
            "https://api.openai.com/v1/chat/completions",
            self._settings.openai_api_key,
            payload,
        )
        parsed = _extract_message_json(response)
        if parsed.get("match_found") is True:
            try:
                return int(parsed.get("actionable_item_id", 0))
            except (TypeError, ValueError):
                return 0
        return 0

    def generate_updated_listing(
        self,
        current_listing: str,
        actionable_item: ActionableItem,
        resolution_notes: str = "",
    ) -> str:
        if not self._settings.openai_api_key:
            raise AIClientError("OPENAI_API_KEY is not set.")
        payload = {
            "model": self._settings.openai_model,
            "temperature": 0.2,
            "response_format": {"type": "json_object"},
            "messages": build_listing_update_messages(
                current_listing=current_listing,
                actionable_item=actionable_item,
                resolution_notes=resolution_notes,
            ),
        }
        response = _post_json(
            "OpenAI",
            "https://api.openai.com/v1/chat/completions",
            self._settings.openai_api_key,
            payload,
        )
        parsed = _extract_message_json(response)
        updated_listing = str(parsed.get("updated_listing", "")).strip()
        if not updated_listing:
            raise AIClientError("OpenAI returned an empty updated_listing.")
        return updated_listing
