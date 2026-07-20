import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure the backend directory is in the Python path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.auth import get_current_user
from app.models.user import User

@pytest.fixture(scope="module")
def client():
    """Fixture providing a FastAPI TestClient instance with mocked auth"""
    # Mock current user for endpoints requiring Depends(get_current_user)
    app.dependency_overrides[get_current_user] = lambda: User(id=1, username="Test User", email="test@bank.com")
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

