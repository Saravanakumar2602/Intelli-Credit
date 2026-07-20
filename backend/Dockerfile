# Use official lightweight Python image
FROM python:3.11-slim

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# Install system dependencies (including tesseract for OCR tasks if needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    tesseract-ocr \
    tesseract-ocr-eng \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a non-privileged user and group
RUN groupadd -g 10001 credit_group && \
    useradd -u 10001 -g credit_group -m -s /bin/bash credit_user

# Set working directory in the container
WORKDIR /app

# Copy requirements first to leverage Docker layer caching
COPY requirements.txt .

# Install python packages
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Create application subdirectories and apply ownership permissions
RUN mkdir -p /app/backend /app/uploads && \
    chown -R credit_user:credit_group /app

# Copy the rest of the backend files inside the backend module folder
COPY --chown=credit_user:credit_group . /app/backend

# Switch to the non-root user
USER credit_user

# Expose API port
EXPOSE 8000

# Health check to ensure API responsiveness
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# Start FastAPI via uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
