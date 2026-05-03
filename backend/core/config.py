"""
Nyayadarsi Configuration
Pydantic BaseSettings — loads from .env with full type safety.
"""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── AI Keys ──────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # ── Database ─────────────────────────────────────────────────────────
    DATABASE_URL: str = "sqlite:///./nyayadarsi.db"

    # ── JWT Authentication ───────────────────────────────────────────────
    # Must be set in .env — no insecure default in production.
    JWT_SECRET_KEY: str = "nyayadarsi-dev-secret-CHANGE-BEFORE-DEPLOYING-32chars+"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Fail fast if someone is using the default key in a non-local environment
        import os
        if self.JWT_SECRET_KEY.startswith("nyayadarsi-dev-secret") and os.getenv("RAILWAY_ENVIRONMENT"):
            raise RuntimeError("❌ JWT_SECRET_KEY must be set to a strong random value in production! Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\"")

    # ── GPS Configuration ────────────────────────────────────────────────
    REGISTERED_SITE_LAT: float = 20.2961
    REGISTERED_SITE_LON: float = 85.8245
    GPS_THRESHOLD_METERS: float = 100.0

    # ── Application ──────────────────────────────────────────────────────
    APP_VERSION: str = "2.0.0"
    APP_TITLE: str = "Nyayadarsi API"
    APP_DESCRIPTION: str = "AI-Powered Procurement Justice Platform — न्यायदर्शी"

    # ── Paths ────────────────────────────────────────────────────────────
    @property
    def UPLOAD_DIR(self) -> Path:
        path = Path(__file__).resolve().parent.parent / "uploads"
        path.mkdir(exist_ok=True)
        return path

    @property
    def DEMO_DATA_DIR(self) -> Path:
        return Path(__file__).resolve().parent.parent.parent / "demo" / "mock_data"

    @property
    def DB_PATH(self) -> Path:
        return Path(__file__).resolve().parent.parent / "nyayadarsi.db"


settings = Settings()
