"""
Test script for greeting detection
"""

import sys
sys.path.insert(0, '/home/comp-020/Desktop/All codes/leo_2/backend/ai')

from app.services.greeting_detector import get_greeting_detector

def test_greetings():
    """Test various greeting inputs"""
    detector = get_greeting_detector()
    
    test_cases = [
        # Greetings (should be detected)
        ("hi", True),
        ("hello", True),
        ("hey there", True),
        ("good morning", True),
        ("how are you?", True),
        ("what's up", True),
        ("bye", True),
        
        # Non-greetings (should NOT be detected)
        ("who is nishant?", False),
        ("what is your name?", False),
        ("tell me about the company", False),
        ("hi there, who is the founder?", False),  # Greeting + question
    ]
    
    print("Testing Greeting Detection:")
    print("=" * 60)
    
    for query, expected in test_cases:
        is_greeting = detector.is_greeting(query)
        status = "✅" if is_greeting == expected else "❌"
        print(f"{status} '{query}' -> {is_greeting} (expected: {expected})")
        
        if is_greeting:
            response = detector.get_greeting_response(query)
            print(f"   Response: {response['answer']}")
    
    print("=" * 60)

if __name__ == "__main__":
    test_greetings()
