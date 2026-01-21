import logging
from typing import Optional
from openai import AsyncOpenAI
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

class ServiceManager:
    """Manages shared service instances with optimized connections"""
    
    def __init__(self):
        self._openai_client: Optional[AsyncOpenAI] = None
    
    @property
    def openai_client(self) -> AsyncOpenAI:
        """Get or create optimized OpenAI client"""
        if self._openai_client is None:
            # Create optimized HTTP client with connection pooling
            http_client = httpx.AsyncClient(
                timeout=httpx.Timeout(10.0, connect=5.0),  # Faster timeouts
                limits=httpx.Limits(
                    max_keepalive_connections=20,
                    max_connections=100,
                    keepalive_expiry=30.0
                ),
                http2=True  # Enable HTTP/2 for better performance
            )
            
            self._openai_client = AsyncOpenAI(
                api_key=settings.OPENAI_API_KEY,
                timeout=10.0,  # Reduced from 30s
                max_retries=1,  # Reduced retries for speed
                http_client=http_client
            )
            logger.info("Created optimized OpenAI client with connection pooling")
        return self._openai_client

# Global service manager instance
_service_manager = None

def get_service_manager() -> ServiceManager:
    """Get global service manager instance"""
    global _service_manager
    if _service_manager is None:
        _service_manager = ServiceManager()
    return _service_manager
