"""
admin_routes.py
================
GET   /api/admin/users               - list all users with prediction counts
PATCH /api/admin/users/{user_id}     - activate/deactivate a user or change role
GET   /api/admin/users/{user_id}/history - view a specific user's prediction history
GET   /api/admin/analytics           - platform-wide analytics (all users combined)

All routes require the ADMIN role (enforced via require_admin dependency).
"""

import math
import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database.database import get_db
from backend.database import crud
from backend.auth.dependencies import require_admin
from backend.models.orm_models import User, PredictionLabel
from backend.models.schemas import (
    AdminUserListItem,
    AdminUserUpdate,
    PaginatedHistoryResponse,
    AnalyticsResponse,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=list[AdminUserListItem])
def list_all_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """List every registered user along with how many predictions each has made."""
    users = crud.list_users(db, skip=0, limit=1000)
    counts = crud.get_prediction_count_per_user(db)

    return [
        AdminUserListItem(
            id=u.id,
            email=u.email,
            full_name=u.full_name,
            role=u.role,
            is_active=u.is_active,
            created_at=u.created_at,
            prediction_count=counts.get(u.id, 0),
        )
        for u in users
    ]


@router.patch("/users/{user_id}", response_model=AdminUserListItem)
def update_user_admin(
    user_id: int,
    payload: AdminUserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    """Activate/deactivate a user account, or change their role."""
    if user_id == admin.id and payload.is_active is False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot deactivate your own admin account.",
        )

    user = crud.get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    updated = crud.update_user(db, user, is_active=payload.is_active, role=payload.role)
    counts = crud.get_prediction_count_per_user(db)

    return AdminUserListItem(
        id=updated.id,
        email=updated.email,
        full_name=updated.full_name,
        role=updated.role,
        is_active=updated.is_active,
        created_at=updated.created_at,
        prediction_count=counts.get(updated.id, 0),
    )


@router.get("/users/{user_id}/history", response_model=PaginatedHistoryResponse)
def get_user_history_admin(
    user_id: int,
    search: Optional[str] = Query(default=None),
    label: Optional[PredictionLabel] = Query(default=None),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """View any user's prediction history (admin-only)."""
    target_user = crud.get_user_by_id(db, user_id)
    if target_user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    rows, total = crud.get_prediction_history(
        db, user_id=user_id, search=search, label_filter=label, page=page, page_size=page_size
    )
    total_pages = math.ceil(total / page_size) if total else 1

    return PaginatedHistoryResponse(
        items=rows, total=total, page=page, page_size=page_size, total_pages=total_pages
    )


@router.get("/analytics", response_model=AnalyticsResponse)
def get_platform_analytics(
    db: Session = Depends(get_db),
    _admin: User = Depends(require_admin),
):
    """Platform-wide analytics aggregated across every user (admin dashboard)."""
    summary = crud.get_analytics_summary(db, user_id=None)

    model_metrics = None
    try:
        with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
            model_metrics = json.load(f).get("best_model_metrics")
    except (FileNotFoundError, json.JSONDecodeError):
        model_metrics = None

    return AnalyticsResponse(**summary, model_metrics=model_metrics)
