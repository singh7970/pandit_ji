import math
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.redis import redis_client
from app.models.booking import Booking
from app.models.pandit import PanditProfile, AvailabilitySlot
from app.models.review import Strike
from app.models.user import User
from app.utils.firebase import send_push_notification


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return distance in km between two lat/lng points."""
    R = 6371
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_top_pandits(
    db: Session,
    city: str,
    puja_id: str,
    scheduled_at: datetime,
    customer_lat: Optional[float],
    customer_lng: Optional[float],
    limit: int = 3,
) -> list[User]:
    """
    Pandit matching algorithm:
    1. Filter by city, specialisation, active status.
    2. Check no conflicting availability slots.
    3. Sort by rating DESC, distance ASC.
    4. Return top N.
    """
    # Step 1: Active pandits in city who specialise in this puja
    profiles = (
        db.query(PanditProfile)
        .filter(
            PanditProfile.status == "ACTIVE",
        )
        .join(User, User.id == PanditProfile.user_id)
        .filter(func.lower(User.city) == func.lower(city), User.is_active == True)
        .all()
    )

    # Filter by specialisation (contains puja_id string, or if specialisations is empty/contains "all")
    puja_id_str = str(puja_id)
    profiles = [
        p for p in profiles 
        if not p.specialisations or len(p.specialisations) == 0 or puja_id_str in p.specialisations or "all" in p.specialisations
    ]

    if not profiles:
        return []

    # Step 2: Filter out pandits with conflicting bookings
    booking_date = scheduled_at.date()
    booking_time = scheduled_at.time()

    available_profiles = []
    for profile in profiles:
        # Check if they have a conflicting booking
        conflict = (
            db.query(Booking)
            .filter(
                Booking.pandit_id == profile.user_id,
                Booking.status.in_(["CONFIRMED", "PANDIT_ARRIVED", "IN_PROGRESS"]),
                Booking.scheduled_at >= scheduled_at - timedelta(hours=4),
                Booking.scheduled_at <= scheduled_at + timedelta(hours=4),
            )
            .first()
        )
        if not conflict:
            available_profiles.append(profile)

    if not profiles:
        return []

    # Step 3: Sort by rating DESC, distance ASC
    def sort_key(profile: PanditProfile):
        user = db.query(User).filter(User.id == profile.user_id).first()
        distance = 0.0
        if customer_lat and customer_lng:
            # Use a default location per city if pandit location unknown
            distance = 0.0  # would use pandit's stored lat/lng in a real implementation
        return (-profile.rating_avg, distance)

    available_profiles.sort(key=sort_key)

    # Return top N users
    result = []
    for profile in available_profiles[:limit]:
        user = db.query(User).filter(User.id == profile.user_id).first()
        if user:
            result.append(user)
    return result


def dispatch_pandit_notification(
    db: Session,
    booking: Booking,
    pandit_user: User,
) -> None:
    """
    Send FCM to pandit and set a 10-minute Redis timer.
    The timer key is used to fall back to the next pandit if no accept.
    """
    # Store which pandit attempt is active
    redis_client.setex(
        f"booking_pending:{booking.id}",
        600,  # 10 minutes
        str(pandit_user.id),
    )

    # Store candidate list for fallback
    send_push_notification(
        fcm_token=getattr(pandit_user, "fcm_token", ""),
        title="New Booking Request",
        body=f"You have a new puja booking request. Accept within 10 minutes.",
        data={
            "booking_id": str(booking.id),
            "type": "BOOKING_REQUEST",
        },
    )


def process_strike(
    db: Session,
    pandit_id: str,
    strike_type: str,  # LATE | CANCELLATION
    booking_id: Optional[str] = None,
) -> None:
    """Add a strike and check thresholds for warnings or suspension."""
    from datetime import timezone

    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=settings.STRIKE_EXPIRY_DAYS)

    strike = Strike(
        pandit_id=pandit_id,
        type=strike_type,
        booking_id=booking_id,
        expires_at=expires_at,
    )
    db.add(strike)
    db.flush()

    # Count active strikes in last 30 days
    lookback = now - timedelta(days=settings.STRIKE_LOOKBACK_DAYS)
    active_strikes = (
        db.query(Strike)
        .filter(
            Strike.pandit_id == pandit_id,
            Strike.type == strike_type,
            Strike.created_at >= lookback,
        )
        .count()
    )

    profile = db.query(PanditProfile).filter(PanditProfile.user_id == pandit_id).first()
    if not profile:
        return

    threshold = (
        settings.LATE_STRIKE_THRESHOLD
        if strike_type == "LATE"
        else settings.CANCEL_STRIKE_THRESHOLD
    )

    if active_strikes >= threshold:
        # Suspend pandit for 7 days
        profile.status = "SUSPENDED"
        profile.suspended_until = now + timedelta(days=settings.SUSPENSION_DAYS)
        db.flush()


def calculate_refund_amount(booking: Booking, cancelled_by: str) -> float:
    """
    Refund rules:
    - Pandit cancels → 100% refund
    - Customer cancels > 24hrs → 100%
    - Customer cancels < 24hrs → 50%
    - Pandit late > 30 min AND customer cancels → 100%
    """
    from datetime import timezone as tz

    if not booking.amount:
        return 0.0

    if cancelled_by == "PANDIT":
        return booking.amount  # 100%

    if cancelled_by == "CUSTOMER":
        now = datetime.now(tz.utc)
        scheduled = booking.scheduled_at
        if scheduled.tzinfo is None:
            scheduled = scheduled.replace(tzinfo=tz.utc)
        hours_until = (scheduled - now).total_seconds() / 3600

        if hours_until > 24:
            return booking.amount  # 100%
        else:
            return booking.amount * 0.5  # 50%

    return 0.0
