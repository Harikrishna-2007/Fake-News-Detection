"""
config.py
=========
Centralized application configuration, loaded from environment
variables (.env file in development). Using pydantic-settings gives us
validation and type coercion for free — a malformed .env fails fast at
startup with a clear error instead of causing a confusing runtime bug
three layers deep.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # ----- Application -----
    APP_NAME: str = "Fake News Detection System"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # ----- Server -----
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # ----- Database -----
    DATABASE_URL: str = "sqlite:///./database/app.db"

    # ----- JWT -----
    JWT_SECRET_KEY: str = "INSECURE_DEFAULT_CHANGE_ME"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ----- CORS -----
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # ----- ML Model Paths -----
    MODEL_DIR: str = str(PROJECT_ROOT / "ml" / "models")
    ACTIVE_MODEL_PATH: str = str(PROJECT_ROOT / "ml" / "models" / "best_model.joblib")
    VECTORIZER_PATH: str = str(PROJECT_ROOT / "ml" / "models" / "tfidf_vectorizer.joblib")
    METADATA_PATH: str = str(PROJECT_ROOT / "ml" / "models" / "model_metadata.json")

    # ----- Admin Seed -----
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "ChangeMe123!"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
