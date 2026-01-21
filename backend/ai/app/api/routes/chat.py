from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.requests import ChatRequest
from app.models.responses import ChatResponse
from app.services.vector_service import get_vector_service
from app.services.chat_service import get_chat_service
from app.workflows.rag_workflow import get_rag_workflow
from app.services.usage_tracker import get_usage_tracker
from app.services.greeting_detector import get_greeting_detector
import logging
import re
import uuid
import asyncio

logger = logging.getLogger(__name__)
router = APIRouter()

def extract_entity_from_query(query: str) -> str:
    """
    Extract the main entity being asked about from a query.
    For example, from "who is John Doe?", extract "John Doe".
    
    Args:
        query: The query string
        
    Returns:
        The extracted entity or empty string if no entity found
    """
    if not query:
        return ""
        
    # Common patterns for entity extraction
    patterns = [
        # "who is X" pattern
        r"who\s+is\s+([^\?]+)(?:\?)?$",
        # "what is X" pattern
        r"what\s+is\s+([^\?]+)(?:\?)?$",
        # "tell me about X" pattern
        r"tell\s+me\s+about\s+([^\?]+)(?:\?)?$",
    ]
    
    # Try each pattern
    for pattern in patterns:
        match = re.search(pattern, query.lower().strip())
        if match:
            return match.group(1).strip()
    
    # Default fallback - return the query without common question words and punctuation
    cleaned = re.sub(r'^(who|what|when|where|why|how)\s+', '', query.lower())
    cleaned = re.sub(r'[\?\!\.]', '', cleaned)
    return cleaned.strip()

async def search_improved_answers(chat_service, query: str, user_id: str, card_id: str, namespace: str = None):
    """
    Search for improved answers in parallel using vector search (FAST!).
    This function is designed to run concurrently with other operations.
    """
    try:
        logger.info(f"Searching for improved answers for query: '{query}'")
        
        # Use vector search instead of full scan (100x faster!)
        improved_points = await chat_service.search_improved_answers(
            query=query,
            user_id=user_id,
            card_id=card_id,
            namespace=namespace,
            limit=3  # Get top 5 matches
        )
        
        if improved_points and len(improved_points) > 0:
            # Already sorted by score from vector search
            best_match = improved_points[0]
            
            logger.info(f"Found improved answer with score {best_match.get('score', 0.0)}")
            
            # Create source with metadata
            source = {
                "text": best_match.get("answer", ""),
                "metadata": best_match.get("metadata", {})
            }
            
            # Add message_id to metadata
            source["metadata"]["message_id"] = best_match.get("id", "")
            
            return {
                "answer": best_match.get("answer", ""),
                "sources": [source],
                "confidence": float(best_match.get("confidence", 0.0)),
                "message_id": best_match.get("id", "")
            }
        
        return None
        
    except Exception as e:
        logger.error(f"Error searching improved answers: {str(e)}")
        return None

async def log_usage_stats(usage_data: dict):
    """
    Background task to log token usage statistics.
    This runs asynchronously after the response is sent to the user.
    """
    try:
        logger.info(f"📊 Token Usage Stats: {usage_data}")
        # Here you could also store usage in a database for analytics
    except Exception as e:
        logger.error(f"Failed to log usage stats: {str(e)}")

async def store_chat_message(
    chat_service,
    user_id: str,
    card_id: str,
    query: str,
    answer: str,
    sources: list,
    confidence: float,
    chat_session_id: str,
    namespace: str,
    visitor_id: str,
    response_time_ms: int,
    message_id: str = None,
    role: str = "visitor"
):
    """
    Background task to store chat message in chat_analytics_v1 collection.
    This runs asynchronously after the response is sent to the user.
    """
    try:
        # Skip storage for admin/training chats
        if role == "admin":
            logger.info(f"Skipping storage for admin chat: user_id={user_id}, role={role}")
            return
        
        logger.info(f"Background task: Storing chat message for user {user_id}, session {chat_session_id}")
        
        # Store conversation in chat history
        message = await chat_service.add_message(
            user_id=user_id,
            card_id=card_id,
            query=query,
            answer=answer,
            sources=sources,
            confidence=confidence,
            chat_session_id=chat_session_id,
            namespace=namespace,
            visitor_id=visitor_id,
            response_time_ms=response_time_ms,
            message_id=message_id
        )
        
        logger.info(f"Background task: Successfully stored message {message.id} for session {chat_session_id}")
        
    except Exception as e:
        logger.error(f"Background task: Error storing chat message for session {chat_session_id}: {str(e)}")
        # Don't raise exception - we don't want to crash the background task

@router.post("/query", response_model=ChatResponse)
async def chat_query(request: ChatRequest, background_tasks: BackgroundTasks):
    """Process a chat query using RAG workflow"""
    # ⏱️ Start timing the request
    request_start_time = asyncio.get_event_loop().time()
    
    try:
        # 📊 Start usage tracking for this request
        usage_tracker = get_usage_tracker()
        usage_tracker.start_tracking()
        
        # 👋 STEP 1: Check if query is a basic greeting
        greeting_detector = get_greeting_detector()
        greeting_response = greeting_detector.get_greeting_response(request.query)
        
        if greeting_response:
            # Handle greeting directly without RAG
            logger.info(f"✅ Detected greeting - responding directly without RAG")
            
            # Generate IDs for response
            temp_message_id = str(uuid.uuid4())
            temp_chat_session_id = request.chat_session_id or str(uuid.uuid4())
            
            # Calculate response time
            response_time_ms = int((asyncio.get_event_loop().time() - request_start_time) * 1000)
            
            # Get usage statistics (should be minimal for greetings)
            usage = usage_tracker.get_usage()
            usage_dict = usage.to_dict()
            
            # Get chat service for background storage
            chat_service = await get_chat_service()
            
            # Add background task to store greeting conversation
            background_tasks.add_task(
                store_chat_message,
                chat_service=chat_service,
                user_id=request.user_id,
                card_id=request.card_id,
                query=request.query,
                answer=greeting_response["answer"],
                sources=greeting_response["sources"],
                confidence=greeting_response["confidence"],
                chat_session_id=temp_chat_session_id,
                namespace=request.namespace,
                visitor_id=request.visitor_id,
                response_time_ms=response_time_ms,
                message_id=temp_message_id,
                role=request.role
            )
            
            # Add background task to log usage
            background_tasks.add_task(log_usage_stats, usage_dict)
            
            # Clear usage tracking
            usage_tracker.clear_usage()
            
            # Return greeting response immediately
            return ChatResponse(
                message_id=temp_message_id,
                query=request.query,
                answer=greeting_response["answer"],
                sources=greeting_response["sources"],
                confidence=greeting_response["confidence"],
                user_id=request.user_id,
                card_id=request.card_id,
                visitor_id=request.visitor_id,
                role=request.role,
                chat_session_id=temp_chat_session_id,
                usage=usage_dict
            )
        
        # 🔍 STEP 2: Not a greeting - proceed with RAG workflow
        logger.info(f"Not a greeting - proceeding with RAG workflow")
        
        # Get services
        vector_service = await get_vector_service()
        rag_workflow = await get_rag_workflow()
        chat_service = await get_chat_service()
        
        # ⚡ PARALLEL EXECUTION: Run vector search and improved answer search concurrently
        logger.info("Starting parallel execution: vector search + improved answer search")
        
        # Use hybrid search if enabled, otherwise use regular dense search
        from app.core.config import settings
        if settings.USE_HYBRID_SEARCH:
            search_task = vector_service.hybrid_search(
                query=request.query,
                user_id=request.user_id,
                card_id=request.card_id,
                limit=3,
                namespace=request.namespace
            )
        else:
            search_task = vector_service.search(
                query=request.query,
                user_id=request.user_id,
                card_id=request.card_id,
                limit=3,
                namespace=request.namespace
            )
        
        improved_answer_task = search_improved_answers(
            chat_service=chat_service,
            query=request.query,
            user_id=request.user_id,
            card_id=request.card_id,
            namespace=request.namespace
        )
        
        # Wait for both operations to complete in parallel
        search_results, improved_answer = await asyncio.gather(
            search_task,
            improved_answer_task,
            return_exceptions=True
        )
        
        # Handle exceptions from parallel execution
        if isinstance(search_results, Exception):
            logger.error(f"Error in vector search: {str(search_results)}")
            raise search_results
        
        if isinstance(improved_answer, Exception):
            logger.warning(f"Error in improved answer search: {str(improved_answer)}")
            improved_answer = None
        
        logger.info(f"Parallel execution completed: vector search returned {len(search_results)} results")
        
        # Apply confidence filtering - use min_confidence as threshold
        # Only return results with confidence >= min_confidence
        if request.min_confidence is not None and request.min_confidence > 0:
            filtered_results = []
            for result in search_results:
                # Use the vector search score as confidence
                confidence = result.score
                
                # Only include results where confidence >= min threshold
                if confidence >= request.min_confidence:
                    filtered_results.append(result)
            
            logger.info(f"Filtered search results from {len(search_results)} to {len(filtered_results)} with confidence >= {request.min_confidence}")
            search_results = filtered_results
        
        # ✅ Priority 1: Check if improved answer meets confidence requirements and skip LLM
        if improved_answer:
            confidence = improved_answer.get("confidence", 0.0)
            
            # For improved answers, we need high confidence (0.75+) to ensure it's the same question
            # 0.75+ indicates very similar semantic meaning in vector space
            # IMPORTANT: Always use 0.75 threshold for improved answers, ignore max_confidence
            # max_confidence is for search result filtering, not for cached answer reuse
            improved_answer_threshold = 0.75
            threshold = improved_answer_threshold
            
            if confidence < threshold:
                logger.info(f"Improved answer confidence {confidence} below threshold {threshold} - will use LLM instead")
                improved_answer = None
            # Only use improved answer if confidence >= threshold
            elif confidence >= threshold:
                # ✅ HIGH CONFIDENCE IMPROVED ANSWER - SKIP LLM ENTIRELY!
                logger.info(f"✅ Using cached improved answer (confidence: {confidence}) - NO LLM CALL - Saved ~3.3s")
                response = improved_answer
                
                # Generate temporary IDs for immediate response
                temp_message_id = str(uuid.uuid4())
                temp_chat_session_id = request.chat_session_id or str(uuid.uuid4())
                
                # ⏱️ Calculate response time
                response_time_ms = int((asyncio.get_event_loop().time() - request_start_time) * 1000)
                
                # 📊 Capture usage statistics (only embeddings and search, no LLM)
                usage = usage_tracker.get_usage()
                usage_dict = usage.to_dict()
                
                # Add background task to store conversation after response is sent
                background_tasks.add_task(
                    store_chat_message,
                    chat_service=chat_service,
                    user_id=request.user_id,
                    card_id=request.card_id,
                    query=request.query,
                    answer=response["answer"],
                    sources=response["sources"],
                    confidence=response["confidence"],
                    chat_session_id=temp_chat_session_id,
                    namespace=request.namespace,
                    visitor_id=request.visitor_id,
                    response_time_ms=response_time_ms,
                    message_id=temp_message_id,
                    role=request.role
                )
                
                # Add background task to log usage statistics
                background_tasks.add_task(log_usage_stats, usage_dict)
                
                # Clear usage tracking
                usage_tracker.clear_usage()
                
                # Return response immediately without LLM call
                return ChatResponse(
                    message_id=temp_message_id,
                    query=request.query,
                    answer=response["answer"],
                    sources=response["sources"],
                    confidence=response["confidence"],
                    user_id=request.user_id,
                    card_id=request.card_id,
                    visitor_id=request.visitor_id,
                    role=request.role,
                    chat_session_id=temp_chat_session_id,
                    usage=usage_dict  # Include usage in response
                )
            else:
                logger.info(f"Improved answer confidence {confidence} below threshold 0.40")
                improved_answer = None
        
        # If no improved answer found, try the vector search results as fallback
        if not improved_answer:
            # Filter search results for any that have been improved
            improved_results = [result for result in search_results if result.metadata.get("has_been_improved") is True]
            
            if improved_results:
                # Sort by score (highest first)
                improved_results.sort(key=lambda x: x.score, reverse=True)
                best_match = improved_results[0]
                
                # Apply confidence filtering if specified
                confidence = best_match.score
                
                # Check if confidence meets threshold
                threshold = request.max_confidence if request.max_confidence is not None else 0.40
                
                if confidence < threshold:
                    logger.info(f"Vector search improved answer confidence {confidence} below threshold {threshold}")
                elif confidence >= threshold:
                    logger.info(f"Using improved answer from vector search for query: {request.query}")
                    
                    # Create source with metadata
                    source = {
                        "text": best_match.text,
                        "metadata": best_match.metadata
                    }
                    
                    # Add message_id to metadata if available
                    if hasattr(best_match, 'id'):
                        source["metadata"]["message_id"] = best_match.id
                    
                    # Create improved answer response
                    improved_answer = {
                        "answer": best_match.text,
                        "sources": [source],
                        "confidence": float(best_match.score)
                    }
                    
                    # Add message_id to response if available
                    if hasattr(best_match, 'id'):
                        improved_answer["message_id"] = best_match.id
        
        # If no improved answer found, process with RAG workflow
        if not improved_answer:
            response = await rag_workflow.process_query(
                query=request.query,
                search_results=search_results,
                chat_session_id=request.chat_session_id
            )
        else:
            response = improved_answer
        
        # Generate temporary IDs for immediate response
        temp_message_id = str(uuid.uuid4())
        temp_chat_session_id = request.chat_session_id or str(uuid.uuid4())
        
        # ⏱️ Calculate response time
        response_time_ms = int((asyncio.get_event_loop().time() - request_start_time) * 1000)
        
        # 📊 Capture usage statistics before returning response
        usage = usage_tracker.get_usage()
        usage_dict = usage.to_dict()
        
        # Add background task to store conversation after response is sent
        background_tasks.add_task(
            store_chat_message,
            chat_service=chat_service,
            user_id=request.user_id,
            card_id=request.card_id,
            query=request.query,
            answer=response["answer"],
            sources=response["sources"],
            confidence=response["confidence"],
            chat_session_id=temp_chat_session_id,
            namespace=request.namespace,
            visitor_id=request.visitor_id,
            response_time_ms=response_time_ms,
            message_id=temp_message_id,
            role=request.role
        )
        
        # Add background task to log usage statistics
        background_tasks.add_task(log_usage_stats, usage_dict)
        
        # Clear usage tracking for this request
        usage_tracker.clear_usage()
        
        # Return response immediately without waiting for storage
        return ChatResponse(
            message_id=temp_message_id,
            query=request.query,
            answer=response["answer"],
            sources=response["sources"],
            confidence=response["confidence"],
            user_id=request.user_id,
            card_id=request.card_id,
            visitor_id=request.visitor_id,
            role=request.role,
            chat_session_id=temp_chat_session_id,
            usage=usage_dict  # Include usage in response
        )
        
    except Exception as e:
        logger.error(f"Error processing chat query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
