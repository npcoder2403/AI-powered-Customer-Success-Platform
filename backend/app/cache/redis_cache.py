import json
import redis

from app.database.config import settings

CUSTOMER_LIST_KEY_PREFIX = "customers:list:"

try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
except Exception:
    redis_client = None


def get_cached_customers(cache_key: str) -> dict | None:
    if not redis_client:
        return None
    try:
        data = redis_client.get(cache_key)
        if data:
            return json.loads(data)
    except Exception:
        pass
    return None


def set_cached_customers(cache_key: str, data: dict) -> None:
    if not redis_client:
        return
    try:
        redis_client.setex(cache_key, settings.CACHE_TTL, json.dumps(data, default=str))
    except Exception:
        pass


def invalidate_customer_cache() -> None:
    if not redis_client:
        return
    try:
        keys = redis_client.keys(f"{CUSTOMER_LIST_KEY_PREFIX}*")
        if keys:
            redis_client.delete(*keys)
    except Exception:
        pass


def build_customer_cache_key(page: int, page_size: int, search: str | None, industry: str | None, status: str | None) -> str:
    return f"{CUSTOMER_LIST_KEY_PREFIX}{page}:{page_size}:{search or ''}:{industry or ''}:{status or ''}"
