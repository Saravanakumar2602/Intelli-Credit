import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from backend.app.main import app
from backend.api.deps import get_current_user
from backend.models.user import User

@pytest.fixture(scope="module")
def client():
    """Fixture providing a FastAPI TestClient instance with mocked auth"""
    app.dependency_overrides[get_current_user] = lambda: User(
        id=1,
        username="Test User",
        email="test@bank.com",
        hashed_password="hashed",
        role="credit_officer",
        is_active=True,
        is_verified=True,
        failed_login_attempts=0
    )
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
