from typing import Optional, List, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum
import uuid
import numpy as np
from app.models.usage import TokenUsage

class ResponseQuality(str, Enum):
    ALL = "all_responses"
    GOOD = "good_responses"
    NEEDS_IMPROVEMENT = "needs_improvement"
    UNRATED = "unrated"
    
class TimeFilter(str, Enum):
    ALL_TIME = "all_time"
    TODAY = "today"
    THIS_WEEK = "this_week"
    THIS_MONTH = "this_month"
    LAST_7_DAYS = "last_7_days"
    LAST_30_DAYS = "last_30_days"
    LAST_3_MONTHS = "last_3_months"
    LAST_YEAR = "last_year"

class DocumentUploadResponse(BaseModel):
    message: str
    inserted_count: int
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None  # Token usage tracking

class ScrapingResponse(BaseModel):
    message: str
    inserted_count: int
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    url: str
    usage: Optional[Dict[str, Any]] = None  # Token usage tracking

class FAQResponse(BaseModel):
    message: str
    inserted_count: int
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None  # Token usage tracking

class AdditionalTextResponse(BaseModel):
    message: str
    inserted_count: int
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None  # Token usage tracking

class ChatResponse(BaseModel):
    message_id: str  # Message ID for reference and improvement
    query: str
    answer: str
    sources: List[Dict[str, Any]]
    confidence: float
    user_id: str
    card_id: str
    visitor_id: str = "Anonymous"  # Visitor identifier, defaults to 'Anonymous'
    role: Optional[str] = "visitor"  # Role: 'admin' or 'visitor'
    chat_session_id: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None  # Token usage tracking


class CacheResponse(BaseModel):
    message: str
    cleared_items: int

# New response models for GET endpoints
class FAQItem(BaseModel):
    id: str
    question: str
    answer: str
    
class FAQListResponse(BaseModel):
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    faqs: List[FAQItem]
    total_count: int

class ScrapedURL(BaseModel):
    # id: str
    url: str
    # title: Optional[str] = None
    
class ScrapedURLsResponse(BaseModel):
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    urls: List[ScrapedURL]
    total_count: int

class AdditionalTextItem(BaseModel):
    text: str
    
class AdditionalTextListResponse(BaseModel):
    items: List[str]

class BioGenerationResponse(BaseModel):
    first_name: str
    last_name: str
    job_title: str
    company_name: Optional[str] = None
    text: Optional[str] = None
    bio: str

class DocumentItem(BaseModel):
    id: str
    filename: str
    
    
class DocumentListResponse(BaseModel):
    user_id: str
    card_id: str
    namespace: Optional[str] = None
    documents: List[DocumentItem]
    total_count: int

# Analytics models
class QAItem(BaseModel):
    id: str
    query: str
    answer: str
    confidence: float
    accuracy: Optional[float] = None  # Response accuracy rating (0.0 to 1.0)
    quality: Optional[str] = None  # Response quality category (good_responses, needs_improvement, unrated)
    timestamp: str
    chat_session_id: Optional[str] = None
    visitor_id: Optional[str] = None  # Visitor identifier
    has_been_improved: Optional[bool] = None  # Whether the answer has been improved
    improved_by: Optional[str] = None  # User who improved the answer
    improved_at: Optional[str] = None  # When the answer was improved

class FrequentQuestion(BaseModel):
    query: str
    count: int
    cards: List[str]  # List of card_ids where this question was asked
    confidence: float  # Average confidence score for this question

class AnalyticsResponse(BaseModel):
    user_id: str
    card_id: str
    conversation_count: int
    average_confidence: float  # As a decimal (0.0 to 1.0)
    average_confidence_percent: int  # As a percentage (0 to 100)
    average_accuracy: float = 0.0  # As a decimal (0.0 to 1.0)
    average_accuracy_percent: int = 0  # As a percentage (0 to 100)
    qa_count: int
    qa_items: List[QAItem]
    most_asked_questions: List[FrequentQuestion] = []  # Most frequently asked questions
    
class AccuracyUpdate(BaseModel):
    accuracy: float
    
class AccuracyResponse(BaseModel):
    message_id: str
    accuracy: float
    updated: bool
    error: Optional[str] = None
    
class BatchAccuracyUpdate(BaseModel):
    updates: List[Dict[str, Any]]
    
class BatchAccuracyResponse(BaseModel):
    results: List[AccuracyResponse]
    success_count: int
    failure_count: int
    
# User Aggregated Analytics models

class DailyConversationCount(BaseModel):
    date: str  # Date in YYYY-MM-DD format
    count: int  # Number of conversations on that date
    
class UserAggregatedAnalyticsResponse(BaseModel):
    user_id: str
    total_conversations: int  # Total conversations across all cards (all time)
    conversations_in_date_range: int  # Conversations within the specified date range
    total_cards: int  # Number of unique cards with conversations
    average_confidence: float  # Average confidence across all cards
    average_confidence_percent: int  # As a percentage
    average_accuracy: float  # Average accuracy across all cards
    average_accuracy_percent: int  # As a percentage
    average_response_time_ms: int  # Average response time in milliseconds
    most_asked_questions: List[FrequentQuestion] = []  # Most frequently asked questions
    daily_conversation_counts: List[DailyConversationCount] = []  # Daily conversation counts for the time period
    
# Search results models
class SearchResultItem(BaseModel):
    id: str
    query: str
    answer: str
    card_id: str
    confidence: float
    timestamp: str
    visitor_id: str = "Anonymous"  # Visitor identifier, defaults to 'Anonymous'
    
class SearchResultsResponse(BaseModel):
    user_id: str
    search_query: str
    total_results: int
    results: List[SearchResultItem]

# Improved Answer models
class ImprovedAnswerUpdate(BaseModel):
    message_id: str  # ID of the original message/question
    improved_answer: str  # The improved/updated answer
    user_id: str  # User who is making the improvement
    card_id: str  # Card ID associated with the improvement
    
class ImprovedAnswerResponse(BaseModel):
    message_id: str
    original_query: str
    improved_answer: str
    updated_at: str  # ISO format timestamp
    updated: bool
    error: Optional[str] = None

# Delete operation models
class DeleteResponse(BaseModel):
    """Response model for delete operations"""
    status: str
    deleted_count: int
    message: Optional[str] = None
    user_id: str
    card_id: str
    namespace: Optional[str] = None

# Conversation stats models
class CardConversationStats(BaseModel):
    """Conversation statistics for a single card"""
    card_id: str
    total_conversations: int

class UserConversationStatsResponse(BaseModel):
    """Response model for user conversation statistics"""
    user_id: str
    cards: List[CardConversationStats]
    total_cards: int
