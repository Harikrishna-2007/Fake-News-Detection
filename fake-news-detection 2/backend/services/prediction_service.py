"""
prediction_service.py
======================
Loads the trained model + TF-IDF vectorizer once at application
startup and exposes a simple predict() function used by the
/api/predict route. This is the bridge between the ml/ training
pipeline and the live backend/ API — it reuses the exact same
TextPreprocessor pipeline from ml/preprocessing so that train/serve
preprocessing never drifts apart.
"""

from __future__ import annotations

import json
import logging
import threading

import joblib

from backend.config import settings
from ml.preprocessing.feature_extractor import TextPreprocessor

logger = logging.getLogger(__name__)


class ModelNotLoadedError(RuntimeError):
    """Raised when a prediction is requested before the model has been loaded."""


class PredictionService:
    """
    Thread-safe singleton-style wrapper around the trained model and
    vectorizer. FastAPI's startup event calls load() once; every
    request thereafter calls predict() against the already-loaded
    in-memory objects (no disk I/O per request).
    """

    def __init__(self):
        self._model = None
        self._vectorizer = None
        self._metadata: dict = {}
        self._preprocessor = TextPreprocessor()
        self._lock = threading.Lock()
        self._loaded = False

    def load(self) -> None:
        """Load the model, vectorizer, and metadata from disk. Call once at startup."""
        with self._lock:
            try:
                self._model = joblib.load(settings.ACTIVE_MODEL_PATH)
                self._vectorizer = joblib.load(settings.VECTORIZER_PATH)
                with open(settings.METADATA_PATH, "r", encoding="utf-8") as f:
                    self._metadata = json.load(f)
                self._loaded = True
                logger.info(
                    "Loaded model '%s' (trained_at=%s)",
                    self._metadata.get("best_model_name", "unknown"),
                    self._metadata.get("trained_at", "unknown"),
                )
            except FileNotFoundError as exc:
                self._loaded = False
                logger.error(
                    "Model artifacts not found at %s / %s. Run "
                    "`python ml/training/train.py` to train and save a model. (%s)",
                    settings.ACTIVE_MODEL_PATH,
                    settings.VECTORIZER_PATH,
                    exc,
                )

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    @property
    def model_name(self) -> str:
        return self._metadata.get("best_model_name", "unknown")

    @property
    def metadata(self) -> dict:
        return self._metadata

    def predict(self, text: str) -> dict:
        """
        Run inference on a single raw article text.

        Args:
            text: raw, unprocessed article text from the user.

        Returns:
            {
              "predicted_label": "REAL" | "FAKE",
              "confidence_score": float (probability of the predicted label),
              "real_probability": float,
              "fake_probability": float,
              "model_used": str,
            }

        Raises:
            ModelNotLoadedError: if load() hasn't successfully run yet.
        """
        if not self._loaded:
            raise ModelNotLoadedError(
                "Prediction model is not loaded. Ensure ml/training/train.py "
                "has been run and the API has completed its startup sequence."
            )

        preprocessed = self._preprocessor.preprocess(text)
        features = self._vectorizer.transform([preprocessed])

        predicted_label = self._model.predict(features)[0]

        # Not every sklearn classifier guarantees predict_proba (e.g. some
        # SVM configurations don't), so we defend against its absence even
        # though all three of our candidate models support it.
        if hasattr(self._model, "predict_proba"):
            proba = self._model.predict_proba(features)[0]
            class_probs = dict(zip(self._model.classes_, proba))
        else:
            # Fall back to a confident-but-unweighted probability split.
            class_probs = {predicted_label: 1.0}

        real_prob = float(class_probs.get("REAL", 0.0))
        fake_prob = float(class_probs.get("FAKE", 0.0))
        confidence = max(real_prob, fake_prob)

        return {
            "predicted_label": predicted_label,
            "confidence_score": confidence,
            "real_probability": real_prob,
            "fake_probability": fake_prob,
            "model_used": self.model_name,
        }


# Module-level singleton, imported by main.py (startup) and routes/predict.py (inference).
prediction_service = PredictionService()
