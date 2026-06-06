from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.session import engine, Base, SessionLocal
from app.database.config import settings
from app.api import auth, customers, interactions, dashboard, users
from app.services.auth_service import seed_admin

Base.metadata.create_all(bind=engine)

db = SessionLocal()
seed_admin(db)
db.close()

app = FastAPI(title="Customer Success Platform API", version="1.0.0")

allowed_origins = [
    "http://localhost:3000",
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(interactions.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(users.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}
