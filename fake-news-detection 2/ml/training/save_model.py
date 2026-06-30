"""
save_model.py
=============
Persists the selected best model, its fitted TF-IDF vectorizer, and a
metadata JSON file describing training results. The backend's
prediction service loads exactly these three artifacts at startup, so
this module is the single source of truth for the on-disk model format.
"""

from __future__ import annotations

import json
import os
from datetime import datetime, timezone

import joblib

from ml.training.model_comparison import ModelResult


def save_artifacts(
    best_result: ModelResult,
    vectorizer,
    all_results: list[ModelResult],
    model_dir: str,
    dataset_path: str,
    n_train: int,
    n_test: int,
) -> dict:
    """
    Save the best model, vectorizer, and metadata to model_dir.

    Args:
        best_result: the ModelResult chosen by select_best_model().
        vectorizer: the fitted TfidfVectorizer used to produce features.
        all_results: every ModelResult from training, for metadata/audit.
        model_dir: directory to write artifacts into (created if missing).
        dataset_path: path to the dataset used for training, recorded
            in metadata for reproducibility/audit purposes.
        n_train: number of training-set rows.
        n_test: number of test-set rows.

    Returns:
        The metadata dict that was written to disk.
    """
    os.makedirs(model_dir, exist_ok=True)

    model_path = os.path.join(model_dir, "best_model.joblib")
    vectorizer_path = os.path.join(model_dir, "tfidf_vectorizer.joblib")
    metadata_path = os.path.join(model_dir, "model_metadata.json")

    joblib.dump(best_result.model, model_path)
    joblib.dump(vectorizer, vectorizer_path)

    metadata = {
        "best_model_name": best_result.name,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "dataset_path": dataset_path,
        "n_train_samples": n_train,
        "n_test_samples": n_test,
        "best_model_metrics": {
            "accuracy": best_result.accuracy,
            "precision": best_result.precision,
            "recall": best_result.recall,
            "f1": best_result.f1,
            "confusion_matrix": best_result.confusion_matrix,
        },
        "all_models_compared": [
            {
                "name": r.name,
                "accuracy": r.accuracy,
                "precision": r.precision,
                "recall": r.recall,
                "f1": r.f1,
                "train_time_seconds": r.train_time_seconds,
            }
            for r in all_results
        ],
        "model_path": model_path,
        "vectorizer_path": vectorizer_path,
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    return metadata


def should_replace_existing_model(metadata_path: str, new_f1: float) -> bool:
    """
    Decide whether a newly trained model should overwrite the existing
    saved model, by comparing F1 scores. If no existing metadata is
    found (first-ever training run), always returns True.

    This guards against accidentally degrading a deployed model when
    retraining on a smaller or noisier dataset.
    """
    if not os.path.exists(metadata_path):
        return True

    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            existing = json.load(f)
        existing_f1 = existing.get("best_model_metrics", {}).get("f1", 0.0)
        return new_f1 >= existing_f1
    except (json.JSONDecodeError, KeyError, OSError):
        # Corrupt or unreadable metadata — safer to proceed with the new model.
        return True
