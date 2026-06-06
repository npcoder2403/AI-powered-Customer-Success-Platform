from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.database.config import settings
from app.schemas.user import UserRegister, UserLogin, UserResponse
from app.services.auth_service import register_user, login_user
from app.auth.jwt import get_current_user, COOKIE_NAME
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

is_production = settings.ENVIRONMENT != "development"


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=is_production,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )


@router.post("/register")
def register(data: UserRegister, response: Response, db: Session = Depends(get_db)):
    result = register_user(db, data)
    set_auth_cookie(response, result["access_token"])
    return {"user": UserResponse.model_validate(result["user"])}


@router.post("/login")
def login(data: UserLogin, response: Response, db: Session = Depends(get_db)):
    result = login_user(db, data)
    set_auth_cookie(response, result["access_token"])
    return {"user": UserResponse.model_validate(result["user"])}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"message": "Logged out"}


@router.get("/profile", response_model=UserResponse)
def profile(current_user: User = Depends(get_current_user)):
    return current_user
