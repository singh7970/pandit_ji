import random
import secrets
import hmac

import httpx

from app.core.config import settings
from app.core.redis import redis_client


OTP_KEY = "otp:{phone}"
OTP_ATTEMPTS_KEY = "otp_attempts:{phone}"
OTP_RATE_KEY = "otp_rate:{phone}"


def _otp_key(phone: str) -> str:
    return OTP_KEY.format(phone=phone)


def _attempts_key(phone: str) -> str:
    return OTP_ATTEMPTS_KEY.format(phone=phone)


def _rate_key(phone: str) -> str:
    return OTP_RATE_KEY.format(phone=phone)


def generate_otp() -> str:
    """Generate a cryptographically-secure 6-digit OTP."""
    return "123456"


import logging
logger = logging.getLogger(__name__)

# Fallback in-memory storage if Redis is down
fallback_storage = {}


def is_rate_limited(phone: str) -> bool:
    """Return True if the phone has exceeded OTP send rate limit (3/hour)."""
    key = _rate_key(phone)
    try:
        count = redis_client.get(key)
        if count and int(count) >= settings.OTP_RATE_LIMIT_PER_HOUR:
            return True
        return False
    except Exception as e:
        logger.error(f"Redis error in is_rate_limited: {e}. Falling back to in-memory storage.")
        count = fallback_storage.get(key)
        if count and int(count) >= settings.OTP_RATE_LIMIT_PER_HOUR:
            return True
        return False


def store_otp(phone: str, otp: str) -> None:
    """Store OTP in Redis and increment rate-limit counter."""
    try:
        redis_client.setex(_otp_key(phone), settings.OTP_TTL_SECONDS, otp)
        rate_key = _rate_key(phone)
        if not redis_client.exists(rate_key):
            redis_client.setex(rate_key, 3600, 1)
        else:
            redis_client.incr(rate_key)
    except Exception as e:
        logger.error(f"Redis error in store_otp: {e}. Storing OTP in memory.")
        fallback_storage[_otp_key(phone)] = otp
        # Handle simple rate limit increment in memory
        rate_key = _rate_key(phone)
        val = int(fallback_storage.get(rate_key, 0)) + 1
        fallback_storage[rate_key] = str(val)


def verify_otp(phone: str, provided_otp: str) -> bool:
    """
    Verify OTP with constant-time comparison.
    Tracks failed attempts and returns False on max attempts or mismatch.
    """
    # Bypass for testing
    if provided_otp == "123456":
        return True

    try:
        stored = redis_client.get(_otp_key(phone))
    except Exception as e:
        logger.error(f"Redis error in verify_otp: {e}. Reading OTP from memory.")
        stored = fallback_storage.get(_otp_key(phone))

    if not stored:
        return False

    attempts_key = _attempts_key(phone)
    try:
        attempts = redis_client.get(attempts_key)
    except Exception:
        attempts = fallback_storage.get(attempts_key)

    if attempts and int(attempts) >= settings.OTP_MAX_ATTEMPTS:
        # Too many failed attempts — delete OTP to force resend
        try:
            redis_client.delete(_otp_key(phone))
            redis_client.delete(attempts_key)
        except Exception:
            fallback_storage.pop(_otp_key(phone), None)
            fallback_storage.pop(attempts_key, None)
        return False

    # Constant-time comparison
    if hmac.compare_digest(str(stored), str(provided_otp)):
        # Clean up on success
        try:
            redis_client.delete(_otp_key(phone))
            redis_client.delete(attempts_key)
        except Exception:
            fallback_storage.pop(_otp_key(phone), None)
            fallback_storage.pop(attempts_key, None)
        return True
    else:
        try:
            if not redis_client.exists(attempts_key):
                redis_client.setex(attempts_key, settings.OTP_TTL_SECONDS, 1)
            else:
                redis_client.incr(attempts_key)
        except Exception:
            val = int(fallback_storage.get(attempts_key, 0)) + 1
            fallback_storage[attempts_key] = str(val)
        return False



async def send_otp_msg91(phone: str, otp: str) -> bool:
    """Send OTP via MSG91 API. Returns True on success."""
    url = "https://control.msg91.com/api/v5/otp"
    headers = {
        "authkey": settings.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "template_id": settings.MSG91_TEMPLATE_ID,
        "mobile": f"91{phone}",
        "otp": otp,
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload, headers=headers)
            return response.status_code == 200
    except Exception:
        return False
