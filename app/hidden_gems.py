"""Separate SQLite storage for hidden-gem amenity tracking."""

import os
import sqlite3
from contextlib import contextmanager
from datetime import datetime
from typing import Generator
from typing import Iterable
from typing import List

from .models import HiddenGemAmenity


class HiddenGemRepository:
    """Tracks amenity mention frequency separately from review/actionable data."""

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
                CREATE TABLE IF NOT EXISTS processed_reviews (
                    review_id INTEGER PRIMARY KEY,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS amenities (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    normalized_name TEXT NOT NULL UNIQUE,
                    display_name TEXT NOT NULL,
                    mention_count INTEGER NOT NULL DEFAULT 0,
                    hidden_gem INTEGER NOT NULL DEFAULT 0,
                    updated_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS review_amenity_mentions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    review_id INTEGER NOT NULL,
                    amenity_id INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    UNIQUE(review_id, amenity_id),
                    FOREIGN KEY(amenity_id) REFERENCES amenities(id)
                );
                """
            )

    def record_review_amenities(
        self,
        review_id: int,
        amenity_catalog: Iterable[str],
        mentioned_amenities: Iterable[str],
    ) -> List[HiddenGemAmenity]:
        catalog = [amenity.strip() for amenity in amenity_catalog if amenity.strip()]
        mentioned_lookup = {
            self._normalize_name(amenity)
            for amenity in mentioned_amenities
            if amenity.strip()
        }
        now = datetime.utcnow().isoformat() + "Z"

        with self._connect() as connection:
            already_processed = connection.execute(
                "SELECT 1 FROM processed_reviews WHERE review_id = ?",
                (review_id,),
            ).fetchone()
            self._ensure_amenities(connection, catalog, now)

            if not already_processed:
                connection.execute(
                    "INSERT INTO processed_reviews (review_id, created_at) VALUES (?, ?)",
                    (review_id, now),
                )
                for amenity in catalog:
                    normalized = self._normalize_name(amenity)
                    if normalized not in mentioned_lookup:
                        continue
                    amenity_row = connection.execute(
                        "SELECT id FROM amenities WHERE normalized_name = ?",
                        (normalized,),
                    ).fetchone()
                    if not amenity_row:
                        continue
                    inserted = connection.execute(
                        """
                        INSERT OR IGNORE INTO review_amenity_mentions (
                            review_id,
                            amenity_id,
                            created_at
                        ) VALUES (?, ?, ?)
                        """,
                        (review_id, int(amenity_row["id"]), now),
                    )
                    if inserted.rowcount:
                        connection.execute(
                            """
                            UPDATE amenities
                            SET mention_count = mention_count + 1,
                                updated_at = ?
                            WHERE id = ?
                            """,
                            (now, int(amenity_row["id"])),
                        )

            self._recompute_hidden_gems(connection, now)
            return self._select_current_review_hidden_gem(connection, mentioned_lookup)

    def _ensure_amenities(
        self, connection: sqlite3.Connection, amenities: Iterable[str], now: str
    ) -> None:
        for amenity in amenities:
            connection.execute(
                """
                INSERT OR IGNORE INTO amenities (
                    normalized_name,
                    display_name,
                    mention_count,
                    hidden_gem,
                    updated_at
                ) VALUES (?, ?, 0, 0, ?)
                """,
                (self._normalize_name(amenity), amenity, now),
            )

    def _recompute_hidden_gems(self, connection: sqlite3.Connection, now: str) -> None:
        total_reviews = self._total_reviews(connection)
        connection.execute(
            "UPDATE amenities SET hidden_gem = 0, updated_at = ?",
            (now,),
        )
        if total_reviews <= 0:
            return
        rarest_row = connection.execute(
            """
            SELECT id
            FROM amenities
            WHERE mention_count > 0
              AND (CAST(mention_count AS REAL) / ?) < 0.05
            ORDER BY
                (CAST(mention_count AS REAL) / ?) ASC,
                mention_count ASC,
                display_name ASC
            LIMIT 1
            """,
            (float(total_reviews), float(total_reviews)),
        ).fetchone()
        if rarest_row:
            connection.execute(
                """
                UPDATE amenities
                SET hidden_gem = 1,
                    updated_at = ?
                WHERE id = ?
                """,
                (now, int(rarest_row["id"])),
            )

    def _select_current_review_hidden_gem(
        self, connection: sqlite3.Connection, mentioned_lookup: set
    ) -> List[HiddenGemAmenity]:
        if not mentioned_lookup:
            return []
        total_reviews = self._total_reviews(connection)
        placeholders = ", ".join("?" for _ in mentioned_lookup)
        rows = connection.execute(
            """
            SELECT display_name, mention_count, hidden_gem
            FROM amenities
            WHERE normalized_name IN ({placeholders})
              AND hidden_gem = 1
            ORDER BY
                (CAST(mention_count AS REAL) / ?) ASC,
                mention_count ASC,
                display_name ASC
            LIMIT 1
            """.format(placeholders=placeholders),
            [*mentioned_lookup, float(total_reviews or 1)],
        ).fetchall()
        if not rows:
            return []

        row = rows[0]
        mention_count = int(row["mention_count"])
        mention_rate = (
            round(mention_count / float(total_reviews), 4)
            if total_reviews
            else 0.0
        )
        return [
            HiddenGemAmenity(
                amenity=str(row["display_name"]),
                mention_count=mention_count,
                total_reviews=total_reviews,
                mention_rate=mention_rate,
                hidden_gem=True,
            )
        ]

    def list_amenity_stats(self) -> List[HiddenGemAmenity]:
        with self._connect() as connection:
            total_reviews = self._total_reviews(connection)
            rows = connection.execute(
                """
                SELECT display_name, mention_count, hidden_gem
                FROM amenities
                ORDER BY display_name ASC
                """
            ).fetchall()
            return [
                self._hydrate_amenity(row, total_reviews)
                for row in rows
            ]

    def _hydrate_amenity(
        self, row: sqlite3.Row, total_reviews: int
    ) -> HiddenGemAmenity:
        mention_count = int(row["mention_count"])
        mention_rate = (
            round(mention_count / float(total_reviews), 4)
            if total_reviews
            else 0.0
        )
        return HiddenGemAmenity(
            amenity=str(row["display_name"]),
            mention_count=mention_count,
            total_reviews=total_reviews,
            mention_rate=mention_rate,
            hidden_gem=bool(row["hidden_gem"]),
        )

    def _total_reviews(self, connection: sqlite3.Connection) -> int:
        row = connection.execute("SELECT COUNT(*) AS count FROM processed_reviews").fetchone()
        return int(row["count"])

    def _normalize_name(self, value: str) -> str:
        return " ".join(value.strip().lower().split())
