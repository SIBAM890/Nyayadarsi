"""
Authentication Routes
POST /api/auth/register — Create new user account
POST /api/auth/login — Authenticate and receive JWT
GET  /api/auth/me — Get current user profile
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from backend.services import auth_service

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Register a new user account.
    Returns JWT token and user profile on success.
    """
    return auth_service.register_user(db, request)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Login and get JWT token",
)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """
    Authenticate with email and password.
    Returns JWT token on success.
    """
    return auth_service.authenticate_user(db, request)


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Get the currently authenticated user's profile."""
    return UserResponse.model_validate(current_user)
