from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.models.customer import Customer
from app.models.interaction import Interaction
from app.models.ai_insight import AIInsight
from app.models.user import User


def _is_admin(user: User) -> bool:
    return user.role.value in ("admin", "superadmin")


def _get_org_admin_id(db: Session, user: User) -> int:
    """For customer users, find the admin who created their customer record."""
    if _is_admin(user):
        return user.id
    customer = db.query(Customer).filter(Customer.email == user.email).first()
    if customer and customer.created_by:
        return customer.created_by
    return user.id


def get_dashboard_metrics(db: Session, current_user: User | None = None) -> dict:
    customer_query = db.query(Customer)
    interaction_query = db.query(Interaction)
    insight_query = db.query(AIInsight)

    if current_user:
        owner_id = _get_org_admin_id(db, current_user)
        customer_query = customer_query.filter(Customer.created_by == owner_id)
        interaction_query = interaction_query.filter(Interaction.created_by == owner_id)
        insight_query = insight_query.join(Interaction, AIInsight.interaction_id == Interaction.id).filter(
            Interaction.created_by == owner_id
        )

    total_customers = customer_query.count()
    total_interactions = interaction_query.count()

    positive = insight_query.filter(AIInsight.sentiment == "Positive").count()
    neutral = insight_query.filter(AIInsight.sentiment == "Neutral").count()
    negative = insight_query.filter(AIInsight.sentiment == "Negative").count()

    customer_growth_query = customer_query.with_entities(
        func.to_char(Customer.created_at, "YYYY-MM").label("month"),
        func.count(Customer.id).label("count"),
    )
    customer_growth_raw = customer_growth_query.group_by("month").order_by("month").limit(12).all()
    customer_growth = [{"month": row.month, "count": row.count} for row in customer_growth_raw]

    interaction_growth_query = interaction_query.with_entities(
        func.to_char(Interaction.meeting_date, "YYYY-MM").label("month"),
        func.count(Interaction.id).label("count"),
    )
    interactions_raw = interaction_growth_query.group_by("month").order_by("month").limit(12).all()
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
