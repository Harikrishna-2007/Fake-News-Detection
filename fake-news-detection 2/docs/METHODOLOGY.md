# Methodology

## Fake News Detection System

This document describes the technical methodology used to build the classification pipeline and the surrounding application.

---

## 1. Data Preparation

The training pipeline expects a CSV file with two columns: `text` (the article body) and `label` (`REAL` or `FAKE`). For development and demonstration purposes, this project ships with a **synthetically generated** dataset (`ml/data/generate_sample_dataset.py`) that produces stylistically distinct REAL-style (institutional, attributed, measured language) and FAKE-style (sensational, conspiratorial, unverified language) articles. This is explicitly documented as a stand-in for a real, licensed corpus (e.g. the Kaggle ISOT Fake News Dataset) — see "Limitations" below.

Data loading (`ml/training/train.py::load_dataset`) performs:
- Validation that required columns exist.
- Dropping of null text/label rows.
- Label normalization (uppercase, whitespace-stripped) and filtering to only `REAL`/`FAKE`.
- A minimum-row-count sanity check before proceeding.

## 2. Train/Test Split

An 80/20 stratified split (`sklearn.model_selection.train_test_split` with `stratify=labels`) is used so that the REAL/FAKE class ratio is preserved in both the training and test sets, preventing an accidental class imbalance from skewing evaluation.

## 3. Text Preprocessing Pipeline

Implemented in `ml/preprocessing/`, applied identically at training and inference time via a shared `TextPreprocessor` class (`feature_extractor.py`) to prevent train/serve skew:

1. **Cleaning** (`text_cleaner.py`): lowercasing, Unicode normalization (accent stripping), HTML tag/entity removal, URL/email/mention/hashtag removal, punctuation removal, repeated-character collapsing, whitespace normalization.
2. **Tokenization** (`tokenizer.py`): word-level tokenization (NLTK's `word_tokenize`, with a regex-based fallback if NLTK data is unavailable), followed by stopword removal (NLTK's English stopword list plus a small set of news-domain-specific stopwords like "said," "according," "reuters") and short-token filtering.
3. **Lemmatization** (`lemmatizer.py`): POS-tag-aware lemmatization via WordNet (e.g. "running" → "run," "studies" → "study"), chosen over stemming to keep TF-IDF feature names human-interpretable for explainability.

## 4. Feature Extraction

TF-IDF vectorization (`feature_extractor.py::build_tfidf_vectorizer`) with:
- `max_features=10000` — caps vocabulary size to control model size and reduce overfitting on rare terms.
- `ngram_range=(1,2)` — unigrams plus bigrams, to capture phrase-level signal (e.g. "breaking news," "fact check") that unigrams alone would miss.
- `min_df=2` — drops terms appearing in only one document (likely noise).
- `max_df=0.9` — drops terms appearing in over 90% of documents (too common to be discriminative).
- `sublinear_tf=True` — applies log-scaling to term frequency, standard practice for text classification.

## 5. Model Training and Comparison

Three classical algorithms are trained on identical TF-IDF features (`ml/training/model_comparison.py`):

| Algorithm | Rationale |
|---|---|
| **Logistic Regression** | Strong, well-calibrated linear baseline for high-dimensional sparse text features; `class_weight="balanced"` guards against label imbalance. |
| **Multinomial Naive Bayes** | Classic, fast text-classification baseline; its feature-independence assumption is a reasonable approximation for bag-of-words/TF-IDF representations. |
| **Random Forest** | Non-linear ensemble baseline, included to test whether tree-based feature interactions outperform the linear models; depth and estimator count capped for tractable training/inference time on a wide TF-IDF matrix. |

Each model is evaluated on the same held-out test set using:
- **Accuracy** — overall correctness.
- **Precision** (positive class = FAKE) — of articles flagged as fake, how many actually were.
- **Recall** (positive class = FAKE) — of all actually-fake articles, how many were caught.
- **F1 Score** — harmonic mean of precision and recall; used as the primary model-selection criterion since it balances both concerns rather than being skewed by class imbalance the way raw accuracy can be.
- **Confusion Matrix** — full breakdown of true/false positives/negatives.

## 6. Model Selection and Persistence

`select_best_model()` chooses the model with the highest F1 score. `save_model.py` persists the chosen model, its fitted TF-IDF vectorizer, and a metadata JSON (model name, training timestamp, dataset path, sample counts, full metrics for all three candidates) to `ml/models/`. A guard function (`should_replace_existing_model`) compares the new model's F1 against any previously saved model's F1, preventing an accidental retrain on a worse/smaller dataset from silently degrading a deployed model.

## 7. Serving Architecture

The FastAPI backend's `PredictionService` (`backend/services/prediction_service.py`) loads the persisted model + vectorizer once at application startup (not per-request) and reuses the exact same `TextPreprocessor` pipeline from the `ml/` package for inference, guaranteeing that preprocessing never drifts between training and serving — a common source of silent accuracy degradation in deployed ML systems.

## 8. Evaluation Caveat

Because the bundled dataset is synthetically generated with two clearly distinct vocabulary registers, the pipeline will report very high (often near-100%) accuracy on it — this reflects the toy dataset's trivial separability, not real-world fake-news-detection difficulty. Genuine evaluation requires retraining on a real, labeled news corpus (see README "Retraining the Model").
