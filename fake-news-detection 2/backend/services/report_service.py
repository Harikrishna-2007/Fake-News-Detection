"""
report_service.py
==================
Generates downloadable PDF reports of a user's prediction history
using reportlab. Kept as a service (not inline in the route) so the
PDF layout logic is unit-testable and reusable (e.g. an admin "export
all users" report could call the same builder with a different query).
"""

from __future__ import annotations

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Table,
    TableStyle,
    Paragraph,
    Spacer,
)

from backend.models.orm_models import PredictionHistory


def _truncate(text: str, max_len: int = 80) -> str:
    text = text.replace("\n", " ").strip()
    return text if len(text) <= max_len else text[: max_len - 3] + "..."


def build_history_pdf(
    records: list[PredictionHistory],
    user_email: str,
    summary: dict | None = None,
) -> bytes:
    """
    Build a PDF report of prediction history records.

    Args:
        records: list of PredictionHistory ORM objects to include.
        user_email: email of the user the report belongs to (shown in header).
        summary: optional analytics summary dict (from crud.get_analytics_summary)
            to render as a stats block above the table.

    Returns:
        Raw PDF bytes, ready to stream back as a FastAPI Response/StreamingResponse.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle", parent=styles["Title"], fontSize=18, spaceAfter=4
    )
    meta_style = ParagraphStyle(
        "Meta", parent=styles["Normal"], fontSize=9, textColor=colors.HexColor("#555555")
    )
    section_style = ParagraphStyle(
        "Section", parent=styles["Heading2"], fontSize=13, spaceAfter=8, spaceBefore=14
    )

    elements = []

    elements.append(Paragraph("Fake News Detection — Prediction History Report", title_style))
    elements.append(
        Paragraph(
            f"Account: {user_email} &nbsp;|&nbsp; Generated: "
            f"{datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
            meta_style,
        )
    )
    elements.append(Spacer(1, 12))

    if summary:
        elements.append(Paragraph("Summary", section_style))
        summary_data = [
            ["Total Analyzed", "Real", "Fake", "Avg. Confidence"],
            [
                str(summary.get("total_analyzed", 0)),
                str(summary.get("real_count", 0)),
                str(summary.get("fake_count", 0)),
                f"{summary.get('average_confidence', 0) * 100:.1f}%",
            ],
        ]
        summary_table = Table(summary_data, colWidths=[1.6 * inch] * 4)
        summary_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cccccc")),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white]),
                    ("TOPPADDING", (0, 0), (-1, -1), 6),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ]
            )
        )
        elements.append(summary_table)

    elements.append(Paragraph("Prediction Records", section_style))

    table_data = [["Date", "Title / Excerpt", "Prediction", "Confidence", "Model"]]
    for r in records:
        title_or_excerpt = r.article_title or _truncate(r.article_text)
        table_data.append(
            [
                r.created_at.strftime("%Y-%m-%d %H:%M"),
                _truncate(title_or_excerpt, 60),
                r.predicted_label.value if hasattr(r.predicted_label, "value") else str(r.predicted_label),
                f"{r.confidence_score * 100:.1f}%",
                r.model_used,
            ]
        )

    history_table = Table(
        table_data,
        colWidths=[1.1 * inch, 2.7 * inch, 0.8 * inch, 0.9 * inch, 1.3 * inch],
        repeatRows=1,
    )

    style_commands = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#dddddd")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]

    # Color-code the Prediction column per row for quick visual scanning.
    for row_idx, record in enumerate(records, start=1):
        label_value = record.predicted_label.value if hasattr(record.predicted_label, "value") else str(record.predicted_label)
        color = colors.HexColor("#dc2626") if label_value == "FAKE" else colors.HexColor("#16a34a")
        style_commands.append(("TEXTCOLOR", (2, row_idx), (2, row_idx), color))
        style_commands.append(("FONTNAME", (2, row_idx), (2, row_idx), "Helvetica-Bold"))

    history_table.setStyle(TableStyle(style_commands))
    elements.append(history_table)

    if not records:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph("No prediction records found for the selected filters.", styles["Normal"]))

    doc.build(elements)
    return buffer.getvalue()
