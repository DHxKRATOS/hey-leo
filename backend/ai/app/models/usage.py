"""
Usage tracking models for OpenAI and Qdrant operations
"""
from pydantic import BaseModel, Field
from typing import Optional


class OpenAIUsage(BaseModel):
    """OpenAI token usage tracking"""
    prompt_tokens: int = Field(default=0, description="Number of tokens in the prompt")
    completion_tokens: int = Field(default=0, description="Number of tokens in the completion")
    total_tokens: int = Field(default=0, description="Total tokens used")
    estimated_cost_usd: float = Field(default=0.0, description="Estimated cost in USD")
    
    def add(self, other: 'OpenAIUsage') -> 'OpenAIUsage':
        """Add another OpenAIUsage to this one"""
        return OpenAIUsage(
            prompt_tokens=self.prompt_tokens + other.prompt_tokens,
            completion_tokens=self.completion_tokens + other.completion_tokens,
            total_tokens=self.total_tokens + other.total_tokens,
            estimated_cost_usd=self.estimated_cost_usd + other.estimated_cost_usd
        )


class QdrantUsage(BaseModel):
    """Qdrant operation tracking"""
    search_operations: int = Field(default=0, description="Number of search operations")
    points_processed: int = Field(default=0, description="Number of points processed")
    upsert_operations: int = Field(default=0, description="Number of upsert operations")
    scroll_operations: int = Field(default=0, description="Number of scroll operations")
    delete_operations: int = Field(default=0, description="Number of delete operations")
    
    def add(self, other: 'QdrantUsage') -> 'QdrantUsage':
        """Add another QdrantUsage to this one"""
        return QdrantUsage(
            search_operations=self.search_operations + other.search_operations,
            points_processed=self.points_processed + other.points_processed,
            upsert_operations=self.upsert_operations + other.upsert_operations,
            scroll_operations=self.scroll_operations + other.scroll_operations,
            delete_operations=self.delete_operations + other.delete_operations
        )


class TokenUsage(BaseModel):
    """Complete token and operation usage tracking"""
    openai: OpenAIUsage = Field(default_factory=OpenAIUsage, description="OpenAI usage statistics")
    qdrant: QdrantUsage = Field(default_factory=QdrantUsage, description="Qdrant usage statistics")
    
    def add(self, other: 'TokenUsage') -> 'TokenUsage':
        """Add another TokenUsage to this one"""
        return TokenUsage(
            openai=self.openai.add(other.openai),
            qdrant=self.qdrant.add(other.qdrant)
        )
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "openai": self.openai.model_dump(),
            "qdrant": self.qdrant.model_dump()
        }
