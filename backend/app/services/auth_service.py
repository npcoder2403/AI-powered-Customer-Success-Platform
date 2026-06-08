from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.customer import Customer
from app.schemas.user import UserRegister, UserLogin, SetPassword
from app.auth.password import hash_password, verify_password
from app.auth.jwt import create_access_token


def register_user(db: Session, data: UserRegister) -> dict:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


def login_user(db: Session, data: UserLogin) -> dict:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


def check_email(db: Session, email: str) -> dict:
    """Check if email exists as a user or customer."""
    user = db.query(User).filter(User.email == email).first()
    if user:
        return {"status": "has_password", "full_name": user.full_name}

    customer = db.query(Customer).filter(Customer.email == email).first()
    if customer:
        return {"status": "needs_password", "full_name": customer.contact_name}

    return {"status": "not_found"}


def set_password(db: Session, data: SetPassword) -> dict:
    """Create a user account for an existing customer who doesn't have one yet."""
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User account already exists. Please login.")

    customer = db.query(Customer).filter(Customer.email == data.email).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")

    user = User(
        email=data.email,
        full_name=customer.contact_name,
        hashed_password=hash_password(data.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user}


def seed_admin(db: Session) -> None:
    existing = db.query(User).filter(User.email == "admin@csplatform.com").first()
    if existing:
        return

    admin = User(
        email="admin@csplatform.com",
        full_name="Admin",
        hashed_password=hash_password("admin123"),
        role="superadmin",
    )
    db.add(admin)
    db.commit()
    print("[SEED] Admin user created: admin@csplatform.com / admin123")
