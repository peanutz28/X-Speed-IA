"""Lightweight HTTP API for review ingestion and actionable tracking."""

import json
import re
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from http.server import ThreadingHTTPServer

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


SETTINGS = get_settings()
REPOSITORY = ReviewRepository(SETTINGS.database_path)
REPOSITORY.initialize()
HIDDEN_GEM_REPOSITORY = HiddenGemRepository(SETTINGS.hidden_gem_database_path)
HIDDEN_GEM_REPOSITORY.initialize()
SERVICE = ReviewProcessingService(
    repository=REPOSITORY,
    review_tagger=FallbackReviewTagAnalyzer(
        primary=CerebrasReviewAnalyzer(SETTINGS),
        fallback=OpenAIReviewTagAnalyzer(SETTINGS),
    ),
    openai_client=OpenAIActionableClient(SETTINGS),
    hidden_gem_repository=HIDDEN_GEM_REPOSITORY,
    amenity_analyzer=CerebrasAmenityMentionAnalyzer(SETTINGS),
)


class ReviewRequestHandler(BaseHTTPRequestHandler):
    """Implements the JSON API."""

    actionable_item_path = re.compile(r"^/actionable-items/(\d+)/resolve$")

    def do_OPTIONS(self) -> None:
        self.send_response(HTTPStatus.NO_CONTENT.value)
        self._send_cors_headers()
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header(
            "Access-Control-Allow-Headers", "Content-Type, Authorization"
        )
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/health":
            self._write_json(
                HTTPStatus.OK,
                {
                    "status": "ok",
                    "service": "x-speed-ia-review-api",
                },
            )
            return
        if self.path == "/actionable-items":
            items = [item.to_dict() for item in SERVICE.list_actionable_items()]
            self._write_json(HTTPStatus.OK, {"actionable_items": items})
            return
        self._write_json(HTTPStatus.NOT_FOUND, {"error": "Route not found."})

    def do_POST(self) -> None:
        if self.path == "/reviews":
            self._handle_create_review()
            return

        match = self.actionable_item_path.match(self.path)
        if match:
            self._handle_resolve_actionable_item(int(match.group(1)))
            return

        self._write_json(HTTPStatus.NOT_FOUND, {"error": "Route not found."})

    def _handle_create_review(self) -> None:
        try:
            payload = self._read_json()
        except json.JSONDecodeError:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON body."})
            return
        review = ReviewInput(
            user_name=str(payload.get("user_name", "")).strip(),
            user_profile_photo_url=str(
                payload.get("user_profile_photo_url", "")
            ).strip(),
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
            self._write_json(
                HTTPStatus.BAD_REQUEST,
                {
                    "error": "Missing required fields.",
                    "missing_fields": missing_fields,
                },
            )
            return
        try:
            result = SERVICE.process_review(review)
        except Exception as exc:  # pragma: no cover - safety for manual usage
            self._write_json(
                HTTPStatus.INTERNAL_SERVER_ERROR, {"error": str(exc)}
            )
            return
        self._write_json(HTTPStatus.CREATED, result.to_dict())

    def _handle_resolve_actionable_item(self, actionable_item_id: int) -> None:
        try:
            payload = self._read_json()
        except json.JSONDecodeError:
            self._write_json(HTTPStatus.BAD_REQUEST, {"error": "Invalid JSON body."})
            return
        resolution_notes = str(payload.get("resolution_notes", "")).strip()
        current_listing = str(payload.get("current_listing", "")).strip()
        try:
            if current_listing:
                result = SERVICE.resolve_actionable_item_and_update_listing(
                    actionable_item_id=actionable_item_id,
                    current_listing=current_listing,
                    resolution_notes=resolution_notes,
                )
                self._write_json(HTTPStatus.OK, result.to_dict())
                return
            item = SERVICE.resolve_actionable_item(actionable_item_id, resolution_notes)
        except ValueError as exc:
            self._write_json(HTTPStatus.NOT_FOUND, {"error": str(exc)})
            return
        self._write_json(HTTPStatus.OK, item.to_dict())

    def _read_json(self) -> dict:
        content_length = int(self.headers.get("Content-Length", "0"))
        if content_length <= 0:
            return {}
        raw = self.rfile.read(content_length).decode("utf-8")
        return json.loads(raw)

    def _write_json(self, status: HTTPStatus, payload: dict) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status.value)
        self._send_cors_headers()
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _send_cors_headers(self) -> None:
        self.send_header("Access-Control-Allow-Origin", SETTINGS.cors_allowed_origin)
        self.send_header("Vary", "Origin")

    def log_message(self, format: str, *args) -> None:
        return


def main() -> None:
    server = ThreadingHTTPServer((SETTINGS.host, SETTINGS.port), ReviewRequestHandler)
    print(
        "Review API listening on http://{host}:{port}".format(
            host=SETTINGS.host, port=SETTINGS.port
        )
    )
    server.serve_forever()


if __name__ == "__main__":
    main()
