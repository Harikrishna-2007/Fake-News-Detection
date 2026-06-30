"""
schemas.py
==========
Pydantic models defining the shape of API request bodies and response
payloads. Kept separate from the SQLAlchemy ORM models (orm_models.py)
so the database schema and the API contract can evolve independently —
e.g. we never want to accidentally expose hashed_password in a response
just because it happens to be a column on User.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, ConfigDict

from backend.models.orm_models import UserRole, PredictionLabel


# ---------- Auth ----------

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = Field(default=None, max_length=255)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime


# ---------- Prediction ----------

class PredictionRequest(BaseModel):
    text: str = Field(min_length=20, max_length=50000, description="Full article text to analyze")
    title: Optional[str] = Field(default=None, max_length=500)


class PredictionResponse(BaseModel):
    id: int
    predicted_label: PredictionLabel
    confidence_score: float = Field(ge=0.0, le=1.0)
    real_probability: float = Field(ge=0.0, le=1.0)
    fake_probability: float = Field(ge=0.0, le=1.0)
    model_used: str
    created_at: datetime


# ---------- History ----------

class PredictionHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    article_title: Optional[str] = None
    article_text: str
    predicted_label: PredictionLabel
    confidence_score: float
    model_used: str
    created_at: datetime


class PaginatedHistoryResponse(BaseModel):
    items: list[PredictionHistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ---------- Analytics ----------

class AnalyticsResponse(BaseModel):
    total_analyzed: int
    real_count: int
    fake_count: int
    real_percentage: float
    fake_percentage: float
    average_confidence: float
    predictions_over_time: list[dict]  # [{"date": "2026-06-20", "real": 3, "fake": 5}, ...]
    model_metrics: Optional[dict] = None  # accuracy/precision/recall/f1 of active model


# ---------- Admin ----------

class AdminUserListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime
    prediction_count: int = 0


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


# ---------- Generic ----------

class MessageResponse(BaseModel):
    message: str
