import hmac
import hashlib
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User
from app.schemas.payment import PaymentOrderResponse, EarningsSummary
from app.services.payment import create_razorpay_order, initiate_refund

router = APIRouter()


@router.post("/create-order", response_model=PaymentOrderResponse, summary="Create Razorpay order")
def create_order(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if str(booking.customer_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")

    order = create_razorpay_order(booking.amount or 0, str(booking.id))

    # Create/update payment record
    payment = booking.payment
    if not payment:
        payment = Payment(booking_id=booking.id, amount=booking.amount or 0)
        db.add(payment)
    payment.razorpay_order_id = order["id"]
    payment.status = "CREATED"
    db.commit()

    return PaymentOrderResponse(
        razorpay_order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=settings.RAZORPAY_KEY_ID,
        booking_id=booking.id,
    )


@router.post("/webhook", summary="Razorpay webhook handler")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    body = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")

    # Verify webhook signature
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")

    import json
    payload = json.loads(body)
    event = payload.get("event")

    if event == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        payment = db.query(Payment).filter(Payment.razorpay_order_id == order_id).first()
        if payment:
            payment.razorpay_payment_id = payment_id
            payment.status = "PAID"
            db.commit()

    elif event == "payment.failed":
        order_id = payload["payload"]["payment"]["entity"].get("order_id")
        payment = db.query(Payment).filter(Payment.razorpay_order_id == order_id).first()
        if payment:
            payment.status = "FAILED"
            db.commit()

    return {"status": "ok"}


@router.post("/refund/{booking_id}", summary="Issue refund for booking")
def refund_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or not booking.payment or booking.payment.status != "PAID":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Paid payment not found")

    refund = initiate_refund(
        booking.payment.razorpay_payment_id,
        int(booking.amount * 100),
    )
    booking.payment.status = "REFUNDED"
    booking.payment.razorpay_refund_id = refund.get("id")
    db.commit()
    return {"message": "Refund initiated", "refund_id": refund.get("id")}


@router.get("/earnings", response_model=EarningsSummary, summary="Pandit earnings summary")
def earnings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "PANDIT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pandits only")

    from datetime import datetime, timezone, timedelta
    from sqlalchemy import func

    completed = (
        db.query(Booking)
        .filter(Booking.pandit_id == current_user.id, Booking.status == "COMPLETED")
        .all()
    )

    now = datetime.now(timezone.utc)
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)

    total = sum(b.pandit_payout or 0 for b in completed)
    this_month = sum(
        b.pandit_payout or 0 for b in completed
        if b.created_at and b.created_at.replace(tzinfo=timezone.utc) >= this_month_start
    )
    last_month = sum(
        b.pandit_payout or 0 for b in completed
        if b.created_at and last_month_start <= b.created_at.replace(tzinfo=timezone.utc) < this_month_start
    )

    return EarningsSummary(
        total_earned=total,
        total_pujas=len(completed),
        pending_payout=0.0,  # Adjust when Razorpay Route is integrated
        this_month=this_month,
        last_month=last_month,
    )
