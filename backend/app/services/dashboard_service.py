from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.customer import Customer
from app.models.interaction import Interaction
from app.models.ai_insight import AIInsight


def get_dashboard_metrics(db: Session) -> dict:
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_interactions = db.query(func.count(Interaction.id)).scalar() or 0

    positive = db.query(func.count(AIInsight.id)).filter(AIInsight.sentiment == "Positive").scalar() or 0
    neutral = db.query(func.count(AIInsight.id)).filter(AIInsight.sentiment == "Neutral").scalar() or 0
    negative = db.query(func.count(AIInsight.id)).filter(AIInsight.sentiment == "Negative").scalar() or 0

    customer_growth_raw = (
        db.query(
            func.to_char(Customer.created_at, "YYYY-MM").label("month"),
            func.count(Customer.id).label("count"),
        )
        .group_by("month")
        .order_by("month")
        .limit(12)
        .all()
    )
    customer_growth = [{"month": row.month, "count": row.count} for row in customer_growth_raw]

    interactions_raw = (
        db.query(
            func.to_char(Interaction.meeting_date, "YYYY-MM").label("month"),
            func.count(Interaction.id).label("count"),
        )
        .group_by("month")
        .order_by("month")
        .limit(12)
        .all()
    )
    interactions_per_month = [{"month": row.month, "count": row.count} for row in interactions_raw]

    sentiment_distribution = [
        {"sentiment": "Positive", "count": positive},
        {"sentiment": "Neutral", "count": neutral},
        {"sentiment": "Negative", "count": negative},
    ]

    return {
        "total_customers": total_customers,
        "total_interactions": total_interactions,
        "positive_sentiments": positive,
        "neutral_sentiments": neutral,
        "negative_sentiments": negative,
        "customer_growth": customer_growth,
        "interactions_per_month": interactions_per_month,
        "sentiment_distribution": sentiment_distribution,
    }
