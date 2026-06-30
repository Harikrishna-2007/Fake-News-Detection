"""
model_comparison.py
====================
Trains multiple classifiers on the same TF-IDF feature matrix and
compares them on held-out test data using standard classification
metrics. Returns a structured comparison so train.py can select and
persist the best-performing model.
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field

from sklearn.linear_model import LogisticRegression
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)


@dataclass
class ModelResult:
    """Holds a trained model plus its evaluation metrics for one algorithm."""

    name: str
    model: object
    accuracy: float
    precision: float
    recall: float
    f1: float
    confusion_matrix: list = field(default_factory=list)
    classification_report: str = ""
    train_time_seconds: float = 0.0


def get_candidate_models(random_state: int = 42) -> dict:
    """
    Defines the three candidate algorithms required by the project spec,
    with hyperparameters chosen for sparse, high-dimensional TF-IDF input:

      - Logistic Regression: strong linear baseline for text
        classification; max_iter raised since TF-IDF features can need
        more iterations to converge than dense numeric data.
      - Multinomial Naive Bayes: classic, fast text-classification
        baseline; assumes feature independence, which is a reasonable
        approximation for bag-of-words/TF-IDF representations.
      - Random Forest: non-linear ensemble baseline to check whether
        tree-based splits capture interactions the linear models miss;
        capped depth and n_estimators to keep training/inference time
        and memory reasonable on a (potentially) wide TF-IDF matrix.
    """
    return {
        "Logistic Regression": LogisticRegression(
            max_iter=1000,
            C=1.0,
            random_state=random_state,
            class_weight="balanced",
        ),
        "Multinomial Naive Bayes": MultinomialNB(alpha=0.5),
        "Random Forest": RandomForestClassifier(
            n_estimators=200,
            max_depth=50,
            min_samples_split=4,
            random_state=random_state,
            class_weight="balanced",
            n_jobs=-1,
        ),
    }


def evaluate_model(model, X_test, y_test, positive_label: str = "FAKE") -> dict:
    """
    Compute the full required metric set for one trained model.

    Args:
        model: a fitted sklearn classifier.
        X_test: TF-IDF test feature matrix.
        y_test: true labels for the test set.
        positive_label: which class to treat as "positive" for
            precision/recall/F1 (FAKE is the operationally interesting
            class — a false negative here means fake news slips through).

    Returns:
        Dict with accuracy, precision, recall, f1, confusion_matrix
        (as nested list), and a full sklearn classification_report string.
    """
    y_pred = model.predict(X_test)

    return {
        "accuracy": accuracy_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred, pos_label=positive_label, zero_division=0),
        "recall": recall_score(y_test, y_pred, pos_label=positive_label, zero_division=0),
        "f1": f1_score(y_test, y_pred, pos_label=positive_label, zero_division=0),
        "confusion_matrix": confusion_matrix(y_test, y_pred, labels=["REAL", "FAKE"]).tolist(),
        "classification_report": classification_report(y_test, y_pred, zero_division=0),
    }


def train_and_compare(X_train, y_train, X_test, y_test, random_state: int = 42) -> list[ModelResult]:
    """
    Train every candidate model and evaluate each on the same test set.

    Returns:
        List of ModelResult, one per algorithm, in the order trained.
    """
    results: list[ModelResult] = []
    candidates = get_candidate_models(random_state=random_state)

    for name, model in candidates.items():
        start = time.time()
        model.fit(X_train, y_train)
        elapsed = time.time() - start

        metrics = evaluate_model(model, X_test, y_test)

        results.append(
            ModelResult(
                name=name,
                model=model,
                accuracy=metrics["accuracy"],
                precision=metrics["precision"],
                recall=metrics["recall"],
                f1=metrics["f1"],
                confusion_matrix=metrics["confusion_matrix"],
                classification_report=metrics["classification_report"],
                train_time_seconds=elapsed,
            )
        )

    return results


def select_best_model(results: list[ModelResult]) -> ModelResult:
    """
    Selects the best model by F1 score (more robust than raw accuracy on
    a binary classification task, since it balances precision and recall
    rather than being skewed by class imbalance).
    """
    return max(results, key=lambda r: r.f1)


def print_comparison_table(results: list[ModelResult]) -> None:
    """Pretty-prints a comparison table of all trained models to stdout."""
    header = f"{'Model':<28}{'Accuracy':>10}{'Precision':>12}{'Recall':>10}{'F1':>10}{'Train(s)':>10}"
    print(header)
    print("-" * len(header))
    for r in sorted(results, key=lambda r: r.f1, reverse=True):
        print(
            f"{r.name:<28}{r.accuracy:>10.4f}{r.precision:>12.4f}"
            f"{r.recall:>10.4f}{r.f1:>10.4f}{r.train_time_seconds:>10.2f}"
        )
