"""
Customer Authentication Router
Uses the separate `customers` table — completely independent from pandit `users` table.
Same phone can exist in both tables without any conflict.
"""
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.models.customer import Customer
from app.utils.otp import generate_otp, is_rate_limited, store_otp, verify_otp, send_otp_msg91

router = APIRouter()


class CustomerSendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    mode: Optional[str] = Field(None, description="login or signup")


class CustomerVerifyOTPRequest(BaseModel):
    phone: str
    otp: str
    name: Optional[str] = None
    city: Optional[str] = None


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/send-otp", summary="Send OTP for Customer app")
async def customer_send_otp(
    body: CustomerSendOTPRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    # Check customer table only — no conflict with pandit users table
    customer = db.query(Customer).filter(Customer.phone == body.phone).first()

    if body.mode == "signup" and customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mobile number is already registered as a Customer. Please login instead.",
        )
    if body.mode == "login" and not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mobile number is not registered. Please sign up first.",
        )

    # Rate limiting
    if is_rate_limited(f"customer:{body.phone}"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many OTP requests. Try again in 1 hour.",
        )

    otp = generate_otp()
    store_otp(f"customer:{body.phone}", otp)
    background_tasks.add_task(send_otp_msg91, body.phone, otp)

    return {"message": "OTP sent successfully", "phone": body.phone}


@router.post("/verify-otp", summary="Verify OTP and get Customer JWT tokens")
def customer_verify_otp(body: CustomerVerifyOTPRequest, db: Session = Depends(get_db)):
    if not verify_otp(f"customer:{body.phone}", body.otp):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP",
        )

    # Get or create customer in the customers table
    customer = db.query(Customer).filter(Customer.phone == body.phone).first()
    if not customer:
        if not body.name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Name is required for new customer registration.",
            )
        customer = Customer(
            phone=body.phone,
            name=body.name,
            city=body.city or "",
            is_active=True,
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)
    else:
        # Update name/city if provided on re-login
        if body.name and not customer.name:
            customer.name = body.name
        if body.city and not customer.city:
            customer.city = body.city
        db.commit()
        db.refresh(customer)

    # Create JWT using customer ID as subject
    token_data = {"sub": str(customer.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(customer.id),
            "phone": customer.phone,
            "name": customer.name,
            "city": customer.city,
            "role": "CUSTOMER",
            "is_active": customer.is_active,
        },
    }


@router.post("/refresh", summary="Refresh customer access token")
def customer_refresh_token(body: RefreshRequest, db: Session = Depends(get_db)):
    from fastapi import HTTPException, status
    from app.core.redis import redis_client
    from app.core.security import decode_token

    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    # Check not blacklisted
    if redis_client.exists(f"blacklist:{body.refresh_token}"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token revoked")

    customer = db.query(Customer).filter(Customer.id == payload.get("sub"), Customer.is_active == True).first()
    if not customer:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Customer not found")

    token_data = {"sub": str(customer.id)}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": str(customer.id),
            "phone": customer.phone,
            "name": customer.name,
            "city": customer.city,
            "role": "CUSTOMER",
            "is_active": customer.is_active,
        },
    }

