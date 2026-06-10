from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/panditji"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # JWT
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # MSG91 (OTP)
    MSG91_AUTH_KEY: str = ""
    MSG91_TEMPLATE_ID: str = ""

    # Razorpay
    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""
    RAZORPAY_WEBHOOK_SECRET: str = ""

    # Firebase
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"
    FIREBASE_REALTIME_DB_URL: str = ""

    # AWS S3
    AWS_ACCESS_KEY_ID: str = ""
    AWS_SECRET_ACCESS_KEY: str = ""
    AWS_S3_BUCKET: str = "panditji-uploads"
    AWS_REGION: str = "ap-south-1"

    # App
    APP_ENV: str = "development"
    DEBUG: bool = True

    # OTP Settings
    OTP_RATE_LIMIT_PER_HOUR: int = 3
    OTP_MAX_ATTEMPTS: int = 5
    OTP_TTL_SECONDS: int = 600

    # Platform fee
    PLATFORM_FEE_PERCENT: float = 0.18

    # Strike thresholds
    LATE_STRIKE_THRESHOLD: int = 3
    CANCEL_STRIKE_THRESHOLD: int = 3
    STRIKE_LOOKBACK_DAYS: int = 30
    STRIKE_EXPIRY_DAYS: int = 90
    SUSPENSION_DAYS: int = 7

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
