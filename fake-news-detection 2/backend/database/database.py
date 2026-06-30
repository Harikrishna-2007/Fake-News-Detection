"""
database.py
===========
SQLAlchemy engine/session setup for SQLite. Provides the declarative
Base that all ORM models inherit from, plus a get_db() dependency for
FastAPI routes to obtain a request-scoped session.
"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from backend.config import settings

# Ensure the directory for the SQLite file exists before SQLAlchemy
# tries to open it (SQLite will not create missing parent directories).
db_path = settings.DATABASE_URL.replace("sqlite:///", "")
if db_path and db_path != ":memory:":
    db_dir = os.path.dirname(db_path) or "."
    os.makedirs(db_dir, exist_ok=True)

# check_same_thread=False is required for SQLite + FastAPI, since
# FastAPI may handle a single request's dependencies across different
# threads in a sync context; SQLAlchemy's session usage here remains
# one-session-per-request so this is safe.
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a database session and guarantees it
    is closed after the request completes, even if an exception is
    raised mid-request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables defined on Base's registry. Called once at app startup."""
    # Import models here (not at module top) to avoid circular imports:
    # backend.models.orm_models imports Base from this module, so
    # importing it at the top of database.py would create a circular import.
    from backend.models import orm_models  # noqa: F401

    Base.metadata.create_all(bind=engine)
