"""
crud.py
=======
Database CRUD (Create/Read/Update/Delete) functions. Keeping these
separate from route handlers means route functions stay thin (parse
request -> call CRUD -> shape response) and the data-access logic is
independently testable and reusable across routes.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.models.orm_models import User, UserRole, PredictionHistory, PredictionLabel
from backend.auth.security import hash_password


# ---------- User CRUD ----------

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(
    db: Session,
    email: str,
    password: str,
    full_name: Optional[str] = None,
    role: UserRole = UserRole.USER,
) -> User:
    user = User(
        email=email.lower(),
        full_name=full_name,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, skip: int = 0, limit: int = 100) -> list[User]:
    return db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()


def count_users(db: Session) -> int:
    return db.query(func.count(User.id)).scalar() or 0


def update_user(db: Session, user: User, is_active: Optional[bool] = None, role: Optional[UserRole] = None) -> User:
    if is_active is not None:
        user.is_active = is_active
    if role is not None:
        user.role = role
    db.commit()
    db.refresh(user)
    return user


# ---------- Prediction History CRUD ----------

def create_prediction(
    db: Session,
    user_id: int,
    article_text: str,
    article_title: Optional[str],
    predicted_label: PredictionLabel,
    confidence_score: float,
    model_used: str,
) -> PredictionHistory:
    record = PredictionHistory(
        user_id=user_id,
        article_text=article_text,
        article_title=article_title,
        predicted_label=predicted_label,
        confidence_score=confidence_score,
        model_used=model_used,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_prediction_history(
    db: Session,
    user_id: Optional[int] = None,
    search: Optional[str] = None,
    label_filter: Optional[PredictionLabel] = None,
    page: int = 1,
    page_size: int = 10,
) -> tuple[list[PredictionHistory], int]:
    """
    Fetch a paginated, optionally filtered slice of prediction history.

    Args:
        user_id: restrict results to one user (None = all users, for admin views).
        search: case-insensitive substring match against article_title/article_text.
        label_filter: restrict to REAL or FAKE predictions only.
        page: 1-indexed page number.
        page_size: rows per page.

    Returns:
        (rows for this page, total matching row count) — the total is
        needed by the API to compute total_pages for the frontend's
        pagination controls.
    """
    query = db.query(PredictionHistory)

    if user_id is not None:
        query = query.filter(PredictionHistory.user_id == user_id)

    if label_filter is not None:
        query = query.filter(PredictionHistory.predicted_label == label_filter)

    if search:
        like_pattern = f"%{search}%"
        query = query.filter(
            (PredictionHistory.article_title.ilike(like_pattern))
            | (PredictionHistory.article_text.ilike(like_pattern))
        )

    total = query.count()

    rows = (
        query.order_by(PredictionHistory.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return rows, total


def get_analytics_summary(db: Session, user_id: Optional[int] = None) -> dict:
    """
    Aggregate prediction counts/percentages/average confidence, plus a
    day-bucketed time series for charting, optionally scoped to one user.
    """
    query = db.query(PredictionHistory)
    if user_id is not None:
        query = query.filter(PredictionHistory.user_id == user_id)

    total = query.count()
    real_count = query.filter(PredictionHistory.predicted_label == PredictionLabel.REAL).count()
    fake_count = query.filter(PredictionHistory.predicted_label == PredictionLabel.FAKE).count()

    avg_confidence = db.query(func.avg(PredictionHistory.confidence_score))
    if user_id is not None:
        avg_confidence = avg_confidence.filter(PredictionHistory.user_id == user_id)
    avg_confidence_value = avg_confidence.scalar() or 0.0

    # Time series for the last 30 days, bucketed by date.
    since = datetime.now(timezone.utc) - timedelta(days=30)
    date_expr = func.date(PredictionHistory.created_at)
    time_series_query = db.query(
        date_expr.label("date"),
        PredictionHistory.predicted_label,
        func.count(PredictionHistory.id).label("count"),
    ).filter(PredictionHistory.created_at >= since)

    if user_id is not None:
        time_series_query = time_series_query.filter(PredictionHistory.user_id == user_id)

    time_series_rows = time_series_query.group_by(date_expr, PredictionHistory.predicted_label).all()

    series_by_date: dict[str, dict[str, int]] = {}
    for date_str, label, count in time_series_rows:
        bucket = series_by_date.setdefault(str(date_str), {"date": str(date_str), "real": 0, "fake": 0})
        if label == PredictionLabel.REAL:
            bucket["real"] = count
        else:
            bucket["fake"] = count

    predictions_over_time = sorted(series_by_date.values(), key=lambda r: r["date"])

    return {
        "total_analyzed": total,
        "real_count": real_count,
        "fake_count": fake_count,
        "real_percentage": round((real_count / total * 100), 2) if total else 0.0,
        "fake_percentage": round((fake_count / total * 100), 2) if total else 0.0,
        "average_confidence": round(float(avg_confidence_value), 4),
        "predictions_over_time": predictions_over_time,
    }


def get_prediction_count_per_user(db: Session) -> dict[int, int]:
    """Returns {user_id: prediction_count} for all users, used by the admin panel."""
    rows = (
        db.query(PredictionHistory.user_id, func.count(PredictionHistory.id))
        .group_by(PredictionHistory.user_id)
        .all()
    )
    return {user_id: count for user_id, count in rows}
