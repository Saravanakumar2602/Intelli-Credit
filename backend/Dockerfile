# =====================================================
# Intelli-Credit Backend Dockerfile
# =====================================================

FROM python:3.11-slim

# Python configuration
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -g 10001 credit_group && \
    useradd -u 10001 -g credit_group -m -s /bin/bash credit_user

# Working directory
WORKDIR /app

# Copy dependency file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Create directories
RUN mkdir -p /app/backend /app/uploads

# Copy backend source
COPY --chown=credit_user:credit_group . /app/backend

# Fix permissions
RUN chown -R credit_user:credit_group /app

# Switch to non-root user
USER credit_user

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
CMD curl -fs http://localhost:8000/ || exit 1

# Start FastAPI
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--proxy-headers", "--forwarded-allow-ips=*"]
