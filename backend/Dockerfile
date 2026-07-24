FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    tesseract-ocr \
    tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g 10001 credit_group && \
    useradd -u 10001 -g credit_group -m -s /bin/bash credit_user

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

RUN mkdir -p /app/backend /app/uploads

COPY --chown=credit_user:credit_group . /app/backend

RUN chown -R credit_user:credit_group /app

USER credit_user

EXPOSE 8000

HEALTHCHECK --interval=30s \
            --timeout=10s \
            --start-period=20s \
            --retries=3 \
CMD curl -fs http://localhost:8000/ || exit 1

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
