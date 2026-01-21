from fastapi import APIRouter, HTTPException
from app.models.requests import AdditionalTextRequest, UserIdRequest
from app.models.responses import AdditionalTextResponse, AdditionalTextListResponse, AdditionalTextItem, DeleteResponse
from app.models.vector import Chunk, SourceType
from app.services.vector_service import get_vector_service
from app.services.usage_tracker import get_usage_tracker
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/add", response_model=AdditionalTextResponse)
async def add_additional_text(request: AdditionalTextRequest):
    """Add additional text to knowledge base (merges with existing text)"""
    try:
        # 📊 Start usage tracking
        usage_tracker = get_usage_tracker()
        usage_tracker.start_tracking()
        
        # Get vector service
        vector_service = await get_vector_service()
        
        # STEP 1: Get existing additional text
        logger.info(f"Fetching existing additional text for user {request.user_id}, card {request.card_id}")
        existing_texts = await vector_service.get_user_data_by_type(
            user_id=request.user_id,
            card_id=request.card_id,
            source_type=SourceType.ADDITIONAL,
            namespace=request.namespace,
            limit=100
        )
        
        # STEP 2: Merge old text with new text
        if existing_texts:
            # Combine all existing texts
            old_text = "\n\n".join([result.text for result in existing_texts])
            merged_text = f"{old_text}\n\n{request.text}"
            logger.info(f"Merging new text with {len(existing_texts)} existing entries")
        else:
            merged_text = request.text
            logger.info("No existing text found, using new text only")
        
        # STEP 3: Delete old entries
        if existing_texts:
            try:
                delete_result = await vector_service.delete_user_data(
                    user_id=request.user_id,
                    card_id=request.card_id,
                    source_type=SourceType.ADDITIONAL,
                    namespace=request.namespace
                )
                logger.info(f"Deleted {delete_result['deleted_count']} old additional text entries")
            except Exception as e:
                logger.warning(f"Error deleting old additional text: {str(e)}")
        
        # STEP 4: Store merged text
        metadata = {
            "source_type": SourceType.ADDITIONAL,
            **(request.metadata or {})
        }
        
        chunk = Chunk(
            text=merged_text,
            metadata=metadata
        )
        
        # Insert merged text into vector database
        result = await vector_service.ingest_chunks(
            [chunk], 
            request.user_id, 
            request.card_id, 
            request.namespace
        )
        
        # 📊 Capture usage statistics AFTER inserting (so we get embedding tokens)
        usage = usage_tracker.get_usage()
        usage_dict = usage.to_dict()
        usage_tracker.clear_usage()
        
        return AdditionalTextResponse(
            message="Successfully added additional text",
            inserted_count=result.inserted_count,
            user_id=request.user_id,
            card_id=request.card_id,
            namespace=request.namespace,
            usage=usage_dict
        )
        
    except Exception as e:
        logger.error(f"Error adding additional text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=AdditionalTextListResponse)
async def get_additional_texts(user_id: str, card_id: str, namespace: Optional[str] = None):
    """Get all additional texts for a user"""
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Get additional texts directly by source_type without embedding
        results = await vector_service.get_user_data_by_type(
            user_id=user_id,
            card_id=card_id,
            source_type=SourceType.ADDITIONAL,
            namespace=namespace,
            limit=100  # Get up to 100 texts
        )
        
        # Process results - extract only the text content
        text_items = [result.text for result in results]
        
        return AdditionalTextListResponse(
            items=text_items
        )
        
    except Exception as e:
        logger.error(f"Error retrieving additional texts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete", response_model=DeleteResponse)
async def delete_additional_text(user_id: str, card_id: str, namespace: Optional[str] = None):
    """Delete additional text for a user
    
    Deletes all additional text for the specified user, card, and namespace.
    """
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Delete by source type
        result = await vector_service.delete_user_data(
            user_id=user_id,
            card_id=card_id,
            source_type=SourceType.ADDITIONAL,
            namespace=namespace
        )
        
        # Clear caches after deletion to prevent stale data
        vector_service.query_cache.clear()
        logger.info(f"Cleared query cache after deleting {result['deleted_count']} additional texts")
        
        # Also clear RAG workflow cache
        from app.workflows.rag_workflow import get_rag_workflow
        rag_workflow = await get_rag_workflow()
        rag_workflow.llm_cache.clear()
        logger.info("Cleared LLM cache after additional text deletion")
        
        return DeleteResponse(
            status=result["status"],
            deleted_count=result["deleted_count"],
            message=f"Successfully deleted {result['deleted_count']} additional text entries",
            user_id=user_id,
            card_id=card_id,
            namespace=namespace
        )
        
    except Exception as e:
        logger.error(f"Error deleting additional text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
