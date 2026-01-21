from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from app.models.responses import DocumentUploadResponse, DocumentListResponse, DocumentItem, DeleteResponse
from app.models.vector import SourceType
from typing import Optional, List
from app.services.document_service import get_document_service
from app.services.vector_service import get_vector_service
from app.services.usage_tracker import get_usage_tracker
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    card_id: str = Form(...),
    namespace: str = Form(None)
):
    """Upload and process a document"""
    try:
        # 📊 Start usage tracking
        usage_tracker = get_usage_tracker()
        usage_tracker.start_tracking()
        
        # Read file content
        file_content = await file.read()
        
        # Get services
        document_service = await get_document_service()
        vector_service = await get_vector_service()
        
        # Process document
        chunks = await document_service.process_file(file_content, file.filename)
        
        # Insert into vector database (this will create embeddings and track usage)
        result = await vector_service.ingest_chunks(
            chunks, 
            user_id, 
            card_id, 
            namespace
        )
        
        # 📊 Capture usage statistics AFTER inserting (so we get embedding tokens)
        usage = usage_tracker.get_usage()
        usage_dict = usage.to_dict()
        usage_tracker.clear_usage()
        
        return DocumentUploadResponse(
            message=f"Successfully processed {file.filename}",
            inserted_count=result.inserted_count,
            user_id=user_id,
            card_id=card_id,
            namespace=namespace,
            usage=usage_dict
        )
        
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=DocumentListResponse)
async def get_documents(user_id: str, card_id: str, namespace: Optional[str] = None):
    """Get all documents for a user"""
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Get documents directly by source_type without embedding
        results = await vector_service.get_user_data_by_type(
            user_id=user_id,
            card_id=card_id,
            source_type=SourceType.DOCUMENT,
            namespace=namespace,
            limit=100  # Get up to 100 documents
        )
        
        # Group chunks by document_id to avoid duplicates
        document_map = {}
        for result in results:
            # Get document_id from the result (now properly extracted from payload)
            doc_id = result.document_id if result.document_id else result.id
            
            # Only add unique documents
            if doc_id not in document_map:
                metadata = result.metadata
                document_map[doc_id] = DocumentItem(
                    id=doc_id,
                    filename=metadata.get("filename", "Unknown")
                )
        
        documents = list(document_map.values())
        
        return DocumentListResponse(
            user_id=user_id,
            card_id=card_id,
            namespace=namespace,
            documents=documents,
            total_count=len(documents)
        )
        
    except Exception as e:
        logger.error(f"Error retrieving documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete", response_model=DeleteResponse)
async def delete_document(user_id: str, card_id: str, document_id: Optional[str] = None, namespace: Optional[str] = None):
    """Delete documents for a user
    
    If document_id is provided, only that specific document will be deleted.
    Otherwise, all documents for the user/card/namespace will be deleted.
    """
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Call delete method with appropriate parameters
        if document_id:
            # Delete all chunks of a specific document using document_id
            result = await vector_service.delete_user_data(
                user_id=user_id,
                card_id=card_id,
                document_id=document_id,
                source_type=SourceType.DOCUMENT,
                namespace=namespace
            )
        else:
            # Delete all documents for user/card
            result = await vector_service.delete_user_data(
                user_id=user_id,
                card_id=card_id,
                source_type=SourceType.DOCUMENT,
                namespace=namespace
            )
        
        # Clear caches after deletion to prevent stale data
        vector_service.query_cache.clear()
        logger.info(f"Cleared query cache after deleting {result['deleted_count']} documents")
        
        # Also clear RAG workflow cache
        from app.workflows.rag_workflow import get_rag_workflow
        rag_workflow = await get_rag_workflow()
        rag_workflow.llm_cache.clear()
        logger.info("Cleared LLM cache after document deletion")
        
        return DeleteResponse(
            status=result["status"],
            deleted_count=result["deleted_count"],
            message=f"Successfully deleted {result['deleted_count']} documents",
            user_id=user_id,
            card_id=card_id,
            namespace=namespace
        )
        
    except Exception as e:
        logger.error(f"Error deleting documents: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
