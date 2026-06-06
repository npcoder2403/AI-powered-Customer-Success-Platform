import math
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.cache.redis_cache import invalidate_customer_cache


def get_customers(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    industry: str | None = None,
    customer_status: str | None = None,
) -> dict:
    query = db.query(Customer)

    if search:
        query = query.filter(Customer.company_name.ilike(f"%{search}%"))
    if industry:
        query = query.filter(Customer.industry == industry)
    if customer_status:
        query = query.filter(Customer.status == customer_status)

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = query.order_by(Customer.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [CustomerResponse.model_validate(c).model_dump() for c in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
    }


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    return customer


def create_customer(db: Session, data: CustomerCreate) -> Customer:
    customer = Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    invalidate_customer_cache()
    return customer


def update_customer(db: Session, customer_id: int, data: CustomerUpdate) -> Customer:
    customer = get_customer(db, customer_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    invalidate_customer_cache()
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()
    invalidate_customer_cache()
