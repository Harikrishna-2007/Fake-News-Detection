"""
history_routes.py
==================
GET /api/history    - paginated, searchable, filterable prediction history
GET /api/analytics  - aggregate stats + time series + model metrics for dashboards
"""

import json
import math
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database import crud
from backend.auth.dependencies import get_current_user
from backend.config import settings
from backend.models.orm_models import User, PredictionLabel
from backend.models.schemas import PaginatedHistoryResponse, AnalyticsResponse

router = APIRouter(prefix="/api", tags=["History & Analytics"])


@router.get("/history", response_model=PaginatedHistoryResponse)
def get_history(
    search: Optional[str] = Query(default=None, description="Search article title/text"),
    label: Optional[PredictionLabel] = Query(default=None, description="Filter by REAL or FAKE"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the current user's own prediction history (admins see only
    their own history here too — see /api/admin/users/{id}/history for
    viewing another user's records).
    """
    rows, total = crud.get_prediction_history(
        db,
        user_id=current_user.id,
        search=search,
        label_filter=label,
        page=page,
        page_size=page_size,
    )

    total_pages = math.ceil(total / page_size) if total else 1

    return PaginatedHistoryResponse(
        items=rows,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/analytics", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns aggregate analytics for the current user's predictions:
    totals, REAL/FAKE breakdown, average confidence, a 30-day time
    series for charting, and the active model's offline evaluation
    metrics (accuracy/precision/recall/f1 from training time).
    """
    summary = crud.get_analytics_summary(db, user_id=current_user.id)

    model_metrics = None
    try:
        with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
            metadata = json.load(f)
            model_metrics = metadata.get("best_model_metrics")
    except (FileNotFoundError, json.JSONDecodeError):
        model_metrics = None

    return AnalyticsResponse(**summary, model_metrics=model_metrics)
