from fastapi import APIRouter, HTTPException, Depends
from app.models.requests import FAQRequest, UserIdRequest
from app.models.responses import FAQResponse, FAQListResponse, FAQItem, DeleteResponse
from app.models.vector import Chunk, SourceType
from app.services.vector_service import get_vector_service
from app.services.usage_tracker import get_usage_tracker
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/add", response_model=FAQResponse)
async def add_faq(request: FAQRequest):
    """Add FAQ to knowledge base"""
    try:
        # 📊 Start usage tracking
        usage_tracker = get_usage_tracker()
        usage_tracker.start_tracking()
        
        # Get vector service
        vector_service = await get_vector_service()
        
        # Create FAQ chunk
        faq_text = f"Q: {request.question}\nA: {request.answer}"
        chunk = Chunk(
            text=faq_text,
            metadata={
                "source_type": SourceType.FAQ,
                "question": request.question,
                "answer": request.answer
            }
        )
        
        # Insert into vector database (this will create embeddings and track usage)
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
        
        return FAQResponse(
            message="Successfully added FAQ",
            inserted_count=result.inserted_count,
            user_id=request.user_id,
            card_id=request.card_id,
            namespace=request.namespace,
            usage=usage_dict
        )
        
    except Exception as e:
        logger.error(f"Error adding FAQ: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=FAQListResponse)
async def get_faqs(user_id: str, card_id: str, namespace: Optional[str] = None):
    """Get all FAQs for a user"""
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Get FAQs directly by source_type without embedding
        results = await vector_service.get_user_data_by_type(
            user_id=user_id,
            card_id=card_id,
            source_type=SourceType.FAQ,
            namespace=namespace,
            limit=100  # Get up to 100 FAQs
        )
        
        # Convert results to FAQItem objects
        faqs = []
        for result in results:
            metadata = result.metadata
            faqs.append(FAQItem(
                id=result.id,
                question=metadata.get("question", ""),
                answer=metadata.get("answer", "")
            ))
        
        return FAQListResponse(
            user_id=user_id,
            card_id=card_id,
            namespace=namespace,
            faqs=faqs,
            total_count=len(faqs)
        )
        
    except Exception as e:
        logger.error(f"Error retrieving FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete", response_model=DeleteResponse)
async def delete_faq(user_id: str, card_id: str, faq_id: Optional[str] = None, namespace: Optional[str] = None):
    """Delete FAQs for a user
    
    If faq_id is provided, only that specific FAQ will be deleted.
    Otherwise, all FAQs for the user/card/namespace will be deleted.
    """
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Call delete method with appropriate parameters
        if faq_id:
            result = await vector_service.delete_user_data(
                user_id=user_id,
                card_id=card_id,
                point_id=faq_id,
                namespace=namespace
            )
        else:
            result = await vector_service.delete_user_data(
                user_id=user_id,
                card_id=card_id,
                source_type=SourceType.FAQ,
                namespace=namespace
            )
        
        # Clear caches after deletion to prevent stale data
        vector_service.query_cache.clear()
        logger.info(f"Cleared query cache after deleting {result['deleted_count']} FAQs")
        
        # Also clear RAG workflow cache
        from app.workflows.rag_workflow import get_rag_workflow
        rag_workflow = await get_rag_workflow()
        rag_workflow.llm_cache.clear()
        logger.info("Cleared LLM cache after FAQ deletion")
        
        return DeleteResponse(
            status=result["status"],
            deleted_count=result["deleted_count"],
            message=f"Successfully deleted {result['deleted_count']} FAQs",
            user_id=user_id,
            card_id=card_id,
            namespace=namespace
        )
        
    except Exception as e:
        logger.error(f"Error deleting FAQs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
