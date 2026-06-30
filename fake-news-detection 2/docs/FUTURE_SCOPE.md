# Future Scope

## Fake News Detection System

This document outlines reasonable next steps for extending this project beyond its current academic/portfolio scope, organized by area.

---

## 1. Data & Model Quality

- **Replace the synthetic dataset with a real, licensed corpus** (e.g. the Kaggle ISOT Fake News Dataset, LIAR dataset, or FakeNewsNet) — this is the single highest-impact next step, since the bundled synthetic dataset exists only to demonstrate the pipeline mechanics, not to produce a production-grade classifier.
- **Add deep learning models** (LSTM, BiLSTM, or transformer-based models like BERT/RoBERTa fine-tuned for sequence classification) as additional candidates in the model comparison step, to benchmark against the classical TF-IDF + linear/ensemble approach.
- **Source-level and metadata features**: incorporate publisher reputation, publication date recency, author history, and URL-domain trust signals alongside pure text features — real-world fake-news detection benefits significantly from these non-textual signals.
- **Multilingual support**: extend preprocessing (stopwords, lemmatization) and retrain on multilingual corpora to support non-English news.
- **Explainability**: surface top contributing TF-IDF features/words per prediction (e.g. via LIME or SHAP) so users can see *why* an article was flagged, not just the verdict.
- **Continuous evaluation**: track live prediction confidence distributions over time to detect model drift as news style/topics evolve.

## 2. Backend & Infrastructure

- **Migrate from SQLite to PostgreSQL** for real concurrent multi-user write loads; SQLite was chosen here for project simplicity and zero-config portability, not production scale.
- **Add Redis caching** for repeated identical-text predictions and for rate-limiting.
- **Async model inference queue** (e.g. Celery/RQ) if a heavier model (transformer-based) makes per-request inference latency too high for a synchronous endpoint.
- **Refresh tokens** in addition to the current short-lived JWT access tokens, with a proper revocation/rotation strategy.
- **Rate limiting** on `/api/predict` to prevent abuse.
- **Structured logging + observability** (e.g. OpenTelemetry traces, Prometheus metrics) for production monitoring.
- **CI/CD pipeline** (GitHub Actions) running `pytest` and the frontend build on every push.

## 3. Frontend & UX

- **Browser extension** that lets users right-click any selected text on any webpage and send it directly to the detector.
- **Bulk/batch upload**: classify multiple articles (CSV/folder of `.txt` files) in one submission with a results table.
- **Shareable verdict cards**: let users generate a shareable image/link of a verdict for social media, similar to a fact-check stamp.
- **Real-time URL submission**: accept a news article URL instead of just pasted text/file, with the backend fetching and extracting the article body server-side (would require a robust article-extraction library and careful handling of paywalls/robots.txt).
- **Internationalization (i18n)** of the UI itself.

## 4. Security & Trust

- **Email verification** on registration.
- **Audit logging** for admin actions (who deactivated which user, when).
- **Content moderation**: flag and review submissions that may contain harmful or illegal content beyond just "fake news" classification.
- **Per-user rate limits** and abuse detection (e.g. a single account submitting thousands of near-identical articles).

## 5. Product Direction

- **Browser-side pre-screening**: a lightweight client-side heuristic model (e.g. a small distilled model running via ONNX/TensorFlow.js) for instant feedback before the full server-side model confirms, reducing perceived latency.
- **Community feedback loop**: let users flag predictions they believe are wrong, feeding a review queue that could inform future retraining (with appropriate safeguards against adversarial manipulation of the feedback signal itself).
- **API access tier** for third-party developers/researchers to integrate the detector into their own tools, with proper API key management and usage quotas.
