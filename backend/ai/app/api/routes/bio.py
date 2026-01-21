from fastapi import APIRouter, HTTPException
from app.models.requests import BioGenerationRequest
from app.models.responses import BioGenerationResponse
from app.core.config import settings
import logging
from openai import AsyncOpenAI
from app.core.service_manager import get_service_manager
from app.services.vector_service import get_vector_service
from app.models.vector import Chunk, SourceType

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=BioGenerationResponse)
async def generate_bio(request: BioGenerationRequest):
    """Generate a professional bio based on user input"""
    try:
        # Get OpenAI client from service manager
        service_manager = get_service_manager()
        openai_client = service_manager.openai_client
        
        # Construct prompt for bio generation
        company_info = f" at {request.company_name}" if request.company_name else ""
        
        # Include additional text if provided
        additional_info = ""
        if request.text:
            additional_info = f"\n\nAdditional information about {request.first_name}:\n{request.text}"
        
        prompt = f"""Generate a professional bio for {request.first_name} {request.last_name}, who works as a {request.job_title}{company_info}.{additional_info}
        
        The bio should be:
        - Professional and concise (2-3 paragraphs)
        - Highlight their expertise in their role
        - Be written in third person
        - Have a confident but approachable tone
        - Include generic professional accomplishments suitable for their role
        - Incorporate the additional information provided (if any)
        
        Generate only the bio text without any additional comments or explanations."""
        
        # Generate bio using OpenAI
        response = await openai_client.chat.completions.create(
            model=settings.LLM_MODEL,
            messages=[
                {"role": "system", "content": "You are a professional bio writer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=250
        )
        
        # Extract bio from response
        bio = response.choices[0].message.content.strip()
        
        # Store bio in knowledge base
        vector_service = await get_vector_service()
        
        # Create comprehensive bio text with profile information
        bio_text = f"""Profile Information:
Name: {request.first_name} {request.last_name}
Job Title: {request.job_title}
Company: {request.company_name or 'N/A'}"""
        
        # Add contact information if provided
        if request.phone_number:
            bio_text += f"\nPhone: {request.phone_number}"
        if request.email_id:
            bio_text += f"\nEmail: {request.email_id}"
        if request.urls:
            bio_text += f"\nProfile URLs: {', '.join(request.urls)}"
        
        bio_text += f"\n\nProfessional Bio:\n{bio}"
        
        # Add additional text if provided
        if request.text:
            bio_text += f"\n\nAdditional Information:\n{request.text}"
        
        # Create chunk for storage
        bio_metadata = {
            "source_type": SourceType.ADDITIONAL.value,
            "content_type": "bio",
            "first_name": request.first_name,
            "last_name": request.last_name,
            "job_title": request.job_title,
            "company_name": request.company_name,
            "namespace": request.namespace
        }
        
        # Add optional fields to metadata if provided
        if request.phone_number:
            bio_metadata["phone_number"] = request.phone_number
        if request.email_id:
            bio_metadata["email_id"] = request.email_id
        if request.urls:
            bio_metadata["urls"] = request.urls
        
        bio_chunk = Chunk(
            text=bio_text,
            metadata=bio_metadata
        )
        
        # Determine card_id: use provided card_id or default to "profile"
        # If card_id is provided, link bio to that specific card
        # If not provided, use "profile" to make it accessible across all cards
        target_card_id = request.card_id if request.card_id else "profile"
        
        # Delete existing bio for this user/card combination before inserting new one
        # This ensures we update instead of creating duplicates
        try:
            # Only pass namespace if it's actually provided to avoid index errors
            delete_kwargs = {
                "user_id": request.user_id,
                "card_id": target_card_id,
                "source_type": SourceType.ADDITIONAL
            }
            if request.namespace:
                delete_kwargs["namespace"] = request.namespace
                
            delete_result = await vector_service.delete_user_data(**delete_kwargs)
            if delete_result.get("deleted_count", 0) > 0:
                logger.info(f"Deleted {delete_result['deleted_count']} existing bio(s) for user {request.user_id} with card_id '{target_card_id}'")
        except Exception as e:
            logger.warning(f"Error deleting existing bio: {str(e)}. Proceeding with insert.")
        
        # Store updated bio in vector database
        await vector_service.ingest_chunks(
            items=[bio_chunk],
            user_id=request.user_id,
            card_id=target_card_id,
            namespace=request.namespace
        )
        
        logger.info(f"Stored bio for user {request.user_id} with card_id '{target_card_id}' in knowledge base")
        
        return BioGenerationResponse(
            first_name=request.first_name,
            last_name=request.last_name,
            job_title=request.job_title,
            company_name=request.company_name,
            text=request.text,
            bio=bio
        )
        
    except Exception as e:
        logger.error(f"Error generating bio: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
