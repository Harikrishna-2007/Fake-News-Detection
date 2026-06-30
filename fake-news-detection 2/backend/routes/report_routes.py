"""
report_routes.py
=================
GET /api/reports/history.pdf  - download current user's prediction history as a PDF
GET /api/reports/history.csv  - download current user's prediction history as CSV
"""

import csv
import io
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database import crud
from backend.auth.dependencies import get_current_user
from backend.models.orm_models import User
from backend.services.report_service import build_history_pdf

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/history.pdf")
def download_history_pdf(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and stream a PDF report of the current user's full prediction history."""
    # page_size set high enough to capture a full history in one report;
    # for very large histories this could be paginated into multiple
    # PDFs, but that's beyond this project's scope.
    rows, _total = crud.get_prediction_history(db, user_id=current_user.id, page=1, page_size=5000)
    summary = crud.get_analytics_summary(db, user_id=current_user.id)

    pdf_bytes = build_history_pdf(rows, user_email=current_user.email, summary=summary)

    filename = f"prediction_history_{datetime.now(timezone.utc).strftime('%Y%m%d')}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/history.csv")
def download_history_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate and stream a CSV export of the current user's full prediction history."""
    rows, _total = crud.get_prediction_history(db, user_id=current_user.id, page=1, page_size=5000)

    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(["Date", "Title", "Article Excerpt", "Prediction", "Confidence", "Model"])
    for r in rows:
        label_value = r.predicted_label.value if hasattr(r.predicted_label, "value") else str(r.predicted_label)
        writer.writerow(
            [
                r.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                r.article_title or "",
                r.article_text[:200].replace("\n", " "),
                label_value,
                f"{r.confidence_score * 100:.2f}%",
                r.model_used,
            ]
        )

    filename = f"prediction_history_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
