import pytest
from fastapi.testclient import TestClient
import sys
import os

# Ensure the backend directory is in the Python path so app can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

@pytest.fixture(scope="module")
def client():
    """Fixture providing a FastAPI TestClient instance"""
    with TestClient(app) as c:
        yield c
