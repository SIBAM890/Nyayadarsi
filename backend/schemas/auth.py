"""Authentication schemas — register, login, token responses."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class RegisterRequest(BaseModel):
    """User registration payload."""
    email: str = Field(..., min_length=5, max_length=255, description="User email address")
    password: str = Field(..., min_length=8, max_length=128, description="Password (min 8 chars)")
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name")
    role: str = Field(
        default="gov_officer",
        pattern=r"^(gov_officer|evaluation_officer|builder)$",
        description="User role",
    )


class LoginRequest(BaseModel):
    """User login payload."""
    email: str = Field(..., min_length=5, max_length=255)
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"


class UserResponse(BaseModel):
    """Public user representation (no password)."""
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
