import html
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    HTTP Security headers middleware (similar to Helmet in Node.js)
    Guards against clickjacking, XSS attacks, MIME sniffing, and injection.
    """
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # Prevent Clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME Sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Enable Browser XSS filter
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Strict Content Security Policy (CSP)
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self';"
        )
        
        # Strict-Transport-Security (HSTS)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

def sanitize_string(value: str) -> str:
    """Helper to HTML-encode inputs to prevent XSS/Injection attacks"""
    if not value or not isinstance(value, str):
        return value
    # Basic HTML escaping
    return html.escape(value)

def sanitize_payload(data: dict) -> dict:
    """Recursively escape dictionary string values"""
    sanitized = {}
    for k, v in data.items():
        if isinstance(v, str):
            sanitized[k] = sanitize_string(v)
        elif isinstance(v, dict):
            sanitized[k] = sanitize_payload(v)
        elif isinstance(v, list):
            sanitized[k] = [sanitize_payload(item) if isinstance(item, dict) else (sanitize_string(item) if isinstance(item, str) else item) for item in v]
        else:
            sanitized[k] = v
    return sanitized
