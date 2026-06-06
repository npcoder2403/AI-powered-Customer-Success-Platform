from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class AIInsightResponse(BaseModel):
    id: int
    summary: str
    sentiment: str
    action_items: List[str]
    risks: List[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class InteractionCreate(BaseModel):
    customer_id: int
    title: str
    interaction_type: str
    meeting_notes: Optional[str] = None
    meeting_date: datetime


class InteractionUpdate(BaseModel):
    title: Optional[str] = None
    interaction_type: Optional[str] = None
    meeting_notes: Optional[str] = None
    meeting_date: Optional[datetime] = None


class InteractionResponse(BaseModel):
    id: int
    customer_id: int
    title: str
    interaction_type: str
    meeting_notes: Optional[str] = None
    meeting_date: datetime
    created_at: datetime
    ai_insight: Optional[AIInsightResponse] = None
    customer_name: Optional[str] = None

    model_config = {"from_attributes": True}


class InteractionListResponse(BaseModel):
    items: List[InteractionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
