from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse, CustomerListResponse
from app.services.customer_service import get_customers, get_customer, create_customer, update_customer, delete_customer
from app.auth.jwt import get_current_user, require_admin
from app.models.user import User
from app.cache.redis_cache import get_cached_customers, set_cached_customers, build_customer_cache_key

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=CustomerListResponse)
def list_customers(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    industry: str | None = Query(None),
    status: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cache_key = build_customer_cache_key(page, page_size, search, industry, status, current_user.id)
    cached = get_cached_customers(cache_key)
    if cached:
        return cached

    result = get_customers(db, page, page_size, search, industry, status, current_user)
    set_cached_customers(cache_key, result)
    return result


@router.get("/{customer_id}", response_model=CustomerResponse)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_customer(db, customer_id, current_user)


@router.post("", response_model=CustomerResponse, status_code=201)
def create(
    data: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_customer(db, data, current_user)


@router.put("/{customer_id}", response_model=CustomerResponse)
def update(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return update_customer(db, customer_id, data, current_user)


@router.delete("/{customer_id}", status_code=204)
def delete(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_customer(db, customer_id, current_user)
