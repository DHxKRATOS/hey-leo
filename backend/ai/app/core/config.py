import os
from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    # Essential API Configuration (from .env)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    
    # OpenAI Models (with sensible defaults)
    EMBEDDING_MODEL: str = "text-embedding-3-large"
    LLM_MODEL: str = "gpt-4o-mini"
    
    # Qdrant Configuration (with sensible defaults)
    QDRANT_COLLECTION_NAME: str = "rag_documents"
    QDRANT_HYBRID_COLLECTION_NAME: str = "rag_documents_hybrid"  # New collection for hybrid search
    USE_HYBRID_SEARCH: bool = True  # Set to False to use old dense-only search
    
    # Vector Configuration (optimized for text-embedding-3-large)
    VECTOR_DIM: int = 3072
    VECTOR_DISTANCE: str = "cosine"
    
    # Chunking Configuration (optimized defaults)
    MAX_CHUNK_SIZE: int = 2000
    CHUNK_OVERLAP: int = 200
    PAGE_AS_CHUNK: bool = True
    
    # App Configuration (production-ready defaults)
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    LOG_LEVEL: str = "INFO"
    
    # Cache Configuration (1 hour default)
    CACHE_TTL: int = 3600
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables

settings = Settings()
