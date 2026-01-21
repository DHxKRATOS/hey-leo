from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DocumentUploadRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    card_id: str = Field(..., description="Card identifier")
    namespace: Optional[str] = Field(None, description="Optional namespace for organization")

class ScrapingRequest(BaseModel):
    url: str = Field(..., description="URL to scrape")
    user_id: str = Field(..., description="User identifier")
    card_id: str = Field(..., description="Card identifier")
    namespace: Optional[str] = Field(None, description="Optional namespace for organization")

class FAQRequest(BaseModel):
    question: str = Field(..., description="FAQ question")
    answer: str = Field(..., description="FAQ answer")
    user_id: str = Field(..., description="User identifier")
    card_id: str = Field(..., description="Card identifier")
    namespace: Optional[str] = Field(None, description="Optional namespace for organization")

class AdditionalTextRequest(BaseModel):
    text: str = Field(..., description="Additional text content")
    user_id: str = Field(..., description="User identifier")
    card_id: str = Field(..., description="Card identifier")
    namespace: Optional[str] = Field(None, description="Optional namespace for organization")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Optional metadata")

class ChatRequest(BaseModel):
    query: str = Field(..., description="User query")
    user_id: str = Field(..., description="User identifier")
    card_id: str = Field(..., description="Card identifier")
    namespace: Optional[str] = Field(None, description="Optional namespace for filtering")
    chat_session_id: Optional[str] = Field(None, description="Optional chat session ID")
    visitor_id: Optional[str] = Field("Anonymous", description="Optional visitor identifier, defaults to 'Anonymous'")
    role: Optional[str] = Field("visitor", description="Role of the requester: 'admin' for training/testing (not stored), 'visitor' for real conversations (stored)")
    min_confidence: Optional[float] = Field(0.0, ge=0.0, le=1.0, description="Minimum confidence threshold (0.0-1.0) for filtering results")
    max_confidence: Optional[float] = Field(1.0, ge=0.0, le=1.0, description="Maximum confidence threshold (0.0-1.0) for filtering results")

class UserIdRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    card_id: str = Field(..., description="Card identifier")
    namespace: Optional[str] = Field(None, description="Optional namespace for filtering")

class BioGenerationRequest(BaseModel):
    user_id: str = Field(..., description="User identifier")
    card_id: Optional[str] = Field(None, description="Card identifier (optional, for linking bio to specific card)")
    first_name: str = Field(..., description="First name")
    last_name: str = Field(..., description="Last name")
    job_title: str = Field(..., description="Job title")
    company_name: Optional[str] = Field(None, description="Company name (optional)")
    phone_number: Optional[str] = Field(None, description="Phone number (optional, international format supported)")
    email_id: Optional[str] = Field(None, description="Email address (optional)")
    urls: Optional[List[str]] = Field(None, description="Profile URLs like LinkedIn, Portfolio, Instagram, etc. (optional)")
    text: Optional[str] = Field(None, description="Additional text to include in bio (optional)")
    namespace: Optional[str] = Field(None, description="Optional namespace for organization")
