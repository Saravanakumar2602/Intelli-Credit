# =====================================================
# Intelli-Credit Backend Dockerfile
# =====================================================

# Use official Python image
FROM python:3.11-slim

# Python settings
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install required Linux packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r credit_group && \
    useradd -r -g credit_group -d /app -s /bin/bash credit_user

# Working directory
WORKDIR /app

# Copy requirements first (Docker cache optimization)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create required directories
RUN mkdir -p \
    /app/backend \
    /app/uploads

# Copy backend source code
COPY . /app/backend

# Give permissions
RUN chown -R credit_user:credit_group /app

# Switch to non-root user
USER credit_user

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=20s \
            --retries=3 \
CMD curl -fs http://localhost:8000/docs || exit 1

# Start FastAPI
CMD [
    "uvicorn",
    "backend.app.main:app",
    "--host",
    "0.0.0.0",
    "--port",
    "8000",
    "--proxy-headers",
    "--forwarded-allow-ips=*"
]
