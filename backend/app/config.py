"""
Application configuration using pydantic-settings.
All settings are loaded from environment variables or .env file.
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # LLM Provider
    LLM_PROVIDER: str = "gemini"  # "gemini" or "openai"
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    # ChromaDB
    CHROMA_DB_PATH: str = "./chroma_db"

    # Uploads
    UPLOAD_DIR: str = "./uploads"

    # Embedding Model
    EMBEDDING_MODEL: str = "all-MiniLM-L6-v2"

    # Chunking Configuration
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50

    # RAG Configuration
    TOP_K_RESULTS: int = 5

    # Tesseract Path (Windows)
    TESSERACT_PATH: Optional[str] = None

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # File upload limits
    MAX_FILE_SIZE_MB: int = 50
    ALLOWED_EXTENSIONS: list = [".pdf", ".txt", ".png", ".jpg", ".jpeg"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Global settings instance
settings = Settings()

# Ensure upload and chroma directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_DB_PATH, exist_ok=True)
