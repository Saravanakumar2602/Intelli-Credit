import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.schemas.user import (
    LoginRequest,
    SignupRequest,
    LoginResponse,
    PasswordResetRequest,
    PasswordResetConfirm,
    Token
)
from backend.models.user import User
from backend.security.auth_service import authenticate_user, register_new_user
from backend.security.tokens import create_access_token, create_refresh_token, decode_token
from backend.security.password import get_password_hash, validate_password_complexity
from backend.repositories.entity_repositories import AuditRepository
from backend.api.deps import get_current_user

router = APIRouter(tags=["Authentication"])

@router.post("/login/", response_model=LoginResponse)
def login(request: LoginRequest, req: Request, db: Session = Depends(get_db)):
    """Authenticate user and return Access and Refresh Tokens with rotation"""
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    user = authenticate_user(db, request.email.strip(), request.password, ip, ua)
    
    # Generate tokens
    access = create_access_token(data={"sub": user.email, "role": user.role})
    refresh = create_refresh_token(data={"sub": user.email})
    
    return {
        "access_token": access,
        "refresh_token": refresh,
        "token_type": "bearer",
        "user": {"email": user.email, "name": user.username, "role": user.role}
    }

@router.post("/signup/")
def signup(request: SignupRequest, req: Request, db: Session = Depends(get_db)):
    """Signup a new banking/corporate officer"""
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    # Validate email
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", request.email.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
        
    user = register_new_user(
        db=db,
        email=request.email.strip(),
        username=request.name.strip(),
        password=request.password,
        role=request.role or "viewer",
        ip=ip,
        ua=ua
    )
    
    return {"message": "Account created successfully. Please login."}

@router.post("/refresh/", response_model=Token)
def rotate_refresh_token(refresh_token: str, req: Request, db: Session = Depends(get_db)):
    """
    Refresh access token using token rotation.
    Decodes the refresh token, verifies it, and issues a new access & refresh token pair.
    """
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
        
    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inactive user or user not found"
        )
        
    # Rotate tokens: create brand new access and refresh tokens
    access = create_access_token(data={"sub": user.email, "role": user.role})
    new_refresh = create_refresh_token(data={"sub": user.email})
    
    AuditRepository.log(
        db=db,
        user_id=user.id,
        username=user.username,
        action="TOKEN_ROTATED",
        details="Refreshed session tokens.",
        ip=ip,
        ua=ua
    )
    
    return {
        "access_token": access,
        "refresh_token": new_refresh,
        "token_type": "bearer"
    }

@router.post("/password-reset-request/")
def request_password_reset(request: PasswordResetRequest, req: Request, db: Session = Depends(get_db)):
    """Request a password reset link/token"""
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    user = db.query(User).filter(User.email == request.email.strip()).first()
    if user:
        import secrets
        token = secrets.token_urlsafe(32)
        user.reset_token = token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        
        # Log audit action
        AuditRepository.log(db, user.id, user.username, "RESET_REQUESTED", "Initiated password reset request.", ip, ua)
        
        # In a real app, send an email. For demo/underwriting, we return the token
        return {"message": "Password reset token generated.", "token": token}
        
    return {"message": "If the email exists, a password reset token has been generated."}

@router.post("/password-reset-confirm/")
def confirm_password_reset(request: PasswordResetConfirm, req: Request, db: Session = Depends(get_db)):
    """Confirm password reset using token and validate complexity"""
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    user = db.query(User).filter(
        User.reset_token == request.token,
        User.reset_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
        
    # Validate password complexity
    is_valid, msg = validate_password_complexity(request.new_password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
        
    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    
    AuditRepository.log(db, user.id, user.username, "RESET_CONFIRMED", "Successfully updated password.", ip, ua)
    
    return {"message": "Password has been reset successfully. Please login."}

@router.post("/verify-email/")
def verify_email(token: str, req: Request, db: Session = Depends(get_db)):
    """Verify user email account"""
    ip = req.client.host if req.client else "unknown"
    ua = req.headers.get("user-agent", "unknown")
    
    user = db.query(User).filter(User.verification_token == token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )
        
    user.is_verified = True
    user.verification_token = None
    db.commit()
    
    AuditRepository.log(db, user.id, user.username, "EMAIL_VERIFIED", "Account verified successfully.", ip, ua)
    
    return {"message": "Email address verified successfully."}

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve details of currently logged-in user"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.username,
        "role": current_user.role,
        "avatar_url": None
    }
