# Viva Questions and Answers

## Fake News Detection System

A reference set of likely evaluator questions and clear, honest answers, organized by topic.

---

## General / Project Overview

**Q: What problem does this project solve?**
A: It classifies a news article's text as REAL or FAKE using NLP preprocessing and a trained machine learning classifier, surfaced through a full-stack web application with user accounts, prediction history, analytics, and reporting.

**Q: Why use classical ML (Logistic Regression, Naive Bayes, Random Forest) instead of a deep learning model like BERT?**
A: Classical ML on TF-IDF features is fast to train, requires far less data and compute, is easy to interpret (you can inspect which words drove a decision), and is a standard, well-understood baseline for text classification. Transformer-based models could improve accuracy further and are listed explicitly in the Future Scope document as a natural next step, but they require significantly more data, compute, and infrastructure (GPU inference) than this project's scope calls for.

**Q: Is the dataset real?**
A: No — the bundled dataset is synthetically generated (`ml/data/generate_sample_dataset.py`) to demonstrate the full pipeline end-to-end without depending on a licensed third-party dataset. This is documented explicitly in the README, SRS, and Methodology docs. The training pipeline is dataset-agnostic: swapping in a real CSV with `text`/`label` columns and re-running `train.py` is all that's required to train on real data.

---

## NLP / Preprocessing

**Q: Walk through your text preprocessing pipeline.**
A: Raw text goes through four stages: (1) **cleaning** — lowercasing, Unicode normalization, removal of HTML/URLs/emails/mentions/hashtags/punctuation, whitespace collapsing; (2) **tokenization** — splitting into words via NLTK, then removing stopwords and very short tokens; (3) **lemmatization** — reducing words to their dictionary base form using WordNet, with part-of-speech tagging so e.g. "running" the verb lemmatizes differently than "running" used as a noun-like gerund; (4) **TF-IDF vectorization** — converting the cleaned token string into a sparse numerical feature vector.

**Q: Why lemmatization instead of stemming?**
A: Lemmatization produces real dictionary words (e.g. "studies" → "study"), while stemming often produces non-words (e.g. "studi"). Real words keep the TF-IDF vocabulary interpretable, which matters for explainability — you can inspect a trained model's top coefficients and read actual English words.

**Q: Why TF-IDF instead of simple word counts (bag-of-words)?**
A: TF-IDF down-weights words that are common across many documents (like "the," "news," "said") and up-weights words that are distinctive to a smaller subset of documents, which produces a more discriminative feature representation for classification than raw counts.

**Q: Why include bigrams (`ngram_range=(1,2)`) and not just single words?**
A: Some signal lives in two-word phrases rather than individual words — e.g. "breaking news" or "fact check" as phrases carry more specific meaning than "breaking," "news," "fact," and "check" do separately. Bigrams capture that without the feature-count explosion that trigrams or higher would cause.

**Q: What happens if NLTK's data files aren't available (e.g. no internet to download corpora)?**
A: The tokenizer and lemmatizer modules detect this and gracefully fall back to a lightweight regex-based tokenizer and a conservative built-in stopword list / suffix-stripping lemmatizer, so the system still runs rather than crashing — at a small cost to linguistic accuracy.

---

## Machine Learning

**Q: How do you choose the "best" model?**
A: All three candidate algorithms are trained on identical TF-IDF features and evaluated on the same held-out test set. The model with the highest **F1 score** (harmonic mean of precision and recall) is selected, since F1 is more robust to class imbalance than raw accuracy.

**Q: Why F1 score and not accuracy?**
A: Accuracy can be misleading if the dataset is imbalanced — a model that always predicts the majority class can still score high accuracy while being useless. F1 balances precision (how many flagged-as-fake articles really are fake) and recall (how many actually-fake articles get caught), giving a more honest single-number summary for this kind of binary classification task.

**Q: What is precision and recall in this context, concretely?**
A: With FAKE as the positive class: **precision** = of all articles the model labeled FAKE, what fraction actually were fake (false positives hurt precision). **Recall** = of all articles that actually were fake, what fraction the model caught (false negatives hurt recall).

**Q: How do you prevent train/test data leakage?**
A: The train/test split happens *before* any preprocessing-pipeline fitting. The TF-IDF vectorizer is `fit_transform`-ed only on the training set; the test set only ever gets `transform`-ed using that already-fitted vectorizer, so no information about the test set's vocabulary or document frequencies leaks into training.

**Q: How do you prevent train/serve skew (the model behaving differently in production than during evaluation)?**
A: Both the training script and the live backend's prediction service import and call the exact same `TextPreprocessor` class from `ml/preprocessing/feature_extractor.py`. There is only one preprocessing code path, used in both places — not two similar-but-subtly-different implementations.

**Q: What would you change in the model if you saw it overfitting?**
A: Reduce Random Forest's `max_depth`/`n_estimators`, increase TF-IDF's `min_df` to drop more rare/noisy terms, reduce `max_features`, add L2 regularization strength tuning for Logistic Regression (the `C` parameter), or — most importantly — get more and more diverse real training data.

---

## Backend / API

**Q: Why FastAPI over Flask or Django?**
A: FastAPI gives automatic request/response validation via Pydantic, auto-generated interactive API docs (Swagger/ReDoc) with zero extra code, native async support, and strong type-hint-driven developer ergonomics — all useful for a project that needs a clean, well-documented REST contract quickly.

**Q: How is authentication implemented?**
A: Email/password registration with bcrypt password hashing (never stored in plaintext). Login verifies the password and issues a signed JWT access token. Protected routes use a FastAPI dependency (`get_current_user`) that decodes and validates the token on every request and loads the corresponding user from the database.

**Q: How do you prevent leaking whether an email is registered?**
A: The login endpoint returns the identical error message ("Incorrect email or password") whether the email doesn't exist or the password is wrong, rather than a distinct "no such user" message.

**Q: How is the admin role enforced?**
A: A second dependency, `require_admin`, builds on `get_current_user` and additionally checks `current_user.role == ADMIN`, raising a 403 otherwise. It's applied to every route under `/api/admin/*`.

**Q: What happens if someone calls `/api/predict` before a model has been trained?**
A: The prediction service raises a custom `ModelNotLoadedError`, which the route handler catches and converts to an HTTP 503 (Service Unavailable) with a clear message — not a generic 500 crash.

---

## Database

**Q: Why SQLite instead of PostgreSQL/MySQL?**
A: SQLite requires zero setup/configuration — it's a single file — which keeps the project easy to run for evaluation/demo purposes. It's explicitly called out in the SRS and Future Scope as a constraint, not an oversight: a production deployment with concurrent multi-user writes would migrate to PostgreSQL.

**Q: How is the database schema structured?**
A: Two tables: `users` (id, email, hashed_password, role, is_active, created_at) and `prediction_history` (id, user_id foreign key, article_text, article_title, predicted_label, confidence_score, model_used, created_at).

---

## Frontend

**Q: Why React + Vite over Create React App or Next.js?**
A: Vite offers dramatically faster dev-server startup and hot-module-reload than Create React App (which is also now deprecated/unmaintained), and this project doesn't need Next.js's server-side rendering or file-based routing since it's a pure client-rendered SPA talking to a separate API.

**Q: How does the frontend handle an expired/invalid JWT?**
A: An Axios response interceptor watches for any `401 Unauthorized` response globally, clears the stored token, and redirects to `/login` — so the user is never left in a broken half-authenticated UI state.

**Q: How is dark mode implemented?**
A: A `ThemeProvider` React context toggles a `dark` class on the document root element; Tailwind CSS's `darkMode: 'class'` config then applies `dark:`-prefixed utility variants throughout the component tree. The preference is persisted to `localStorage` and also respects the OS-level `prefers-color-scheme` on first load.

---

## Deployment

**Q: How do you deploy this with Docker?**
A: `docker compose up --build` builds two containers: the backend (Python/FastAPI/Uvicorn, with NLTK corpora pre-downloaded at build time) and the frontend (a multi-stage build — Node builds the static Vite bundle, then Nginx serves it with SPA-fallback routing). The backend's entrypoint script automatically generates the sample dataset and trains a model on first boot if none exists yet.

**Q: How is data persisted across container restarts?**
A: Two named Docker volumes — `backend_db` for the SQLite file and `ml_models` for the trained model artifacts — are mounted into the backend container, so rebuilding the image doesn't wipe the database or force retraining.

---

## Limitations (be ready to discuss honestly)

**Q: What are this project's known limitations?**
A:
1. The bundled dataset is synthetic, not a real-world news corpus — accuracy numbers on it don't reflect real-world performance.
2. SQLite isn't suited for high-concurrency production write loads.
3. The model doesn't use any source/metadata signals (publisher reputation, date, etc.) — purely text-based.
4. No deep learning/transformer model is included as a comparison point, only classical ML.
5. There's no automated retraining/monitoring pipeline for detecting model drift over time in production.

Being able to state limitations clearly and specifically (rather than claiming the system is production-perfect) is itself a sign of engineering maturity — examiners generally view honest, specific limitation answers favorably.
