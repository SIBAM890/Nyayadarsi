"""CollusionReport ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from backend.core.database import Base


class CollusionReport(Base):
    """5-flag collusion risk analysis report."""

    __tablename__ = "collusion_report"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    tender_id: str = Column(String, nullable=False, index=True)
    flags_json: str = Column(Text, nullable=False)
    generated_at: datetime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    reviewed_by: str | None = Column(String, nullable=True)
    reviewed_at: datetime | None = Column(DateTime(timezone=True), nullable=True)

    def __repr__(self) -> str:
        return f"<CollusionReport tender={self.tender_id}>"
