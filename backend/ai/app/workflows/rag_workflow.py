import logging
from typing import List, Dict, Any, Optional
from app.models.vector import VectorSearchResult
from app.core.service_manager import get_service_manager
from app.core.config import settings
from app.services.usage_tracker import get_usage_tracker
import hashlib
import time
import asyncio

logger = logging.getLogger(__name__)

class RAGWorkflow:
    """Simple RAG workflow for processing queries"""
    
    def __init__(self):
        service_manager = get_service_manager()
        self.openai_client = service_manager.openai_client
        self.llm_model = settings.LLM_MODEL
        # LLM response cache to avoid redundant API calls
        self.llm_cache = {}  # {cache_key: {"response": ..., "timestamp": ...}}
        self.cache_ttl = 3600  # 1 hour cache
        self.cache_max_size = 200
    
    def _get_cache_key(self, query: str, context: str) -> str:
        """Generate cache key from query and context"""
        combined = f"{query.lower().strip()}|{context[:300]}"  # Normalize and use first 300 chars
        return hashlib.md5(combined.encode()).hexdigest()
    
    def _get_from_cache(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get cached LLM response if available and not expired"""
        if cache_key in self.llm_cache:
            cached = self.llm_cache[cache_key]
            if time.time() - cached["timestamp"] < self.cache_ttl:
                logger.info(f"✅ LLM Cache HIT - Saved ~1.5s and API cost")
                return cached["response"]
            else:
                # Expired, remove it
                del self.llm_cache[cache_key]
        return None
    
    def _add_to_cache(self, cache_key: str, response: Dict[str, Any]):
        """Add response to cache with LRU eviction"""
        if len(self.llm_cache) >= self.cache_max_size:
            # Remove oldest entry (simple FIFO)
            oldest_key = min(self.llm_cache.keys(), key=lambda k: self.llm_cache[k]["timestamp"])
            del self.llm_cache[oldest_key]
            logger.info(f"Cache full, evicted oldest entry")
        
        self.llm_cache[cache_key] = {
            "response": response,
            "timestamp": time.time()
        }
        logger.info(f"Cached LLM response (cache size: {len(self.llm_cache)}/{self.cache_max_size})")
    
    async def process_query(
        self,
        query: str,
        search_results: List[VectorSearchResult],
        chat_session_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process a query using RAG approach"""
        
        if not search_results:
            return {
                "answer": "I don't have enough information.",
                "sources": [],
                "confidence": 0.5
            }
        
        # Prepare context from search results
        context_parts = []
        sources = []
        
        for i, result in enumerate(search_results):
            # Add more detailed source information including filename
            source_info = f"Source {i+1} [File: {result.metadata.get('filename', 'Unknown')}]: {result.text}"
            context_parts.append(source_info)
            
            sources.append({
                "id": result.id,
                "text": result.text,
                "metadata": result.metadata,
                "score": result.score
            })
        
        context = "\n\n".join(context_parts)
        
        # Check cache before making API call
        cache_key = self._get_cache_key(query, context)
        cached_response = self._get_from_cache(cache_key)
        if cached_response:
            return cached_response
        
        # Create prompt
        prompt = f"""Based on the following context, please answer the user's question.

Pay special attention to the content in each source. If the user is asking about specific files or documents, use the information from those sources.

IMPORTANT RULES:
1. DO NOT include source references like "Source X" or "[File: filename]" in your answer.
2. If the information is NOT in the context, respond ONLY with: "I don't have enough information."
3. Do NOT say things like "is not mentioned in the provided context" or "the context doesn't contain".
4. Just provide a clean, direct answer based on the information, or say "I don't have enough information."

Context:
{context}

Question: {query}

Answer:"""
        
        try:
            # Get response from LLM with optimized parameters and timeout
            # Add 8-second timeout to prevent long waits
            try:
                response = await asyncio.wait_for(
                    self.openai_client.chat.completions.create(
                        model=self.llm_model,
                        messages=[
                            {"role": "system", "content": "Answer based ONLY on the context provided. Be concise and direct. Do not include source references. If the answer is not in the context, respond with exactly: 'I don't have enough information.' Do NOT say the information is not mentioned or not in the context."},
                            {"role": "user", "content": prompt}
                        ],
                        temperature=0,
                        max_tokens=100,  # Optimized for speed while maintaining quality
                        timeout=8.0  # OpenAI client timeout
                    ),
                    timeout=10.0  # Asyncio timeout (slightly higher than OpenAI timeout)
                )
            except asyncio.TimeoutError:
                logger.warning(f"⚠️ LLM call timed out after 10 seconds - returning fallback answer")
                # Return a quick answer based on search results without LLM
                avg_score = sum(r.score for r in search_results) / len(search_results)
                confidence = avg_score  # Use average score directly (already in 0.5-1.0 range from RRF)
                
                # Use the best search result as fallback
                best_result = max(search_results, key=lambda r: r.score)
                fallback_answer = f"Based on the available information: {best_result.text[:200]}..."
                
                return {
                    "answer": fallback_answer,
                    "sources": sources,
                    "confidence": confidence * 0.8  # Reduce confidence for fallback
                }
            
            answer = response.choices[0].message.content
            
            # Track LLM token usage
            try:
                usage_tracker = get_usage_tracker()
                usage_tracker.track_openai_from_response(
                    response_usage=response.usage,
                    model=self.llm_model
                )
            except Exception as e:
                logger.warning(f"Failed to track LLM usage: {str(e)}")
            
            # Calculate confidence based on search scores
            avg_score = sum(r.score for r in search_results) / len(search_results)
            confidence = avg_score  # Use average score directly (already in 0.5-1.0 range from RRF)
            
            response_data = {
                "answer": answer,
                "sources": sources,
                "confidence": confidence
            }
            
            # Cache the response
            self._add_to_cache(cache_key, response_data)
            
            return response_data
            
        except Exception as e:
            logger.error(f"Error in RAG workflow: {str(e)}")
            return {
                "answer": "I encountered an error while processing your question. Please try again.",
                "sources": sources,
                "confidence": 0.0
            }

# Singleton instance
_rag_workflow_instance = None

async def get_rag_workflow() -> RAGWorkflow:
    """Get or create RAG workflow instance"""
    global _rag_workflow_instance
    if _rag_workflow_instance is None:
        _rag_workflow_instance = RAGWorkflow()
    return _rag_workflow_instance
