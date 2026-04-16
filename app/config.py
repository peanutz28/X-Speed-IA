"""Configuration helpers for the review processing service."""

from dataclasses import dataclass
import os
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _load_env_file(env_path: Path, override: bool = False) -> None:
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"')
        if key:
            if override:
                os.environ[key] = value
            else:
                os.environ.setdefault(key, value)


_load_env_file(PROJECT_ROOT / ".env")
_load_env_file(PROJECT_ROOT / ".env.local", override=True)


@dataclass(frozen=True)
class Settings:
    openai_api_key: str = os.environ.get("OPENAI_API_KEY", "").strip()
    cerebras_api_key: str = os.environ.get("CEREBRAS_API_KEY", "").strip()
    openai_model: str = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
    cerebras_model: str = os.environ.get("CEREBRAS_MODEL", "gpt-oss-120b")
    database_path: str = os.environ.get("REVIEW_DB_PATH", "./data/reviews.db")
    hidden_gem_database_path: str = os.environ.get(
        "HIDDEN_GEM_DB_PATH", "./data/hidden_gems.db"
    )
    host: str = os.environ.get("REVIEW_APP_HOST", "127.0.0.1")
    port: int = int(os.environ.get("REVIEW_APP_PORT", "8000"))
    cors_allowed_origin: str = os.environ.get("CORS_ALLOWED_ORIGIN", "*")


def get_settings() -> Settings:
    return Settings()
