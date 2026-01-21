import time
import hashlib
import json
from typing import Any, Optional, Dict
from cachetools import TTLCache
from app.core.config import settings

class ResponseCache:
    """Simple in-memory cache for API responses"""
    
    def __init__(self, ttl: int = None):
        self.ttl = ttl or settings.CACHE_TTL
        self.cache = TTLCache(maxsize=1000, ttl=self.ttl)
    
    def _generate_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments"""
        key_data = {
            'args': args,
            'kwargs': kwargs
        }
        key_str = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def get(self, *args, **kwargs) -> Optional[Any]:
        """Get cached value"""
        key = self._generate_key(*args, **kwargs)
        return self.cache.get(key)
    
    def set(self, value: Any, *args, **kwargs) -> None:
        """Set cached value"""
        key = self._generate_key(*args, **kwargs)
        self.cache[key] = value
    
    def clear(self) -> None:
        """Clear all cached values"""
        self.cache.clear()

# Global cache instance
response_cache = ResponseCache()
