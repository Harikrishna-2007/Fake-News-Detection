"""
main.py
=======
FastAPI application entry point. Run with:

    uvicorn backend.main:app --reload --port 8000

Responsibilities at startup:
  1. Initialize the SQLite database (create tables if missing).
  2. Seed a default admin user (from .env ADMIN_EMAIL/ADMIN_PASSWORD)
     if one doesn't already exist.
  3. Load the trained ML model + vectorizer into memory.

All business routes are registered as routers from backend/routes/.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from backend.config import settings
from backend.database.database import init_db, SessionLocal
from backend.database import crud
from backend.models.orm_models import UserRole
from backend.services.prediction_service import prediction_service

from backend.routes import auth_routes, prediction_routes, history_routes, report_routes, admin_routes

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="REST API for detecting REAL vs FAKE news articles using NLP + ML.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Returns a flatter, frontend-friendlier validation error shape than
    FastAPI's default nested structure, so the React form layer can
    display field-level errors without complex parsing.
    """
    errors = [
        {"field": ".".join(str(p) for p in err["loc"][1:]), "message": err["msg"]}
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


def _seed_admin_user() -> None:
    """Create the default admin account on first run if it doesn't already exist."""
    db = SessionLocal()
    try:
        existing = crud.get_user_by_email(db, settings.ADMIN_EMAIL)
        if existing is None:
            crud.create_user(
                db,
                email=settings.ADMIN_EMAIL,
                password=settings.ADMIN_PASSWORD,
                full_name="System Administrator",
                role=UserRole.ADMIN,
            )
            logger.info("Seeded default admin user: %s", settings.ADMIN_EMAIL)
        else:
            logger.info("Admin user already exists: %s", settings.ADMIN_EMAIL)
    finally:
        db.close()


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Starting %s ...", settings.APP_NAME)

    logger.info("Initializing database ...")
    init_db()

    logger.info("Seeding admin account if needed ...")
    _seed_admin_user()

    logger.info("Loading ML model ...")
    prediction_service.load()
    if not prediction_service.is_loaded:
        logger.warning(
            "API started WITHOUT a loaded model. /api/predict will return 503 "
            "until you run `python ml/training/train.py`."
        )

    logger.info("Startup complete.")


@app.get("/", tags=["Health"])
def root():
    """Basic liveness check + quick links."""
    return {
        "service": settings.APP_NAME,
        "status": "ok",
        "docs": "/docs",
        "model_loaded": prediction_service.is_loaded,
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """
    Health check endpoint for monitoring/load balancers/Docker
    healthchecks. Reports whether the ML model is loaded, since a
    "healthy" API that can't serve predictions is only half-healthy.
    """
    return {
        "status": "healthy",
        "model_loaded": prediction_service.is_loaded,
        "model_name": prediction_service.model_name if prediction_service.is_loaded else None,
    }


# ---- Route registration ----
app.include_router(auth_routes.router)
app.include_router(prediction_routes.router)
app.include_router(history_routes.router)
app.include_router(report_routes.router)
app.include_router(admin_routes.router)
