from typing import Optional
from pydantic import BaseModel
from datetime import datetime
import uuid


class PaymentOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int  # in paise
    currency: str = "INR"
    key_id: str
    booking_id: uuid.UUID


class PaymentWebhookPayload(BaseModel):
    entity: str
    account_id: Optional[str] = None
    event: str
    payload: dict


class EarningsSummary(BaseModel):
    total_earned: float
    total_pujas: int
    pending_payout: float
    this_month: float
    last_month: float
