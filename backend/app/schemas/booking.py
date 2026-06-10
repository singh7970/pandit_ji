from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, date, time
import uuid


class BookingCreate(BaseModel):
    puja_id: uuid.UUID
    city: str
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    scheduled_at: datetime
    kit_ordered: bool = False


class BookingResponse(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    pandit_id: Optional[uuid.UUID] = None
    puja_id: uuid.UUID
    city: str
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    scheduled_at: datetime
    status: str
    amount: Optional[float] = None
    platform_fee: Optional[float] = None
    pandit_payout: Optional[float] = None
    kit_ordered: bool
    cancel_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BookingCancelRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=500)


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class AvailabilitySlotCreate(BaseModel):
    date: date
    start_time: time
    end_time: time
    is_available: bool = True


class AvailabilitySlotResponse(AvailabilitySlotCreate):
    id: uuid.UUID
    pandit_id: uuid.UUID

    class Config:
        from_attributes = True
