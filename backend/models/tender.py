"""Tender ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, String, Text, Float, DateTime
from backend.core.database import Base


class Tender(Base):
    """Government procurement tender."""

    __tablename__ = "tender"

    id: str = Column(String, primary_key=True)
    title: str = Column(String, nullable=False)
    description: str | None = Column(Text, nullable=True)
    department: str | None = Column(String, nullable=True)
    category: str | None = Column(String, nullable=True)
    estimated_value: float | None = Column(Float, nullable=True)
    criteria_json: str | None = Column(Text, nullable=True)
    alerts_json: str | None = Column(Text, nullable=True)
    doc_hash: str | None = Column(String, nullable=True)
    status: str = Column(String, default="draft")
    created_at: datetime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    published_at: datetime | None = Column(DateTime(timezone=True), nullable=True)
    created_by: str | None = Column(String, nullable=True)

    def __repr__(self) -> str:
        return f"<Tender {self.id}: {self.title}>"
