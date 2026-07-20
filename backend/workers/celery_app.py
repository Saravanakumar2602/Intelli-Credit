import os
from celery import Celery
from backend.core.config import settings

# Create Celery instance
celery_app = Celery(
    "intelli_credit_workers",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["backend.tasks.analysis_task"]
)

# Celery Configuration
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="Asia/Kolkata",
    enable_utc=True,
    # Fallback to local synchronous execution if CELERY_ALWAYS_EAGER is enabled
    task_always_eager=os.getenv("CELERY_ALWAYS_EAGER", "false").lower() == "true",
    task_track_started=True,
    result_expires=86400, # 24 hours
)

if __name__ == "__main__":
    celery_app.start()
