"""User ORM model for authentication."""
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, Boolean, DateTime
from backend.core.database import Base


class User(Base):
    """Registered user — gov officer, evaluation officer, or builder."""

    __tablename__ = "user"

    id: str = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email: str = Column(String, unique=True, nullable=False, index=True)
    hashed_password: str = Column(String, nullable=False)
    full_name: str = Column(String, nullable=False)
    role: str = Column(String, nullable=False, default="gov_officer")  # gov_officer | evaluation_officer | builder
    is_active: bool = Column(Boolean, default=True)
    created_at: datetime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def __repr__(self) -> str:
        return f"<User {self.email} ({self.role})>"
