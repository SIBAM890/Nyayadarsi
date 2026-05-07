"""
Nyayadarsi Centralized Error Handling
Provides standard exception classes and response shapes for API errors.
"""
from typing import Any, Optional
from fastapi import HTTPException, status
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    """Standard error response shape."""
    error: bool = True
    message: str
    code: str
    detail: Optional[Any] = None

class NyayadarsiException(HTTPException):
    """Base exception for all domain-specific errors."""
    def __init__(
        self, 
        message: str, 
        code: str = "INTERNAL_ERROR", 
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: Optional[Any] = None
    ):
        super().__init__(
            status_code=status_code,
            detail={
                "error": True,
                "message": message,
                "code": code,
                "detail": detail
            }
        )

class AuthException(NyayadarsiException):
    """Authentication or authorization failures."""
    def __init__(self, message: str, code: str = "AUTH_FAILED"):
        super().__init__(message, code, status_code=status.HTTP_401_UNAUTHORIZED)

class ValidationException(NyayadarsiException):
    """Data validation or schema failures."""
    def __init__(self, message: str, code: str = "VALIDATION_ERROR"):
        super().__init__(message, code, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)

class NotFoundException(NyayadarsiException):
    """Resource not found."""
    def __init__(self, message: str, code: str = "NOT_FOUND"):
        super().__init__(message, code, status_code=status.HTTP_404_NOT_FOUND)

class RateLimitException(NyayadarsiException):
    """Quota exceeded."""
    def __init__(self, message: str = "Too many requests. Please try again later."):
        super().__init__(message, "RATE_LIMIT_EXCEEDED", status_code=status.HTTP_429_TOO_MANY_REQUESTS)
