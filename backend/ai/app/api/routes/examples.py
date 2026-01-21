from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from app.services.vector_service import get_vector_service
from app.core.service_manager import get_service_manager
from app.models.vector import SourceType
import logging
import json

logger = logging.getLogger(__name__)
router = APIRouter()

class ExampleQuestion(BaseModel):
    question: str
    category: str
    confidence: float

class ExampleQuestionsResponse(BaseModel):
    user_id: str
    card_id: str
    questions: List[ExampleQuestion]
    total_documents: int
    message: str

@router.get("/generate", response_model=ExampleQuestionsResponse)
async def generate_example_questions(
    user_id: str,
    card_id: str,
    namespace: Optional[str] = None,
    limit: int = 5
):
    """Generate example questions based on user's uploaded knowledge base
    
    This analyzes the user's documents and generates relevant questions
    that can actually be answered from their knowledge base.
    
    Args:
        user_id: User ID
        card_id: Card ID
        namespace: Optional namespace
        limit: Number of example questions to generate (default 5)
    """
    try:
        # Get vector service
        vector_service = await get_vector_service()
        
        # Get all user's documents to analyze
        documents = await vector_service.get_user_data_by_type(
            user_id=user_id,
            card_id=card_id,
            source_type=None,  # Get all types
            namespace=namespace
        )
        
        if not documents or len(documents) == 0:
            return ExampleQuestionsResponse(
                user_id=user_id,
                card_id=card_id,
                questions=[],
                total_documents=0,
                message="No documents found. Please upload documents first."
            )
        
        logger.info(f"Found {len(documents)} documents for user {user_id}")
        
        # Extract key topics from documents
        document_texts = []
        for doc in documents[:10]:  # Analyze first 10 documents
            text = doc.text if hasattr(doc, 'text') else ""
            if text:
                document_texts.append(text[:500])  # First 500 chars of each
        
        # Generate questions using LLM
        service_manager = get_service_manager()
        openai_client = service_manager.openai_client
        
        context = "\n\n".join(document_texts)
        
        prompt = f"""Based on the following knowledge base content, generate {limit} example questions that users might ask.

Requirements:
1. Questions should be directly answerable from the content
2. Use natural, conversational language
3. Cover different topics from the content
4. Include questions about people, facts, and concepts mentioned
5. Format: Return ONLY a JSON array of questions, nothing else

Content:
{context}

Return format:
[
  {{"question": "Who is...", "category": "people"}},
  {{"question": "What is...", "category": "concepts"}},
  {{"question": "How does...", "category": "processes"}}
]
"""

        response = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates relevant questions based on document content. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1500
        )
        
        # Parse response
        import json
        response_text = response.choices[0].message.content.strip()
        
        # Extract JSON if wrapped in markdown
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        questions_data = json.loads(response_text)
        
        # Convert to ExampleQuestion objects
        example_questions = []
        for q in questions_data[:limit]:
            example_questions.append(ExampleQuestion(
                question=q.get("question", ""),
                category=q.get("category", "general"),
                confidence=0.8  # High confidence since generated from actual content
            ))
        
        logger.info(f"Generated {len(example_questions)} example questions for user {user_id}")
        
        return ExampleQuestionsResponse(
            user_id=user_id,
            card_id=card_id,
            questions=example_questions,
            total_documents=len(documents),
            message=f"Generated {len(example_questions)} example questions from {len(documents)} documents"
        )
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")
        
    except Exception as e:
        logger.error(f"Error generating example questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/quick", response_model=ExampleQuestionsResponse)
async def get_quick_example_questions(
    user_id: str,
    card_id: str,
    namespace: Optional[str] = None
):
    """Get quick example questions based on document metadata (fast, no LLM call)
    
    This generates questions based on document filenames and types without
    calling the LLM, making it much faster.
    """
    try:
        vector_service = await get_vector_service()
        
        # Get user's documents
        documents = await vector_service.get_user_data_by_type(
            user_id=user_id,
            card_id=card_id,
            source_type=None,
            namespace=namespace
        )
        
        if not documents or len(documents) == 0:
            return ExampleQuestionsResponse(
                user_id=user_id,
                card_id=card_id,
                questions=[],
                total_documents=0,
                message="No documents found"
            )
        
        # Generate questions based on document types and content
        questions = []
        
        # Check for FAQs
        faqs = [d for d in documents if d.metadata.get("source_type") == "faq"]
        if faqs:
            questions.append(ExampleQuestion(
                question="What are the frequently asked questions?",
                category="faq",
                confidence=0.9
            ))
        
        # Check for documents
        docs = [d for d in documents if d.metadata.get("source_type") == "document"]
        if docs:
            # Extract names from first document
            first_doc = docs[0].text[:200] if docs[0].text else ""
            questions.append(ExampleQuestion(
                question="What information is in the uploaded documents?",
                category="documents",
                confidence=0.8
            ))
        
        # Check for web content
        web_docs = [d for d in documents if d.metadata.get("source_type") in ["web", "scrape"]]
        if web_docs:
            questions.append(ExampleQuestion(
                question="What information was scraped from websites?",
                category="web",
                confidence=0.8
            ))
        
        # Generic questions based on content
        questions.extend([
            ExampleQuestion(
                question="Summarize the key information available",
                category="general",
                confidence=0.7
            ),
            ExampleQuestion(
                question="What topics are covered in the knowledge base?",
                category="general",
                confidence=0.7
            )
        ])
        
        return ExampleQuestionsResponse(
            user_id=user_id,
            card_id=card_id,
            questions=questions[:5],
            total_documents=len(documents),
            message=f"Generated quick questions from {len(documents)} documents"
        )
        
    except Exception as e:
        logger.error(f"Error generating quick questions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
