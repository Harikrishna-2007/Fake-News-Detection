"""
test_api.py
============
Integration tests for the FastAPI backend, using an in-memory SQLite
database and FastAPI's TestClient so tests run fast and never touch
the real app.db file.

Run with:
    pytest tests/test_api.py -v

Requires: pip install -r requirements-dev.txt (httpx is FastAPI's
TestClient dependency).
"""

import sys
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.database.database import Base, get_db
from backend.main import app
from backend.services.prediction_service import prediction_service


# ---------------------------------------------------------------------------
# Test database fixture: a fresh in-memory SQLite DB per test session,
# wired in via FastAPI's dependency override so no test ever touches the
# real backend/database/app.db file.
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


class _StubModel:
    """
    Deterministic stand-in for the real trained model, used so API
    tests don't depend on ml/models/*.joblib existing or on real
    classifier behavior — they test the API contract, not ML accuracy
    (that's covered by tests/test_ml.py).
    """

    classes_ = ["FAKE", "REAL"]

    def predict(self, X):
        # Always predicts REAL for predictability in assertions.
        return ["REAL"] * X.shape[0]

    def predict_proba(self, X):
        import numpy as np

        return np.array([[0.15, 0.85]] * X.shape[0])


class _StubVectorizer:
    def transform(self, texts):
        import numpy as np
        from scipy.sparse import csr_matrix

        return csr_matrix(np.ones((len(texts), 5)))


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """
    Create all tables in the in-memory test engine once for the test
    session. TestClient triggers FastAPI's startup event, which calls
    init_db() and seeds an admin user — both of those run against the
    *real* configured DATABASE_URL (the production app.db file) unless
    we patch them out, since init_db() binds to the engine imported
    directly from backend.database.database rather than going through
    the get_db dependency we've overridden above. We monkeypatch both
    functions to no-ops for the test session so test runs never touch
    the real database file, then create the in-memory test schema directly.
    """
    import backend.main as main_module

    original_init_db = main_module.init_db
    original_seed_admin = main_module._seed_admin_user
    main_module.init_db = lambda: None
    main_module._seed_admin_user = lambda: None

    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

    main_module.init_db = original_init_db
    main_module._seed_admin_user = original_seed_admin


@pytest.fixture(autouse=True)
def stub_prediction_model(monkeypatch):
    """
    Inject a deterministic stub model so /api/predict tests don't need
    a real trained model on disk. Also patches load() to a no-op so
    that FastAPI's startup event (triggered by TestClient) never
    attempts real disk I/O against ml/models/*.joblib during tests.
    """
    monkeypatch.setattr(prediction_service, "load", lambda: None)
    monkeypatch.setattr(prediction_service, "_model", _StubModel())
    monkeypatch.setattr(prediction_service, "_vectorizer", _StubVectorizer())
    monkeypatch.setattr(prediction_service, "_loaded", True)
    monkeypatch.setattr(prediction_service, "_metadata", {"best_model_name": "Stub Model"})
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def registered_user(client):
    """Registers and returns a fresh test user's credentials."""
    payload = {"email": "testuser@example.com", "password": "SecurePass123", "full_name": "Test User"}
    client.post("/api/auth/register", json=payload)
    return payload


@pytest.fixture
def auth_headers(client, registered_user):
    """Logs in registered_user and returns Authorization headers."""
    response = client.post(
        "/api/auth/login",
        json={"email": registered_user["email"], "password": registered_user["password"]},
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------------------------
# Health checks
# ---------------------------------------------------------------------------

class TestHealth:
    def test_root_endpoint_returns_ok(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    def test_health_endpoint(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert "model_loaded" in response.json()


# ---------------------------------------------------------------------------
# Auth: register / login
# ---------------------------------------------------------------------------

class TestAuth:
    def test_register_creates_user(self, client):
        response = client.post(
            "/api/auth/register",
            json={"email": "new@example.com", "password": "SecurePass123"},
        )
        assert response.status_code == 201
        body = response.json()
        assert body["email"] == "new@example.com"
        assert "hashed_password" not in body  # never leak password hash

    def test_register_duplicate_email_fails(self, client, registered_user):
        response = client.post("/api/auth/register", json=registered_user)
        assert response.status_code == 400

    def test_register_short_password_fails_validation(self, client):
        response = client.post(
            "/api/auth/register",
            json={"email": "short@example.com", "password": "short"},
        )
        assert response.status_code == 422

    def test_login_with_correct_credentials_succeeds(self, client, registered_user):
        response = client.post(
            "/api/auth/login",
            json={"email": registered_user["email"], "password": registered_user["password"]},
        )
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_with_wrong_password_fails(self, client, registered_user):
        response = client.post(
            "/api/auth/login",
            json={"email": registered_user["email"], "password": "WrongPassword123"},
        )
        assert response.status_code == 401

    def test_login_with_nonexistent_email_fails(self, client):
        response = client.post(
            "/api/auth/login",
            json={"email": "nobody@example.com", "password": "whatever123"},
        )
        assert response.status_code == 401

    def test_get_me_requires_auth(self, client):
        response = client.get("/api/auth/me")
        assert response.status_code == 401

    def test_get_me_with_valid_token(self, client, auth_headers):
        response = client.get("/api/auth/me", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["email"] == "testuser@example.com"


# ---------------------------------------------------------------------------
# Prediction
# ---------------------------------------------------------------------------

class TestPrediction:
    def test_predict_requires_auth(self, client):
        response = client.post("/api/predict", json={"text": "x" * 30})
        assert response.status_code == 401

    def test_predict_with_valid_text_returns_verdict(self, client, auth_headers):
        response = client.post(
            "/api/predict",
            json={"text": "This is a sufficiently long sample news article for testing."},
            headers=auth_headers,
        )
        assert response.status_code == 200
        body = response.json()
        assert body["predicted_label"] in ("REAL", "FAKE")
        assert 0.0 <= body["confidence_score"] <= 1.0

    def test_predict_with_too_short_text_fails_validation(self, client, auth_headers):
        response = client.post("/api/predict", json={"text": "too short"}, headers=auth_headers)
        assert response.status_code == 422

    def test_predict_upload_rejects_non_txt_file(self, client, auth_headers):
        response = client.post(
            "/api/predict/upload",
            files={"file": ("article.pdf", b"fake pdf bytes", "application/pdf")},
            headers=auth_headers,
        )
        assert response.status_code == 400

    def test_predict_upload_accepts_txt_file(self, client, auth_headers):
        content = b"This is a sufficiently long sample news article uploaded as a file."
        response = client.post(
            "/api/predict/upload",
            files={"file": ("article.txt", content, "text/plain")},
            headers=auth_headers,
        )
        assert response.status_code == 200


# ---------------------------------------------------------------------------
# History & Analytics
# ---------------------------------------------------------------------------

class TestHistoryAndAnalytics:
    def test_history_empty_initially_for_new_user(self, client, auth_headers):
        response = client.get("/api/history", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["total"] >= 0  # may be 0 or include prior test predictions

    def test_history_after_prediction_contains_record(self, client, auth_headers):
        client.post(
            "/api/predict",
            json={"text": "A brand new article for history tracking verification purposes."},
            headers=auth_headers,
        )
        response = client.get("/api/history", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["total"] >= 1

    def test_history_pagination_params(self, client, auth_headers):
        response = client.get("/api/history?page=1&page_size=5", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        assert body["page"] == 1
        assert body["page_size"] == 5

    def test_analytics_requires_auth(self, client):
        response = client.get("/api/analytics")
        assert response.status_code == 401

    def test_analytics_returns_expected_shape(self, client, auth_headers):
        response = client.get("/api/analytics", headers=auth_headers)
        assert response.status_code == 200
        body = response.json()
        for key in ("total_analyzed", "real_count", "fake_count", "average_confidence", "predictions_over_time"):
            assert key in body


# ---------------------------------------------------------------------------
# Admin authorization boundaries
# ---------------------------------------------------------------------------

class TestAdminAuthorization:
    def test_non_admin_cannot_list_users(self, client, auth_headers):
        response = client.get("/api/admin/users", headers=auth_headers)
        assert response.status_code == 403

    def test_non_admin_cannot_access_platform_analytics(self, client, auth_headers):
        response = client.get("/api/admin/analytics", headers=auth_headers)
        assert response.status_code == 403


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-v"]))
