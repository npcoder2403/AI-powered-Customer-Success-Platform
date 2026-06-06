import math
from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status

from app.models.interaction import Interaction
from app.models.customer import Customer
from app.models.user import User
from app.schemas.interaction import InteractionCreate, InteractionUpdate
from app.services.ai_service import generate_ai_insights


def _is_admin(user: User) -> bool:
    return user.role.value == "admin"


def _to_dict(item: Interaction) -> dict:
    return {
        "id": item.id,
        "customer_id": item.customer_id,
        "title": item.title,
        "interaction_type": item.interaction_type.value if hasattr(item.interaction_type, "value") else item.interaction_type,
        "meeting_notes": item.meeting_notes,
        "meeting_date": item.meeting_date,
        "created_at": item.created_at,
        "ai_insight": item.ai_insight,
        "customer_name": item.customer.company_name if item.customer else None,
    }


def get_interactions(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    customer_id: int | None = None,
    interaction_type: str | None = None,
    date_from: str | None = None,
    date_to: str | None = None,
    current_user: User | None = None,
) -> dict:
    query = db.query(Interaction).options(joinedload(Interaction.ai_insight), joinedload(Interaction.customer))

    if current_user and not _is_admin(current_user):
        query = query.filter(Interaction.created_by == current_user.id)

    if customer_id:
        query = query.filter(Interaction.customer_id == customer_id)
    if interaction_type:
        query = query.filter(Interaction.interaction_type == interaction_type)
    if date_from:
        query = query.filter(Interaction.meeting_date >= date_from)
    if date_to:
        query = query.filter(Interaction.meeting_date <= date_to)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = query.order_by(Interaction.meeting_date.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [_to_dict(item) for item in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_interaction(db: Session, interaction_id: int, current_user: User | None = None) -> dict:
    interaction = (
        db.query(Interaction)
        .options(joinedload(Interaction.ai_insight), joinedload(Interaction.customer))
        .filter(Interaction.id == interaction_id)
        .first()
    )
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interaction not found")

    if current_user and not _is_admin(current_user) and interaction.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return _to_dict(interaction)


def create_interaction(db: Session, data: InteractionCreate, current_user: User | None = None) -> dict:
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    interaction = Interaction(**data.model_dump())
    if current_user:
        interaction.created_by = current_user.id

    db.add(interaction)
    db.commit()
    db.refresh(interaction)

    if data.meeting_notes:
        generate_ai_insights(db, interaction.id, data.meeting_notes)
        db.refresh(interaction)

    return get_interaction(db, interaction.id)


def update_interaction(db: Session, interaction_id: int, data: InteractionUpdate, current_user: User | None = None) -> dict:
    interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()
    if not interaction:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interaction not found")

    if current_user and not _is_admin(current_user) and interaction.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(interaction, key, value)
    db.commit()
    db.refresh(interaction)

    if "meeting_notes" in update_data and update_data["meeting_notes"]:
        generate_ai_insights(db, interaction.id, update_data["meeting_notes"])

    return get_interaction(db, interaction_id)
