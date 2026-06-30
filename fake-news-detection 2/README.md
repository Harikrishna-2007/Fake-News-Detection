# Fake News Detection System

A full-stack web application that classifies news articles as **REAL** or **FAKE** using classical NLP feature engineering (TF-IDF) and supervised machine learning (Logistic Regression, Multinomial Naive Bayes, Random Forest), with model comparison and automatic selection of the best performer.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router, Chart.js |
| Backend | Python, FastAPI, SQLAlchemy, JWT auth (python-jose, passlib) |
| ML | scikit-learn, pandas, NumPy, NLTK, joblib |
| Database | SQLite |
| Deployment | Docker, Docker Compose |

## Project Structure

```
fake-news-detection/
├── frontend/          React SPA (Vite)
├── backend/           FastAPI app (auth, prediction, history, reports, admin)
├── ml/                Training pipeline, preprocessing, saved models
├── docs/              SRS, architecture, viva Q&A, PPT outline
├── tests/             Backend + ML test suite
├── docker/            Dockerfiles
├── requirements.txt
├── docker-compose.yml
└── README.md
```

## Quick Start (Local, no Docker)

### 1. Backend + ML setup

```bash
cd fake-news-detection
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # edit JWT_SECRET_KEY at minimum

# One-time NLTK data download
python -c "import nltk; nltk.download('stopwords'); nltk.download('wordnet'); nltk.download('omw-1.4')"

# Train the models (downloads/uses sample dataset, trains 3 models, saves the best one)
python ml/training/train.py

# Start the API
uvicorn backend.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs` (FastAPI Swagger UI).

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_BASE_URL if backend isn't on localhost:8000
npm run dev
```

App available at `http://localhost:5173`.

### Default admin login
After first backend startup, an admin account is seeded using `ADMIN_EMAIL` / `ADMIN_PASSWORD` from your `.env`.

## Quick Start (Docker)

```bash
cp .env.example .env   # edit secrets
docker compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

## Running Tests

```bash
pip install -r requirements-dev.txt
pytest tests/ -v --cov=backend --cov=ml
```

## Retraining the Model

The pipeline in `ml/training/train.py` is dataset-agnostic: drop a CSV with `text` and `label` (`REAL`/`FAKE`) columns into `ml/data/`, point `DATASET_PATH` in `train.py` at it, and re-run. It will re-vectorize, retrain all three models, compare them on held-out test data, and overwrite `ml/models/best_model.joblib` only if the new model outperforms the existing one.

## License
MIT — provided as an educational / portfolio project.
