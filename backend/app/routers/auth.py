from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import security, get_current_user
from app.schemas.user import SendOTPRequest, VerifyOTPRequest, TokenResponse, RefreshRequest
from app.services.auth import get_or_create_user, create_tokens, refresh_access_token, blacklist_token
from app.utils.otp import (
    generate_otp,
    is_rate_limited,
    store_otp,
    verify_otp,
    send_otp_msg91,
)

router = APIRouter()


@router.post("/send-otp", summary="Send OTP to phone number")
async def send_otp(
    body: SendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if is_rate_limited(body.phone):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Try again in 1 hour.",
        )

    # Check user registration status based on mode
    if body.mode:
        from app.models.user import User
        user = db.query(User).filter(User.phone == body.phone).first()
        if body.mode == "signup" and user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number is already registered. Please login instead.",
            )
        elif body.mode == "login" and not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mobile number is not registered. Please sign up first.",
            )

    otp = generate_otp()
    store_otp(body.phone, otp)

    # Send SMS in background to avoid blocking the response
    background_tasks.add_task(send_otp_msg91, body.phone, otp)

    return {"message": "OTP sent successfully", "phone": body.phone}


@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP and get JWT tokens")
def verify_otp_endpoint(body: VerifyOTPRequest, db: Session = Depends(get_db)):
    if not verify_otp(body.phone, body.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    user = get_or_create_user(db, body.phone, body.name, body.role)
    return create_tokens(user)


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
def refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    return refresh_access_token(body.refresh_token, db)


@router.post("/logout", summary="Logout and blacklist token")
def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    current_user=Depends(get_current_user),
):
    blacklist_token(credentials.credentials)
    return {"message": "Logged out successfully"}
