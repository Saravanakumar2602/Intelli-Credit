from datetime import datetime, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from backend.models.user import User
from backend.security.password import verify_password, get_password_hash, validate_password_complexity
from backend.security.tokens import create_access_token, create_refresh_token
from backend.models.audit_log import AuditLog

LOCKOUT_DURATION_MINUTES = 15
MAX_FAILED_ATTEMPTS = 5

def authenticate_user(db: Session, email: str, password: str, ip: str = None, ua: str = None) -> User:
    """
    Authenticate user, tracking failed attempts and locking account if max attempts exceeded.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Check if account is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )
        
    # Check if account is locked
    if user.lockout_until and user.lockout_until > datetime.utcnow():
        lock_remaining = int((user.lockout_until - datetime.utcnow()).total_seconds() / 60)
        # Log audit action
        audit = AuditLog(user_id=user.id, username=user.username, action="LOGIN_LOCKED", details=f"Attempt from locked account.", ip_address=ip, user_agent=ua)
        db.add(audit)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account is locked. Please try again in {lock_remaining} minutes."
        )

    # Verify password
    if not verify_password(password, user.hashed_password):
        # Increment failed attempts
        user.failed_login_attempts += 1
        details = f"Failed login attempt {user.failed_login_attempts}/{MAX_FAILED_ATTEMPTS}."
        
        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.lockout_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
            details = f"Account locked out for {LOCKOUT_DURATION_MINUTES} minutes due to max failed attempts."
            
        db.commit()
        
        # Log audit action
        audit = AuditLog(user_id=user.id, username=user.username, action="LOGIN_FAILED", details=details, ip_address=ip, user_agent=ua)
        db.add(audit)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
        
    # Reset failed attempts on success
    user.failed_login_attempts = 0
    user.lockout_until = None
    db.commit()
    
    # Log audit action
    audit = AuditLog(user_id=user.id, username=user.username, action="LOGIN_SUCCESS", details="Successfully logged in.", ip_address=ip, user_agent=ua)
    db.add(audit)
    db.commit()
    
    return user

def register_new_user(db: Session, email: str, username: str, password: str, role: str = "viewer", ip: str = None, ua: str = None) -> User:
    """
    Register a new user, enforcing password complexity rules.
    """
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # Check if username is already registered
    existing_username = db.query(User).filter(User.username == username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
        
    # Validate password complexity
    is_valid, msg = validate_password_complexity(password)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )
        
    # Create new user
    hashed_pwd = get_password_hash(password)
    user = User(
        email=email,
        username=username,
        hashed_password=hashed_pwd,
        role=role.lower()
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Log audit action
    audit = AuditLog(user_id=user.id, username=user.username, action="SIGNUP_SUCCESS", details=f"User signed up with role: {role}.", ip_address=ip, user_agent=ua)
    db.add(audit)
    db.commit()
    
    return user
