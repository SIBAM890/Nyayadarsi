"""
Nyayadarsi Dependencies
FastAPI dependency injection for authentication and database sessions.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.core.security import decode_access_token
from backend.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency — extracts and validates the current user from JWT.

    Usage:
        @router.get("/protected")
        async def protected(current_user: User = Depends(get_current_user)):
            ...
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={
            "error": True,
            "message": "Invalid or expired authentication token",
            "code": "INVALID_TOKEN",
        },
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": True,
                "message": "User account is deactivated",
                "code": "ACCOUNT_INACTIVE",
            },
        )
    return user


class RoleChecker:
    """Dependency for Role-Based Access Control (RBAC)."""
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)) -> User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": True,
                    "message": f"Role '{user.role}' is not authorized to perform this action.",
                    "code": "FORBIDDEN",
                },
            )
        return user


# Common RBAC Dependencies
require_gov_officer = RoleChecker(["gov_officer"])
require_evaluator = RoleChecker(["evaluation_officer", "gov_officer"])
require_builder = RoleChecker(["builder"])
