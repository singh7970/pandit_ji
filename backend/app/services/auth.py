from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.redis import redis_client
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.models.user import User
from app.schemas.user import TokenResponse, UserResponse


def get_or_create_user(db: Session, phone: str, name: str = None, role: str = None) -> User:
    """Return existing user or create a new one."""
    user = db.query(User).filter(User.phone == phone).first()
    if not user:
        db_role = role or "CUSTOMER"
        user = User(phone=phone, name=name, role=db_role)
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        updated = False
        if name and not user.name:
            user.name = name
            updated = True
        if role and user.role != role:
            user.role = role
            updated = True
        if updated:
            db.commit()
            db.refresh(user)
    return user


def create_tokens(user: User) -> TokenResponse:
    """Generate access + refresh JWT tokens for a user."""
    data = {"sub": str(user.id), "role": user.role, "phone": user.phone}
    access = create_access_token(data)
    refresh = create_refresh_token(data)
    return TokenResponse(
        access_token=access,
        refresh_token=refresh,
        user=UserResponse.from_orm(user),
    )


def refresh_access_token(refresh_token: str, db: Session) -> TokenResponse:
    """Verify a refresh token and return a new access token."""
    from fastapi import HTTPException, status

    payload = decode_token(refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    # Check not blacklisted
    if redis_client.exists(f"blacklist:{refresh_token}"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    user = db.query(User).filter(User.id == payload.get("sub"), User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return create_tokens(user)


def blacklist_token(token: str, expire_seconds: int = None) -> None:
    """Add a token to the Redis blacklist."""
    ttl = expire_seconds or (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    redis_client.setex(f"blacklist:{token}", ttl, "1")
