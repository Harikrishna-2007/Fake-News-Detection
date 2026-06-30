# Architecture Description

## Fake News Detection System

This document describes the system architecture in both diagram and narrative form. Diagrams use Mermaid syntax, which renders natively on GitHub and most modern Markdown viewers.

---

## 1. High-Level System Architecture

```mermaid
flowchart TB
    subgraph Client["Client (Browser)"]
        UI["React SPA (Vite + Tailwind CSS)"]
    end

    subgraph Backend["Backend (FastAPI)"]
        AUTH["Auth Routes<br/>(register, login, JWT)"]
        PRED["Prediction Routes<br/>(/predict, /predict/upload)"]
        HIST["History & Analytics Routes"]
        REP["Report Routes<br/>(PDF/CSV export)"]
        ADMIN["Admin Routes"]
        SVC["Prediction Service<br/>(in-memory model)"]
    end

    subgraph ML["ML Layer (offline)"]
        TRAIN["train.py"]
        PREP["Preprocessing Pipeline<br/>(clean → tokenize → lemmatize → TF-IDF)"]
        MODELS["LogReg / NaiveBayes / RandomForest"]
        ARTIFACTS["Saved Artifacts<br/>(best_model.joblib, vectorizer.joblib, metadata.json)"]
    end

    subgraph DB["Data Layer"]
        SQLITE["SQLite<br/>(users, prediction_history)"]
    end

    UI -- "HTTPS/JSON (Axios)" --> AUTH
    UI --> PRED
    UI --> HIST
    UI --> REP
    UI --> ADMIN

    AUTH --> SQLITE
    HIST --> SQLITE
    REP --> SQLITE
    ADMIN --> SQLITE
    PRED --> SQLITE
    PRED --> SVC

    TRAIN --> PREP --> MODELS --> ARTIFACTS
    SVC -. "loads at startup" .-> ARTIFACTS
```

**Narrative:** The React SPA communicates exclusively over a JSON REST API with the FastAPI backend, authenticated via a JWT bearer token attached to every request after login. The backend's five route groups (auth, prediction, history/analytics, reports, admin) all read/write through SQLAlchemy to a single SQLite database. The ML layer is decoupled from the live request path: training happens offline via `train.py`, producing artifacts that the backend's `PredictionService` loads once into memory at startup and reuses for every subsequent `/api/predict` request — no retraining happens during a live request.

---

## 2. Request Flow: Submitting an Article for Classification

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant F as React Frontend
    participant B as FastAPI Backend
    participant S as Prediction Service
    participant D as SQLite DB

    U->>F: Pastes article text, clicks "Analyze"
    F->>B: POST /api/predict (Bearer JWT, {text, title})
    B->>B: Validate JWT -> resolve current_user
    B->>S: predict(text)
    S->>S: TextPreprocessor.preprocess(text)
    S->>S: vectorizer.transform(...)
    S->>S: model.predict() + predict_proba()
    S-->>B: {label, confidence, real_prob, fake_prob, model_used}
    B->>D: INSERT INTO prediction_history (...)
    D-->>B: record (with generated id, created_at)
    B-->>F: 200 OK {id, predicted_label, confidence_score, ...}
    F->>F: Render ResultCard (verdict stamp + confidence gauge)
```

---

## 3. ML Training Pipeline (Offline)

```mermaid
flowchart LR
    A[news_dataset.csv] --> B[Load & validate dataset]
    B --> C["Stratified train/test split (80/20)"]
    C --> D["TextPreprocessor:<br/>clean → tokenize → lemmatize"]
    D --> E["TF-IDF Vectorizer<br/>(fit on train, transform test)"]
    E --> F1[Logistic Regression]
    E --> F2[Multinomial Naive Bayes]
    E --> F3[Random Forest]
    F1 --> G[Evaluate on test set]
    F2 --> G
    F3 --> G
    G --> H["Select best model by F1 score"]
    H --> I["Persist: best_model.joblib,<br/>tfidf_vectorizer.joblib,<br/>model_metadata.json"]
```

---

## 4. Deployment Architecture (Docker Compose)

```mermaid
flowchart TB
    subgraph Host["Host Machine"]
        subgraph Compose["docker-compose.yml"]
            FE["frontend container<br/>(Nginx serving Vite build)<br/>Port 3000 → 80"]
            BE["backend container<br/>(Uvicorn + FastAPI)<br/>Port 8000"]
            V1[(backend_db volume)]
            V2[(ml_models volume)]
        end
    end

    Browser["User's Browser"] -- "localhost:3000" --> FE
    Browser -- "localhost:8000/api/*" --> BE
    FE -. "API calls (VITE_API_BASE_URL,<br/>baked in at build time)" .-> BE
    BE --- V1
    BE --- V2
```

**Narrative:** Two containers are orchestrated by `docker-compose.yml`. The frontend container is a multi-stage build: Node builds the static Vite bundle, then Nginx serves it (with SPA fallback routing so client-side routes survive a page refresh). The backend container runs the FastAPI app under Uvicorn, with `backend_db` and `ml_models` named volumes ensuring the SQLite database and trained model artifacts persist across container rebuilds. On first boot, the backend's entrypoint script automatically generates the sample dataset and trains a model if none exists yet, so `docker compose up --build` works without any manual training step.

---

## 5. Directory-to-Layer Mapping

| Directory | Architectural Layer |
|---|---|
| `frontend/src/pages` | Presentation — route-level views |
| `frontend/src/components` | Presentation — reusable UI building blocks |
| `frontend/src/services` | Presentation — API client layer (Axios) |
| `frontend/src/hooks` | Presentation — cross-cutting state (auth, theme) |
| `backend/routes` | Application — HTTP request handling |
| `backend/services` | Application — business logic (prediction, reports) |
| `backend/auth` | Application — security (JWT, password hashing, dependencies) |
| `backend/database` | Data Access — SQLAlchemy engine/session/CRUD |
| `backend/models` | Data Access + Contract — ORM models + Pydantic schemas |
| `ml/preprocessing` | ML — shared text pipeline (training + inference) |
| `ml/training` | ML — offline training, comparison, persistence |
| `ml/data` | ML — dataset storage and generation |
