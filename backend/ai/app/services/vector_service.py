import asyncio
import logging
import uuid
from typing import Dict, List, Optional, Any, Union, Tuple
import time
import backoff
import tiktoken
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from cachetools import TTLCache

from openai import AsyncOpenAI
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from qdrant_client.http.exceptions import UnexpectedResponse, ResponseHandlingException
from qdrant_client.http.models import Distance, VectorParams, PointStruct, UpdateResult, OptimizersConfig, HnswConfig, QuantizationConfig, ScalarQuantization, SearchParams

# Import fastembed for BM25 sparse vectors (hybrid search)
try:
    from fastembed import SparseTextEmbedding
    FASTEMBED_AVAILABLE = True
except ImportError:
    FASTEMBED_AVAILABLE = False
    logger.warning("fastembed not installed. Hybrid search will not be available. Install with: pip install fastembed")

from app.core.config import settings
from app.core.exceptions import VectorServiceException
from app.models.vector import Chunk, InsertResult, VectorSearchResult, SourceType
from app.services.usage_tracker import get_usage_tracker

logger = logging.getLogger(__name__)

def timing_decorator(func):
    """Decorator to measure execution time of functions"""
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        execution_time = time.time() - start_time
        logger.info(f"{func.__name__} executed in {execution_time:.2f}s")
        return result
    return wrapper


class VectorService:
    """Service for vector operations including embedding and storage in Qdrant"""
    
    def __init__(self):
        # Initialize optimized embedding cache with longer TTL and larger size
        self.embedding_cache = TTLCache(maxsize=5000, ttl=7200)  # 2 hour TTL, larger cache
        
        # Add collection existence cache to avoid repeated API calls
        self.collection_cache = TTLCache(maxsize=50, ttl=300)  # 5 minute TTL for collection existence
        
        # Add query result cache for identical queries
        self.query_cache = TTLCache(maxsize=1000, ttl=1800)  # 30 min TTL for query results
        
        # Cache for sparse embeddings
        self.sparse_embedding_cache = TTLCache(maxsize=2000, ttl=7200)  # 2 hour TTL
        
        # Use persistent OpenAI client from service manager
        from app.core.service_manager import get_service_manager
        service_manager = get_service_manager()
        self.openai_client = service_manager.openai_client
        
        # Initialize Qdrant client with ultra-fast settings
        self.qdrant_client = QdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
            prefer_grpc=False,
            timeout=2.0  # Ultra-fast timeout for sub-100ms performance
        )
        
        self.embedding_model = settings.EMBEDDING_MODEL
        self.vector_dim = settings.VECTOR_DIM
        self.vector_distance = self._parse_distance(settings.VECTOR_DISTANCE)
        
        # Initialize BM25 sparse embedding model for hybrid search
        self.sparse_model = None
        if FASTEMBED_AVAILABLE:
            try:
                # Use persistent cache directory to avoid re-downloading model files
                import os
                cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "fastembed")
                os.makedirs(cache_dir, exist_ok=True)
                
                self.sparse_model = SparseTextEmbedding(
                    model_name="Qdrant/bm25",
                    cache_dir=cache_dir
                )
                logger.info("Initialized BM25 sparse embedding model for hybrid search")
            except Exception as e:
                logger.warning(f"Failed to initialize BM25 model: {e}. Hybrid search disabled.")
        
        logger.info("VectorService initialized with persistent connections and caching")
    
    def _parse_distance(self, distance_str: str) -> Distance:
        """Parse distance string to Qdrant Distance enum"""
        distance_map = {
            "cosine": Distance.COSINE,
            "euclid": Distance.EUCLID,
            "dot": Distance.DOT,
        }
        return distance_map.get(distance_str.lower(), Distance.COSINE)
    
    async def _collection_exists_cached(self, collection_name: str) -> bool:
        """Check if collection exists with caching to avoid repeated API calls"""
        if collection_name in self.collection_cache:
            return self.collection_cache[collection_name]
        
        try:
            collections = await asyncio.to_thread(self.qdrant_client.get_collections)
            exists = any(col.name == collection_name for col in collections.collections)
            self.collection_cache[collection_name] = exists
            return exists
        except Exception as e:
            logger.warning(f"Failed to check collection existence: {e}")
            return False
    
    async def create_speed_optimized_collection(self, collection_name: str) -> bool:
        """Create collection optimized for ultra-fast search performance with hybrid search support"""
        try:
            # Prepare sparse vectors config if fastembed is available
            sparse_vectors_config = None
            if self.sparse_model:
                sparse_vectors_config = {
                    "text-sparse": qmodels.SparseVectorParams(
                        index=qmodels.SparseIndexParams(
                            on_disk=False  # Keep sparse index in memory for speed
                        ),
                        modifier=qmodels.Modifier.IDF  # Required for BM25
                    )
                }
                logger.info("Creating collection with hybrid search support (dense + sparse vectors)")
            
            # Create collection with speed-first settings using dictionary configs
            self.qdrant_client.create_collection(
                collection_name=collection_name,
                vectors_config={
                    "size": self.vector_dim,
                    "distance": self.vector_distance.value,
                    "on_disk": False  # Keep vectors in memory for maximum speed
                },
                sparse_vectors_config=sparse_vectors_config,  # Add sparse vectors for hybrid search
                # Speed-optimized settings as dictionary
                optimizers_config={
                    "deleted_threshold": 0.2,
                    "vacuum_min_vector_number": 1000,
                    "default_segment_number": 1,  # Single segment for small datasets
                    "max_segment_size": 50000,  # Larger segments for better performance
                    "memmap_threshold": None,  # Disable memmap for speed
                    "indexing_threshold": 1000,  # Start indexing early
                    "flush_interval_sec": 1,  # Fast flushing
                    "max_optimization_threads": 4
                },
                # Ultra-fast HNSW settings as dictionary
                hnsw_config={
                    "m": 16,  # Reduced for faster search
                    "ef_construct": 64,  # Lower for faster indexing
                    "full_scan_threshold": 1000,  # Lower threshold for small datasets
                    "max_indexing_threads": 8,  # More threads for faster indexing
                    "on_disk": False,  # Keep index in memory
                    "payload_m": 8  # Reduced payload links
                }
            )
            
            # Update cache
            self.collection_cache[collection_name] = True
            logger.info(f"Created speed-optimized collection: {collection_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to create speed-optimized collection {collection_name}: {e}")
            return False
    
    async def optimize_collection(self, collection_name: str) -> bool:
        """Optimize an existing collection for speed"""
        try:
            # Update to speed-optimized settings using dictionary configs
            self.qdrant_client.update_collection(
                collection_name=collection_name,
                optimizer_config={
                    "deleted_threshold": 0.2,
                    "vacuum_min_vector_number": 1000,
                    "default_segment_number": 1,
                    "max_segment_size": 50000,
                    "memmap_threshold": None,
                    "indexing_threshold": 1000,
                    "flush_interval_sec": 1,
                    "max_optimization_threads": 4
                }
            )
            
            # Update HNSW for speed using dictionary config
            self.qdrant_client.update_collection(
                collection_name=collection_name,
                hnsw_config={
                    "m": 16,
                    "ef_construct": 100,  # Increased for better accuracy
                    "full_scan_threshold": 10000,  # Higher threshold
                    "max_indexing_threads": 8,
                    "on_disk": False,
                    "payload_m": 16  # Increased for better payload indexing
                }
            )
            
            logger.info(f"Optimized collection {collection_name} for speed")
            return True
            
        except Exception as e:
            logger.error(f"Failed to optimize collection {collection_name}: {e}")
            return False
    
    def _get_collection_name(self, user_id: str, use_hybrid: bool = None) -> str:
        """Get the collection name for a user
        
        Args:
            user_id: User ID
            use_hybrid: If True, use hybrid collection. If None, auto-detect based on config and sparse_model
            
        Returns:
            Collection name to use
        """
        # Auto-detect if hybrid should be used based on config and availability
        if use_hybrid is None:
            use_hybrid = settings.USE_HYBRID_SEARCH and self.sparse_model is not None
        
        # Use hybrid collection if enabled and sparse model is available
        if use_hybrid and self.sparse_model:
            return settings.QDRANT_HYBRID_COLLECTION_NAME
        
        # Fall back to regular collection
        return settings.QDRANT_COLLECTION_NAME
        
    def _split_text_recursively(self, text: str, max_tokens: int, encoding) -> List[str]:
        """Split text recursively until all chunks are below the token limit"""
        token_count = len(encoding.encode(text))
        
        if token_count <= max_tokens:
            return [text]
            
        # Split the text in half and process recursively
        mid = len(text) // 2
        first_half = text[:mid]
        second_half = text[mid:]
        
        # Process each half recursively
        result = []
        result.extend(self._split_text_recursively(first_half, max_tokens, encoding))
        result.extend(self._split_text_recursively(second_half, max_tokens, encoding))
        
        return result
    
    def _get_cache_key(self, text: str) -> str:
        """Generate a cache key for a text string with aggressive normalization"""
        # Aggressive normalization for better cache hits
        normalized_text = ' '.join(text.strip().lower().split())  # Remove extra whitespace
        # Use a hash of the normalized text as the cache key
        return hashlib.md5(normalized_text.encode('utf-8')).hexdigest()
    
    def _get_query_cache_key(self, query: str, user_id: str, card_id: str, namespace: Optional[str] = None) -> str:
        """Generate a cache key for a query"""
        # Normalize query by removing extra whitespace and converting to lowercase
        normalized_query = " ".join(query.lower().split())
        
        # Create cache key
        if namespace:
            return f"{user_id}:{card_id}:{namespace}:{normalized_query}"
        else:
            return f"{user_id}:{card_id}:{normalized_query}"
    
    def _is_retryable_error(self, error: Exception) -> bool:
        """Determine if an error is worth retrying"""
        # Network/connection errors - retry
        if isinstance(error, (ConnectionError, TimeoutError)):
            return True
        
        # Qdrant specific errors - retry for server errors, not client errors
        if isinstance(error, (UnexpectedResponse, ResponseHandlingException)):
            # Check if it's a server error (5xx) vs client error (4xx)
            if hasattr(error, 'status_code'):
                return error.status_code >= 500
            return True
        
        # Generic exceptions that might be transient
        error_str = str(error).lower()
        transient_indicators = [
            'timeout', 'connection', 'network', 'unavailable', 
            'overloaded', 'rate limit', 'too many requests'
        ]
        return any(indicator in error_str for indicator in transient_indicators)
    
    async def _perform_search_with_retry(
        self, 
        collection_name: str, 
        query_vector: List[float], 
        limit: int, 
        search_filter: Optional[qmodels.Filter] = None,
        max_retries: int = 1  # Reduced to 1 for faster failure
    ) -> List[Any]:
        """Perform search with ultra-fast optimized logic"""
        retry_count = 0
        last_error = None
        
        while retry_count <= max_retries:
            try:
                # Direct search without collection existence check for maximum speed
                # Collection should already exist from initialization
                search_results = self.qdrant_client.search(
                    collection_name=collection_name,
                    query_vector=query_vector,
                    query_filter=search_filter,
                    limit=limit,
                    with_payload=True,
                    with_vectors=False,
                    # Add search-time optimizations
                    search_params=qmodels.SearchParams(
                        hnsw_ef=64,  # Reduced ef for faster search (trade accuracy for speed)
                        exact=False  # Use approximate search for speed
                    )
                )
                return search_results
                
            except Exception as e:
                last_error = e
                
                # Only retry if it's a retryable error
                if not self._is_retryable_error(e):
                    logger.info(f"Non-retryable error encountered: {str(e)}")
                    raise VectorServiceException(f"Search failed: {str(e)}")
                
                retry_count += 1
                if retry_count <= max_retries:
                    # Use shorter, more aggressive retry delays
                    retry_delay = min(0.5 * (2 ** (retry_count - 1)), 2.0)  # Cap at 2 seconds
                    logger.warning(f"Retryable error (attempt {retry_count}/{max_retries + 1}): {str(e)}. Retrying in {retry_delay}s...")
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(f"Search failed after {max_retries + 1} attempts: {str(e)}")
                    raise VectorServiceException(f"Search failed after retries: {str(last_error)}")
        
        # This should never be reached, but just in case
        raise VectorServiceException(f"Search failed: {str(last_error)}")
    
    async def _parallel_search_multiple_strategies(
        self,
        collection_name: str,
        query_vector: List[float],
        limit: int,
        user_id: str,
        search_filter: Optional[qmodels.Filter] = None
    ) -> List[Any]:
        """Perform parallel searches with multiple strategies for better performance"""
        
        # Define search strategies to run in parallel
        search_tasks = []
        
        # Strategy 1: Filtered search with higher limit (if filter exists)
        if search_filter is not None:
            filtered_limit = min(limit * 2, 20)
            search_tasks.append(
                self._perform_search_with_retry(
                    collection_name, query_vector, filtered_limit, search_filter
                )
            )
        
        # Strategy 2: Unfiltered search with standard limit
        search_tasks.append(
            self._perform_search_with_retry(
                collection_name, query_vector, limit, None
            )
        )
        
        # Run searches in parallel
        try:
            results = await asyncio.gather(*search_tasks, return_exceptions=True)
            
            # Process results - prioritize filtered results if available
            best_results = None
            
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    logger.warning(f"Search strategy {i+1} failed: {str(result)}")
                    continue
                
                if result and len(result) > 0:
                    # If this is filtered results (first strategy), use them
                    if i == 0 and search_filter is not None:
                        # Trim to requested limit
                        best_results = result[:limit]
                        logger.info(f"Using filtered search results: {len(best_results)} items")
                        break
                    # If this is unfiltered results and we don't have filtered results yet
                    elif best_results is None:
                        # Post-filter if needed
                        if user_id != "default":
                            original_count = len(result)
                            result = [
                                r for r in result 
                                if r.payload.get("user_id") == user_id
                            ][:limit]
                            if len(result) < original_count:
                                logger.info(f"Post-filtered results from {original_count} to {len(result)}")
                        
                        best_results = result[:limit]
                        logger.info(f"Using unfiltered search results: {len(best_results)} items")
            
            return best_results or []
            
        except Exception as e:
            logger.error(f"Parallel search failed: {str(e)}")
            raise VectorServiceException(f"Parallel search failed: {str(e)}")
    
    async def _create_single_embedding_optimized(self, text: str) -> List[float]:
        """Create embedding for a single text with aggressive caching and optimization"""
        try:
            # Check cache first with normalized key
            cache_key = self._get_cache_key(text)
            if cache_key in self.embedding_cache:
                logger.info("Query embedding found in cache")
                return self.embedding_cache[cache_key]
            
            # Direct optimized API call for single text
            start_time = time.time()
            response = await self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=text,  # Single string instead of list for better performance
                encoding_format="float"  # Explicit format for consistency
            )
            api_time = time.time() - start_time
            logger.info(f"OpenAI embedding API call completed in {api_time:.2f}s")
            
            embedding = response.data[0].embedding
            
            # Track token usage
            try:
                usage_tracker = get_usage_tracker()
                usage_tracker.track_openai_embedding(
                    prompt_tokens=response.usage.prompt_tokens,
                    model=self.embedding_model
                )
            except Exception as e:
                logger.warning(f"Failed to track embedding usage: {str(e)}")
            
            # Cache the result
            self.embedding_cache[cache_key] = embedding
            
            return embedding
            
        except Exception as e:
            logger.error(f"Error creating single embedding: {str(e)}")
            raise VectorServiceException(f"Failed to create embedding: {str(e)}")
    
    @backoff.on_exception(
        backoff.expo,
        (UnexpectedResponse, Exception),
        max_tries=3,
        max_time=5
    )
    async def _create_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Create embeddings for a list of texts using OpenAI API with batching to handle token limits"""
        try:
            # Start timing the embedding process
            start_time_embedding = time.time()
            logger.info(f"Creating embeddings for {len(texts)} texts")
            
            # Check cache first for each text
            cache_hits = 0
            texts_to_embed = []
            cached_embeddings = {}
            
            for i, text in enumerate(texts):
                cache_key = self._get_cache_key(text)
                if cache_key in self.embedding_cache:
                    cached_embeddings[i] = self.embedding_cache[cache_key]
                    cache_hits += 1
                else:
                    texts_to_embed.append((i, text))
            
            logger.info(f"Embedding cache: {cache_hits}/{len(texts)} hits ({cache_hits/len(texts)*100:.1f}%)")
            
            # If all embeddings are cached, return them immediately
            if len(texts_to_embed) == 0:
                logger.info("All embeddings found in cache, skipping API call")
                # Reconstruct the ordered list of embeddings
                all_embeddings = [None] * len(texts)
                for i, embedding in cached_embeddings.items():
                    all_embeddings[i] = embedding
                
                total_embedding_time = time.time() - start_time_embedding
                logger.info(f"Total embedding process completed in {total_embedding_time:.2f}s (all from cache)")
                return all_embeddings
            
            # Extract just the texts for the API call
            texts_for_api = [t[1] for t in texts_to_embed]
            logger.info(f"Need to create {len(texts_for_api)} embeddings via API")
            
            # Initialize token counter and encoder
            encoding = tiktoken.get_encoding("cl100k_base")  # OpenAI's encoding
            # text-embedding-3-large has an 8,192 token limit
            max_tokens_per_batch = 7000  # Set well below the 8,192 limit for safety
            max_tokens_per_text = 7000  # Maximum tokens for a single text chunk
            all_embeddings = []  # Initialize here for all code paths
            
            # First, preprocess texts to ensure no single text exceeds token limit
            preprocessed_texts = []
            for text in texts_for_api:
                token_count = len(encoding.encode(text))
                if token_count > max_tokens_per_text:
                    # Split large text chunks recursively
                    logger.warning(f"Text chunk with {token_count} tokens exceeds batch limit. Splitting further.")
                    split_texts = self._split_text_recursively(text, max_tokens_per_text, encoding)
                    preprocessed_texts.extend(split_texts)
                else:
                    preprocessed_texts.append(text)
            
            # Create dynamic batches based on token count
            current_batch = []
            current_token_count = 0
            batch_count = 1
            total_batches = 0  # Will calculate after creating all batches
            
            # First pass: create batches based on token counts
            all_batches = []
            for text in preprocessed_texts:
                text_token_count = len(encoding.encode(text))
                
                # If adding this text would exceed our limit, or if it's too large on its own
                if text_token_count > max_tokens_per_batch:
                    logger.warning(f"Text chunk with {text_token_count} tokens exceeds batch limit. Splitting further.")
                    # This text is too large on its own, we need to split it
                    words = text.split()
                    current_mini_batch = []
                    current_mini_token_count = 0
                    
                    for word in words:
                        word_token_count = len(encoding.encode(word + " "))
                        if current_mini_token_count + word_token_count > max_tokens_per_batch and current_mini_batch:
                            # Create a batch from current mini batch
                            mini_text = " ".join(current_mini_batch)
                            all_batches.append([mini_text])
                            current_mini_batch = [word]
                            current_mini_token_count = word_token_count
                        else:
                            current_mini_batch.append(word)
                            current_mini_token_count += word_token_count
                    
                    # Add the last mini batch if not empty
                    if current_mini_batch:
                        mini_text = " ".join(current_mini_batch)
                        all_batches.append([mini_text])
                elif current_token_count + text_token_count > max_tokens_per_batch and current_batch:
                    # This batch is full, start a new one
                    all_batches.append(current_batch)
                    current_batch = [text]
                    current_token_count = text_token_count
                else:
                    # Add to current batch
                    current_batch.append(text)
                    current_token_count += text_token_count
            
            # Add the last batch if not empty
            if current_batch:
                all_batches.append(current_batch)
            
            total_batches = len(all_batches)
            logger.info(f"Split {len(texts)} text chunks into {total_batches} batches for embedding")
            
            # Second pass: process each batch
            for i, batch_texts in enumerate(all_batches):
                batch_start_time = time.time()
                logger.info(f"Creating embeddings for batch {i+1}/{total_batches}")
                
                # Double-check token count for this batch
                batch_token_count = sum(len(encoding.encode(t)) for t in batch_texts)
                logger.info(f"Batch {i+1} contains {batch_token_count} tokens")
                
                if batch_token_count > 8000:  # text-embedding-3-large limit is 8,192
                    logger.error(f"Batch {i+1} exceeds model's token limit with {batch_token_count} tokens (limit: 8,192)")
                    raise VectorServiceException(f"Batch exceeds token limit: {batch_token_count} tokens (limit: 8,192)")
                
                # Since we've already preprocessed texts, we shouldn't have any oversized chunks
                # But let's double-check just to be safe
                for j, text in enumerate(batch_texts):
                    text_token_count = len(encoding.encode(text))
                    if text_token_count > 7000:
                        logger.warning(f"Text {j} in batch {i+1} has {text_token_count} tokens, approaching limit")
                
                # Time the actual API call
                api_call_start = time.time()
                response = await self.openai_client.embeddings.create(
                    model=self.embedding_model,
                    input=batch_texts
                )
                api_call_time = time.time() - api_call_start
                logger.info(f"OpenAI API call for batch {i+1} completed in {api_call_time:.2f}s")
                
                # Track token usage for this batch
                try:
                    usage_tracker = get_usage_tracker()
                    usage_tracker.track_openai_embedding(
                        prompt_tokens=response.usage.prompt_tokens,
                        model=self.embedding_model
                    )
                except Exception as e:
                    logger.warning(f"Failed to track batch embedding usage: {str(e)}")
                
                batch_embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(batch_embeddings)
                
                batch_time = time.time() - batch_start_time
                logger.info(f"Batch {i+1}/{total_batches} processed in {batch_time:.2f}s")
                
                # Add a small delay between batches to avoid rate limits
                if i < total_batches - 1:
                    await asyncio.sleep(0.5)
            
            # Store new embeddings in cache
            for (original_idx, text), embedding in zip([t for t in texts_to_embed], all_embeddings):
                cache_key = self._get_cache_key(text)
                self.embedding_cache[cache_key] = embedding
                cached_embeddings[original_idx] = embedding
            
            # Reconstruct the ordered list of embeddings
            final_embeddings = [None] * len(texts)
            for i, embedding in cached_embeddings.items():
                final_embeddings[i] = embedding
            
            # Calculate total embedding time
            total_embedding_time = time.time() - start_time_embedding
            logger.info(f"Total embedding process completed in {total_embedding_time:.2f}s for {len(texts)} texts")
            
            return final_embeddings
        except Exception as e:
            logger.error(f"Error creating embeddings: {str(e)}")
            raise VectorServiceException(f"Failed to create embeddings: {str(e)}")
    
    async def _ensure_collection_exists(self, collection_name: str) -> None:
        """Ensure collection exists with correct dimensions, recreate if dimension mismatch"""
        max_retries = 3
        retry_count = 0
        retry_delay = 1  # Start with 1 second delay
        
        while retry_count < max_retries:
            try:
                # Check if collection exists and get its info
                collections = self.qdrant_client.get_collections()
                collection_exists = collection_name in [c.name for c in collections.collections]
                
                if collection_exists:
                    # Check if dimensions match
                    try:
                        collection_info = self.qdrant_client.get_collection(collection_name)
                        existing_dim = collection_info.config.params.vectors.size
                        
                        if existing_dim != self.vector_dim:
                            logger.warning(f"Collection {collection_name} has dimension {existing_dim}, but current model requires {self.vector_dim}")
                            logger.info(f"Deleting and recreating collection {collection_name} with correct dimensions")
                            
                            # Delete existing collection
                            self.qdrant_client.delete_collection(collection_name)
                            collection_exists = False
                        else:
                            logger.info(f"Collection {collection_name} exists with correct dimensions ({self.vector_dim})")
                            return
                    except Exception as e:
                        logger.warning(f"Could not verify collection dimensions: {e}. Recreating collection.")
                        try:
                            self.qdrant_client.delete_collection(collection_name)
                        except:
                            pass
                        collection_exists = False
                
                if not collection_exists:
                    logger.info(f"Creating collection {collection_name} with vector dimension {self.vector_dim}")
                    
                    # Create collection with speed-optimized settings
                    await self.create_speed_optimized_collection(collection_name)
                    
                    # Create index for user_id field to enable filtering
                    try:
                        logger.info(f"Creating index for user_id field in collection {collection_name}")
                        self.qdrant_client.create_payload_index(
                            collection_name=collection_name,
                            field_name="user_id",
                            field_schema="keyword"
                        )
                        logger.info(f"Successfully created index for user_id field")
                    except Exception as e:
                        logger.warning(f"Failed to create index for user_id: {str(e)}. Filtering by user_id may not work.")
                    
                    # Create index for card_id field to enable filtering
                    try:
                        logger.info(f"Creating index for card_id field in collection {collection_name}")
                        self.qdrant_client.create_payload_index(
                            collection_name=collection_name,
                            field_name="card_id",
                            field_schema="keyword"
                        )
                        logger.info(f"Successfully created index for card_id field")
                    except Exception as e:
                        logger.warning(f"Failed to create index for card_id: {str(e)}. Filtering by card_id may not work.")
                        
                    # Create index for metadata.namespace field to enable namespace filtering
                    try:
                        logger.info(f"Creating index for metadata.namespace field in collection {collection_name}")
                        self.qdrant_client.create_payload_index(
                            collection_name=collection_name,
                            field_name="metadata.namespace",
                            field_schema="keyword"
                        )
                        logger.info(f"Successfully created index for metadata.namespace field")
                    except Exception as e:
                        logger.warning(f"Failed to create index for metadata.namespace: {str(e)}. Filtering by namespace may not work.")
                    
                    # Create index for metadata.source_type field to enable source type filtering
                    try:
                        logger.info(f"Creating index for metadata.source_type field in collection {collection_name}")
                        self.qdrant_client.create_payload_index(
                            collection_name=collection_name,
                            field_name="metadata.source_type",
                            field_schema="keyword"
                        )
                        logger.info(f"Successfully created index for metadata.source_type field")
                    except Exception as e:
                        logger.warning(f"Failed to create index for metadata.source_type: {str(e)}. Filtering by source_type may not work.")
                    
                    logger.info(f"Successfully created collection: {collection_name}")
                return
            except Exception as e:
                retry_count += 1
                if retry_count < max_retries:
                    logger.warning(f"Collection operation failed (attempt {retry_count}/{max_retries}): {str(e)}. Retrying in {retry_delay}s...")
                    await asyncio.sleep(retry_delay)
                    retry_delay *= 2  # Exponential backoff
                else:
                    logger.error(f"Error ensuring collection exists after {max_retries} attempts: {str(e)}")
                    raise VectorServiceException(f"Failed to ensure collection exists after {max_retries} attempts: {str(e)}")
    
    async def _insert_batch_with_retry(
        self,
        collection_name: str,
        batch: List[PointStruct],
        batch_num: Union[int, str],
        total_batches: Union[int, str],
        max_retries: int = 5  # Increased from 3 to 5
    ) -> bool:
        """Insert a batch of points with retry logic"""
        success = False
        retry_count = 0
        retry_delay = 1  # Start with 1 second delay
        
        while not success and retry_count < max_retries:
            try:
                # Use a longer timeout for larger batches
                # Hybrid vectors need more time due to dense + sparse data
                timeout = min(180, 30 + len(batch) * 2.0)  # Scale timeout with batch size (increased for hybrid)
                
                # Use the async version of upsert when possible to avoid blocking
                if hasattr(self.qdrant_client, 'upsert_async'):
                    await self.qdrant_client.upsert_async(
                        collection_name=collection_name,
                        points=batch,
                        timeout=timeout
                    )
                else:
                    # Fall back to synchronous version if async not available
                    self.qdrant_client.upsert(
                        collection_name=collection_name,
                        points=batch
                    )
                    
                success = True
                logger.info(f"Successfully inserted batch {batch_num}/{total_batches} ({len(batch)} points)")
            except Exception as e:
                retry_count += 1
                if retry_count < max_retries:
                    # Use a more aggressive backoff strategy
                    retry_delay = min(30, retry_delay * 2)  # Cap at 30 seconds
                    logger.warning(f"Qdrant insert failed (attempt {retry_count}/{max_retries}): {str(e)}. Retrying in {retry_delay}s...")
                    await asyncio.sleep(retry_delay)
                else:
                    logger.error(f"Error inserting batch {batch_num} into Qdrant after {max_retries} attempts: {str(e)}")
                    return False
        
        return success
        
    async def ingest_chunks(
        self, 
        items: List[Chunk], 
        user_id: str,
        card_id: str,
        namespace: Optional[str] = None,
        usage_data: Optional[Dict[str, Any]] = None
    ) -> InsertResult:
        """Ingest chunks into vector database with optional usage tracking"""
        if not items:
            return InsertResult(inserted_count=0, user_id=user_id, namespace=namespace)
        
        collection_name = self._get_collection_name(user_id)
        
        # Ensure collection exists
        # COMMENTED OUT: Collection already exists, no need to check on every query
        # This saves ~100-200ms per request by avoiding unnecessary Qdrant API call
        # await self._ensure_collection_exists(collection_name)
        
        # Extract texts for embedding
        texts = [item.text for item in items]
        
        # Create embeddings (this will track OpenAI usage)
        embeddings = await self._create_embeddings(texts)
        
        # Get current usage stats to embed in metadata
        try:
            from app.services.usage_tracker import get_usage_tracker
            usage_tracker = get_usage_tracker()
            current_usage = usage_tracker.get_usage().to_dict()
        except:
            current_usage = None
        
        # Prepare points for Qdrant (with hybrid search support)
        points = []
        
        # Generate sparse embeddings for all texts if hybrid search is enabled
        sparse_embeddings = []
        if self.sparse_model:
            try:
                logger.info("Generating sparse embeddings for hybrid search")
                texts = [item.text for item in items]
                sparse_results = await asyncio.to_thread(
                    lambda: list(self.sparse_model.embed(texts))
                )
                sparse_embeddings = sparse_results
                logger.info(f"Generated {len(sparse_embeddings)} sparse embeddings")
            except Exception as e:
                logger.warning(f"Failed to generate sparse embeddings: {e}. Continuing without hybrid search support.")
                sparse_embeddings = []
        
        for i, (item, embedding) in enumerate(zip(items, embeddings)):
            # Copy metadata
            metadata = item.metadata.copy() if item.metadata else {}
            metadata["created_at"] = datetime.utcnow().isoformat()
            metadata["source_type"] = metadata.get("source_type", "document")
            
            # Add namespace if provided (no default namespace)
            if namespace:
                metadata["namespace"] = namespace
            # If no namespace provided, don't add it to metadata (allows searching across all data)
            
            # Add usage data to metadata (use current usage if not provided)
            if current_usage:
                metadata["usage"] = current_usage
            elif usage_data:
                metadata["usage"] = usage_data
            
            # Create payload with user_id and card_id directly in the root
            payload = {
                "text": item.text,
                "user_id": user_id,  # Store user_id in root payload
                "card_id": card_id,  # Store card_id in root payload
                "metadata": metadata
            }
            
            # Add document_id to root payload if available (for easy deletion)
            if item.document_id:
                payload["document_id"] = item.document_id
            
            # Create point with both dense and sparse vectors (if available)
            if sparse_embeddings and i < len(sparse_embeddings):
                # Hybrid mode: use named vectors for both dense and sparse
                sparse_emb = sparse_embeddings[i]
                points.append(PointStruct(
                    id=item.id,
                    vector={
                        "": embedding,  # Default/unnamed dense vector
                        "text-sparse": qmodels.SparseVector(
                            indices=sparse_emb.indices.tolist(),
                            values=sparse_emb.values.tolist()
                        )
                    },
                    payload=payload
                ))
            else:
                # Dense-only mode: use simple vector
                points.append(PointStruct(
                    id=item.id,
                    vector=embedding,
                    payload=payload
                ))
        
        # Insert points in batches to avoid timeouts
        # Dynamically adjust batch size based on number of points
        # Use smaller batches for hybrid search (dense + sparse vectors = more data)
        total_points = len(points)
        if total_points > 200:
            batch_size = 5  # Very small batches for very large uploads
        elif total_points > 100:
            batch_size = 10  # Small batches for large uploads
        else:
            batch_size = 20  # Default batch size for smaller uploads
            
        logger.info(f"Using batch size of {batch_size} for {total_points} points")
        inserted_count = 0
        failed_batches = []
        
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            batch_num = i//batch_size + 1
            total_batches = (len(points)-1)//batch_size + 1
            
            success = await self._insert_batch_with_retry(
                collection_name=collection_name,
                batch=batch,
                batch_num=batch_num,
                total_batches=total_batches
            )
            
            if success:
                inserted_count += len(batch)
            else:
                # Keep track of failed batches for potential retry
                failed_batches.append((batch_num, batch))
        
        # If there were any failed batches, try one more time with even smaller batches
        if failed_batches:
            logger.warning(f"Attempting to insert {len(failed_batches)} failed batches with smaller batch size")
            for batch_num, batch in failed_batches:
                # Split the failed batch into even smaller sub-batches
                smaller_batch_size = max(1, len(batch) // 2)
                for j in range(0, len(batch), smaller_batch_size):
                    sub_batch = batch[j:j + smaller_batch_size]
                    sub_batch_num = f"{batch_num}.{j//smaller_batch_size + 1}"
                    
                    success = await self._insert_batch_with_retry(
                        collection_name=collection_name,
                        batch=sub_batch,
                        batch_num=sub_batch_num,
                        total_batches=f"{total_batches}+"
                    )
                    
                    if success:
                        inserted_count += len(sub_batch)
                    else:
                        logger.error(f"Failed to insert sub-batch {sub_batch_num} even after retry with smaller batch size")
        
        if inserted_count < total_points:
            logger.warning(f"Only inserted {inserted_count}/{total_points} points. Some points failed to insert.")
        
        return InsertResult(
            inserted_count=inserted_count,
            user_id=user_id,
            card_id=card_id,
            namespace=namespace
        )
    
    @timing_decorator
    async def search(
        self,
        query: str,
        user_id: str,
        card_id: str,
        limit: int = 5,
        namespace: Optional[str] = None
    ) -> List[VectorSearchResult]:
        """Ultra-fast search optimized for sub-100ms performance with aggressive caching"""
        
        # Check query result cache first
        query_cache_key = self._get_query_cache_key(query, user_id, card_id, namespace)
        if query_cache_key in self.query_cache:
            logger.info("Complete query result found in cache, returning immediately")
            return self.query_cache[query_cache_key]
        
        collection_name = self._get_collection_name(user_id)
        
        # Create query embedding with optimized caching
        start_time_query_embedding = time.time()
        query_embedding = await self._create_single_embedding_optimized(query)
        query_embedding_time = time.time() - start_time_query_embedding
        logger.info(f"Query embedding: {query_embedding_time:.2f}s")
        
        # Build filter efficiently - always enforce card_id filter
        conditions = [
            qmodels.FieldCondition(key="user_id", match=qmodels.MatchValue(value=user_id)),
            qmodels.FieldCondition(key="card_id", match=qmodels.MatchValue(value=card_id))
        ]
        if namespace:
            conditions.append(qmodels.FieldCondition(key="metadata.namespace", match=qmodels.MatchValue(value=namespace)))
        search_filter = qmodels.Filter(must=conditions)
        
        # Ultra-fast direct search
        start_time_search = time.time()
        
        try:
            # Primary search with user filtering
            search_results = self.qdrant_client.search(
                collection_name=collection_name,
                query_vector=query_embedding,
                query_filter=search_filter,
                limit=limit,  # Exact limit for faster results
                with_payload=True,
                with_vectors=False,  # Don't return vectors to save bandwidth
                search_params=qmodels.SearchParams(
                    hnsw_ef=16,  # Even lower ef for maximum speed (was 32)
                    exact=False
                ),
                timeout=3  # Add timeout to fail fast
            )
            
            # Fallback search if no results and we have filters
            if not search_results and search_filter:
                logger.info("No results with filters, trying fallback search")
                search_results = self.qdrant_client.search(
                    collection_name=collection_name,
                    query_vector=query_embedding,
                    query_filter=None,  # Remove filters for broader search
                    limit=limit * 3,
                    with_payload=True,
                    with_vectors=False,
                    search_params=qmodels.SearchParams(hnsw_ef=16, exact=False),
                    timeout=3
                )
                # Post-filter results by user_id and card_id
                if search_results and user_id != "default":
                    search_results = [r for r in search_results 
                                    if r.payload.get("user_id") == user_id and 
                                       r.payload.get("card_id") == card_id][:limit]
            
            search_time = time.time() - start_time_search
            logger.info(f"Search: {search_time:.2f}s, found {len(search_results) if search_results else 0} results")
            
            # Track Qdrant search operation
            try:
                usage_tracker = get_usage_tracker()
                usage_tracker.track_qdrant_search(points_returned=len(search_results) if search_results else 0)
            except Exception as e:
                logger.warning(f"Failed to track Qdrant search: {str(e)}")
                
        except Exception as e:
            logger.error(f"Fast search failed: {str(e)}")
            raise VectorServiceException(f"Search failed: {str(e)}")
        
        # Convert to VectorSearchResult objects
        results = []
        if search_results:
            for hit in search_results:
                # Debug log to see what's in the payload
                logger.info(f"Payload for hit {hit.id}: {hit.payload}")
                
                # Create the VectorSearchResult with proper extraction
                results.append(VectorSearchResult(
                    id=hit.id,
                    text=hit.payload.get("text", ""),
                    user_id=hit.payload.get("user_id", user_id),  # Extract user_id from root payload
                    card_id=hit.payload.get("card_id", "default"),  # Extract card_id or use default
                    metadata=hit.payload.get("metadata", {}),
                    score=hit.score
                ))
        
        # Cache the complete query result
        self.query_cache[query_cache_key] = results
        logger.info("Cached search results for future queries")
        
        return results
    
    def _create_sparse_embedding(self, text: str) -> Optional[Tuple[List[int], List[float]]]:
        """Create BM25 sparse embedding for a text
        
        Args:
            text: Text to create sparse embedding for
            
        Returns:
            Tuple of (indices, values) for sparse vector, or None if not available
        """
        if not self.sparse_model:
            return None
        
        # Check cache first
        cache_key = hashlib.md5(text.encode()).hexdigest()
        if cache_key in self.sparse_embedding_cache:
            return self.sparse_embedding_cache[cache_key]
        
        try:
            # Generate sparse embedding
            embeddings = list(self.sparse_model.embed([text]))
            if embeddings:
                sparse_emb = embeddings[0]
                indices = sparse_emb.indices.tolist()
                values = sparse_emb.values.tolist()
                
                # Cache the result
                self.sparse_embedding_cache[cache_key] = (indices, values)
                return (indices, values)
        except Exception as e:
            logger.warning(f"Failed to create sparse embedding: {e}")
        
        return None
    
    def _reciprocal_rank_fusion(
        self, 
        dense_results: List[Any], 
        sparse_results: List[Any], 
        k: int = 60
    ) -> List[Tuple[str, float]]:
        """Combine results from dense and sparse search using Reciprocal Rank Fusion (RRF)
        
        RRF formula: score(d) = sum(1 / (k + rank(d)))
        Then normalize to 0-1 range for consistency with vector similarity scores
        
        Args:
            dense_results: Results from dense vector search
            sparse_results: Results from sparse vector search
            k: Constant for RRF (default 60, as per literature)
            
        Returns:
            List of (point_id, normalized_score) tuples, sorted by score descending
        """
        scores = {}
        
        # Process dense results
        for rank, hit in enumerate(dense_results, start=1):
            point_id = str(hit.id)
            scores[point_id] = scores.get(point_id, 0) + (1.0 / (k + rank))
        
        # Process sparse results
        for rank, hit in enumerate(sparse_results, start=1):
            point_id = str(hit.id)
            scores[point_id] = scores.get(point_id, 0) + (1.0 / (k + rank))
        
        # Normalize scores to 0-1 range
        if scores:
            max_score = max(scores.values())
            min_score = min(scores.values())
            score_range = max_score - min_score
            
            if score_range > 0:
                # Normalize to 0.5-1.0 range (to match typical vector similarity scores)
                normalized_scores = {
                    point_id: 0.5 + 0.5 * ((score - min_score) / score_range)
                    for point_id, score in scores.items()
                }
            else:
                # Only one result or all scores are the same
                # Scale based on absolute RRF score (higher RRF = better match)
                # Max possible RRF for top result: 2/(k+1) ≈ 0.0328 for k=60
                # Scale to 0.6-0.95 range based on RRF score
                max_possible_rrf = 2.0 / (k + 1)  # Both searches rank it #1
                normalized_scores = {}
                for point_id, score in scores.items():
                    # Scale: 0.0328 -> 0.95, 0.0164 -> 0.75, etc.
                    normalized = 0.5 + 0.5 * min(1.0, score / max_possible_rrf)
                    normalized_scores[point_id] = normalized
        else:
            normalized_scores = {}
        
        # Sort by normalized score descending
        sorted_results = sorted(normalized_scores.items(), key=lambda x: x[1], reverse=True)
        return sorted_results
    
    @timing_decorator
    async def hybrid_search(
        self,
        query: str,
        user_id: str,
        card_id: str,
        limit: int = 5,
        namespace: Optional[str] = None,
        rrf_k: int = 60
    ) -> List[VectorSearchResult]:
        """Perform hybrid search combining dense vectors (semantic) and sparse vectors (keyword/BM25)
        
        This uses Reciprocal Rank Fusion (RRF) to combine results from both search methods,
        providing better results than either method alone.
        
        Args:
            query: Search query text
            user_id: User ID for filtering
            card_id: Card ID for filtering
            limit: Maximum number of results to return
            namespace: Optional namespace for filtering
            rrf_k: RRF constant (default 60)
            
        Returns:
            List of VectorSearchResult objects, sorted by fused score
        """
        if not self.sparse_model:
            logger.warning("Hybrid search not available (fastembed not installed). Falling back to dense search.")
            return await self.search(query, user_id, card_id, limit, namespace)
        
        # Check query result cache first
        query_cache_key = self._get_query_cache_key(f"hybrid_{query}", user_id, card_id, namespace)
        if query_cache_key in self.query_cache:
            logger.info("Complete hybrid query result found in cache, returning immediately")
            return self.query_cache[query_cache_key]
        
        collection_name = self._get_collection_name(user_id)
        
        try:
            # Step 1: Create dense embedding (semantic)
            start_time_dense = time.time()
            dense_embedding = await self._create_single_embedding_optimized(query)
            dense_time = time.time() - start_time_dense
            logger.info(f"Dense embedding: {dense_time:.2f}s")
            
            # Step 2: Create sparse embedding (BM25 keyword)
            start_time_sparse = time.time()
            sparse_result = await asyncio.to_thread(self._create_sparse_embedding, query)
            sparse_time = time.time() - start_time_sparse
            logger.info(f"Sparse embedding: {sparse_time:.2f}s")
            
            if not sparse_result:
                logger.warning("Failed to create sparse embedding, falling back to dense search")
                return await self.search(query, user_id, card_id, limit, namespace)
            
            sparse_indices, sparse_values = sparse_result
            
            # Build filter for both searches
            # Include both the specific card_id AND the "profile" card to get bio data
            conditions = [
                qmodels.FieldCondition(key="user_id", match=qmodels.MatchValue(value=user_id)),
                qmodels.Filter(should=[
                    qmodels.FieldCondition(key="card_id", match=qmodels.MatchValue(value=card_id)),
                    qmodels.FieldCondition(key="card_id", match=qmodels.MatchValue(value="profile"))
                ])
            ]
            if namespace:
                conditions.append(qmodels.FieldCondition(key="metadata.namespace", match=qmodels.MatchValue(value=namespace)))
            search_filter = qmodels.Filter(must=conditions)
            
            # Step 3: Perform both searches in parallel
            start_time_search = time.time()
            
            # Get more results than needed for better fusion (reduced from 3x to 2x for speed)
            search_limit = limit * 2
            
            # Dense vector search
            dense_search_task = asyncio.to_thread(
                self.qdrant_client.search,
                collection_name=collection_name,
                query_vector=dense_embedding,
                query_filter=search_filter,
                limit=search_limit,
                with_payload=True,
                with_vectors=False,
                search_params=qmodels.SearchParams(hnsw_ef=32, exact=False),
                timeout=3
            )
            
            # Sparse vector search (BM25)
            sparse_search_task = asyncio.to_thread(
                self.qdrant_client.search,
                collection_name=collection_name,
                query_vector=qmodels.NamedSparseVector(
                    name="text-sparse",
                    vector=qmodels.SparseVector(
                        indices=sparse_indices,
                        values=sparse_values
                    )
                ),
                query_filter=search_filter,
                limit=search_limit,
                with_payload=True,
                with_vectors=False,
                timeout=3
            )
            
            # Wait for both searches to complete
            dense_results, sparse_results = await asyncio.gather(
                dense_search_task,
                sparse_search_task,
                return_exceptions=True
            )
            
            search_time = time.time() - start_time_search
            logger.info(f"Parallel search: {search_time:.2f}s")
            
            # Handle exceptions
            if isinstance(dense_results, Exception):
                logger.error(f"Dense search failed: {dense_results}")
                dense_results = []
            if isinstance(sparse_results, Exception):
                logger.error(f"Sparse search failed: {sparse_results}")
                sparse_results = []
            
            # Step 4: Fuse results using RRF
            start_time_fusion = time.time()
            fused_scores = self._reciprocal_rank_fusion(dense_results, sparse_results, k=rrf_k)
            fusion_time = time.time() - start_time_fusion
            logger.info(f"RRF fusion: {fusion_time:.2f}s, combined {len(dense_results)} dense + {len(sparse_results)} sparse results")
            
            # Step 5: Retrieve full payloads for top results
            top_ids = [point_id for point_id, _ in fused_scores[:limit]]
            
            if not top_ids:
                logger.warning("No results after fusion")
                return []
            
            # Retrieve points with full payloads
            points = await asyncio.to_thread(
                self.qdrant_client.retrieve,
                collection_name=collection_name,
                ids=top_ids,
                with_payload=True,
                with_vectors=False
            )
            
            # Create a map of fused scores
            score_map = {point_id: score for point_id, score in fused_scores[:limit]}
            
            # Convert to VectorSearchResult objects with fused scores
            results = []
            for point in points:
                fused_score = score_map.get(str(point.id), 0.0)
                results.append(VectorSearchResult(
                    id=point.id,
                    text=point.payload.get("text", ""),
                    user_id=point.payload.get("user_id", user_id),
                    card_id=point.payload.get("card_id", "default"),
                    metadata=point.payload.get("metadata", {}),
                    score=fused_score  # Use fused score instead of individual scores
                ))
            
            # Sort by fused score (should already be sorted, but ensure it)
            results.sort(key=lambda x: x.score, reverse=True)
            
            # Track usage
            try:
                usage_tracker = get_usage_tracker()
                usage_tracker.track_qdrant_search(points_returned=len(results))
            except Exception as e:
                logger.warning(f"Failed to track Qdrant search: {str(e)}")
            
            # Cache the results
            self.query_cache[query_cache_key] = results
            logger.info(f"Hybrid search completed: returned {len(results)} results with fused scores")
            
            return results
            
        except Exception as e:
            logger.error(f"Hybrid search failed: {str(e)}")
            logger.warning("Falling back to dense search")
            return await self.search(query, user_id, card_id, limit, namespace)
        
    async def ensure_required_indexes(self, collection_name: str) -> bool:
        """Ensure that all required indexes exist in the collection
        
        Args:
            collection_name: The name of the collection to check
            
        Returns:
            True if all indexes were created or already exist, False otherwise
        """
        try:
            # Create index for user_id field
            try:
                logger.info(f"Creating index for user_id field in collection {collection_name}")
                self.qdrant_client.create_payload_index(
                    collection_name=collection_name,
                    field_name="user_id",
                    field_schema="keyword"
                )
                logger.info(f"Successfully created index for user_id field")
            except Exception as e:
                if "already exists" in str(e).lower():
                    logger.info(f"Index for user_id already exists")
                else:
                    logger.warning(f"Failed to create index for user_id: {str(e)}")
                    
            # Create index for card_id field
            try:
                logger.info(f"Creating index for card_id field in collection {collection_name}")
                self.qdrant_client.create_payload_index(
                    collection_name=collection_name,
                    field_name="card_id",
                    field_schema="keyword"
                )
                logger.info(f"Successfully created index for card_id field")
            except Exception as e:
                if "already exists" in str(e).lower():
                    logger.info(f"Index for card_id already exists")
                else:
                    logger.warning(f"Failed to create index for card_id: {str(e)}")
            
            # Create index for metadata.namespace field
            try:
                logger.info(f"Creating index for metadata.namespace field in collection {collection_name}")
                self.qdrant_client.create_payload_index(
                    collection_name=collection_name,
                    field_name="metadata.namespace",
                    field_schema="keyword"
                )
                logger.info(f"Successfully created index for metadata.namespace field")
            except Exception as e:
                if "already exists" in str(e).lower():
                    logger.info(f"Index for metadata.namespace already exists")
                else:
                    logger.warning(f"Failed to create index for metadata.namespace: {str(e)}")
            
            # Create index for metadata.source_type field
            try:
                logger.info(f"Creating index for metadata.source_type field in collection {collection_name}")
                self.qdrant_client.create_payload_index(
                    collection_name=collection_name,
                    field_name="metadata.source_type",
                    field_schema="keyword"
                )
                logger.info(f"Successfully created index for metadata.source_type field")
            except Exception as e:
                if "already exists" in str(e).lower():
                    logger.info(f"Index for metadata.source_type already exists")
                else:
                    logger.warning(f"Failed to create index for metadata.source_type: {str(e)}")
            
            # Create index for document_id field (for document-level deletion)
            try:
                logger.info(f"Creating index for document_id field in collection {collection_name}")
                self.qdrant_client.create_payload_index(
                    collection_name=collection_name,
                    field_name="document_id",
                    field_schema="keyword"
                )
                logger.info(f"Successfully created index for document_id field")
            except Exception as e:
                if "already exists" in str(e).lower():
                    logger.info(f"Index for document_id already exists")
                else:
                    logger.warning(f"Failed to create index for document_id: {str(e)}")
            
            return True
        except Exception as e:
            logger.error(f"Error ensuring required indexes: {str(e)}")
            return False
    
    @timing_decorator
    async def delete_user_data(self, user_id: str, card_id: str, source_type: Optional[Union[str, List[str]]] = None, 
                              namespace: Optional[str] = None, point_id: Optional[str] = None, document_id: Optional[str] = None) -> Dict[str, Any]:
        """Delete user data from vector database
        
        Args:
            user_id: User identifier
            card_id: Card identifier
            source_type: Optional source type or list of source types to filter by
            namespace: Optional namespace to filter by
            point_id: Optional specific point ID to delete
            document_id: Optional document ID to delete all chunks of a document
            
        Returns:
            Dictionary with deletion status and count
        """
        try:
            collection_name = self._get_collection_name(user_id)
            
            # Check if collection exists
            # COMMENTED OUT: Collection already exists, no need to check on every query
            # This saves ~100-200ms per request by avoiding unnecessary Qdrant API call
            # exists = await self._collection_exists_cached(collection_name)
            # if not exists:
            #     logger.warning(f"Collection {collection_name} does not exist")
            #     return {"status": "success", "deleted_count": 0}
            
            if point_id:
                # Delete specific point by ID
                self.qdrant_client.delete(
                    collection_name=collection_name,
                    points_selector=qmodels.PointIdsList(
                        points=[point_id]
                    )
                )
                logger.info(f"Deleted point with ID {point_id}")
                return {"status": "success", "deleted_count": 1}
            
            # Prepare filter conditions
            filter_conditions = [
                qmodels.FieldCondition(
                    key="user_id",
                    match=qmodels.MatchValue(value=user_id)
                ),
                qmodels.FieldCondition(
                    key="card_id",
                    match=qmodels.MatchValue(value=card_id)
                )
            ]
            
            # Add source_type filter if provided
            if source_type:
                if isinstance(source_type, list):
                    # If source_type is a list, use should condition to match any of the types
                    source_conditions = []
                    for st in source_type:
                        source_conditions.append(
                            qmodels.FieldCondition(
                                key="metadata.source_type",
                                match=qmodels.MatchValue(value=st)
                            )
                        )
                    filter_conditions.append(qmodels.Filter(should=source_conditions))
                else:
                    # If source_type is a single value, use a simple match condition
                    filter_conditions.append(
                        qmodels.FieldCondition(
                            key="metadata.source_type",
                            match=qmodels.MatchValue(value=source_type)
                        )
                    )
            
            # Add document_id filter if provided (for deleting entire document)
            if document_id:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="document_id",
                        match=qmodels.MatchValue(value=document_id)
                    )
                )
            
            # Add namespace filter if provided
            if namespace:
                filter_conditions.append(
                    qmodels.FieldCondition(
                        key="metadata.namespace",
                        match=qmodels.MatchValue(value=namespace)
                    )
                )
            
            # Create the filter
            filter_query = qmodels.Filter(must=filter_conditions)
            
            # Count points to be deleted first
            count_result = self.qdrant_client.count(
                collection_name=collection_name,
                count_filter=filter_query
            )
            count = count_result.count
            
            # Delete points matching the filter
            self.qdrant_client.delete(
                collection_name=collection_name,
                points_selector=qmodels.FilterSelector(
                    filter=filter_query
                )
            )
            
            logger.info(f"Deleted {count} points for user {user_id}, card {card_id}, source_type {source_type}, namespace {namespace}")
            return {"status": "success", "deleted_count": count}
            
        except Exception as e:
            logger.error(f"Error deleting user data: {str(e)}")
            return {"status": "error", "message": str(e), "deleted_count": 0}
    
    @timing_decorator
    async def get_user_data_by_type(self, user_id: str, card_id: str, source_type: Union[str, List[str]], namespace: Optional[str] = None, limit: int = 100) -> List[VectorSearchResult]:
        """Retrieve user data by source type without embedding
        
        Args:
            user_id: The user ID to filter by
            source_type: The source type(s) to filter by (e.g., 'faq', 'web', 'scrape', 'additional')
            namespace: Optional namespace to filter by
            limit: Maximum number of results to return
            
        Returns:
            List of VectorSearchResult objects matching the criteria
        """
        collection_name = self._get_collection_name(user_id)
        
        # Check if collection exists
        # COMMENTED OUT: Collection already exists, no need to check on every query
        # This saves ~100-200ms per request by avoiding unnecessary Qdrant API call
        try:
            # exists = await self._collection_exists_cached(collection_name)
            # if not exists:
            #     logger.warning(f"Collection {collection_name} does not exist")
            #     return []
            
            # Ensure required indexes exist
            await self.ensure_required_indexes(collection_name)
            
        except Exception as e:
            logger.error(f"Error checking collection: {str(e)}")
            raise VectorServiceException(f"Failed to check collection: {str(e)}")
        
        try:
            # Build filter conditions
            must_conditions = [
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
                must_conditions.append(qmodels.FieldCondition(
                    key="metadata.namespace",
                    match=qmodels.MatchValue(value=namespace)
                ))
            
            # Add source_type filter (only if provided)
            if source_type is not None:
                if isinstance(source_type, list):
                    # If multiple source types are provided, use should condition
                    should_conditions = []
                    for st in source_type:
                        should_conditions.append(qmodels.FieldCondition(
                            key="metadata.source_type",
                            match=qmodels.MatchValue(value=st)
                        ))
                    must_conditions.append(qmodels.Filter(should=should_conditions))
                else:
                    # Single source type
                    must_conditions.append(qmodels.FieldCondition(
                        key="metadata.source_type",
                        match=qmodels.MatchValue(value=source_type)
                    ))
            
            # Create the final filter
            scroll_filter = qmodels.Filter(must=must_conditions)
            
            try:
                # Use scroll API to get all points for the user with the specified source type
                # This is more efficient than search for retrieving all points
                scroll_results = self.qdrant_client.scroll(
                    collection_name=collection_name,
                    scroll_filter=scroll_filter,
                    limit=limit,  # Get up to the specified limit of points
                    with_payload=True,
                    with_vectors=False
                )
                
                # Extract points from scroll results
                points = scroll_results[0]
                
                # Convert to VectorSearchResult objects
                results = []
                for point in points:
                    results.append(VectorSearchResult(
                        id=point.id,
                        text=point.payload.get("text", ""),
                        user_id=point.payload.get("user_id", user_id),
                        metadata=point.payload.get("metadata", {}),
                        score=1.0,  # Default score since these aren't from a search
                        document_id=point.payload.get("document_id"),  # Extract document_id from payload
                        payload=point.payload  # Include full payload
                    ))
                
                logger.info(f"Retrieved {len(results)} items of type '{source_type}' for user {user_id}")
                return results
            
            except Exception as e:
                if "index required but not found" in str(e).lower():
                    # If the index doesn't exist, fall back to search and filter in memory
                    logger.warning(f"Index not found, falling back to search method: {str(e)}")
                    
                    # Use search with empty query as fallback
                    search_results = await self.search(
                        query="",
                        user_id=user_id,
                        card_id=card_id,
                        limit=100,  # Get more results for better filtering
                        namespace=namespace
                    )
                    
                    # Filter results by source_type in memory
                    results = []
                    for result in search_results:
                        metadata = result.metadata
                        source_type_match = False
                        
                        if isinstance(source_type, list):
                            if metadata.get("source_type") in source_type:
                                source_type_match = True
                        else:
                            if metadata.get("source_type") == source_type:
                                source_type_match = True
                                
                        if source_type_match:
                            results.append(result)
                    
                    logger.info(f"Retrieved {len(results)} items of type '{source_type}' for user {user_id} using fallback method")
                    return results[:limit]  # Apply limit
                else:
                    # Re-raise other exceptions
                    raise
            
        except Exception as e:
            logger.error(f"Error retrieving user data by type: {str(e)}")
            raise VectorServiceException(f"Failed to retrieve user data by type: {str(e)}")
    
    @timing_decorator
    async def get_all_user_chunks(self, user_id: str, card_id: str, namespace: Optional[str] = None, limit: int = 100) -> List[VectorSearchResult]:
        """Retrieve all chunks for a specific user"""
        collection_name = self._get_collection_name(user_id)
        
        # Check if collection exists
        # COMMENTED OUT: Collection already exists, no need to check on every query
        # This saves ~100-200ms per request by avoiding unnecessary Qdrant API call
        try:
            # exists = await self._collection_exists_cached(collection_name)
            # if not exists:
            #     logger.warning(f"Collection {collection_name} does not exist")
            #     return []
                
            # Ensure required indexes exist
            await self.ensure_required_indexes(collection_name)
                
        except Exception as e:
            logger.error(f"Error checking collection: {str(e)}")
            raise VectorServiceException(f"Failed to check collection: {str(e)}")
        
        try:
            # Build filter conditions
            must_conditions = [
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
                must_conditions.append(qmodels.FieldCondition(
                    key="metadata.namespace",
                    match=qmodels.MatchValue(value=namespace)
                ))
            
            # Create the final filter
            scroll_filter = qmodels.Filter(must=must_conditions)
            
            try:
                # Use scroll API to get all points for the user
                scroll_results = self.qdrant_client.scroll(
                    collection_name=collection_name,
                    scroll_filter=scroll_filter,
                    limit=limit,
                    with_payload=True,
                    with_vectors=False
                )
                
                # Extract points from scroll results
                points = scroll_results[0]
                
                # Convert to VectorSearchResult objects
                results = []
                for point in points:
                    results.append(VectorSearchResult(
                        id=point.id,
                        text=point.payload.get("text", ""),
                        user_id=point.payload.get("user_id", user_id),
                        metadata=point.payload.get("metadata", {}),
                        score=1.0  # Default score since these aren't from a search
                    ))
                
                logger.info(f"Retrieved {len(results)} chunks for user {user_id}")
                return results
                
            except Exception as e:
                if "index required but not found" in str(e).lower():
                    # If the index doesn't exist, fall back to search
                    logger.warning(f"Index not found, falling back to search method: {str(e)}")
                    
                    # Use search with empty query as fallback
                    search_results = await self.search(
                        query="",
                        user_id=user_id,
                        card_id=card_id,
                        limit=limit,
                        namespace=namespace
                    )
                    
                    logger.info(f"Retrieved {len(search_results)} chunks for user {user_id} using fallback method")
                    return search_results
                else:
                    # Re-raise other exceptions
                    raise
            
        except Exception as e:
            logger.error(f"Error retrieving user chunks: {str(e)}")
            raise VectorServiceException(f"Failed to retrieve user chunks: {str(e)}")


# Singleton instance
_vector_service_instance = None

async def get_vector_service() -> VectorService:
    """Get or create vector service instance"""
    global _vector_service_instance
    if _vector_service_instance is None:
        _vector_service_instance = VectorService()
    return _vector_service_instance