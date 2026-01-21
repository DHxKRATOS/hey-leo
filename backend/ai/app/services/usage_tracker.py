"""
Usage tracker service for tracking OpenAI and Qdrant operations
Thread-safe singleton service for request-scoped usage tracking
"""
import threading
from contextvars import ContextVar
from typing import Optional
from app.models.usage import TokenUsage, OpenAIUsage, QdrantUsage
import logging

logger = logging.getLogger(__name__)

# Context variable for request-scoped usage tracking
_usage_context: ContextVar[Optional[TokenUsage]] = ContextVar('usage_context', default=None)


class UsageTracker:
    """
    Thread-safe usage tracker using context variables for request isolation.
    Each request gets its own usage tracking context.
    """
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance
    
    def start_tracking(self) -> TokenUsage:
        """Start tracking for the current request context"""
        usage = TokenUsage()
        _usage_context.set(usage)
        logger.debug("Started usage tracking for request")
        return usage
    
    def get_usage(self) -> TokenUsage:
        """Get current usage for the request context"""
        usage = _usage_context.get()
        if usage is None:
            # Auto-initialize if not started
            usage = self.start_tracking()
        return usage
    
    def clear_usage(self):
        """Clear usage tracking for the current request context"""
        _usage_context.set(None)
        logger.debug("Cleared usage tracking for request")
    
    # OpenAI tracking methods
    def track_openai_embedding(self, prompt_tokens: int, model: str = "text-embedding-3-large"):
        """Track OpenAI embedding API call"""
        usage = self.get_usage()
        
        # Calculate cost based on model
        cost_per_1k = self._get_embedding_cost(model)
        estimated_cost = (prompt_tokens / 1000) * cost_per_1k
        
        openai_usage = OpenAIUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=0,
            total_tokens=prompt_tokens,
            estimated_cost_usd=estimated_cost
        )
        
        usage.openai = usage.openai.add(openai_usage)
        logger.debug(f"Tracked embedding: {prompt_tokens} tokens, ${estimated_cost:.6f}")
    
    def track_openai_completion(self, prompt_tokens: int, completion_tokens: int, model: str = "gpt-3.5-turbo"):
        """Track OpenAI chat completion API call"""
        usage = self.get_usage()
        
        # Calculate cost based on model
        input_cost_per_1k, output_cost_per_1k = self._get_completion_cost(model)
        estimated_cost = (prompt_tokens / 1000) * input_cost_per_1k + (completion_tokens / 1000) * output_cost_per_1k
        
        openai_usage = OpenAIUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            estimated_cost_usd=estimated_cost
        )
        
        usage.openai = usage.openai.add(openai_usage)
        logger.debug(f"Tracked completion: {prompt_tokens} prompt + {completion_tokens} completion tokens, ${estimated_cost:.6f}")
    
    def track_openai_from_response(self, response_usage, model: str = "gpt-3.5-turbo"):
        """Track OpenAI usage from response.usage object"""
        if hasattr(response_usage, 'prompt_tokens') and hasattr(response_usage, 'completion_tokens'):
            self.track_openai_completion(
                prompt_tokens=response_usage.prompt_tokens,
                completion_tokens=response_usage.completion_tokens,
                model=model
            )
    
    # Qdrant tracking methods
    def track_qdrant_search(self, points_returned: int = 0):
        """Track Qdrant search operation"""
        usage = self.get_usage()
        qdrant_usage = QdrantUsage(
            search_operations=1,
            points_processed=points_returned
        )
        usage.qdrant = usage.qdrant.add(qdrant_usage)
        logger.debug(f"Tracked Qdrant search: {points_returned} points")
    
    def track_qdrant_upsert(self, points_count: int):
        """Track Qdrant upsert operation"""
        usage = self.get_usage()
        qdrant_usage = QdrantUsage(
            upsert_operations=1,
            points_processed=points_count
        )
        usage.qdrant = usage.qdrant.add(qdrant_usage)
        logger.debug(f"Tracked Qdrant upsert: {points_count} points")
    
    def track_qdrant_scroll(self, points_returned: int = 0):
        """Track Qdrant scroll operation"""
        usage = self.get_usage()
        qdrant_usage = QdrantUsage(
            scroll_operations=1,
            points_processed=points_returned
        )
        usage.qdrant = usage.qdrant.add(qdrant_usage)
        logger.debug(f"Tracked Qdrant scroll: {points_returned} points")
    
    def track_qdrant_delete(self, points_count: int):
        """Track Qdrant delete operation"""
        usage = self.get_usage()
        qdrant_usage = QdrantUsage(
            delete_operations=1,
            points_processed=points_count
        )
        usage.qdrant = usage.qdrant.add(qdrant_usage)
        logger.debug(f"Tracked Qdrant delete: {points_count} points")
    
    # Cost calculation helpers
    def _get_embedding_cost(self, model: str) -> float:
        """Get cost per 1K tokens for embedding models"""
        costs = {
            "text-embedding-3-large": 0.00013,  # $0.13 per 1M tokens
            "text-embedding-3-small": 0.00002,  # $0.02 per 1M tokens
            "text-embedding-ada-002": 0.00010,  # $0.10 per 1M tokens
        }
        return costs.get(model, 0.00013)  # Default to large model cost
    
    def _get_completion_cost(self, model: str) -> tuple[float, float]:
        """Get (input_cost_per_1k, output_cost_per_1k) for completion models"""
        costs = {
            "gpt-4": (0.03, 0.06),
            "gpt-4-turbo": (0.01, 0.03),
            "gpt-4o": (0.005, 0.015),
            "gpt-4o-mini": (0.00015, 0.0006),
            "gpt-3.5-turbo": (0.0005, 0.0015),
            "gpt-3.5-turbo-16k": (0.003, 0.004),
        }
        return costs.get(model, (0.0005, 0.0015))  # Default to gpt-3.5-turbo


# Global singleton instance
_tracker_instance = None

def get_usage_tracker() -> UsageTracker:
    """Get the global UsageTracker singleton instance"""
    global _tracker_instance
    if _tracker_instance is None:
        _tracker_instance = UsageTracker()
    return _tracker_instance
