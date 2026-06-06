from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserRegister, UserLogin
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
        role="admin",
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


def seed_admin(db: Session) -> None:
    existing = db.query(User).filter(User.email == "admin@csplatform.com").first()
    if existing:
        return

    admin = User(
        email="admin@csplatform.com",
        full_name="Admin",
        hashed_password=hash_password("admin123"),
        role="admin",
    )
    db.add(admin)
    db.commit()
    print("[SEED] Admin user created: admin@csplatform.com / admin123")
