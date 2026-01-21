class VectorServiceException(Exception):
    """Exception raised by vector service operations"""
    pass

class DocumentProcessingException(Exception):
    """Exception raised during document processing"""
    pass

class ScrapingException(Exception):
    """Exception raised during web scraping"""
    pass

class WorkflowException(Exception):
    """Exception raised during workflow execution"""
    pass

class ChatServiceException(Exception):
    """Exception raised by chat service operations"""
    pass
