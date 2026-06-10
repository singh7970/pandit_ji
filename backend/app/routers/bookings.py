from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.puja import Puja
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse, BookingCancelRequest, ReviewCreate
from app.services.booking import (
    find_top_pandits,
    dispatch_pandit_notification,
    process_strike,
    calculate_refund_amount,
)
from app.services.notification import (
    notify_booking_confirmed,
    notify_puja_completed,
)
from app.services.payment import initiate_refund

router = APIRouter()


@router.post("/", response_model=BookingResponse, summary="Create a new booking")
def create_booking(
    body: BookingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Only customers can create bookings
    if current_user.role not in ("CUSTOMER", "ADMIN"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers only")

    puja = db.query(Puja).filter(Puja.id == body.puja_id, Puja.is_active == True).first()
    if not puja:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puja not found")

    booking = Booking(
        customer_id=current_user.id,
        puja_id=body.puja_id,
        city=body.city,
        address=body.address,
        lat=body.lat,
        lng=body.lng,
        scheduled_at=body.scheduled_at,
        kit_ordered=body.kit_ordered,
        amount=puja.base_price,
        status="PENDING",
    )
    db.add(booking)
    db.flush()

    # Find top pandit matches and dispatch notification in background
    candidates = find_top_pandits(
        db=db,
        city=body.city,
        puja_id=str(body.puja_id),
        scheduled_at=body.scheduled_at,
        customer_lat=body.lat,
        customer_lng=body.lng,
    )

    if candidates:
        booking.pandit_id = candidates[0].id
        background_tasks.add_task(dispatch_pandit_notification, db, booking, candidates[0])

    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my", response_model=List[BookingResponse], summary="Get my bookings")
def my_bookings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "CUSTOMER":
        bookings = db.query(Booking).filter(Booking.customer_id == current_user.id).order_by(Booking.created_at.desc()).all()
    elif current_user.role == "PANDIT":
        bookings = db.query(Booking).filter(Booking.pandit_id == current_user.id).order_by(Booking.created_at.desc()).all()
    else:
        bookings = db.query(Booking).order_by(Booking.created_at.desc()).all()
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse, summary="Get booking detail")
def get_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    # Authorization: only the customer, pandit, or admin can view
    if current_user.role == "ADMIN":
        pass
    elif str(booking.customer_id) != str(current_user.id) and str(booking.pandit_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return booking


@router.put("/{booking_id}/accept", response_model=BookingResponse, summary="Pandit accepts booking")
def accept_booking(
    booking_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "PANDIT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pandits only")
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if str(booking.pandit_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your booking")
    if booking.status != "PENDING":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Booking is not pending")
    booking.status = "CONFIRMED"
    db.commit()
    db.refresh(booking)
    background_tasks.add_task(notify_booking_confirmed, db, booking)
    return booking


@router.put("/{booking_id}/decline", response_model=BookingResponse, summary="Pandit declines booking")
def decline_booking(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "PANDIT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pandits only")
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or str(booking.pandit_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    # Reset to pending for re-matching
    booking.pandit_id = None
    booking.status = "PENDING"
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/arrived", response_model=BookingResponse, summary="Pandit marks arrived")
def mark_arrived(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = _get_pandit_booking(booking_id, current_user, db)
    _transition_booking(booking, "CONFIRMED", "PANDIT_ARRIVED")
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/start", response_model=BookingResponse, summary="Start puja")
def start_puja(
    booking_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = _get_pandit_booking(booking_id, current_user, db)
    _transition_booking(booking, "PANDIT_ARRIVED", "IN_PROGRESS")
    db.commit()
    db.refresh(booking)
    return booking


@router.put("/{booking_id}/complete", response_model=BookingResponse, summary="Complete puja")
def complete_puja(
    booking_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = _get_pandit_booking(booking_id, current_user, db)
    _transition_booking(booking, "IN_PROGRESS", "COMPLETED")

    # Calculate payout
    if booking.amount:
        booking.platform_fee = booking.amount * settings.PLATFORM_FEE_PERCENT
        booking.pandit_payout = booking.amount - booking.platform_fee

    db.commit()
    db.refresh(booking)
    background_tasks.add_task(notify_puja_completed, db, booking)
    return booking


@router.put("/{booking_id}/cancel", response_model=BookingResponse, summary="Cancel booking")
def cancel_booking(
    booking_id: str,
    body: BookingCancelRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")

    if booking.status in ("COMPLETED", "CANCELLED"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot cancel this booking")

    cancelled_by = current_user.role  # CUSTOMER | PANDIT | ADMIN
    refund_amount = calculate_refund_amount(booking, cancelled_by)

    booking.status = "CANCELLED"
    booking.cancel_reason = body.reason
    booking.cancelled_by = cancelled_by

    # Issue refund if payment exists
    if booking.payment and booking.payment.status == "PAID" and refund_amount > 0:
        refund_paise = int(refund_amount * 100)
        initiate_refund(booking.payment.razorpay_payment_id, refund_paise)
        booking.payment.status = "REFUNDED"
        booking.payment.refund_amount = refund_amount

    # Add cancellation strike if pandit cancelled
    if cancelled_by == "PANDIT":
        process_strike(db, str(booking.pandit_id), "CANCELLATION", str(booking.id))

    db.commit()
    db.refresh(booking)
    return booking


# ─── Helpers ─────────────────────────────────────────────────────────────────

def _get_pandit_booking(booking_id: str, current_user: User, db: Session) -> Booking:
    if current_user.role != "PANDIT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pandits only")
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking or str(booking.pandit_id) != str(current_user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    return booking


def _transition_booking(booking: Booking, expected_status: str, new_status: str) -> None:
    if booking.status != expected_status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status transition: {booking.status} → {new_status}",
        )
    booking.status = new_status
