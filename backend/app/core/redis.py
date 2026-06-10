import redis
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class MockRedis:
    def __init__(self):
        self.data = {}
        logger.warning("Initializing Mock In-Memory Redis client because Redis is offline/uninstalled")

    def get(self, key):
        return self.data.get(key)

    def setex(self, key, time, value):
        self.data[key] = str(value)

    def delete(self, key):
        if key in self.data:
            del self.data[key]

    def exists(self, key):
        return key in self.data

    def incr(self, key):
        val = int(self.data.get(key, 0)) + 1
        self.data[key] = str(val)
        return val

try:
    redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    redis_client.ping()
except Exception:
    redis_client = MockRedis()

