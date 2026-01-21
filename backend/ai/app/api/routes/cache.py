from fastapi import APIRouter, HTTPException
from app.models.responses import CacheResponse
from app.core.response_cache import response_cache
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/clear", response_model=CacheResponse)
async def clear_cache():
    """Clear all cached responses"""
    try:
        # Get current cache size
        cache_size = len(response_cache.cache)
        
        # Clear cache
        response_cache.clear()
        
        return CacheResponse(
            message="Cache cleared successfully",
            cleared_items=cache_size
        )
        
    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
