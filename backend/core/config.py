import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Settings:
    # App Settings
    PROJECT_NAME: str = "Intelli-Credit Enterprise Platform"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENV: str = os.getenv("ENV", "development") # "development" or "production"
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    
    # Security
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "supersecretkey")
    JWT_ENCRYPTED_SECRET: str = os.getenv("JWT_ENCRYPTED_SECRET", "supersecurejwtencrypterkey123")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15 # Short-lived access token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7 # Refresh token duration
    
    # Upload Settings
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024  # 50MB limit
    ALLOWED_EXTENSIONS: set = {".pdf", ".docx", ".xlsx", ".csv", ".txt"}
    ENCRYPT_STORAGE: bool = os.getenv("ENCRYPT_STORAGE", "false").lower() == "true"
    AES_ENCRYPTION_KEY: str = os.getenv("AES_ENCRYPTION_KEY", "sixteenbyteskey1") # 16 byte key
    
    # AI Engine & APIs
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")
    
    # Background Processing
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    # OCR
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")
    
    # Observability
    SENTRY_DSN: str = os.getenv("SENTRY_DSN", "")
    ENABLE_PROMETHEUS: bool = os.getenv("ENABLE_PROMETHEUS", "true").lower() == "true"
    
    # Rate Limiting
    RATE_LIMIT_DEFAULT: str = os.getenv("RATE_LIMIT_DEFAULT", "60 per minute")

settings = Settings()
