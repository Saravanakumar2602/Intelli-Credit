from fastapi import HTTPException, status
from backend.models.user import User

# Configurable permissions map
ROLE_PERMISSIONS = {
    "admin": {"*"},
    "credit_officer": {"upload", "analyze", "read", "onboard", "download"},
    "relationship_manager": {"onboard", "read"},
    "auditor": {"read", "audit"},
    "viewer": {"read"}
}

def has_permission(user_role: str, required_permission: str) -> bool:
    """Check if a role has the specified permission"""
    role = user_role.lower()
    if role not in ROLE_PERMISSIONS:
        return False
    
    permissions = ROLE_PERMISSIONS[role]
    if "*" in permissions:
        return True
        
    return required_permission in permissions

def verify_user_permission(user: User, required_permission: str) -> None:
    """Helper exception raising function for route dependency checking"""
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user account"
        )
        
    if not has_permission(user.role, required_permission):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied: required permission '{required_permission}' not granted for role '{user.role}'."
        )
