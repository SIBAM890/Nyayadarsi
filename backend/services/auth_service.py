"""
Authentication Service
Handles user registration, login, and token generation.
"""
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from backend.models.user import User
from backend.core.security import hash_password, verify_password, create_access_token
from backend.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse


def register_user(db: Session, request: RegisterRequest) -> TokenResponse:
    """
    Register a new user account.

    Args:
        db: SQLAlchemy session.
        request: Registration payload with email, password, name, role.

    Returns:
        TokenResponse with JWT and user info.

    Raises:
        HTTPException 409: If email already exists.
    """
    # Check duplicate email
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "error": True,
                "message": f"Email '{request.email}' is already registered",
                "code": "EMAIL_EXISTS",
            },
        )

    # Create user
    user = User(
        email=request.email,
        hashed_password=hash_password(request.password),
        full_name=request.full_name,
        role=request.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    access_token = create_access_token(data={"sub": user.id, "role": user.role})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )


def authenticate_user(db: Session, request: LoginRequest) -> TokenResponse:
    """
    Authenticate user and return JWT.

    Args:
        db: SQLAlchemy session.
        request: Login payload with email and password.

    Returns:
        TokenResponse with JWT and user info.

    Raises:
        HTTPException 401: If credentials are invalid.
    """
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": True,
                "message": "Invalid email or password",
                "code": "INVALID_CREDENTIALS",
            },
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": True,
                "message": "Account is deactivated",
                "code": "ACCOUNT_INACTIVE",
            },
        )

    access_token = create_access_token(data={"sub": user.id, "role": user.role})

    return TokenResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user),
    )
