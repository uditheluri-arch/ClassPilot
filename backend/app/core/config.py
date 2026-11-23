from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ClassPilot – Smart Academic Management System"
    TAGLINE: str = "Learning. Managing. Growing."
    API_V1_STR: str = ""
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "postgresql+psycopg2://postgres@localhost:5433/classpilot_db"
    
    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        """
        Normalize DATABASE_URL for SQLAlchemy 2.0 + psycopg2.
        Cloud providers (Render, Neon, Supabase, Railway) frequently
        provide URLs with 'postgres://' or 'postgresql://' prefixes.
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+psycopg2://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
            url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
        return url
    
    # JWT Authentication
    JWT_SECRET_KEY: str = "classpilot-super-secret-key-change-in-production-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:80",
        "http://localhost",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()
