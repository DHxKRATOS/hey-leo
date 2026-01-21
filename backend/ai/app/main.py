from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import logging

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.routes import documents, scraper, faq, additional, chat, cache, bio, analytics, examples

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="LEO Agentic RAG",
    description="API for document ingestion and RAG-powered chat",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api_router = APIRouter(prefix="/api")

# Include route modules
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(scraper.router, prefix="/scraper", tags=["scraper"])
api_router.include_router(faq.router, prefix="/faq", tags=["faq"])
api_router.include_router(additional.router, prefix="/additional", tags=["additional"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(cache.router, prefix="/cache", tags=["cache"])
api_router.include_router(bio.router, prefix="/bio", tags=["bio"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(examples.router, prefix="/examples", tags=["examples"])

# Include the API router
app.include_router(api_router)

@app.get("/")
async def root():
    return {"message": "LEO Agentic RAG API", "version": "0.1.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=True,
        log_level=settings.LOG_LEVEL.lower()
    )
