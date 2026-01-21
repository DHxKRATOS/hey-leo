from fastapi import APIRouter, HTTPException, Query, Path, Body
from typing import Optional, List, Dict, Any
from app.models.responses import (
    AnalyticsResponse, 
    AccuracyResponse, 
    BatchAccuracyResponse,
    UserAggregatedAnalyticsResponse,
    SearchResultsResponse,
    ImprovedAnswerResponse,
    UserConversationStatsResponse,
    CardConversationStats,
    QAItem, 
    AccuracyUpdate, 
    BatchAccuracyUpdate,
    ResponseQuality, 
    TimeFilter, 
    FrequentQuestion,
    SearchResultItem, 
    ImprovedAnswerUpdate
)
from app.services.chat_service import get_chat_service
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/metrics", response_model=AnalyticsResponse)
async def get_analytics_metrics(
    user_id: str,
    card_id: str,
    namespace: Optional[str] = None,
    min_confidence: float = Query(0.0, ge=0.0, le=1.0),
    max_confidence: float = Query(1.0, ge=0.0, le=1.0),
    quality: str = Query(ResponseQuality.ALL.value, description="Response quality filter (optional, good_responses,needs_improvement,unrated,defaults to all_responses)"),
    time_filter: str = Query(TimeFilter.ALL_TIME.value, description="Time filter for analytics (all_time, today, this_week, this_month)"),
    limit: int = Query(10, ge=1, le=100),
    visitor_only: bool = Query(True, description="If true, only include visitor conversations (exclude training)")
):
    """Get analytics metrics for a specific user and card."""
    try:
        logger.info(f"Getting analytics metrics for user_id: {user_id}, card_id: {card_id}, time_filter: {time_filter}")
        
        # Get chat service
        chat_service = await get_chat_service()
        
        # Get conversation count with detailed logging
        logger.info(f"Getting conversation count for user_id: {user_id}, card_id: {card_id}, time_filter: {time_filter}, visitor_only: {visitor_only}")
        conversation_count = await chat_service.get_conversation_count(user_id, card_id, namespace, time_filter, visitor_only)
        logger.info(f"Retrieved conversation count: {conversation_count}")
        
        # Get average confidence with detailed logging
        logger.info(f"Getting average confidence for user_id: {user_id}, card_id: {card_id}, time_filter: {time_filter}, visitor_only: {visitor_only}")
        avg_confidence = await chat_service.get_average_confidence(user_id, card_id, namespace, time_filter, visitor_only)
        avg_confidence_percent = int(avg_confidence * 100)
        logger.info(f"Retrieved average confidence: {avg_confidence:.4f} ({avg_confidence_percent}%)")
        
        # Get average accuracy with detailed logging
        logger.info(f"Getting average accuracy for user_id: {user_id}, card_id: {card_id}, time_filter: {time_filter}, visitor_only: {visitor_only}")
        avg_accuracy = await chat_service.get_average_accuracy(user_id, card_id, namespace, time_filter, visitor_only)
        avg_accuracy_percent = int(avg_accuracy * 100)
        logger.info(f"Retrieved average accuracy: {avg_accuracy:.4f} ({avg_accuracy_percent}%)")
        
        # Get QA items filtered by quality and confidence
        logger.info(f"Getting QA items with quality: {quality}, confidence between {min_confidence} and {max_confidence}, time_filter: {time_filter}, visitor_only: {visitor_only}")
        
        # Get QA items by confidence with the specified time_filter
        qa_items = await chat_service.get_qa_items_by_confidence(
            user_id, card_id, min_confidence, max_confidence, quality, namespace, time_filter, limit, visitor_only
        )
            
        logger.info(f"Retrieved {len(qa_items)} QA items with quality: {quality}")
        
        # Get most asked questions with the specified time_filter
        logger.info(f"Getting most asked questions for user_id: {user_id}, card_id: {card_id}, time_filter: {time_filter}")
        most_asked = await chat_service.get_most_asked_questions(user_id, card_id, 5, namespace, time_filter)
        
        # Convert to FrequentQuestion format
        frequent_questions = []
        for question in most_asked:
            frequent_questions.append(FrequentQuestion(
                query=question["query"],
                count=question["count"],
                cards=question["cards"],
                confidence=question["confidence"]
            ))
        
        logger.info(f"Retrieved {len(frequent_questions)} most asked questions")
        
        
        logger.info(f"Analytics metrics retrieved: {conversation_count} conversations, {avg_confidence_percent}% avg confidence, {avg_accuracy_percent}% avg accuracy, {len(qa_items)} QA items")
        
        return AnalyticsResponse(
            user_id=user_id,
            card_id=card_id,
            conversation_count=conversation_count,
            average_confidence=avg_confidence,
            average_confidence_percent=avg_confidence_percent,
            average_accuracy=avg_accuracy,
            average_accuracy_percent=avg_accuracy_percent,
            qa_count=len(qa_items),
            qa_items=qa_items,
            most_asked_questions=frequent_questions
        )
        
    except Exception as e:
        logger.error(f"Error retrieving analytics metrics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/messages/{message_id}/accuracy", response_model=AccuracyResponse)
async def update_message_accuracy(
    message_id: str = Path(..., description="ID of the message to update"),
    update: AccuracyUpdate = Body(..., description="Accuracy update data")
):
    """Update the accuracy rating for a specific message.
    
    This function updates the accuracy rating of a message identified by  the given
    message_id. It first validates the accuracy value to ensure  it is between 0.0
    and 1.0. If the value is valid, it retrieves the  chat service and attempts to
    update the message accuracy. The function  handles potential errors and returns
    an AccuracyResponse indicating  the success of the update operation.
    """
    try:
        if not (0.0 <= update.accuracy <= 1.0):
            raise HTTPException(status_code=400, detail="Accuracy must be between 0.0 and 1.0")
            
        logger.info(f"Updating accuracy for message {message_id} to {update.accuracy:.2f}")
        
        # Get chat service
        chat_service = await get_chat_service()
        
        # Update message accuracy
        success = await chat_service.update_message_accuracy(message_id, update.accuracy)
        
        if not success:
            return AccuracyResponse(
                message_id=message_id,
                accuracy=update.accuracy,
                updated=False,
                error="Message not found or update failed"
            )
        
        return AccuracyResponse(
            message_id=message_id,
            accuracy=update.accuracy,
            updated=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating message accuracy: {str(e)}")
        return AccuracyResponse(
            message_id=message_id,
            accuracy=update.accuracy if hasattr(update, 'accuracy') else 0.0,
            updated=False,
            error=str(e)
        )

@router.patch("/messages/accuracy/batch", response_model=BatchAccuracyResponse)
async def batch_update_accuracy(updates: BatchAccuracyUpdate = Body(..., description="Batch accuracy updates")):
    """Update accuracy ratings for multiple messages in a single request."""
    try:
        logger.info(f"Processing batch accuracy update for {len(updates.updates)} messages")
        
        # Get chat service
        chat_service = await get_chat_service()
        
        # Process batch update
        result = await chat_service.batch_update_message_accuracy(updates.updates)
        
        # Convert results to proper response format
        response_results = []
        for item in result["results"]:
            response_results.append(AccuracyResponse(
                message_id=item.get("message_id", ""),
                accuracy=item.get("accuracy", 0.0),
                updated=item.get("updated", False),
                error=item.get("error")
            ))
        
        return BatchAccuracyResponse(
            results=response_results,
            success_count=result["success_count"],
            failure_count=result["failure_count"]
        )
        
    except Exception as e:
        logger.error(f"Error processing batch accuracy update: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user-metrics", response_model=UserAggregatedAnalyticsResponse)
async def get_user_aggregated_analytics(
    user_id: str,
    card_id: Optional[str] = None,
    namespace: Optional[str] = None,
    time_range: str = Query(TimeFilter.LAST_30_DAYS.value, description="Time range filter (last_30_days, last_7_days, last_3_months, last_year)"),
    start_date: Optional[str] = Query(None, description="Start date for filtering (ISO format: YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date for filtering (ISO format: YYYY-MM-DD)"),
    limit: int = Query(10, ge=1, le=50, description="Maximum number of most asked questions to return"),
    visitor_only: bool = Query(True, description="If true, only include visitor conversations (exclude training)")
):
    """Get aggregated analytics metrics across all cards for a specific user.
    
    This function retrieves various analytics metrics for a user, including total
    conversations,  average confidence, average accuracy, and average response
    time. It can filter results based  on a specific card, time range, and date
    range. The function also logs relevant information  throughout the process and
    handles potential errors gracefully.
    
    Args:
        user_id (str): User identifier.
        card_id (Optional[str]): Optional card identifier (if not provided, metrics will be
            aggregated across all cards).
        namespace (Optional[str]): Optional namespace for filtering.
        time_range (str): Time range filter (default: last_30_days). Options:
            last_30_days, last_7_days, last_3_months, last_year.
        start_date (Optional[str]): Optional start date for filtering (ISO format: YYYY-MM-DD).
        end_date (Optional[str]): Optional end date for filtering (ISO format: YYYY-MM-DD).
        limit (int): Maximum number of most asked questions to return.
        visitor_only (bool): If true, only include visitor conversations (exclude training).
    """
    try:
        logger.info(f"Getting aggregated analytics metrics for user_id: {user_id}")
        
        # Get chat service
        chat_service = await get_chat_service()
        
        # Log time range, date range and card_id if specified
        filter_info = f" with time_range: {time_range}"
        if start_date or end_date:
            filter_info += f", date range: {start_date or 'any'} to {end_date or 'any'}"
        if card_id:
            filter_info += f", card_id: {card_id}"
        logger.info(f"Getting analytics metrics for user_id: {user_id}{filter_info}")
        
        # Get cards for the user (either all cards or the specific one)
        if card_id:
            # If card_id is specified, use only that card
            card_ids = [card_id]
            total_cards = 1
        else:
            # Otherwise get all cards for the user with time_range and date range
            card_ids = await chat_service.get_user_cards(user_id, namespace, time_range, start_date, end_date)
            total_cards = len(card_ids)
        
        logger.info(f"Using {total_cards} cards for user {user_id}{filter_info}")
        
        # Get total conversations count (independent of filters, only filtered by user_id and card_id)
        total_conversations = await chat_service.get_total_conversations_for_user(user_id, namespace, TimeFilter.ALL_TIME.value, None, None, card_id, visitor_only)
        logger.info(f"Total conversations for user {user_id} (all time, visitor_only={visitor_only}): {total_conversations}")
        
        # Get conversations count within the specified time range and date range
        conversations_in_date_range = await chat_service.get_total_conversations_for_user(user_id, namespace, time_range, start_date, end_date, card_id, visitor_only)
        logger.info(f"Conversations for user {user_id} in filtered period (visitor_only={visitor_only}): {conversations_in_date_range}")
        
        # Get average confidence with time range and date range
        avg_confidence = await chat_service.get_average_confidence_for_user(user_id, namespace, time_range, start_date, end_date, card_id, visitor_only)
        avg_confidence_percent = int(avg_confidence * 100)
        logger.info(f"Average confidence for user {user_id}{filter_info} (visitor_only={visitor_only}): {avg_confidence:.4f} ({avg_confidence_percent}%)")
        
        # Get average accuracy with time range and date range
        avg_accuracy = await chat_service.get_average_accuracy_for_user(user_id, namespace, time_range, start_date, end_date, card_id, visitor_only)
        avg_accuracy_percent = int(avg_accuracy * 100)
        logger.info(f"Average accuracy for user {user_id}{filter_info} (visitor_only={visitor_only}): {avg_accuracy:.4f} ({avg_accuracy_percent}%)")
        
        # Get average response time with time range and date range
        avg_response_time = await chat_service.get_average_response_time(user_id, namespace, time_range, start_date, end_date, card_id, visitor_only)
        logger.info(f"Average response time for user {user_id}{filter_info} (visitor_only={visitor_only}): {avg_response_time}ms")
        
        # Get most asked questions with time range
        most_asked = await chat_service.get_most_asked_questions(
            user_id=user_id, 
            limit=limit, 
            namespace=namespace, 
            time_filter=time_range, 
            card_id=card_id,
            visitor_only=visitor_only
        )
        logger.info(f"Retrieved {len(most_asked)} most asked questions for user {user_id} with time_range: {time_range} (visitor_only={visitor_only})")
        
        # Convert to FrequentQuestion format
        frequent_questions = [
            FrequentQuestion(
                query=item["query"],
                count=item["count"],
                cards=item["cards"],
                confidence=item["confidence"]
            ) for item in most_asked
        ]
        
        # Get daily conversation counts
        daily_counts = await chat_service.get_daily_conversation_counts(
            user_id=user_id,
            namespace=namespace,
            time_filter=time_range,
            start_date=start_date,
            end_date=end_date,
            card_id=card_id,
            visitor_only=visitor_only
        )
        logger.info(f"Retrieved daily conversation counts for user {user_id}: {len(daily_counts)} days")
        
        return UserAggregatedAnalyticsResponse(
            user_id=user_id,
            total_conversations=total_conversations,
            conversations_in_date_range=conversations_in_date_range,
            total_cards=total_cards,
            average_confidence=avg_confidence,
            average_confidence_percent=avg_confidence_percent,
            average_accuracy=avg_accuracy,
            average_accuracy_percent=avg_accuracy_percent,
            average_response_time_ms=avg_response_time,
            most_asked_questions=frequent_questions,
            daily_conversation_counts=daily_counts
        )
        
    except Exception as e:
        logger.error(f"Error retrieving user aggregated analytics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search-conversations", response_model=SearchResultsResponse)
async def search_conversations(
    user_id: str,
    card_id: str,
    search_query: Optional[str] = Query(None, description="Optional keywords to search for in questions or answers"),
    namespace: Optional[str] = None,
    time_filter: str = Query(TimeFilter.ALL_TIME.value, description="Time filter for search results (all_time, today, this_week, this_month)"),
    limit: int = Query(20, ge=1, le=100, description="Maximum number of search results to return"),
    visitor_only: bool = Query(True, description="If true, only return visitor conversations (exclude training conversations)")
):
    """Search conversations by keywords in questions or answers.
    
    Args:
        user_id (str): User identifier.
        card_id (str): Card identifier.
        search_query (Optional[str]): Optional keywords to search for in questions or answers.
        namespace (Optional[str]): Optional namespace for filtering.
        time_filter (str): Time filter for search results (all_time, today, this_week, this_month).
        limit (int): Maximum number of search results to return.
        visitor_only (bool): If true, only return visitor conversations.
    """
    try:
        logger.info(f"Searching conversations for user_id: {user_id} with query: '{search_query}', time filter: {time_filter}, visitor_only: {visitor_only}")
        
        # Get chat service
        chat_service = await get_chat_service()
        
        # Search messages by keywords (if search_query is None, return all messages)
        matching_messages = await chat_service.search_messages_by_keywords(
            user_id, 
            search_query, 
            card_id, 
            namespace, 
            time_filter,
            visitor_only=visitor_only
        )
        
        # Limit the number of results
        limited_results = matching_messages[:limit]
        
        # Convert to SearchResultItem format
        search_results = [
            SearchResultItem(
                id=msg.id,
                query=msg.query,
                answer=msg.answer,
                card_id=msg.card_id,
                confidence=msg.confidence,
                timestamp=msg.timestamp,
                visitor_id=getattr(msg, 'visitor_id', 'Anonymous')  # Include visitor_id with fallback to 'Anonymous'
            ) for msg in limited_results
        ]
        
        return SearchResultsResponse(
            user_id=user_id,
            search_query=search_query or "",
            total_results=len(matching_messages),
            results=search_results
        )
        
    except Exception as e:
        logger.error(f"Error searching conversations: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/improve-answer", response_model=ImprovedAnswerResponse)
async def improve_answer(
    update: ImprovedAnswerUpdate
):
    """Improve an answer for a specific message.
    
    This endpoint allows card owners to provide improved answers for specific
    questions.  The improved answer replaces the original answer directly in the
    database. The function  retrieves the chat service, updates the answer using
    the provided details, and handles  potential errors by returning appropriate
    HTTP status codes if the original message is  not found or if other issues
    occur during the update process.
    """
    try:
        logger.info(f"Improving answer for message {update.message_id}")
        
        # Get chat service
        chat_service = await get_chat_service()
        
        # Update the answer directly in chat_analytics_v1
        result = await chat_service.improve_answer(
            message_id=update.message_id,
            improved_answer=update.improved_answer,
            user_id=update.user_id,
            card_id=update.card_id
        )
        
        if not result["updated"]:
            # Return 404 if message not found or other error
            status_code = 404 if result["error"] == "Original message not found" else 400
            raise HTTPException(status_code=status_code, detail=result["error"])
        
        return ImprovedAnswerResponse(
            message_id=result["message_id"],
            original_query=result["original_query"],
            improved_answer=result["improved_answer"],
            updated_at=result["updated_at"],
            updated=True,
            error=None
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error improving answer: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/conversation-stats", response_model=UserConversationStatsResponse)
async def get_user_conversation_stats(
    user_id: str = Query(..., description="User ID to get conversation statistics for"),
    limit: Optional[int] = Query(None, description="Maximum number of cards to return")
):
    """Get conversation statistics for all cards belonging to a user.
    
    This function retrieves the total conversation count for each card associated
    with a specified user.  It first fetches the user's cards and applies an
    optional limit on the number of cards to process.  For each card, it gathers
    the conversation count and compiles the results into a response model,
    ensuring that any errors encountered during the process are logged and do not
    halt execution for other cards.
    
    Args:
        user_id: User identifier to get conversation statistics for.
        limit: Optional limit on the number of cards to return.
    """
    try:
        logger.info(f"Getting conversation stats for user {user_id} with limit {limit}")
        
        # Get chat service
        chat_service = await get_chat_service()
        
        # Get all cards for the user
        card_ids = await chat_service.get_user_cards(user_id)
        
        # Apply limit if specified
        if limit and limit > 0:
            card_ids = card_ids[:limit]
        
        logger.info(f"Found {len(card_ids)} cards for user {user_id}")
        
        # Get conversation count for each card
        card_stats = []
        for card_id in card_ids:
            try:
                # Get conversation count for this card
                conversation_count = await chat_service.get_total_conversations_for_user(
                    user_id=user_id,
                    card_id=card_id
                )
                
                card_stats.append(CardConversationStats(
                    card_id=card_id,
                    total_conversations=conversation_count
                ))
                
                logger.info(f"Card {card_id}: {conversation_count} conversations")
                
            except Exception as e:
                logger.warning(f"Error getting conversation count for card {card_id}: {str(e)}")
                # Continue with other cards even if one fails
                continue
        
        # Sort by conversation count (descending)
        card_stats.sort(key=lambda x: x.total_conversations, reverse=True)
        
        logger.info(f"Successfully retrieved conversation stats for {len(card_stats)} cards")
        
        return UserConversationStatsResponse(
            user_id=user_id,
            cards=card_stats,
            total_cards=len(card_stats)
        )
        
    except Exception as e:
        logger.error(f"Error retrieving conversation stats: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
