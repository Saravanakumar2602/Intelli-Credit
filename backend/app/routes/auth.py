from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import uuid

router = APIRouter(tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

class SignupRequest(BaseModel):
    email: str
    password: str
    name: str

class LoginResponse(BaseModel):
    access_token: str
    user: dict

DEMO_USER = {
    "email": "demo@bank.com",
    "password": "demo123",
    "name": "Demo User"
}

users_db = {}

@router.post("/login/")
def login(request: LoginRequest):
    """Login endpoint"""
    if request.email == DEMO_USER["email"] and request.password == DEMO_USER["password"]:
        token = str(uuid.uuid4())
        return LoginResponse(
            access_token=token,
            user={"email": request.email, "name": DEMO_USER["name"]}
        )
    
    if request.email in users_db and users_db[request.email]["password"] == request.password:
        token = str(uuid.uuid4())
        return LoginResponse(
            access_token=token,
            user={"email": request.email, "name": users_db[request.email]["name"]}
        )
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@router.post("/signup/")
def signup(request: SignupRequest):
    """Signup endpoint"""
    if request.email in users_db or request.email == DEMO_USER["email"]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    users_db[request.email] = {
        "password": request.password,
        "name": request.name
    }
    
    return {"message": "Account created successfully. Please login."}
