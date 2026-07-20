from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import re
from app.auth import get_db, verify_password, get_password_hash, create_access_token
from app.models.user import User

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
    token_type: str = "bearer"
    user: dict

@router.post("/login/")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Login endpoint"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": user.email})
    return LoginResponse(
        access_token=token,
        user={"email": user.email, "name": user.username}
    )

@router.post("/signup/")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    """Signup endpoint"""
    # Simple email regex validation
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", request.email.strip()):
        raise HTTPException(status_code=400, detail="Invalid email format")

    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(request.password)
    new_user = User(
        username=request.name,
        email=request.email.strip(),
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    
    return {"message": "Account created successfully. Please login."}


