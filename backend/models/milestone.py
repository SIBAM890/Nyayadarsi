"""Milestone ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, String, Float, Text, Integer, DateTime
from backend.core.database import Base


class Milestone(Base):
    """Construction milestone with payment tracking."""

    __tablename__ = "milestone"

    id: str = Column(String, primary_key=True)
    contract_id: str = Column(String, nullable=False, index=True)
    title: str = Column(String, nullable=False)
    description: str | None = Column(Text, nullable=True)
    target_percent: float = Column(Float, nullable=False)
    current_percent: float = Column(Float, default=0.0)
    status: str = Column(String, default="pending")
    payment_amount: float | None = Column(Float, nullable=True)
    payment_status: str = Column(String, default="locked")
    payment_released_at: datetime | None = Column(DateTime(timezone=True), nullable=True)
    ai_verified: int = Column(Integer, default=0)
    officer_confirmed: int = Column(Integer, default=0)
    created_at: datetime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self) -> str:
        return f"<Milestone {self.id} {self.title}>"
