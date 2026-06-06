import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:postgres@db:5432/customer_success"
    REDIS_URL: str = "redis://redis:6379/0"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    AI_API_KEY: str = ""
    AI_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    AI_MODEL: str = "llama-3.3-70b-versatile"
    CACHE_TTL: int = 300
    FRONTEND_URL: str = "http://localhost:3000"
    ENVIRONMENT: str = os.getenv("RENDER", "development")

    class Config:
        env_file = ".env"


settings = Settings()
