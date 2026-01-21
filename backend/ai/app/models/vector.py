from typing import Dict, List, Optional, Any
from pydantic import BaseModel
from enum import Enum
import uuid
import hashlib

class SourceType(str, Enum):
    DOCUMENT = "document"
    WEB = "web"
    FAQ = "faq"
    ADDITIONAL = "additional"

class Chunk(BaseModel):
    id: str = None
    text: str
    metadata: Optional[Dict[str, Any]] = None
    document_id: Optional[str] = None  # Single ID for entire document
    chunk_index: Optional[int] = None  # Position of chunk in document
    
    def __init__(self, **data):
        if data.get('id') is None:
            # Always use UUID format for Qdrant compatibility
            # Store document_id and chunk_index separately in metadata for tracking
            data['id'] = str(uuid.uuid4())
        super().__init__(**data)

class InsertResult(BaseModel):
    inserted_count: int
    user_id: str
    card_id: str
    namespace: Optional[str] = None

class VectorSearchResult(BaseModel):
    id: str
    text: str
    user_id: str
    card_id: Optional[str] = "default"  # Make card_id optional with default value
    metadata: Dict[str, Any]
    score: float
    document_id: Optional[str] = None  # Document ID from payload
    payload: Optional[Dict[str, Any]] = None  # Full payload for accessing root-level fields
