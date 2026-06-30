"""
prediction_routes.py
=====================
POST /api/predict        - run REAL/FAKE detection on submitted text
POST /api/predict/upload  - same, but text comes from an uploaded .txt file
GET  /api/auth/me         - return the current authenticated user's profile

Every successful prediction is persisted to prediction_history so it
shows up in the user's History and Analytics views.
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database import crud
from backend.auth.dependencies import get_current_user
from backend.models.orm_models import User, PredictionLabel
from backend.models.schemas import PredictionRequest, PredictionResponse, UserResponse
from backend.services.prediction_service import prediction_service, ModelNotLoadedError

router = APIRouter(prefix="/api", tags=["Prediction"])


@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return the profile of the currently authenticated user."""
    return current_user


def _run_prediction_and_store(
    db: Session, current_user: User, text: str, title: str | None
) -> PredictionResponse:
    """Shared logic between the plain-text and file-upload predict endpoints."""
    try:
        result = prediction_service.predict(text)
    except ModelNotLoadedError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    record = crud.create_prediction(
        db,
        user_id=current_user.id,
        article_text=text,
        article_title=title,
        predicted_label=PredictionLabel(result["predicted_label"]),
        confidence_score=result["confidence_score"],
        model_used=result["model_used"],
    )

    return PredictionResponse(
        id=record.id,
        predicted_label=record.predicted_label,
        confidence_score=result["confidence_score"],
        real_probability=result["real_probability"],
        fake_probability=result["fake_probability"],
        model_used=result["model_used"],
        created_at=record.created_at,
    )


@router.post("/predict", response_model=PredictionResponse)
def predict_news(
    payload: PredictionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Classify pasted article text as REAL or FAKE, with a confidence score."""
    return _run_prediction_and_store(db, current_user, payload.text, payload.title)


@router.post("/predict/upload", response_model=PredictionResponse)
async def predict_news_from_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Classify article text extracted from an uploaded .txt file."""
    filename = file.filename or ""
    if file.content_type not in ("text/plain", "application/octet-stream") and not filename.endswith(".txt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only plain .txt files are supported for upload.",
        )

    raw_bytes = await file.read()
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File could not be decoded as UTF-8 text.",
        )

    if len(text.strip()) < 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file does not contain enough text to analyze (minimum 20 characters).",
        )

    return _run_prediction_and_store(db, current_user, text, file.filename)
