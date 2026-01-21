"""
Greeting Detection Service

This module provides functionality to detect and respond to basic greetings
without using the RAG workflow, improving response time and user experience.
"""

import re
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class GreetingDetector:
    """Service for detecting greetings and providing appropriate responses"""
    
    # Define greeting patterns (case-insensitive)
    GREETING_PATTERNS = [
        # Basic greetings
        r'^hi\s*$',
        r'^hello\s*$',
        r'^hey\s*$',
        r'^hola\s*$',
        r'^greetings\s*$',
        r'^good\s+morning\s*$',
        r'^good\s+afternoon\s*$',
        r'^good\s+evening\s*$',
        r'^good\s+day\s*$',
        
        # Greetings with punctuation
        r'^hi[!.]+\s*$',
        r'^hello[!.]+\s*$',
        r'^hey[!.]+\s*$',
        
        # Greetings with "there"
        r'^hi\s+there\s*[!.]*$',
        r'^hello\s+there\s*[!.]*$',
        r'^hey\s+there\s*[!.]*$',
        
        # How are you variations
        r'^how\s+are\s+you\s*[?!.]*$',
        r'^how\s+are\s+you\s+doing\s*[?!.]*$',
        r"^how's\s+it\s+going\s*[?!.]*$",
        r"^how\s+is\s+it\s+going\s*[?!.]*$",
        r'^what\'s\s+up\s*[?!.]*$',
        r'^whats\s+up\s*[?!.]*$',
        r'^sup\s*[?!.]*$',
        
        # Farewells (also handle these as greetings)
        r'^bye\s*[!.]*$',
        r'^goodbye\s*[!.]*$',
        r'^see\s+you\s*[!.]*$',
        r'^take\s+care\s*[!.]*$',
        r'^have\s+a\s+good\s+(day|night|one)\s*[!.]*$',
    ]
    
    # Define responses for different greeting types
    GREETING_RESPONSES = {
        "default": "Hello! How can I help you today?",
        "morning": "Good morning! How can I assist you today?",
        "afternoon": "Good afternoon! How can I help you?",
        "evening": "Good evening! What can I do for you?",
        "how_are_you": "I'm doing great, thank you for asking! How can I assist you today?",
        "farewell": "Goodbye! Feel free to reach out if you need anything else.",
    }
    
    def __init__(self):
        """Initialize the greeting detector"""
        # Compile patterns for better performance
        self.compiled_patterns = [
            re.compile(pattern, re.IGNORECASE) for pattern in self.GREETING_PATTERNS
        ]
    
    def is_greeting(self, query: str) -> bool:
        """
        Check if the query is a basic greeting
        
        Args:
            query: The user's query text
            
        Returns:
            True if the query is a greeting, False otherwise
        """
        if not query:
            return False
        
        # Normalize the query
        normalized_query = query.strip()
        
        # Check against all patterns
        for pattern in self.compiled_patterns:
            if pattern.match(normalized_query):
                logger.info(f"Detected greeting: '{query}'")
                return True
        
        return False
    
    def get_greeting_response(self, query: str) -> Optional[Dict[str, Any]]:
        """
        Get an appropriate response for a greeting
        
        Args:
            query: The user's query text
            
        Returns:
            Dictionary with answer, sources, and confidence, or None if not a greeting
        """
        if not self.is_greeting(query):
            return None
        
        # Normalize query for response selection
        normalized_query = query.lower().strip()
        
        # Select appropriate response based on greeting type
        if any(word in normalized_query for word in ["morning"]):
            response_text = self.GREETING_RESPONSES["morning"]
        elif any(word in normalized_query for word in ["afternoon"]):
            response_text = self.GREETING_RESPONSES["afternoon"]
        elif any(word in normalized_query for word in ["evening"]):
            response_text = self.GREETING_RESPONSES["evening"]
        elif any(phrase in normalized_query for phrase in ["how are you", "how's it going", "how is it going", "what's up", "whats up", "sup"]):
            response_text = self.GREETING_RESPONSES["how_are_you"]
        elif any(word in normalized_query for word in ["bye", "goodbye", "see you", "take care"]):
            response_text = self.GREETING_RESPONSES["farewell"]
        else:
            response_text = self.GREETING_RESPONSES["default"]
        
        logger.info(f"Generated greeting response: '{response_text}'")
        
        return {
            "answer": response_text,
            "sources": [],  # No sources for greetings
            "confidence": 1.0  # High confidence for greeting responses
        }


# Singleton instance
_greeting_detector_instance = None


def get_greeting_detector() -> GreetingDetector:
    """Get or create greeting detector instance"""
    global _greeting_detector_instance
    if _greeting_detector_instance is None:
        _greeting_detector_instance = GreetingDetector()
    return _greeting_detector_instance
