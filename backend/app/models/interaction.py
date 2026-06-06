from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.database.session import Base


class InteractionType(str, enum.Enum):
    meeting = "meeting"
    call = "call"
    email = "email"
    demo = "demo"
    support = "support"


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    interaction_type = Column(SAEnum(InteractionType), nullable=False, index=True)
    meeting_notes = Column(Text)
    meeting_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="interactions")
    creator = relationship("User", foreign_keys=[created_by])
    ai_insight = relationship("AIInsight", back_populates="interaction", uselist=False, cascade="all, delete-orphan")
