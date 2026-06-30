# Software Requirements Specification (SRS)
## Fake News Detection System

**Version:** 1.0
**Date:** June 2026

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the Fake News Detection System, a full-stack web application that classifies news articles as REAL or FAKE using Natural Language Processing (NLP) and Machine Learning (ML). It is intended for developers, evaluators, and academic reviewers assessing the system's design and scope.

### 1.2 Scope
The system allows registered users to submit news article text (pasted or uploaded as a `.txt` file) and receive a classification with a confidence score. It maintains a history of predictions per user, provides aggregate analytics, supports PDF/CSV report export, and includes an administrative panel for user management. The classification model is trained offline using a TF-IDF + classical ML pipeline (Logistic Regression, Multinomial Naive Bayes, Random Forest) and served via a REST API.

### 1.3 Intended Audience
Software engineering students/instructors evaluating this as a capstone/coursework project, developers extending the project, and technical reviewers conducting a viva or code review.

### 1.4 Definitions
- **TF-IDF**: Term Frequency–Inverse Document Frequency, a numerical statistic reflecting how important a word is to a document within a corpus.
- **JWT**: JSON Web Token, used for stateless authentication.
- **F1 Score**: The harmonic mean of precision and recall, used here as the primary model-selection metric.

---

## 2. Overall Description

### 2.1 Product Perspective
The system is composed of three independently deployable layers:
- **ML layer** (`ml/`): offline training pipeline producing a serialized model + vectorizer.
- **Backend layer** (`backend/`): FastAPI REST API providing auth, prediction inference, history, analytics, reports, and admin endpoints.
- **Frontend layer** (`frontend/`): a React SPA consuming the backend API.

### 2.2 Product Functions (Summary)
1. User registration and JWT-based login.
2. Submission of article text (pasted or file-uploaded) for REAL/FAKE classification with a confidence score.
3. Persistent, searchable, paginated prediction history per user.
4. Aggregate analytics (totals, breakdowns, time series, model metrics).
5. PDF and CSV export of prediction history.
6. Admin user management (activate/deactivate accounts, role changes) and platform-wide analytics.

### 2.3 User Classes
- **Standard User**: registers, submits articles, views their own history/analytics, downloads their own reports.
- **Administrator**: all standard-user capabilities plus user management and platform-wide analytics, seeded automatically on first run from `.env` credentials.

### 2.4 Operating Environment
- Backend: Python 3.11+, runs on Linux/macOS/Windows, deployable via Docker.
- Frontend: any modern evergreen browser (Chrome, Firefox, Edge, Safari) supporting ES2020+.
- Database: SQLite (file-based; no separate DB server required for this project's scope).

### 2.5 Design and Implementation Constraints
- The model is trained offline; the API does not retrain on the fly. Retraining requires re-running `ml/training/train.py`.
- SQLite is used for simplicity and portability; it is not intended for high-concurrency production write loads, which is an explicit, accepted constraint for a project of this scope (see Future Scope).
- The bundled sample dataset (`ml/data/news_dataset.csv`) is **synthetically generated** for pipeline demonstration; production-quality accuracy claims require retraining on a real, licensed corpus.

---

## 3. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | The system shall allow a new user to register with email + password. | High |
| FR-2 | The system shall reject registration with an already-registered email. | High |
| FR-3 | The system shall authenticate users via email + password and issue a JWT access token. | High |
| FR-4 | The system shall allow authenticated users to submit pasted article text for classification. | High |
| FR-5 | The system shall allow authenticated users to submit a `.txt` file for classification. | High |
| FR-6 | The system shall return a REAL/FAKE label and a confidence score (0–1) for each submission. | High |
| FR-7 | The system shall persist every prediction to the requesting user's history. | High |
| FR-8 | The system shall allow users to search, filter (by label), and paginate their prediction history. | High |
| FR-9 | The system shall compute and expose aggregate analytics (totals, percentages, average confidence, 30-day time series). | Medium |
| FR-10 | The system shall expose the active model's offline evaluation metrics (accuracy, precision, recall, F1). | Medium |
| FR-11 | The system shall allow users to export their prediction history as PDF. | Medium |
| FR-12 | The system shall allow users to export their prediction history as CSV. | Medium |
| FR-13 | The system shall restrict administrative endpoints to users with the ADMIN role. | High |
| FR-14 | Administrators shall be able to list all users, view any user's history, and activate/deactivate accounts. | Medium |
| FR-15 | The system shall seed a default administrator account on first startup if none exists. | Low |
| FR-16 | The training pipeline shall train and compare at least three classical ML algorithms and persist the best-performing one by F1 score. | High |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | **Security**: Passwords shall be hashed with bcrypt; never stored or logged in plaintext. |
| NFR-2 | **Security**: API endpoints (other than register/login/health) shall require a valid JWT bearer token. |
| NFR-3 | **Performance**: A single prediction request shall complete in under 2 seconds on commodity hardware once the model is loaded in memory. |
| NFR-4 | **Usability**: The frontend shall be responsive across mobile, tablet, and desktop viewport widths. |
| NFR-5 | **Usability**: The frontend shall support both light and dark themes. |
| NFR-6 | **Reliability**: The API shall return a `503` (not a `500` crash) if a prediction is requested before a model has been trained/loaded. |
| NFR-7 | **Maintainability**: Preprocessing logic used at training time and at inference time shall be implemented in a single shared module to prevent train/serve skew. |
| NFR-8 | **Portability**: The full system shall be deployable via a single `docker compose up` command. |

---

## 5. External Interface Requirements

### 5.1 REST API (selected endpoints)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/predict`
- `POST /api/predict/upload`
- `GET /api/history`
- `GET /api/analytics`
- `GET /api/reports/history.pdf`
- `GET /api/reports/history.csv`
- `GET /api/admin/users`
- `PATCH /api/admin/users/{id}`
- `GET /api/admin/analytics`

Full interactive documentation is auto-generated by FastAPI and served at `/docs` (Swagger UI) and `/redoc`.

### 5.2 Database
SQLite, accessed via SQLAlchemy ORM. Two primary tables: `users`, `prediction_history` (see `backend/models/orm_models.py`).

---

## 6. Assumptions and Dependencies
- Assumes Python 3.11+ and Node.js 18+ are available in the deployment environment (or Docker, which provides both).
- Assumes the operator will replace the bundled synthetic dataset with a real, licensed news dataset before any production-accuracy claims are made.
- Assumes a single-instance SQLite deployment is acceptable for the intended scale (academic/portfolio project, not high-traffic production).
