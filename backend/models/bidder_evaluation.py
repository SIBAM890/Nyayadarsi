"""BidderEvaluation ORM model."""
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from backend.core.database import Base


class BidderEvaluation(Base):
    """Bidder evaluation results with GREEN/YELLOW/RED verdicts."""

    __tablename__ = "bidder_evaluation"

    id: int = Column(Integer, primary_key=True, autoincrement=True)
    tender_id: str = Column(String, nullable=False, index=True)
    bidder_id: str = Column(String, nullable=False)
    company_name: str = Column(String, nullable=False)
    overall_verdict: str = Column(String, nullable=False)
    verdicts_json: str = Column(Text, nullable=False)
    evaluated_at: datetime = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self) -> str:
        return f"<BidderEvaluation {self.bidder_id} verdict={self.overall_verdict}>"
