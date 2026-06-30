"""
orm_models.py
=============
SQLAlchemy ORM model definitions: User and PredictionHistory. These map
directly to the SQLite tables created by database.init_db().
"""

import enum
from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
    Text,
)
from sqlalchemy.orm import relationship

from backend.database.database import Base


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"


class PredictionLabel(str, enum.Enum):
    REAL = "REAL"
    FAKE = "FAKE"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=_utcnow, nullable=False)

    predictions = relationship(
        "PredictionHistory", back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r} role={self.role}>"


class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Article text is stored truncated for display/audit purposes; full
    # text storage is capped to keep the SQLite file size reasonable
    # for a demo/portfolio project rather than a production data lake.
    article_text = Column(Text, nullable=False)
    article_title = Column(String(500), nullable=True)

    predicted_label = Column(SQLEnum(PredictionLabel), nullable=False)
    confidence_score = Column(Float, nullable=False)  # 0.0 - 1.0
    model_used = Column(String(100), nullable=False)

    created_at = Column(DateTime, default=_utcnow, nullable=False, index=True)

    user = relationship("User", back_populates="predictions")

    def __repr__(self) -> str:
        return (
            f"<PredictionHistory id={self.id} user_id={self.user_id} "
            f"label={self.predicted_label} confidence={self.confidence_score:.2f}>"
        )
