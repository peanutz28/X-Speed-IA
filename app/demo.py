"""CLI demo runner for processing one review end-to-end."""

import argparse
import json
from pathlib import Path
from typing import Any
from typing import Dict

from .ai_clients import CerebrasReviewAnalyzer
from .ai_clients import CerebrasAmenityMentionAnalyzer
from .ai_clients import FallbackReviewTagAnalyzer
from .ai_clients import OpenAIActionableClient
from .ai_clients import OpenAIReviewTagAnalyzer
from .config import get_settings
from .hidden_gems import HiddenGemRepository
from .models import ReviewInput
from .repository import ReviewRepository
from .service import ReviewProcessingService


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Process one review through the full X-Speed-IA pipeline."
    )
    parser.add_argument(
        "--json-file",
        help="Path to a JSON file containing the review payload.",
    )
    parser.add_argument(
        "--user-name",
        default="Jane Doe",
        help="Reviewer name.",
    )
    parser.add_argument(
        "--user-profile-photo-url",
        default="https://example.com/jane.jpg",
        help="Reviewer profile photo URL.",
    )
    parser.add_argument(
        "--content",
        default=(
            "The location was great, but the shower knob was broken and the WiFi "
            "was unreliable. Breakfast could also be extended to 11am."
        ),
        help="Review text to process.",
    )
    parser.add_argument(
        "--review-date",
        default="2026-04-15",
        help="Review date in YYYY-MM-DD format.",
    )
    parser.add_argument(
        "--property-name",
        default="Downtown Suites",
        help="Property name.",
    )
    parser.add_argument(
        "--amenity",
        action="append",
        default=[],
        help="Amenity from the frontend list. Can be provided multiple times.",
    )
    return parser


def load_review_payload(args: argparse.Namespace) -> Dict[str, Any]:
    if args.json_file:
        raw = Path(args.json_file).read_text(encoding="utf-8")
        return json.loads(raw)
    return {
        "user_name": args.user_name,
        "user_profile_photo_url": args.user_profile_photo_url,
        "content": args.content,
        "review_date": args.review_date,
        "property_name": args.property_name,
        "amenities": args.amenity,
    }


def build_service() -> ReviewProcessingService:
    settings = get_settings()
    repository = ReviewRepository(settings.database_path)
    repository.initialize()
    hidden_gem_repository = HiddenGemRepository(settings.hidden_gem_database_path)
    hidden_gem_repository.initialize()
    return ReviewProcessingService(
        repository=repository,
        review_tagger=FallbackReviewTagAnalyzer(
            primary=CerebrasReviewAnalyzer(settings),
            fallback=OpenAIReviewTagAnalyzer(settings),
        ),
        openai_client=OpenAIActionableClient(settings),
        hidden_gem_repository=hidden_gem_repository,
        amenity_analyzer=CerebrasAmenityMentionAnalyzer(settings),
    )


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    payload = load_review_payload(args)

    review = ReviewInput(
        user_name=str(payload.get("user_name", "")).strip(),
        user_profile_photo_url=str(payload.get("user_profile_photo_url", "")).strip(),
        content=str(payload.get("content", "")).strip(),
        review_date=str(payload.get("review_date", "")).strip(),
        property_name=str(payload.get("property_name", "")).strip(),
        amenities=[
            str(amenity).strip()
            for amenity in payload.get("amenities", [])
            if str(amenity).strip()
        ],
    )

    missing_fields = [
        field_name
        for field_name, value in review.__dict__.items()
        if field_name != "amenities" and not str(value).strip()
    ]
    if missing_fields:
        raise SystemExit(
            "Missing required review fields: {0}".format(", ".join(missing_fields))
        )

    result = build_service().process_review(review)
    print(json.dumps(result.to_dict(), indent=2))


if __name__ == "__main__":
    main()
