from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.interaction import InteractionCreate, InteractionUpdate, InteractionResponse, InteractionListResponse
from app.services.interaction_service import get_interactions, get_interaction, create_interaction, update_interaction
from app.auth.jwt import get_current_user
from app.models.user import User

router = APIRouter(prefix="/interactions", tags=["Interactions"])


@router.get("", response_model=InteractionListResponse)
def list_interactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    customer_id: int | None = Query(None),
    interaction_type: str | None = Query(None),
    date_from: str | None = Query(None),
    date_to: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_interactions(db, page, page_size, customer_id, interaction_type, date_from, date_to, current_user)


@router.get("/{interaction_id}", response_model=InteractionResponse)
def read_interaction(
    interaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_interaction(db, interaction_id, current_user)


@router.post("", response_model=InteractionResponse, status_code=201)
def create(
    data: InteractionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_interaction(db, data, current_user)


@router.put("/{interaction_id}", response_model=InteractionResponse)
def update(
    interaction_id: int,
    data: InteractionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_interaction(db, interaction_id, data, current_user)
