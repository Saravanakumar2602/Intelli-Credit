import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, Response

# Simple In-Memory Prometheus Metrics Collector
# Avoids heavy prometheus-client installs while providing identical metric structure
METRICS = {
    "http_requests_total": {}, # {(method, path, status): count}
    "http_request_duration_seconds_sum": {},
    "db_queries_total": 0,
    "llm_requests_total": 0,
}

# Set up structured logging format
logging.basicConfig(
    level=logging.INFO,
    format='{"timestamp": "%(asctime)s", "level": "%(levelname)s", "request_id": "%(request_id)s", "message": "%(message)s"}',
    datefmt='%Y-%m-%dT%H:%M:%S'
)

class ObservabilityLoggerAdapter(logging.LoggerAdapter):
    """Logger adapter to implicitly pass request_id context"""
    def process(self, msg, kwargs):
        kwargs["extra"] = {"request_id": self.extra.get("request_id", "GLOBAL")}
        return msg, kwargs

def get_logger(request_id: str = "GLOBAL") -> ObservabilityLoggerAdapter:
    logger = logging.getLogger("intelli_credit")
    return ObservabilityLoggerAdapter(logger, {"request_id": request_id})

class ObservabilityMiddleware(BaseHTTPMiddleware):
    """
    Middleware to:
    1. Attach request ID to headers
    2. Log request/response start, duration, and status code
    3. Increment Prometheus counts
    """
    async def dispatch(self, request: Request, call_next):
        # Retrieve or generate Request ID
        req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        request.state.request_id = req_id
        
        logger = get_logger(req_id)
        start_time = time.time()
        
        logger.info(f"Incoming Request: {request.method} {request.url.path}")
        
        try:
            response: Response = await call_next(request)
        except Exception as e:
            # Handle and log unexpected server crash
            duration = time.time() - start_time
            logger.error(f"Request Failed: {request.method} {request.url.path} - Exception: {e}")
            raise e
            
        duration = time.time() - start_time
        response.headers["X-Request-ID"] = req_id
        
        logger.info(f"Response: {request.method} {request.url.path} - Status: {response.status_code} - Duration: {duration:.4f}s")
        
        # Accumulate metrics
        key = (request.method, request.url.path, str(response.status_code))
        METRICS["http_requests_total"][key] = METRICS["http_requests_total"].get(key, 0) + 1
        METRICS["http_request_duration_seconds_sum"][key] = METRICS["http_request_duration_seconds_sum"].get(key, 0.0) + duration
        
        return response

def get_prometheus_metrics() -> str:
    """Format in-memory metric dictionaries into Prometheus registry format string"""
    lines = []
    
    # HTTP requests total
    lines.append("# HELP http_requests_total Total HTTP requests handled.")
    lines.append("# TYPE http_requests_total counter")
    for (method, path, status), count in METRICS["http_requests_total"].items():
        lines.append(f'http_requests_total{{method="{method}",path="{path}",status="{status}"}} {count}')
        
    # HTTP duration
    lines.append("# HELP http_request_duration_seconds_sum Sum of HTTP request duration.")
    lines.append("# TYPE http_request_duration_seconds_sum summary")
    for (method, path, status), val in METRICS["http_request_duration_seconds_sum"].items():
        lines.append(f'http_request_duration_seconds_sum{{method="{method}",path="{path}",status="{status}"}} {val:.6f}')
        
    # DB Queries
    lines.append("# HELP db_queries_total Total DB transactions executed.")
    lines.append("# TYPE db_queries_total counter")
    lines.append(f'db_queries_total {METRICS["db_queries_total"]}')
    
    # LLM requests
    lines.append("# HELP llm_requests_total Total LLM calls completed.")
    lines.append("# TYPE llm_requests_total counter")
    lines.append(f'llm_requests_total {METRICS["llm_requests_total"]}')
    
    return "\n".join(lines)
