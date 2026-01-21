from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
import numpy as np

class ChatMessage(BaseModel):
    id: str = None
    user_id: str
    card_id: str
    query: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float
    accuracy: Optional[float] = None  # Response accuracy rating (0.0 to 1.0)
    chat_session_id: str
    namespace: Optional[str] = None
    visitor_id: str = "Anonymous"  # Visitor identifier, defaults to 'Anonymous'
    timestamp: str = None
    response_time_ms: Optional[int] = None  # Response time in milliseconds
    
    def __init__(self, **data):
        if data.get('id') is None:
            data['id'] = str(uuid.uuid4())
        if data.get('timestamp') is None:
            data['timestamp'] = datetime.utcnow().isoformat()
        super().__init__(**data)
    
    def to_qdrant_payload(self) -> Dict[str, Any]:
        """Convert to Qdrant payload format"""
        payload = {
            "user_id": self.user_id,
            "card_id": self.card_id,
            "query": self.query,
            "answer": self.answer,
            "confidence": self.confidence,
            "chat_session_id": self.chat_session_id,
            "timestamp": self.timestamp,
            "visitor_id": self.visitor_id,
            "type": "message"  # Important for filtering
        }
        
        # Auto-mark high-confidence answers as "improved" for caching
        # This allows the system to reuse good answers without manual improvement
        if self.confidence >= 0.7:
            payload["has_been_improved"] = True
            payload["improved_at"] = self.timestamp
            payload["improved_by"] = "auto"  # Indicate this was auto-marked
        
        # Add optional fields if they exist
        if self.namespace:
            payload["namespace"] = self.namespace
        if self.sources:
            payload["sources"] = self.sources
        if self.accuracy is not None:
            payload["accuracy"] = self.accuracy
        if self.response_time_ms is not None:
            payload["response_time_ms"] = self.response_time_ms
            
        return payload
    
    @classmethod
    def from_qdrant_payload(cls, id: str, payload: Dict[str, Any]) -> 'ChatMessage':
        """Create from Qdrant payload"""
        return cls(
            id=id,
            user_id=payload.get("user_id"),
            card_id=payload.get("card_id"),
            query=payload.get("query"),
            answer=payload.get("answer"),
            sources=payload.get("sources", []),
            confidence=payload.get("confidence", 0.0),
            accuracy=payload.get("accuracy"),  # May be None if not rated yet
            chat_session_id=payload.get("chat_session_id"),
            namespace=payload.get("namespace"),
            visitor_id=payload.get("visitor_id", "Anonymous"),
            timestamp=payload.get("timestamp"),
            response_time_ms=payload.get("response_time_ms")
        )
    
    def get_embedding_text(self) -> str:
        """Get text to use for embedding"""
        return f"{self.query} {self.answer}"

class ChatSession(BaseModel):
    id: str = None
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    visitor_id: Optional[str] = None
    start_time: str = None
    last_activity: str = None
    message_count: int = 0
    
    def __init__(self, **data):
        if data.get('id') is None:
            data['id'] = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat()
        if data.get('start_time') is None:
            data['start_time'] = current_time
        if data.get('last_activity') is None:
            data['last_activity'] = current_time
        super().__init__(**data)
    
    def to_qdrant_payload(self) -> Dict[str, Any]:
        """Convert to Qdrant payload format"""
        payload = {
            "user_id": self.user_id,
            "card_id": self.card_id,
            "start_time": self.start_time,
            "last_activity": self.last_activity,
            "message_count": self.message_count,
            "type": "session"  # Important for filtering
        }
        
        # Add optional fields if they exist
        if self.namespace:
            payload["namespace"] = self.namespace
        if self.visitor_id:
            payload["visitor_id"] = self.visitor_id
            
        return payload
    
    @classmethod
    def from_qdrant_payload(cls, id: str, payload: Dict[str, Any]) -> 'ChatSession':
        """Create from Qdrant payload"""
        return cls(
            id=id,
            user_id=payload.get("user_id"),
            card_id=payload.get("card_id"),
            namespace=payload.get("namespace"),
            visitor_id=payload.get("visitor_id"),
            start_time=payload.get("start_time"),
            last_activity=payload.get("last_activity"),
            message_count=payload.get("message_count", 0)
        )
    
    def get_embedding_text(self) -> str:
        """Get text to use for embedding"""
        return f"Chat session for user {self.user_id} card {self.card_id}"
