import math
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.models.customer import Customer
from app.models.user import User
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.cache.redis_cache import invalidate_customer_cache


def _is_admin(user: User) -> bool:
    return user.role.value == "admin"


def get_customers(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
    industry: str | None = None,
    customer_status: str | None = None,
    current_user: User | None = None,
) -> dict:
    query = db.query(Customer)

    if current_user:
        query = query.filter(Customer.created_by == current_user.id)

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


def get_customer(db: Session, customer_id: int, current_user: User | None = None) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    if current_user and customer.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return customer


def create_customer(db: Session, data: CustomerCreate, current_user: User | None = None) -> Customer:
    customer = Customer(**data.model_dump())
    if current_user:
        customer.created_by = current_user.id
    db.add(customer)
    db.commit()
    db.refresh(customer)
    invalidate_customer_cache()
    return customer


def update_customer(db: Session, customer_id: int, data: CustomerUpdate, current_user: User | None = None) -> Customer:
    customer = get_customer(db, customer_id, current_user)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(customer, key, value)
    db.commit()
    db.refresh(customer)
    invalidate_customer_cache()
    return customer


def delete_customer(db: Session, customer_id: int, current_user: User | None = None) -> None:
    customer = get_customer(db, customer_id, current_user)
    db.delete(customer)
    db.commit()
    invalidate_customer_cache()
