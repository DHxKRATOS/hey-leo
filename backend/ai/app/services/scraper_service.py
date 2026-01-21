import logging
import asyncio
from typing import List, Optional, Dict, Any
import aiohttp
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re

from app.models.vector import Chunk, SourceType
from app.core.exceptions import ScrapingException

logger = logging.getLogger(__name__)

class ScraperService:
    """Service for web scraping and content extraction"""
    
    def __init__(self):
        self.timeout = aiohttp.ClientTimeout(total=30)
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean extracted text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-\'"]+', '', text)
        return text.strip()
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Extract main content from HTML"""
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
            script.decompose()
        
        # Try to find main content areas
        main_selectors = [
            'main', 'article', '.content', '#content', 
            '.main-content', '#main-content', '.post-content',
            '.entry-content', '.article-content'
        ]
        
        main_content = None
        for selector in main_selectors:
            elements = soup.select(selector)
            if elements:
                main_content = elements[0]
                break
        
        # If no main content found, use body
        if main_content is None:
            main_content = soup.find('body') or soup
        
        # Extract text
        text = main_content.get_text(separator=' ', strip=True)
        return self._clean_text(text)
    
    async def scrape_url(self, url: str) -> List[Chunk]:
        """Scrape content from a URL and return chunks"""
        try:
            async with aiohttp.ClientSession(timeout=self.timeout, headers=self.headers) as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        raise ScrapingException(f"HTTP {response.status}: Failed to fetch {url}")
                    
                    content = await response.text()
                    content_type = response.headers.get('content-type', '').lower()
                    
                    if 'html' not in content_type:
                        raise ScrapingException(f"Unsupported content type: {content_type}")
        
        except aiohttp.ClientError as e:
            logger.error(f"Network error scraping {url}: {str(e)}")
            raise ScrapingException(f"Network error: {str(e)}")
        except Exception as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            raise ScrapingException(f"Scraping failed: {str(e)}")
        
        try:
            # Parse HTML
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract title
            title_elem = soup.find('title')
            title = title_elem.get_text().strip() if title_elem else urlparse(url).netloc
            
            # Extract main content
            main_text = self._extract_main_content(soup)
            
            if not main_text:
                raise ScrapingException("No content found on the page")
            
            # Create metadata
            metadata = {
                "source_type": SourceType.WEB,
                "url": url,
                "title": title,
                "scraped_at": asyncio.get_event_loop().time()
            }
            
            # Split into chunks (simple word-based splitting)
            words = main_text.split()
            chunks = []
            chunk_size = 1000  # words per chunk
            
            for i in range(0, len(words), chunk_size):
                chunk_words = words[i:i + chunk_size]
                chunk_text = ' '.join(chunk_words)
                
                chunk_metadata = metadata.copy()
                chunk_metadata["chunk_index"] = i // chunk_size
                
                chunks.append(Chunk(
                    text=chunk_text,
                    metadata=chunk_metadata
                ))
            
            logger.info(f"Scraped {url}: {len(chunks)} chunks from {len(words)} words")
            return chunks
            
        except Exception as e:
            logger.error(f"Error parsing content from {url}: {str(e)}")
            raise ScrapingException(f"Content parsing failed: {str(e)}")

# Singleton instance
_scraper_service_instance = None

async def get_scraper_service() -> ScraperService:
    """Get or create scraper service instance"""
    global _scraper_service_instance
    if _scraper_service_instance is None:
        _scraper_service_instance = ScraperService()
    return _scraper_service_instance
