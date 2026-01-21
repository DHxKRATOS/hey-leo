from fastapi import APIRouter, HTTPException
from app.models.requests import ScrapingRequest, UserIdRequest
from app.models.responses import ScrapingResponse, ScrapedURLsResponse, ScrapedURL, DeleteResponse
from app.services.scraper_service import get_scraper_service
from app.services.vector_service import get_vector_service
from app.services.usage_tracker import get_usage_tracker
from app.models.vector import SourceType
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/scrape", response_model=ScrapingResponse)
async def scrape_url(request: ScrapingRequest):
    """Scrape content from a URL"""
    try:
        # 📊 Start usage tracking
        usage_tracker = get_usage_tracker()
        usage_tracker.start_tracking()
        
        # Get services
        scraper_service = await get_scraper_service()
        vector_service = await get_vector_service()
        
        # Scrape URL
        chunks = await scraper_service.scrape_url(request.url)
        
        # Insert into vector database (this will create embeddings and track usage)
        result = await vector_service.ingest_chunks(
            chunks, 
            request.user_id, 
            request.card_id, 
            request.namespace
        )
        
        # 📊 Capture usage statistics AFTER inserting (so we get embedding tokens)
        usage = usage_tracker.get_usage()
        usage_dict = usage.to_dict()
        usage_tracker.clear_usage()
        
        return ScrapingResponse(
            message=f"Successfully scraped {request.url}",
            inserted_count=result.inserted_count,
            user_id=request.user_id,
            card_id=request.card_id,
            namespace=request.namespace,
            url=request.url,
            usage=usage_dict
        )
        
    except Exception as e:
        logger.error(f"Error scraping URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=ScrapedURLsResponse)
async def get_scraped_urls(user_id: str, card_id: str, namespace: Optional[str] = None):
    """Get all scraped URLs for a user"""
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Get scraped URLs directly by source_type without embedding
        results = await vector_service.get_user_data_by_type(
            user_id=user_id,
            card_id=card_id,
            source_type=[SourceType.WEB, "scrape"],  # Get both WEB and 'scrape' types
            namespace=namespace,
            limit=100  # Get up to 100 URLs
        )
        
        # Process results and deduplicate URLs
        urls = []
        processed_urls = set()  # Track URLs we've already processed
        
        for result in results:
            metadata = result.metadata
            url = metadata.get("url", "")
            if url and url not in processed_urls:
                processed_urls.add(url)  # Mark as processed
                urls.append(ScrapedURL(
                    # id=result.id,  # Commented out as per user's modification
                    url=url
                    # title=metadata.get("title", None)  # Commented out as per user's modification
                ))
        
        return ScrapedURLsResponse(
            user_id=user_id,
            card_id=card_id,
            namespace=namespace,
            urls=urls,
            total_count=len(urls)
        )
        
    except Exception as e:
        logger.error(f"Error retrieving scraped URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete", response_model=DeleteResponse)
async def delete_scraped_url(user_id: str, card_id: str, url: Optional[str] = None, namespace: Optional[str] = None):
    """Delete scraped URLs for a user
    
    If url is provided, only data from that specific URL will be deleted.
    Otherwise, all scraped data for the user/card/namespace will be deleted.
    """
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Delete by source type
        result = await vector_service.delete_user_data(
            user_id=user_id,
            card_id=card_id,
            source_type=[SourceType.WEB, "scrape"],  # Get both WEB and 'scrape' types
            namespace=namespace
        )
        
        # Clear caches after deletion to prevent stale data
        vector_service.query_cache.clear()
        logger.info(f"Cleared query cache after deleting {result['deleted_count']} scraped URLs")
        
        # Also clear RAG workflow cache
        from app.workflows.rag_workflow import get_rag_workflow
        rag_workflow = await get_rag_workflow()
        rag_workflow.llm_cache.clear()
        logger.info("Cleared LLM cache after scraper deletion")
        
        return DeleteResponse(
            status=result["status"],
            deleted_count=result["deleted_count"],
            message=f"Successfully deleted {result['deleted_count']} scraped URLs",
            user_id=user_id,
            card_id=card_id,
            namespace=namespace
        )
        
    except Exception as e:
        logger.error(f"Error deleting scraped URLs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
