import logging
from typing import List, Dict, Any, Optional, Tuple, Union
from datetime import datetime, timedelta
import uuid
import asyncio
import time
import numpy as np
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.http.models import PointStruct

from app.models.chat import ChatMessage, ChatSession
from app.models.responses import ResponseQuality, TimeFilter
from app.core.exceptions import ChatServiceException
from app.core.config import settings
from app.services.vector_service import get_vector_service

logger = logging.getLogger(__name__)

class ChatService:
    """Service for managing chat history and analytics using Qdrant"""
    
    # Class-level cache for collection existence and index checks
    _collection_initialized = {}
    _indexes_initialized = {}
    _all_points_cache = {}
    _all_points_cache_time = {}
    _cache_ttl = 60  # Cache TTL in seconds
    
    def __init__(self):
        self.collection_name = "chat_analytics_v1"  # Use a distinct name to avoid conflicts
        self.vector_dim = 3072  # Using OpenAI's embedding dimension from text-embedding-3-large
        self.qdrant_client = None
        self.vector_service = None
    
    async def initialize(self):
        """Initialize the service with connections (optimized for speed)"""
        if self.qdrant_client is None:
            # Get vector service to reuse its client
            self.vector_service = await get_vector_service()
            self.qdrant_client = self.vector_service.qdrant_client
            
            # Ensure collection exists (only if not already initialized)
            collection_key = f"{self.collection_name}_{self.vector_dim}"
            if collection_key not in ChatService._collection_initialized:
                # Check if collection exists without creating indexes
                try:
                    collection_info = self.qdrant_client.get_collection(collection_name=self.collection_name)
                    # If we get here, collection exists - create indexes if needed
                    logger.debug(f"Collection {self.collection_name} already exists")
                    await self._create_essential_indexes(self.collection_name)
                    ChatService._collection_initialized[collection_key] = True
                except Exception:
                    # Collection doesn't exist, create it with indexes
                    await self._ensure_collection_exists()
                    ChatService._collection_initialized[collection_key] = True
    
    async def _ensure_collection_exists(self):
        """Ensure the chat analytics collection exists with correct vector dimension"""
        try:
            # Ensure chat analytics collection exists
            await self._ensure_single_collection_exists(self.collection_name)
                
        except Exception as e:
            logger.error(f"Error ensuring collections exist: {str(e)}")
            raise ChatServiceException(f"Failed to initialize chat service: {str(e)}")
            
    async def _ensure_single_collection_exists(self, collection_name: str):
        """Ensure a single collection exists with correct vector dimension"""
        try:
            # Check if we've already verified this collection in this session
            collection_key = f"{collection_name}_{self.vector_dim}"
            if collection_key in ChatService._collection_initialized:
                logger.debug(f"Collection {collection_name} already verified in this session")
                return
                
            logger.info(f"Checking if collection {collection_name} exists")
            collection_exists = False
            
            try:
                # First, check if the collection exists
                collection_info = self.qdrant_client.get_collection(collection_name=collection_name)
                logger.info(f"Collection {collection_name} exists, checking vector dimension")
                collection_exists = True
                
                # Check if the vector dimension matches
                existing_dim = collection_info.config.params.vectors.size
                if existing_dim != self.vector_dim:
                    logger.warning(f"Vector dimension mismatch: collection {collection_name} has {existing_dim}, but we need {self.vector_dim}")
                    logger.warning(f"Recreating collection {collection_name} with correct dimension")
                    
                    # Delete the existing collection
                    self.qdrant_client.delete_collection(collection_name=collection_name)
                    logger.info(f"Deleted collection {collection_name}")
                    collection_exists = False
                else:
                    logger.info(f"Collection {collection_name} has correct vector dimension: {existing_dim}")
                    
                    # Only check indexes once per session
                    if collection_name not in ChatService._indexes_initialized:
                        self._ensure_type_index_exists(collection_name)
                        ChatService._indexes_initialized[collection_name] = True
                    
                    # Mark collection as initialized
                    ChatService._collection_initialized[collection_key] = True
                    return
                    
            except Exception as e:
                # Collection doesn't exist or couldn't be accessed
                logger.info(f"Collection {collection_name} doesn't exist or couldn't be accessed: {str(e)}")
                collection_exists = False
            
            # Create the collection if it doesn't exist or was deleted due to dimension mismatch
            if not collection_exists:
                # Create the collection with appropriate settings
                self.qdrant_client.create_collection(
                    collection_name=collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=self.vector_dim,
                        distance=qmodels.Distance.COSINE
                    )
                )
                logger.info(f"Created collection {collection_name} with vector dimension {self.vector_dim}")
                
                # Create payload index for the 'type' field
                self._ensure_type_index_exists(collection_name)
                ChatService._indexes_initialized[collection_name] = True
                
                # Mark collection as initialized
                ChatService._collection_initialized[collection_key] = True
                
        except Exception as e:
            logger.error(f"Error ensuring collection {collection_name} exists: {str(e)}")
            raise ChatServiceException(f"Failed to initialize collection {collection_name}: {str(e)}")
                
    def _ensure_type_index_exists(self, collection_name: str):
        """Create essential indexes only once during collection initialization
        
        Args:
            collection_name: The name of the collection to create indexes for
        """
        # Only create the most essential indexes - we'll assume they exist after initial creation
        try:
            # Create index for 'type' field - critical for message filtering
            self.qdrant_client.create_payload_index(
                collection_name=collection_name,
                field_name="type",
                field_schema="keyword"
            )
            logger.info(f"Created index for 'type' field in {collection_name} collection")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.debug(f"Index for 'type' field already exists")
            else:
                logger.warning(f"Error creating index for 'type': {str(e)}")
                
        # Create index for 'user_id' field - needed for user filtering
        try:
            self.qdrant_client.create_payload_index(
                collection_name=collection_name,
                field_name="user_id",
                field_schema="keyword"
            )
            logger.info(f"Created index for 'user_id' field in {collection_name} collection")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.debug(f"Index for 'user_id' field already exists")
            else:
                logger.warning(f"Error creating index for 'user_id': {str(e)}")
                
        # Create index for 'has_been_improved' field - critical for improved answer retrieval
        try:
            self.qdrant_client.create_payload_index(
                collection_name=collection_name,
                field_name="has_been_improved",
                field_schema="bool"
            )
            logger.info(f"Created index for 'has_been_improved' field in {collection_name} collection")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.debug(f"Index for 'has_been_improved' field already exists")
            else:
                logger.warning(f"Error creating index for 'has_been_improved': {str(e)}")
        
        # Create index for 'timestamp' field - needed for time-based Range filters
        try:
            self.qdrant_client.create_payload_index(
                collection_name=collection_name,
                field_name="timestamp",
                field_schema="float"
            )
            logger.info(f"Created index for 'timestamp' field in {collection_name} collection")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.debug(f"Index for 'timestamp' field already exists")
            else:
                logger.warning(f"Error creating index for 'timestamp': {str(e)}")
        
        # Create index for 'created_at' field - needed for session time-based Range filters
        try:
            self.qdrant_client.create_payload_index(
                collection_name=collection_name,
                field_name="created_at",
                field_schema="float"
            )
            logger.info(f"Created index for 'created_at' field in {collection_name} collection")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.debug(f"Index for 'created_at' field already exists")
            else:
                logger.warning(f"Error creating index for 'created_at': {str(e)}")
    
    async def get_all_points(self) -> List[Dict[str, Any]]:
        """Get all points from the collection with caching for improved performance"""
        await self.initialize()
        
        try:
            # Check if we have a recent cache
            current_time = time.time()
            cache_key = self.collection_name
            
            if (cache_key in ChatService._all_points_cache and 
                current_time - ChatService._all_points_cache_time.get(cache_key, 0) < ChatService._cache_ttl):
                logger.debug(f"Using cached points for collection {self.collection_name}")
                return ChatService._all_points_cache[cache_key]
            
            logger.info(f"Getting all points in collection {self.collection_name}")
            
            # Get collection info to check if it exists
            try:
                self.qdrant_client.get_collection(collection_name=self.collection_name)
            except Exception as e:
                logger.warning(f"Collection {self.collection_name} doesn't exist: {str(e)}")
                return []
            
            # Use scroll to get all points with optimized parameters
            all_points = []
            offset = None
            
            # Increase batch size for faster retrieval
            batch_size = 250
            
            while True:
                response = self.qdrant_client.scroll(
                    collection_name=self.collection_name,
                    limit=batch_size,
                    offset=offset,
                    with_payload=True,
                    with_vectors=False  # Don't need vectors for most operations
                )
                
                # Unpack the response tuple (points, next_page_offset)
                points, next_offset = response
                
                # Add points to result with efficient processing
                all_points.extend([{"id": point.id, "payload": point.payload} for point in points])
                
                # Check if we're done
                if not next_offset:
                    break
                    
                # Update offset for next batch
                offset = next_offset
            
            # Update the cache
            ChatService._all_points_cache[cache_key] = all_points
            ChatService._all_points_cache_time[cache_key] = current_time
            
            logger.info(f"Retrieved {len(all_points)} points from collection {self.collection_name}")
            return all_points
            
        except Exception as e:
            logger.error(f"Error getting all points: {str(e)}")
            return []
    
    async def _create_embedding(self, text: str) -> List[float]:
        """Create embedding for text using vector service"""
        await self.initialize()
        
        try:
            # Use the vector service to create the embedding
            embedding = await self.vector_service._create_single_embedding_optimized(text)
            
            # Check if the embedding dimension matches what we expect
            if len(embedding) != self.vector_dim:
                logger.warning(f"Embedding dimension mismatch: got {len(embedding)}, expected {self.vector_dim}")
                # Adjust our expected dimension to match what the service provides
                self.vector_dim = len(embedding)
                logger.info(f"Adjusted vector_dim to {self.vector_dim}")
                
            return embedding
        except Exception as e:
            logger.error(f"Error creating embedding: {str(e)}")
            # Return a zero vector as fallback with correct dimension
            return [0.0] * self.vector_dim
    
    async def get_or_create_session(self, user_id: str, card_id: str, session_id: Optional[str] = None, namespace: Optional[str] = None, visitor_id: Optional[str] = None) -> ChatSession:
        """Get an existing session or create a new one"""
        await self.initialize()
        
        try:
            # Validate session_id is a valid UUID before attempting retrieval
            if session_id:
                # Check if session_id is a valid UUID format
                try:
                    uuid.UUID(session_id)
                except (ValueError, AttributeError):
                    logger.warning(f"Invalid session_id format: '{session_id}'. Creating new session instead.")
                    session_id = None
            
            # If session_id is provided and valid, try to find it
            if session_id:
                logger.info(f"Looking for existing session with ID: {session_id}")
                
                try:
                    # Direct point retrieval by ID
                    points = self.qdrant_client.retrieve(
                        collection_name=self.collection_name,
                        ids=[session_id]
                    )
                    
                    if points:
                        point = points[0]
                        payload = point.payload
                        
                        if payload.get("type") == "session":
                            logger.info(f"Found existing session with ID: {session_id}")
                            return ChatSession.from_qdrant_payload(point.id, payload)
                        else:
                            logger.warning(f"ID {session_id} exists but is not a session")
                    else:
                        logger.warning(f"Session with ID {session_id} not found")
                        
                except Exception as e:
                    logger.warning(f"Could not retrieve session directly: {str(e)}")
            
            # Create a new session
            logger.info(f"Creating new chat session for user_id: {user_id}, card_id: {card_id}, visitor_id: {visitor_id}")
            
            new_session = ChatSession(
                user_id=user_id,
                card_id=card_id,
                namespace=namespace,
                visitor_id=visitor_id
            )
            
            # Store in Qdrant
            try:
                embedding = await self._create_embedding(new_session.get_embedding_text())
                
                self.qdrant_client.upsert(
                    collection_name=self.collection_name,
                    points=[PointStruct(
                        id=new_session.id,
                        vector=embedding,
                        payload=new_session.to_qdrant_payload()
                    )]
                )
                logger.info(f"Created new session with ID: {new_session.id}")
            except Exception as e:
                logger.error(f"Error storing new session in Qdrant: {str(e)}")
                raise ChatServiceException(f"Failed to store chat session in database: {str(e)}")
            
            return new_session
        except Exception as e:
            logger.error(f"Error creating new session: {str(e)}")
            raise ChatServiceException(f"Failed to create chat session: {str(e)}")
    
    async def add_message(self, user_id: str, card_id: str, query: str, answer: str, 
                         sources: List[Dict[str, Any]], confidence: float, 
                         chat_session_id: Optional[str] = None, namespace: Optional[str] = None,
                         visitor_id: Optional[str] = "Anonymous", response_time_ms: Optional[int] = None,
                         message_id: Optional[str] = None) -> ChatMessage:
        """Add a new message to the chat history"""
        try:
            await self.initialize()
            
            # Get or create session
            session = await self.get_or_create_session(user_id, card_id, chat_session_id, namespace, visitor_id)
            
            # Create message
            try:
                message = ChatMessage(
                    id=message_id,  # Use provided message_id if available
                    user_id=user_id,
                    card_id=card_id,
                    query=query,
                    answer=answer,
                    sources=sources,
                    confidence=confidence,
                    chat_session_id=session.id,
                    namespace=namespace,
                    visitor_id=visitor_id,
                    response_time_ms=response_time_ms
                )
            except Exception as e:
                logger.error(f"Error creating message object: {str(e)}")
                raise ChatServiceException(f"Failed to create message: {str(e)}")
            
            # Store message in Qdrant
            try:
                logger.info(f"Creating embedding for message: {message.id}")
                embedding = await self._create_embedding(message.get_embedding_text())
                
                logger.info(f"Storing message in Qdrant: {message.id}")
                self.qdrant_client.upsert(
                    collection_name=self.collection_name,
                    points=[PointStruct(
                        id=message.id,
                        vector=embedding,
                        payload=message.to_qdrant_payload()
                    )]
                )
                logger.info(f"Successfully stored message: {message.id}")
                
                # Update session message count
                session.message_count += 1
                session.last_activity = message.timestamp
                
                # Update session in Qdrant
                try:
                    logger.info(f"Updating session with new message count: {session.id}")
                    session_embedding = await self._create_embedding(session.get_embedding_text())
                    self.qdrant_client.upsert(
                        collection_name=self.collection_name,
                        points=[PointStruct(
                            id=session.id,
                            vector=session_embedding,
                            payload=session.to_qdrant_payload()
                        )]
                    )
                    logger.info(f"Successfully updated session: {session.id}")
                except Exception as e:
                    logger.warning(f"Failed to update session after adding message: {str(e)}")
                    # Continue since the message was stored successfully
            except Exception as e:
                logger.error(f"Error storing message in Qdrant: {str(e)}")
                raise ChatServiceException(f"Failed to store chat message: {str(e)}")
            
            return message
        except Exception as e:
            logger.error(f"Error in add_message: {str(e)}")
            raise ChatServiceException(f"Failed to add message: {str(e)}")
    
    def is_message_in_time_period(self, message: ChatMessage, time_filter: str) -> bool:
        """Check if a message falls within the specified time period
        
        Args:
            message: The message to check
            time_filter: Time filter (all_time, today, this_week, this_month, last_7_days, last_30_days, last_3_months, last_year)
            
        Returns:
            bool: True if the message is within the time period, False otherwise
        """
        if time_filter == TimeFilter.ALL_TIME.value:
            return True
            
        # Parse message timestamp
        try:
            message_time = datetime.fromisoformat(message.timestamp)
        except (ValueError, TypeError):
            logger.warning(f"Invalid timestamp format: {message.timestamp}")
            return False
            
        now = datetime.now()
        today_start = datetime(now.year, now.month, now.day)
        
        if time_filter == TimeFilter.TODAY.value:
            return message_time >= today_start
        elif time_filter == TimeFilter.THIS_WEEK.value:
            # Get the start of the current week (Monday)
            start_of_week = today_start - timedelta(days=now.weekday())
            return message_time >= start_of_week
        elif time_filter == TimeFilter.THIS_MONTH.value:
            # Get the start of the current month
            start_of_month = datetime(now.year, now.month, 1)
            return message_time >= start_of_month
        elif time_filter == TimeFilter.LAST_7_DAYS.value:
            # Last 7 days from now
            seven_days_ago = now - timedelta(days=7)
            return message_time >= seven_days_ago
        elif time_filter == TimeFilter.LAST_30_DAYS.value:
            # Last 30 days from now
            thirty_days_ago = now - timedelta(days=30)
            return message_time >= thirty_days_ago
        elif time_filter == TimeFilter.LAST_3_MONTHS.value:
            # Last 3 months from now (approximately 90 days)
            three_months_ago = now - timedelta(days=90)
            return message_time >= three_months_ago
        elif time_filter == TimeFilter.LAST_YEAR.value:
            # Last year from now (365 days)
            one_year_ago = now - timedelta(days=365)
            return message_time >= one_year_ago
        else:
            # Unknown time filter, default to all time
            return True
            
    def is_message_in_date_range(self, message: ChatMessage, start_date: Optional[str] = None, end_date: Optional[str] = None) -> bool:
        """Check if a message falls within the specified date range
        
        Args:
            message: The message to check
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            
        Returns:
            bool: True if the message is within the date range, False otherwise
        """
        if not start_date and not end_date:
            return True  # No date range specified, include all messages
            
        # Parse message timestamp
        try:
            message_time = datetime.fromisoformat(message.timestamp)
        except (ValueError, TypeError):
            logger.warning(f"Invalid timestamp format: {message.timestamp}")
            return False
            
        # Check start date
        if start_date:
            try:
                start = datetime.fromisoformat(f"{start_date}T00:00:00")
                if message_time < start:
                    return False
            except ValueError:
                logger.warning(f"Invalid start date format: {start_date}")
                
        # Check end date
        if end_date:
            try:
                # End date is inclusive, so use 23:59:59
                end = datetime.fromisoformat(f"{end_date}T23:59:59")
                if message_time > end:
                    return False
            except ValueError:
                logger.warning(f"Invalid end date format: {end_date}")
                
        return True
    
    async def get_user_cards(self, user_id: str, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[str]:
        """Get all card_ids for a specific user within the specified time period or date range
        
        Args:
            user_id: User identifier
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            
        Returns:
            List of card_ids
        """
        await self.initialize()
        
        logger.info(f"Getting all cards for user {user_id} with time filter: {time_filter}")
        
        # Get all points and filter for unique card_ids
        all_points = await self.get_all_points()
        card_ids = set()
        
        for point in all_points:
            payload = point.get("payload", {})
            if (payload.get("type") == "message" and 
                payload.get("user_id") == user_id and
                (namespace is None or payload.get("namespace") == namespace)):
                
                # Apply time filter and date range filter
                try:
                    message = ChatMessage.from_qdrant_payload(point["id"], payload)
                    if self.is_message_in_time_period(message, time_filter) and self.is_message_in_date_range(message, start_date, end_date):
                        card_ids.add(payload.get("card_id"))
                except Exception as e:
                    logger.warning(f"Error processing message for card_id: {str(e)}")
        
        logger.info(f"Found {len(card_ids)} unique cards for user {user_id} after applying time filter: {time_filter}")
        return list(card_ids)
        
    async def get_total_conversations_for_user(self, user_id: str, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None, card_id: Optional[str] = None, visitor_only: bool = True) -> int:
        """Get total conversation count across all cards for a user within the specified time period or date range
        
        Args:
            user_id: User identifier
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            
        Returns:
            Total conversation count
        """
        await self.initialize()
        
        logger.info(f"Getting total conversation count for user {user_id} with time filter: {time_filter}")
        
        # Get cards for the user (either all cards or the specific one)
        if card_id:
            # If card_id is specified, use only that card
            card_ids = [card_id]
        else:
            # Otherwise get all cards for the user with time filter and date range
            card_ids = await self.get_user_cards(user_id, namespace, time_filter, start_date, end_date)
        
        # For accurate time filtering, we need to count sessions directly
        # Get all points and filter for sessions
        all_points = await self.get_all_points()
        sessions = []
        
        for point in all_points:
            payload = point.get("payload", {})
            if (payload.get("type") == "session" and 
                payload.get("user_id") == user_id and
                payload.get("card_id") in card_ids and
                (namespace is None or payload.get("namespace") == namespace)):
                
                # Apply time filter
                try:
                    # Create a dummy message to use the time filter function
                    dummy_message = ChatMessage(
                        user_id=payload.get("user_id"),
                        card_id=payload.get("card_id"),
                        query="",
                        answer="",
                        sources=[],
                        confidence=0.0,
                        chat_session_id=point["id"],
                        timestamp=payload.get("last_activity")
                    )
                        
                    if self.is_message_in_time_period(dummy_message, time_filter) and self.is_message_in_date_range(dummy_message, start_date, end_date):
                        # Apply visitor_only filter
                        if visitor_only:
                            visitor_id = payload.get("visitor_id", "")
                            if visitor_id and visitor_id != user_id and visitor_id.lower() != "training":
                                sessions.append(point["id"])
                        else:
                            sessions.append(point["id"])
                except Exception as e:
                    logger.warning(f"Error processing session for time filter: {str(e)}")
        
        total_count = len(sessions)
        logger.info(f"Total conversation count for user {user_id} with time filter {time_filter}, visitor_only={visitor_only}: {total_count}")
        return total_count
    
    async def get_daily_conversation_counts(self, user_id: str, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None, card_id: Optional[str] = None, visitor_only: bool = True) -> List[Dict[str, Any]]:
        """Get daily conversation counts for a user within the specified time period
        
        Args:
            user_id: User identifier
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month, last_7_days, last_30_days, etc.)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            card_id: Optional card_id for filtering
            
        Returns:
            List of daily conversation counts with date and count
        """
        await self.initialize()
        
        logger.info(f"Getting daily conversation counts for user {user_id} with time filter: {time_filter}")
        
        # Get cards for the user (either all cards or the specific one)
        if card_id:
            card_ids = [card_id]
        else:
            card_ids = await self.get_user_cards(user_id, namespace, time_filter, start_date, end_date)
        
        # Get all points and filter for sessions
        all_points = await self.get_all_points()
        sessions_by_date = {}
        
        for point in all_points:
            payload = point.get("payload", {})
            if (payload.get("type") == "session" and 
                payload.get("user_id") == user_id and
                payload.get("card_id") in card_ids and
                (namespace is None or payload.get("namespace") == namespace)):
                
                try:
                    # Create a dummy message to use the time filter function
                    dummy_message = ChatMessage(
                        user_id=payload.get("user_id"),
                        card_id=payload.get("card_id"),
                        query="",
                        answer="",
                        sources=[],
                        confidence=0.0,
                        chat_session_id=point["id"],
                        timestamp=payload.get("last_activity")
                    )
                    
                    if self.is_message_in_time_period(dummy_message, time_filter) and self.is_message_in_date_range(dummy_message, start_date, end_date):
                        # Apply visitor_only filter
                        if visitor_only:
                            visitor_id = payload.get("visitor_id", "")
                            if not (visitor_id and visitor_id != user_id and visitor_id.lower() != "training"):
                                continue
                        
                        # Extract date from timestamp
                        timestamp = payload.get("last_activity")
                        if timestamp:
                            date_str = timestamp.split("T")[0]  # Get YYYY-MM-DD part
                            sessions_by_date[date_str] = sessions_by_date.get(date_str, 0) + 1
                except Exception as e:
                    logger.warning(f"Error processing session for daily counts: {str(e)}")
        
        # Determine the date range based on time_filter
        if start_date and end_date:
            start_dt = datetime.fromisoformat(start_date)
            end_dt = datetime.fromisoformat(end_date)
        else:
            end_dt = datetime.utcnow()
            if time_filter == TimeFilter.TODAY.value:
                start_dt = end_dt.replace(hour=0, minute=0, second=0, microsecond=0)
            elif time_filter == TimeFilter.THIS_WEEK.value:
                start_dt = end_dt - timedelta(days=end_dt.weekday())
            elif time_filter == TimeFilter.THIS_MONTH.value:
                start_dt = end_dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            elif time_filter == TimeFilter.LAST_7_DAYS.value:
                start_dt = end_dt - timedelta(days=6)
            elif time_filter == TimeFilter.LAST_30_DAYS.value:
                start_dt = end_dt - timedelta(days=29)
            elif time_filter == TimeFilter.LAST_3_MONTHS.value:
                start_dt = end_dt - timedelta(days=89)
            elif time_filter == TimeFilter.LAST_YEAR.value:
                start_dt = end_dt - timedelta(days=364)
            else:  # ALL_TIME
                # For all time, just return the dates we have data for
                daily_counts = [
                    {"date": date, "count": count}
                    for date, count in sorted(sessions_by_date.items())
                ]
                logger.info(f"Daily conversation counts for user {user_id}: {len(daily_counts)} days with data")
                return daily_counts
        
        # Generate all dates in the range and fill with counts (0 if no data)
        daily_counts = []
        current_dt = start_dt
        while current_dt <= end_dt:
            date_str = current_dt.strftime("%Y-%m-%d")
            count = sessions_by_date.get(date_str, 0)
            daily_counts.append({"date": date_str, "count": count})
            current_dt += timedelta(days=1)
        
        logger.info(f"Daily conversation counts for user {user_id} with time filter {time_filter}: {len(daily_counts)} days")
        return daily_counts
        
    async def get_average_confidence_for_user(self, user_id: str, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None, card_id: Optional[str] = None, visitor_only: bool = True) -> float:
        """Get average confidence across all cards for a user within the specified time period or date range
        
        Args:
            user_id: User identifier
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            
        Returns:
            Average confidence score (0.0 to 1.0)
        """
        await self.initialize()
        
        logger.info(f"Getting average confidence across all cards for user {user_id} with time filter: {time_filter}")
        
        # Get all messages for the user
        all_points = await self.get_all_points()
        messages = []
        
        for point in all_points:
            payload = point.get("payload", {})
            if (payload.get("type") == "message" and 
                payload.get("user_id") == user_id and
                (namespace is None or payload.get("namespace") == namespace)):
                try:
                    message = ChatMessage.from_qdrant_payload(point["id"], payload)
                    # Apply time filter and date range filter
                    if self.is_message_in_time_period(message, time_filter) and self.is_message_in_date_range(message, start_date, end_date):
                        messages.append(message)
                except Exception as e:
                    logger.warning(f"Error processing message: {str(e)}")
        
        if not messages:
            logger.info(f"No messages found for user {user_id} with time filter: {time_filter}")
            return 0.0
        
        # Calculate average confidence
        total_confidence = sum(msg.confidence for msg in messages)
        avg_confidence = total_confidence / len(messages)
        
        logger.info(f"Average confidence across all cards for user {user_id} with time filter {time_filter}: {avg_confidence:.4f} ({len(messages)} messages)")
        return avg_confidence
        
    async def get_average_accuracy_for_user(self, user_id: str, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None, card_id: Optional[str] = None, visitor_only: bool = True) -> float:
        """Get average accuracy across all cards for a user within the specified time period or date range
        
        Args:
            user_id: User identifier
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            
        Returns:
            Average accuracy score (0.0 to 1.0)
        """
        await self.initialize()
        
        logger.info(f"Getting average accuracy across all cards for user {user_id} with time filter: {time_filter}")
        
        # Get all messages for the user
        all_points = await self.get_all_points()
        messages = []
        
        for point in all_points:
            payload = point.get("payload", {})
            if (payload.get("type") == "message" and 
                payload.get("user_id") == user_id and
                (namespace is None or payload.get("namespace") == namespace)):
                try:
                    message = ChatMessage.from_qdrant_payload(point["id"], payload)
                    # Apply time filter and date range filter
                    if self.is_message_in_time_period(message, time_filter) and self.is_message_in_date_range(message, start_date, end_date):
                        messages.append(message)
                except Exception as e:
                    logger.warning(f"Error processing message: {str(e)}")
        
        if not messages:
            logger.info(f"No messages found for user {user_id} with time filter: {time_filter}")
            return 0.0
        
        # Filter messages that have accuracy ratings
        messages_with_accuracy = [msg for msg in messages if msg.accuracy is not None]
        if not messages_with_accuracy:
            logger.info(f"No messages with accuracy data found for user {user_id} with time filter: {time_filter}")
            return 0.0
        
        # Calculate average accuracy
        total_accuracy = sum(msg.accuracy for msg in messages_with_accuracy)
        avg_accuracy = total_accuracy / len(messages_with_accuracy)
        
        logger.info(f"Average accuracy across all cards for user {user_id} with time filter {time_filter}: {avg_accuracy:.4f} ({len(messages_with_accuracy)}/{len(messages)} messages rated)")
        return avg_accuracy
        
    async def get_average_response_time(self, user_id: str, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None, card_id: Optional[str] = None, visitor_only: bool = True) -> int:
        """Get average response time in milliseconds within the specified time period or date range
        
        Args:
            user_id: User identifier
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            card_id: Optional card_id for filtering
            
        Returns:
            Average response time in milliseconds
        """
        await self.initialize()
        
        logger.info(f"Calculating average response time for user {user_id} with time filter: {time_filter}")
        
        # Get all messages for the user
        all_points = await self.get_all_points()
        response_times = []
        
        # Extract response times from messages
        for point in all_points:
            payload = point.get("payload", {})
            if (payload.get("type") == "message" and 
                payload.get("user_id") == user_id and
                (namespace is None or payload.get("namespace") == namespace) and
                (card_id is None or payload.get("card_id") == card_id)):
                try:
                    message = ChatMessage.from_qdrant_payload(point["id"], payload)
                    # Apply time filter and date range filter
                    if self.is_message_in_time_period(message, time_filter) and self.is_message_in_date_range(message, start_date, end_date):
                        # Use stored response_time_ms if available
                        if message.response_time_ms is not None and message.response_time_ms > 0:
                            response_times.append(message.response_time_ms)
                except Exception as e:
                    logger.warning(f"Error processing message for response time calculation: {str(e)}")
        
        if not response_times:
            logger.info(f"No messages with response time found for user {user_id} with time filter: {time_filter}")
            return 0
            
        avg_response_time = int(sum(response_times) / len(response_times))
        logger.info(f"Average response time for user {user_id}: {avg_response_time}ms (from {len(response_times)} messages)")
        
        return avg_response_time
        
    async def store_usage_data(
        self,
        user_id: str,
        card_id: str,
        operation_type: str,  # "document_upload", "scrape", "faq_add", "additional_text", "chat"
        usage_data: Dict[str, Any],
        namespace: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """Store usage data in Qdrant for analytics"""
        try:
            await self.initialize()
            
            usage_id = str(uuid.uuid4())
            timestamp = datetime.utcnow().isoformat()
            
            # Create payload
            payload = {
                "type": "usage",
                "operation_type": operation_type,
                "user_id": user_id,
                "card_id": card_id,
                "namespace": namespace,
                "timestamp": timestamp,
                "usage": usage_data,
                "metadata": metadata or {}
            }
            
            # Create a simple embedding (we don't need semantic search for usage data)
            # Just use a dummy vector since we'll query by filters only
            dummy_vector = [0.0] * self.vector_dim
            
            # Store in Qdrant
            point = PointStruct(
                id=usage_id,
                vector=dummy_vector,
                payload=payload
            )
            
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=[point],
                wait=True  # Wait for indexing so data is immediately queryable
            )
            
            logger.info(f"Stored usage data for {operation_type} (user: {user_id}, card: {card_id})")
            return usage_id
            
        except Exception as e:
            logger.error(f"Error storing usage data: {str(e)}")
            return ""
    
    async def search_improved_answers(self, query: str, user_id: str, card_id: str, namespace: Optional[str] = None, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for improved answers using vector search (FAST!)"""
        try:
            await self.initialize()
            
            # Create embedding for the query
            embedding = await self._create_embedding(query)
            
            # Build filter for improved answers only
            conditions = [
                qmodels.FieldCondition(key="type", match=qmodels.MatchValue(value="message")),
                qmodels.FieldCondition(key="has_been_improved", match=qmodels.MatchValue(value=True)),
                qmodels.FieldCondition(key="user_id", match=qmodels.MatchValue(value=user_id)),
                qmodels.FieldCondition(key="card_id", match=qmodels.MatchValue(value=card_id))
            ]
            if namespace:
                conditions.append(qmodels.FieldCondition(key="namespace", match=qmodels.MatchValue(value=namespace)))
            
            search_filter = qmodels.Filter(must=conditions)
            
            # Vector search (FAST - uses HNSW index)
            results = self.qdrant_client.search(
                collection_name=self.collection_name,
                query_vector=embedding,
                query_filter=search_filter,
                limit=limit,
                with_payload=True,
                with_vectors=False,
                search_params=qmodels.SearchParams(
                    hnsw_ef=16,  # Fast search
                    exact=False
                )
            )
            
            # Convert to dict format
            improved_answers = []
            for result in results:
                improved_answers.append({
                    "id": result.id,
                    "query": result.payload.get("query", ""),
                    "answer": result.payload.get("answer", ""),
                    "confidence": result.score,
                    "score": result.score,
                    "metadata": result.payload.get("metadata", {})
                })
            
            logger.info(f"Found {len(improved_answers)} improved answers using vector search")
            return improved_answers
            
        except Exception as e:
            logger.error(f"Error searching improved answers: {str(e)}")
            return []
    
    async def get_most_asked_questions(self, user_id: str, limit: int = 5, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None, card_id: Optional[str] = None, visitor_only: bool = True) -> List[Dict[str, Any]]:
        """Get most frequently asked questions across all cards for a user
        
        Args:
            user_id: User identifier
            limit: Maximum number of questions to return
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            card_id: Optional card identifier (if provided, only include questions for this card)
            
        Returns:
            List of most asked questions with count, cards, and average confidence
        """
        try:
            await self.initialize()
            
            logger.info(f"Getting most asked questions for user {user_id} with time filter: {time_filter}, card_id: {card_id}")
            
            # Get all messages for the user
            all_points = await self.get_all_points()
            messages = []
            
            for point in all_points:
                payload = point.get("payload", {})
                if (payload.get("type") == "message" and 
                    payload.get("user_id") == user_id and
                    (namespace is None or payload.get("namespace") == namespace) and
                    (card_id is None or payload.get("card_id") == card_id)):
                    try:
                        message = ChatMessage.from_qdrant_payload(point["id"], payload)
                        # Apply time filter and date range filter
                        if self.is_message_in_time_period(message, time_filter) and self.is_message_in_date_range(message, start_date, end_date):
                            messages.append(message)
                    except Exception as e:
                        logger.warning(f"Error processing message: {str(e)}")
            
            if not messages:
                logger.info(f"No messages found for user {user_id} with time filter: {time_filter}")
                return []
            
            # Group by normalized query
            query_groups = {}
            for message in messages:
                # Normalize query (lowercase, strip punctuation)
                normalized_query = message.query.lower().strip()
                
                if normalized_query not in query_groups:
                    query_groups[normalized_query] = {
                        "query": message.query,  # Use the original query for display
                        "count": 0,
                        "cards": set(),
                        "confidence_sum": 0.0
                    }
                
                query_groups[normalized_query]["count"] += 1
                query_groups[normalized_query]["cards"].add(message.card_id)
                query_groups[normalized_query]["confidence_sum"] += message.confidence
            
            # Convert to list and calculate average confidence
            result = []
            for query_data in query_groups.values():
                result.append({
                    "query": query_data["query"],
                    "count": query_data["count"],
                    "cards": list(query_data["cards"]),
                    "confidence": query_data["confidence_sum"] / query_data["count"]
                })
            
            # Sort by count (descending) and limit
            result.sort(key=lambda x: x["count"], reverse=True)
            result = result[:limit]
            
            logger.info(f"Found {len(result)} most asked questions for user {user_id}")
            return result
        except Exception as e:
            logger.error(f"Error getting most asked questions: {str(e)}")
            return []
        
    async def search_messages_by_keywords(self, user_id: str, search_query: Optional[str] = None, card_id: Optional[str] = None, namespace: Optional[str] = None, time_filter: str = TimeFilter.ALL_TIME.value, start_date: Optional[str] = None, end_date: Optional[str] = None, visitor_only: bool = True) -> List[ChatMessage]:
        """Search messages by keywords in query or answer, or return all messages if no search query provided
        
        Args:
            user_id: User identifier
            search_query: Optional keywords to search for (if None, returns all messages)
            card_id: Optional card identifier for filtering
            namespace: Optional namespace for filtering
            time_filter: Time filter (all_time, today, this_week, this_month)
            start_date: Optional start date in YYYY-MM-DD format
            end_date: Optional end date in YYYY-MM-DD format
            visitor_only: If True, only return visitor conversations (exclude training conversations)
            
        Returns:
            List of messages matching the search query or all messages if no query provided
        """
        await self.initialize()
        
        # If no search query provided, return all messages (with filters applied)
        if not search_query or search_query.strip() == "":
            logger.info(f"No search query provided for user {user_id}, returning all messages with filters (visitor_only={visitor_only})")
            return_all = True
        else:
            logger.info(f"Searching messages for user {user_id} with query: '{search_query}' and time filter: {time_filter} (visitor_only={visitor_only})")
            return_all = False
            search_terms = search_query.lower().split()
        
        # Get all messages for the user
        all_points = await self.get_all_points()
        matching_messages = []
        
        for point in all_points:
            payload = point.get("payload", {})
            if (payload.get("type") == "message" and 
                payload.get("user_id") == user_id and
                (card_id is None or payload.get("card_id") == card_id) and
                (namespace is None or payload.get("namespace") == namespace)):
                
                # Filter out training conversations if visitor_only is True
                if visitor_only:
                    visitor_id = payload.get("visitor_id", "")
                    # Skip if visitor_id is empty, None, or matches the user_id (training mode)
                    if not visitor_id or visitor_id == user_id or visitor_id.lower() == "training":
                        continue
                
                try:
                    message = ChatMessage.from_qdrant_payload(point["id"], payload)
                    
                    # Apply time filter and date range filter
                    if not self.is_message_in_time_period(message, time_filter) or not self.is_message_in_date_range(message, start_date, end_date):
                        continue
                    
                    # If returning all messages, add without keyword check
                    if return_all:
                        matching_messages.append(message)
                    else:
                        # Check if any search term is in the query or answer
                        query_text = message.query.lower()
                        answer_text = message.answer.lower()
                        
                        if any(term in query_text or term in answer_text for term in search_terms):
                            matching_messages.append(message)
                        
                except Exception as e:
                    logger.warning(f"Error processing message during search: {str(e)}")
        
        if return_all:
            logger.info(f"Found {len(matching_messages)} total messages for user {user_id} (visitor_only={visitor_only})")
        else:
            logger.info(f"Found {len(matching_messages)} messages matching search query '{search_query}' for user {user_id} (visitor_only={visitor_only})")
        return matching_messages
        
    async def improve_answer(self, message_id: str, improved_answer: str, user_id: str, card_id: str) -> Dict[str, Any]:
        """Update an answer directly in the chat_analytics_v1 collection
        
        Args:
            message_id: ID of the message to update
            improved_answer: The improved answer text
            user_id: User who is making the improvement
            card_id: Card ID associated with the improvement
            
        Returns:
            Dictionary with update status and message details
        """
        await self.initialize()
        
        logger.info(f"Updating answer for message {message_id} in {self.collection_name} collection")
        
        try:
            # Direct point retrieval by ID
            points = self.qdrant_client.retrieve(
                collection_name=self.collection_name,
                ids=[message_id]
            )
            
            if not points:
                logger.warning(f"Message with ID {message_id} not found")
                return {
                    "message_id": message_id,
                    "updated": False,
                    "error": "Original message not found",
                    "original_query": "",
                    "improved_answer": improved_answer,
                    "updated_at": datetime.utcnow().isoformat()
                }
                
            point = points[0]
            payload = point.payload
            
            if payload.get("type") != "message":
                logger.warning(f"ID {message_id} exists but is not a message")
                return {
                    "message_id": message_id,
                    "updated": False,
                    "error": "ID exists but is not a message",
                    "original_query": "",
                    "improved_answer": improved_answer,
                    "updated_at": datetime.utcnow().isoformat()
                }
                
            # Store the original values
            original_query = payload.get("query", "")
            
            # Create a new updated payload
            updated_payload = dict(payload)
            
            # Update the answer directly in the payload
            updated_payload["answer"] = improved_answer
            
            # Add improvement metadata
            updated_payload["has_been_improved"] = True
            updated_payload["improved_by"] = user_id
            updated_payload["improved_at"] = datetime.utcnow().isoformat()
            
            # Create new embedding for the updated content
            embedding_text = f"{original_query} {improved_answer}"
            vector = await self._create_embedding(embedding_text)
            
            # Update the point in the collection with new vector and payload
            self.qdrant_client.upsert(
                collection_name=self.collection_name,
                points=[PointStruct(
                    id=message_id,
                    vector=vector,  # Use the new vector based on improved answer
                    payload=updated_payload
                )]
            )
            
            logger.info(f"Successfully updated answer for message {message_id}")
            
            return {
                "message_id": message_id,
                "original_query": original_query,
                "improved_answer": improved_answer,
                "updated_at": updated_payload["improved_at"],
                "updated": True,
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error updating answer: {str(e)}")
            return {
                "message_id": message_id,
                "updated": False,
                "error": f"Error updating answer: {str(e)}",
                "original_query": "",
                "improved_answer": improved_answer,
                "updated_at": datetime.utcnow().isoformat()
            }
    
    # The get_improved_answers_batch and find_related_improved_answers methods have been removed
    # as we now update answers directly in the chat_analytics_v1 collection

    async def get_conversation_count(self, user_id: str, card_id: str, namespace: Optional[str] = None, time_filter: str = "all_time", visitor_only: bool = True) -> int:
        """Get the count of unique conversations for a user and card
        
        Args:
            user_id: The user ID to filter by
            card_id: The card ID to filter by
            namespace: Optional namespace to filter by
            time_filter: Optional time filter (today, this_week, this_month, all_time)
            visitor_only: If True, only count visitor conversations (exclude training)
            
        Returns:
            The count of unique conversations
        """
        await self.initialize()
        
        try:
            # Search for chat sessions
            filter_conditions = [
                qmodels.FieldCondition(
                    key="type",
                    match=qmodels.MatchValue(value="chat_session")
                ),
                qmodels.FieldCondition(
                    key="user_id",
                    match=qmodels.MatchValue(value=user_id)
                ),
                qmodels.FieldCondition(
                    key="card_id",
                    match=qmodels.MatchValue(value=card_id)
                )
            ]
            
            # Add namespace filter if provided
            if namespace:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="namespace",
                        match=qmodels.MatchValue(value=namespace)
                    )
                )
            
            # Create the filter (without time filter - will apply in-memory)
            filter_query = qmodels.Filter(must=filter_conditions)
            
            # Get all sessions and filter by time in-memory
            if time_filter != "all_time":
                # Get all sessions first
                sessions = self.qdrant_client.scroll(
                    collection_name=self.collection_name,
                    scroll_filter=filter_query,
                    limit=10000,
                    with_payload=True
                )[0]
                
                # Filter by time in-memory
                now = datetime.now()
                if time_filter == "today":
                    start_datetime = datetime(now.year, now.month, now.day)
                elif time_filter == "this_week":
                    start_datetime = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
                elif time_filter == "this_month":
                    start_datetime = datetime(now.year, now.month, 1)
                else:
                    start_datetime = None
                
                if start_datetime:
                    filtered_sessions = []
                    for session in sessions:
                        created_at_str = session.payload.get("created_at")
                        if created_at_str:
                            try:
                                created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                                if created_at >= start_datetime:
                                    filtered_sessions.append(session)
                            except:
                                pass
                    sessions = filtered_sessions
                
                # Apply visitor_only filter
                if visitor_only:
                    visitor_filtered = []
                    for session in sessions:
                        visitor_id = session.payload.get("visitor_id", "")
                        if visitor_id and visitor_id != user_id and visitor_id.lower() != "training":
                            visitor_filtered.append(session)
                    return len(visitor_filtered)
                else:
                    return len(sessions)
            else:
                # For all_time, get all sessions and apply visitor filter
                sessions = self.qdrant_client.scroll(
                    collection_name=self.collection_name,
                    scroll_filter=filter_query,
                    limit=10000,
                    with_payload=True
                )[0]
                
                # Apply visitor_only filter
                if visitor_only:
                    visitor_filtered = []
                    for session in sessions:
                        visitor_id = session.payload.get("visitor_id", "")
                        if visitor_id and visitor_id != user_id and visitor_id.lower() != "training":
                            visitor_filtered.append(session)
                    return len(visitor_filtered)
                else:
                    return len(sessions)
            
        except Exception as e:
            logger.error(f"Error getting conversation count: {str(e)}")
            return 0

    async def get_average_confidence(self, user_id: str, card_id: str, namespace: Optional[str] = None, time_filter: str = "all_time", visitor_only: bool = True) -> float:
        """Get the average confidence score for a user and card
        
        Args:
            user_id: The user ID to filter by
            card_id: The card ID to filter by
            namespace: Optional namespace to filter by
            time_filter: Optional time filter (today, this_week, this_month, all_time)
            
        Returns:
            The average confidence score (0.0 to 1.0)
        """
        await self.initialize()
        
        try:
            # Search for messages
            filter_conditions = [
                qmodels.FieldCondition(
                    key="type",
                    match=qmodels.MatchValue(value="message")
                ),
                qmodels.FieldCondition(
                    key="user_id",
                    match=qmodels.MatchValue(value=user_id)
                ),
                qmodels.FieldCondition(
                    key="card_id",
                    match=qmodels.MatchValue(value=card_id)
                )
            ]
            
            # Add namespace filter if provided
            if namespace:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="namespace",
                        match=qmodels.MatchValue(value=namespace)
                    )
                )
            
            # Create the filter (without time filter - will apply in-memory)
            filter_query = qmodels.Filter(must=filter_conditions)
            
            # Get all messages
            search_results = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                scroll_filter=filter_query,
                limit=10000,  # Get up to 10000 messages
                with_payload=True
            )[0]  # [0] contains the points, [1] contains next_page_offset
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return 0.0
            
            # Apply time filter in-memory if needed
            if time_filter != "all_time":
                now = datetime.now()
                if time_filter == "today":
                    start_datetime = datetime(now.year, now.month, now.day)
                elif time_filter == "this_week":
                    start_datetime = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
                elif time_filter == "this_month":
                    start_datetime = datetime(now.year, now.month, 1)
                else:
                    start_datetime = None
                
                if start_datetime:
                    filtered_results = []
                    for point in search_results:
                        timestamp_str = point.payload.get("timestamp")
                        if timestamp_str:
                            try:
                                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                                if timestamp >= start_datetime:
                                    filtered_results.append(point)
                            except:
                                pass
                    search_results = filtered_results
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return 0.0
            
            # Apply visitor_only filter
            if visitor_only:
                visitor_filtered = []
                for point in search_results:
                    visitor_id = point.payload.get("visitor_id", "")
                    if visitor_id and visitor_id != user_id and visitor_id.lower() != "training":
                        visitor_filtered.append(point)
                search_results = visitor_filtered
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return 0.0
            
            # Calculate average confidence
            total_confidence = 0.0
            count = 0
            
            for point in search_results:
                confidence = point.payload.get("confidence", 0.0)
                if isinstance(confidence, (int, float)):
                    total_confidence += confidence
                    count += 1
            
            if count == 0:
                logger.info(f"No messages with confidence data found for user {user_id} and card {card_id}")
                return 0.0
            
            avg_confidence = total_confidence / count
            logger.info(f"Average confidence for user {user_id} and card {card_id}: {avg_confidence:.4f} (from {count} messages)")
            
            return avg_confidence
            
        except Exception as e:
            logger.error(f"Error getting average confidence: {str(e)}")
            return 0.0
    
    async def get_average_accuracy(self, user_id: str, card_id: str, namespace: Optional[str] = None, time_filter: str = "all_time", visitor_only: bool = True) -> float:
        """Get the average accuracy score for a user and card
        
        Args:
            user_id: The user ID to filter by
            card_id: The card ID to filter by
            namespace: Optional namespace to filter by
            time_filter: Optional time filter (today, this_week, this_month, all_time)
            
        Returns:
            The average accuracy score (0.0 to 1.0)
        """
        await self.initialize()
        
        try:
            # Search for messages
            filter_conditions = [
                qmodels.FieldCondition(
                    key="type",
                    match=qmodels.MatchValue(value="message")
                ),
                qmodels.FieldCondition(
                    key="user_id",
                    match=qmodels.MatchValue(value=user_id)
                ),
                qmodels.FieldCondition(
                    key="card_id",
                    match=qmodels.MatchValue(value=card_id)
                )
            ]
            
            # Add namespace filter if provided
            if namespace:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="namespace",
                        match=qmodels.MatchValue(value=namespace)
                    )
                )
            
            # Create the filter (without time filter - will apply in-memory)
            filter_query = qmodels.Filter(must=filter_conditions)
            
            # Get all messages
            search_results = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                scroll_filter=filter_query,
                limit=10000,  # Get up to 10000 messages
                with_payload=True
            )[0]  # [0] contains the points, [1] contains next_page_offset
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return 0.0
            
            # Apply time filter in-memory if needed
            if time_filter != "all_time":
                now = datetime.now()
                if time_filter == "today":
                    start_datetime = datetime(now.year, now.month, now.day)
                elif time_filter == "this_week":
                    start_datetime = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
                elif time_filter == "this_month":
                    start_datetime = datetime(now.year, now.month, 1)
                else:
                    start_datetime = None
                
                if start_datetime:
                    filtered_results = []
                    for point in search_results:
                        timestamp_str = point.payload.get("timestamp")
                        if timestamp_str:
                            try:
                                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                                if timestamp >= start_datetime:
                                    filtered_results.append(point)
                            except:
                                pass
                    search_results = filtered_results
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return 0.0
            
            # Apply visitor_only filter
            if visitor_only:
                visitor_filtered = []
                for point in search_results:
                    visitor_id = point.payload.get("visitor_id", "")
                    if visitor_id and visitor_id != user_id and visitor_id.lower() != "training":
                        visitor_filtered.append(point)
                search_results = visitor_filtered
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return 0.0
            
            # Calculate average accuracy
            total_accuracy = 0.0
            count = 0
            
            for point in search_results:
                # Check if the message has an accuracy rating
                accuracy = point.payload.get("accuracy")
                if accuracy is not None and isinstance(accuracy, (int, float)):
                    total_accuracy += accuracy
                    count += 1
            
            if count == 0:
                logger.info(f"No messages with accuracy data found for user {user_id} and card {card_id}")
                return 0.0
            
            avg_accuracy = total_accuracy / count
            logger.info(f"Average accuracy for user {user_id} and card {card_id}: {avg_accuracy:.4f} (from {count} messages)")
            
            return avg_accuracy
            
        except Exception as e:
            logger.error(f"Error getting average accuracy: {str(e)}")
            return 0.0

    async def get_average_accuracy_DUPLICATE_TO_DELETE(self, user_id: str, card_id: str, namespace: Optional[str] = None, time_filter: str = "all_time") -> float:
        """Get the average accuracy score for a user and card
        
        Args:
            user_id: The user ID to filter by
            card_id: The card ID to filter by
            namespace: Optional namespace to filter by
            time_filter: Optional time filter (today, this_week, this_month, all_time)
            
        Returns:
            The average accuracy score (0.0 to 1.0)
        """
        await self.initialize()
        
        try:
            # Search for messages
            filter_conditions = [
                qmodels.FieldCondition(
                    key="type",
                    match=qmodels.MatchValue(value="message")
                ),
                qmodels.FieldCondition(
                    key="user_id",
                    match=qmodels.MatchValue(value=user_id)
                ),
                qmodels.FieldCondition(
                    key="card_id",
                    match=qmodels.MatchValue(value=card_id)
                )
            ]
            
            # Add namespace filter if provided
            if namespace:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="namespace",
                        match=qmodels.MatchValue(value=namespace)
                    )
                )
            
            # Apply time filter if specified
            if time_filter != "all_time":
                # Get the start date based on the time filter
                now = datetime.now()
                if time_filter == "today":
                    start_datetime = datetime(now.year, now.month, now.day)
                elif time_filter == "this_week":
                    # Get the start of the current week (Monday)
                    start_datetime = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
                elif time_filter == "this_month":
                    # Get the start of the current month
                    start_datetime = datetime(now.year, now.month, 1)
                else:
                    start_datetime = None
                
                if start_datetime:
                    # Convert to ISO string for comparison with existing data
                    start_date_str = start_datetime.isoformat()
                    filter_conditions.append(
                        qmodels.FieldCondition(
                            key="timestamp",
                            range=qmodels.Range(gte=start_date_str)
                        )
                    )
            
            # Create the filter
            filter_query = qmodels.Filter(must=filter_conditions)
            
            # Get all messages
            search_results = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                scroll_filter=filter_query,
                limit=1000,  # Get up to 1000 messages
                with_payload=True
            )[0]  # [0] contains the points, [1] contains next_page_offset
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return 0.0
            
            # Calculate average accuracy
            total_accuracy = 0.0
            count = 0
            
            for point in search_results:
                # Check if the message has an accuracy rating
                accuracy = point.payload.get("accuracy")
                if accuracy is not None and isinstance(accuracy, (int, float)):
                    total_accuracy += accuracy
                    count += 1
            
            if count == 0:
                logger.info(f"No messages with accuracy data found for user {user_id} and card {card_id}")
                return 0.0
            
            avg_accuracy = total_accuracy / count
            logger.info(f"Average accuracy for user {user_id} and card {card_id}: {avg_accuracy:.4f} (from {count} messages)")
            
            return avg_accuracy
            
        except Exception as e:
            logger.error(f"Error getting average accuracy: {str(e)}")
            return 0.0

    async def get_qa_items_by_confidence(self, user_id: str, card_id: str, min_confidence: float = 0.0, max_confidence: float = 1.0, quality: str = "all_responses", namespace: Optional[str] = None, time_filter: str = "all_time", limit: int = 10, visitor_only: bool = True) -> List[Dict[str, Any]]:
        """Get QA items filtered by confidence range and quality
        
        Args:
            user_id: The user ID to filter by
            card_id: The card ID to filter by
            min_confidence: Minimum confidence threshold (0.0 to 1.0)
            max_confidence: Maximum confidence threshold (0.0 to 1.0)
            quality: Response quality filter (all_responses, good_responses, needs_improvement, unrated)
            namespace: Optional namespace to filter by
            time_filter: Optional time filter (today, this_week, this_month, all_time)
            limit: Maximum number of QA items to return
            
        Returns:
            List of QA items matching the criteria
        """
        await self.initialize()
        
        try:
            # Search for messages
            filter_conditions = [
                qmodels.FieldCondition(
                    key="type",
                    match=qmodels.MatchValue(value="message")
                ),
                qmodels.FieldCondition(
                    key="user_id",
                    match=qmodels.MatchValue(value=user_id)
                ),
                qmodels.FieldCondition(
                    key="card_id",
                    match=qmodels.MatchValue(value=card_id)
                )
            ]
            
            # Add namespace filter if provided
            if namespace:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="namespace",
                        match=qmodels.MatchValue(value=namespace)
                    )
                )
            
            # NOTE: Confidence filtering moved to in-memory (after retrieval)
            # because confidence field may not be indexed in Qdrant
            
            # Apply quality filter
            if quality != "all_responses":
                if quality == "good_responses":
                    # Good responses have accuracy >= 0.7
                    filter_conditions.append(
                        qmodels.FieldCondition(
                            key="accuracy",
                            range=qmodels.Range(gte=0.7)
                        )
                    )
                elif quality == "needs_improvement":
                    # Needs improvement responses have accuracy < 0.7
                    filter_conditions.append(
                        qmodels.FieldCondition(
                            key="accuracy",
                            range=qmodels.Range(lt=0.7)
                        )
                    )
                elif quality == "unrated":
                    # Unrated responses don't have an accuracy field
                    # This is harder to filter directly in Qdrant, so we'll filter after retrieval
                    pass
            
            # Create the filter (without time filter - will apply in-memory)
            filter_query = qmodels.Filter(must=filter_conditions)
            
            # Get all messages
            search_results = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                scroll_filter=filter_query,
                limit=10000,  # Get up to 10000 messages to filter from
                with_payload=True
            )[0]  # [0] contains the points, [1] contains next_page_offset
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id} with the specified filters")
                return []
            
            # Apply time filter in-memory if needed
            if time_filter != "all_time":
                now = datetime.now()
                if time_filter == "today":
                    start_datetime = datetime(now.year, now.month, now.day)
                elif time_filter == "this_week":
                    start_datetime = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
                elif time_filter == "this_month":
                    start_datetime = datetime(now.year, now.month, 1)
                else:
                    start_datetime = None
                
                if start_datetime:
                    filtered_results = []
                    for point in search_results:
                        timestamp_str = point.payload.get("timestamp")
                        if timestamp_str:
                            try:
                                timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                                if timestamp >= start_datetime:
                                    filtered_results.append(point)
                            except:
                                pass
                    search_results = filtered_results
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id} with the specified filters")
                return []
            
            # Process and filter the results
            qa_items = []
            for point in search_results:
                payload = point.payload
                
                # Apply confidence filter in-memory
                confidence = payload.get("confidence", 0.0)
                if confidence < min_confidence or confidence > max_confidence:
                    continue
                
                # Apply unrated filter if needed
                if quality == "unrated" and payload.get("accuracy") is not None:
                    continue
                
                # Create QA item
                qa_item = {
                    "id": point.id,  # Use 'id' instead of 'message_id' to match QAItem model
                    "query": payload.get("query", ""),
                    "answer": payload.get("answer", ""),
                    "confidence": confidence,
                    "accuracy": payload.get("accuracy"),
                    "sources": payload.get("sources", []),
                    "timestamp": payload.get("timestamp", ""),
                    "chat_session_id": payload.get("chat_session_id"),
                    "visitor_id": payload.get("visitor_id"),  # Include visitor_id
                    "has_improved_answer": payload.get("has_improved_answer", False),
                    "improved_answer": payload.get("improved_answer", None),
                    "improved_by": payload.get("improved_by", None),
                    "improved_at": payload.get("improved_at", None)
                }
                
                qa_items.append(qa_item)
            
            # Sort by timestamp (newest first) and limit
            qa_items.sort(key=lambda x: x["timestamp"], reverse=True)
            qa_items = qa_items[:limit]
            
            logger.info(f"Found {len(qa_items)} QA items for user {user_id} and card {card_id} with the specified filters")
            return qa_items
            
        except Exception as e:
            logger.error(f"Error getting QA items by confidence: {str(e)}")
            return []

    async def get_most_asked_questions_for_card(self, user_id: str, card_id: str, limit: int = 5, namespace: Optional[str] = None, time_filter: str = "all_time", visitor_only: bool = True) -> List[Dict[str, Any]]:
        """Get most frequently asked questions for a specific user and card (using Qdrant filters)
        
        Args:
            user_id: The user ID to filter by
            card_id: The card ID to filter by (required)
            limit: Maximum number of questions to return
            namespace: Optional namespace to filter by
            time_filter: Optional time filter (today, this_week, this_month, all_time)
            
        Returns:
            List of most asked questions with count, confidence, and cards
        """
        await self.initialize()
        
        try:
            # Search for messages
            filter_conditions = [
                qmodels.FieldCondition(
                    key="type",
                    match=qmodels.MatchValue(value="message")
                ),
                qmodels.FieldCondition(
                    key="user_id",
                    match=qmodels.MatchValue(value=user_id)
                ),
                qmodels.FieldCondition(
                    key="card_id",
                    match=qmodels.MatchValue(value=card_id)
                )
            ]
            
            # Add namespace filter if provided
            if namespace:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="namespace",
                        match=qmodels.MatchValue(value=namespace)
                    )
                )
            
            # Create the filter
            filter_query = qmodels.Filter(must=filter_conditions)
            
            # Get all messages
            search_results = self.qdrant_client.scroll(
                collection_name=self.collection_name,
                scroll_filter=filter_query,
                limit=1000,  # Get up to 1000 messages to analyze
                with_payload=True
            )[0]  # [0] contains the points, [1] contains next_page_offset
            
            if not search_results:
                logger.info(f"No messages found for user {user_id} and card {card_id}")
                return []
            
            # Get the time filter start date for client-side filtering
            time_filter_start_date = self._get_time_filter_start_date(time_filter)
            
            # Group by normalized query
            query_groups = {}
            for point in search_results:
                payload = point.payload
                query = payload.get("query", "")
                confidence = payload.get("confidence", 0.0)
                timestamp_str = payload.get("timestamp", "")
                
                # Apply client-side time filtering if needed
                if time_filter_start_date and timestamp_str:
                    try:
                        # Parse the timestamp string to a datetime object
                        timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                        # Skip if the timestamp is before the start date
                        if timestamp < time_filter_start_date:
                            continue
                    except (ValueError, TypeError):
                        # If we can't parse the timestamp, include the message anyway
                        pass
                
                # Normalize query (lowercase, strip punctuation)
                normalized_query = query.lower().strip()
                
                if normalized_query not in query_groups:
                    query_groups[normalized_query] = {
                        "query": query,  # Use the original query for display
                        "count": 0,
                        "cards": set([card_id]),  # Initialize with current card_id
                        "confidence_sum": 0.0
                    }
                
                query_groups[normalized_query]["count"] += 1
                query_groups[normalized_query]["confidence_sum"] += confidence
            
            # Convert to list and calculate average confidence
            result = []
            for query_data in query_groups.values():
                result.append({
                    "query": query_data["query"],
                    "count": query_data["count"],
                    "cards": list(query_data["cards"]),
                    "confidence": query_data["confidence_sum"] / query_data["count"]
                })
            
            # Sort by count (descending) and limit
            result.sort(key=lambda x: x["count"], reverse=True)
            result = result[:limit]
            
            logger.info(f"Found {len(result)} most asked questions for user {user_id} and card {card_id}")
            return result
            
        except Exception as e:
            logger.error(f"Error getting most asked questions: {str(e)}")
            return []

    def _get_time_filter_start_date(self, time_filter: str) -> Optional[datetime]:
        """Get the start date for a time filter
        
        Args:
            time_filter: The time filter (today, this_week, this_month, all_time)
            
        Returns:
            The start date as a datetime object, or None for all_time
        """
        if time_filter == "all_time":
            return None
            
        now = datetime.now()
        if time_filter == "today":
            return datetime(now.year, now.month, now.day)
        elif time_filter == "this_week":
            # Get the start of the current week (Monday)
            return datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
        elif time_filter == "this_month":
            # Get the start of the current month
            return datetime(now.year, now.month, 1)
        
        return None

# Singleton instance
_chat_service = None

async def get_chat_service() -> ChatService:
    """Get the chat service singleton instance"""
    global _chat_service
    if _chat_service is None:
        logger.info("Creating new chat service instance")
        _chat_service = ChatService()
    return _chat_service
