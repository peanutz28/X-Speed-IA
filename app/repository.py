"""SQLite persistence for reviews, tags, actionable items, and links."""

import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from typing import Generator
from typing import List
from typing import Optional

from .models import ActionableItem
from .models import LinkedReview
from .models import ReviewAnalysis
from .models import ReviewInput
from .models import StoredReview


class ReviewRepository:
    """Encapsulates persistence and retrieval logic."""

    REVIEW_SCHEMA_COLUMNS = (
        "id",
        "user_name",
        "user_profile_photo_url",
        "content",
        "review_date",
        "property_name",
        "sentiment_label",
        "sentiment_score",
        "review_tag",
        "recent_review",
        "created_at",
    )
    REVIEW_COLUMNS = (
        ("sentiment_label", "TEXT NOT NULL DEFAULT 'neutral'"),
        ("sentiment_score", "REAL NOT NULL DEFAULT 0"),
        ("review_tag", "TEXT NOT NULL DEFAULT 'Solos'"),
        ("recent_review", "INTEGER NOT NULL DEFAULT 0"),
    )
    REVIEW_ACTIONABLE_LINK_COLUMNS = (
        ("link_tag", "TEXT NOT NULL DEFAULT 'general_actionable'"),
    )
    ACTIONABLE_ITEM_COLUMNS = (
        ("listing_update_text", "TEXT"),
        ("listing_updated_at", "TEXT"),
    )

    def __init__(self, database_path: str):
        self._database_path = database_path

    @contextmanager
    def _connect(self) -> Generator[sqlite3.Connection, None, None]:
        directory = os.path.dirname(os.path.abspath(self._database_path))
        if directory:
            os.makedirs(directory, exist_ok=True)
        connection = sqlite3.connect(self._database_path)
        connection.row_factory = sqlite3.Row
        try:
            yield connection
            connection.commit()
        finally:
            connection.close()

    def initialize(self) -> None:
        with self._connect() as connection:
            connection.executescript(
                """
                CREATE TABLE IF NOT EXISTS reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_name TEXT NOT NULL,
                    user_profile_photo_url TEXT NOT NULL,
                    content TEXT NOT NULL,
                    review_date TEXT NOT NULL,
                    property_name TEXT NOT NULL,
                    sentiment_label TEXT NOT NULL,
                    sentiment_score REAL NOT NULL,
                    review_tag TEXT NOT NULL,
                    recent_review INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS actionable_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    canonical_text TEXT NOT NULL,
                    category TEXT NOT NULL CHECK(category IN ('major', 'minor')),
                    dedupe_key TEXT NOT NULL UNIQUE,
                    status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open', 'resolved')),
                    created_at TEXT NOT NULL,
                    resolved_at TEXT,
                    resolution_notes TEXT
                );

                CREATE TABLE IF NOT EXISTS review_actionable_links (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    review_id INTEGER NOT NULL,
                    actionable_item_id INTEGER NOT NULL,
                    link_tag TEXT NOT NULL,
                    source_excerpt TEXT,
                    created_at TEXT NOT NULL,
                    UNIQUE(review_id, actionable_item_id),
                    FOREIGN KEY(review_id) REFERENCES reviews(id),
                    FOREIGN KEY(actionable_item_id) REFERENCES actionable_items(id)
                );
                """
            )
            self._ensure_review_columns(connection)
            self._rebuild_reviews_table_if_needed(connection)
            self._ensure_actionable_item_columns(connection)
            self._ensure_review_actionable_link_columns(connection)

    def create_review(self, review: ReviewInput, analysis: ReviewAnalysis) -> StoredReview:
        created_at = datetime.utcnow().isoformat() + "Z"
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO reviews (
                    user_name,
                    user_profile_photo_url,
                    content,
                    review_date,
                    property_name,
                    sentiment_label,
                    sentiment_score,
                    review_tag,
                    recent_review,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    review.user_name,
                    review.user_profile_photo_url,
                    review.content,
                    review.review_date,
                    review.property_name,
                    analysis.sentiment_label,
                    analysis.sentiment_score,
                    analysis.review_tag,
                    int(analysis.recent_review),
                    created_at,
                ),
            )
            review_id = int(cursor.lastrowid)
        return StoredReview(
            id=review_id,
            created_at=created_at,
            analysis=analysis,
            **review.__dict__
        )

    def _ensure_review_columns(self, connection: sqlite3.Connection) -> None:
        existing_columns = {
            str(row["name"])
            for row in connection.execute("PRAGMA table_info(reviews)").fetchall()
        }
        for column_name, definition in self.REVIEW_COLUMNS:
            if column_name not in existing_columns:
                connection.execute(
                    "ALTER TABLE reviews ADD COLUMN {name} {definition}".format(
                        name=column_name, definition=definition
                    )
                )

    def _rebuild_reviews_table_if_needed(self, connection: sqlite3.Connection) -> None:
        rows = connection.execute("PRAGMA table_info(reviews)").fetchall()
        existing_columns = [str(row["name"]) for row in rows]
        if existing_columns == list(self.REVIEW_SCHEMA_COLUMNS):
            return

        connection.execute("PRAGMA foreign_keys = OFF")
        connection.execute("ALTER TABLE reviews RENAME TO reviews_legacy")
        connection.execute(
            """
            CREATE TABLE reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_name TEXT NOT NULL,
                user_profile_photo_url TEXT NOT NULL,
                content TEXT NOT NULL,
                review_date TEXT NOT NULL,
                property_name TEXT NOT NULL,
                sentiment_label TEXT NOT NULL,
                sentiment_score REAL NOT NULL,
                review_tag TEXT NOT NULL,
                recent_review INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            )
            """
        )
        legacy_columns = {
            str(row["name"])
            for row in connection.execute("PRAGMA table_info(reviews_legacy)").fetchall()
        }
        select_values = []
        for column_name in self.REVIEW_SCHEMA_COLUMNS:
            if column_name in legacy_columns:
                select_values.append(column_name)
            elif column_name == "review_tag":
                select_values.append("'Solos' AS review_tag")
            elif column_name == "sentiment_label":
                select_values.append("'neutral' AS sentiment_label")
            elif column_name == "sentiment_score":
                select_values.append("0 AS sentiment_score")
            elif column_name == "recent_review":
                select_values.append("0 AS recent_review")
            elif column_name == "created_at":
                select_values.append("datetime('now') AS created_at")
            else:
                select_values.append("'' AS {0}".format(column_name))
        connection.execute(
            """
            INSERT INTO reviews ({columns})
            SELECT {select_values}
            FROM reviews_legacy
            """.format(
                columns=", ".join(self.REVIEW_SCHEMA_COLUMNS),
                select_values=", ".join(select_values),
            )
        )
        connection.execute("DROP TABLE reviews_legacy")
        connection.execute("PRAGMA foreign_keys = ON")

    def get_actionable_by_dedupe_key(self, dedupe_key: str) -> Optional[ActionableItem]:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM actionable_items WHERE dedupe_key = ?",
                (dedupe_key,),
            ).fetchone()
        return self._hydrate_actionable_item(row) if row else None

    def get_actionable_by_id(self, actionable_item_id: int) -> Optional[ActionableItem]:
        with self._connect() as connection:
            row = connection.execute(
                "SELECT * FROM actionable_items WHERE id = ?",
                (actionable_item_id,),
            ).fetchone()
        return self._hydrate_actionable_item(row) if row else None

    def list_actionable_items(self) -> List[ActionableItem]:
        with self._connect() as connection:
            rows = connection.execute(
                "SELECT * FROM actionable_items ORDER BY id ASC"
            ).fetchall()
        return [self._hydrate_actionable_item(row) for row in rows]

    def create_actionable_item(
        self, canonical_text: str, category: str, dedupe_key: str
    ) -> ActionableItem:
        created_at = datetime.utcnow().isoformat() + "Z"
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO actionable_items (
                    canonical_text,
                    category,
                    dedupe_key,
                    status,
                    created_at
                ) VALUES (?, ?, ?, 'open', ?)
                """,
                (canonical_text, category, dedupe_key, created_at),
            )
            actionable_item_id = int(cursor.lastrowid)
        return self.get_actionable_by_id(actionable_item_id)

    def _ensure_review_actionable_link_columns(
        self, connection: sqlite3.Connection
    ) -> None:
        existing_columns = {
            str(row["name"])
            for row in connection.execute(
                "PRAGMA table_info(review_actionable_links)"
            ).fetchall()
        }
        for column_name, definition in self.REVIEW_ACTIONABLE_LINK_COLUMNS:
            if column_name not in existing_columns:
                connection.execute(
                    "ALTER TABLE review_actionable_links ADD COLUMN {name} {definition}".format(
                        name=column_name, definition=definition
                    )
                )

    def _ensure_actionable_item_columns(self, connection: sqlite3.Connection) -> None:
        existing_columns = {
            str(row["name"])
            for row in connection.execute("PRAGMA table_info(actionable_items)").fetchall()
        }
        for column_name, definition in self.ACTIONABLE_ITEM_COLUMNS:
            if column_name not in existing_columns:
                connection.execute(
                    "ALTER TABLE actionable_items ADD COLUMN {name} {definition}".format(
                        name=column_name, definition=definition
                    )
                )

    def link_review_to_actionable_item(
        self,
        review_id: int,
        actionable_item_id: int,
        link_tag: str,
        source_excerpt: str,
    ) -> None:
        created_at = datetime.utcnow().isoformat() + "Z"
        with self._connect() as connection:
            connection.execute(
                """
                INSERT OR IGNORE INTO review_actionable_links (
                    review_id,
                    actionable_item_id,
                    link_tag,
                    source_excerpt,
                    created_at
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (review_id, actionable_item_id, link_tag, source_excerpt, created_at),
            )

    def resolve_actionable_item(
        self, actionable_item_id: int, resolution_notes: str = ""
    ) -> Optional[ActionableItem]:
        resolved_at = datetime.utcnow().isoformat() + "Z"
        with self._connect() as connection:
            connection.execute(
                """
                UPDATE actionable_items
                SET status = 'resolved',
                    resolved_at = ?,
                    resolution_notes = ?
                WHERE id = ?
                """,
                (resolved_at, resolution_notes, actionable_item_id),
            )
        return self.get_actionable_by_id(actionable_item_id)

    def save_listing_update(
        self, actionable_item_id: int, updated_listing: str
    ) -> Optional[ActionableItem]:
        listing_updated_at = datetime.utcnow().isoformat() + "Z"
        with self._connect() as connection:
            connection.execute(
                """
                UPDATE actionable_items
                SET listing_update_text = ?,
                    listing_updated_at = ?
                WHERE id = ?
                """,
                (updated_listing, listing_updated_at, actionable_item_id),
            )
        return self.get_actionable_by_id(actionable_item_id)

    def _hydrate_actionable_item(self, row: sqlite3.Row) -> ActionableItem:
        linked_reviews = self.get_linked_reviews(int(row["id"]))
        return ActionableItem(
            id=int(row["id"]),
            canonical_text=str(row["canonical_text"]),
            category=str(row["category"]),
            dedupe_key=str(row["dedupe_key"]),
            status=str(row["status"]),
            created_at=str(row["created_at"]),
            resolved_at=row["resolved_at"],
            resolution_notes=row["resolution_notes"],
            listing_update_text=row["listing_update_text"],
            listing_updated_at=row["listing_updated_at"],
            linked_review_ids=[linked_review.review_id for linked_review in linked_reviews],
            linked_reviews=linked_reviews,
        )

    def get_linked_review_ids(self, actionable_item_id: int) -> List[int]:
        return [
            linked_review.review_id
            for linked_review in self.get_linked_reviews(actionable_item_id)
        ]

    def get_linked_reviews(self, actionable_item_id: int) -> List[LinkedReview]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT review_id, link_tag
                FROM review_actionable_links
                WHERE actionable_item_id = ?
                ORDER BY review_id ASC
                """,
                (actionable_item_id,),
            ).fetchall()
        return [
            LinkedReview(review_id=int(row["review_id"]), link_tag=str(row["link_tag"]))
            for row in rows
        ]
