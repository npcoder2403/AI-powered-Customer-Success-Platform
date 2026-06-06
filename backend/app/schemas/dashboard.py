from pydantic import BaseModel
from typing import List


class SentimentCount(BaseModel):
    sentiment: str
    count: int


class MonthlyCount(BaseModel):
    month: str
    count: int


class DashboardMetrics(BaseModel):
    total_customers: int
    total_interactions: int
    positive_sentiments: int
    neutral_sentiments: int
    negative_sentiments: int
    customer_growth: List[MonthlyCount]
    interactions_per_month: List[MonthlyCount]
    sentiment_distribution: List[SentimentCount]
