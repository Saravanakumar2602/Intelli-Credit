import uuid


def test_signup_success(client):
    """Test successful signup"""
    suffix = uuid.uuid4().hex[:8]
    email = f"new_user_{suffix}@bank.com"
    name = f"New User {suffix}"
    response = client.post(
        "/api/v1/auth/signup/",
        json={"email": email, "password": "SecureP@ss123!", "name": name}
    )
    assert response.status_code == 200
    assert response.json()["message"] == "Account created successfully. Please login."


def test_signup_duplicate_email(client):
    """Test signing up with an already registered email"""
    response = client.post(
        "/api/v1/auth/signup/",
        json={"email": "demo@bank.com", "password": "SecureP@ss123!", "name": "Demo Duplicate"}
    )
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_login_demo_success(client):
    """Test login with standard demo account credentials"""
    response = client.post(
        "/api/v1/auth/login/",
        json={"email": "demo@bank.com", "password": "demo123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["user"]["email"] == "demo@bank.com"


def test_login_new_user_success(client):
    """Test login with the newly created user credentials"""
    client.post(
        "/api/v1/auth/signup/",
        json={"email": "active_user@bank.com", "password": "SecureP@ss123!", "name": "Active User"}
    )
    response = client.post(
        "/api/v1/auth/login/",
        json={"email": "active_user@bank.com", "password": "SecureP@ss123!"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["user"]["email"] == "active_user@bank.com"


def test_login_invalid_credentials(client):
    """Test login with invalid password"""
    response = client.post(
        "/api/v1/auth/login/",
        json={"email": "demo@bank.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]
