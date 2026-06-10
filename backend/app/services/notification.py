from sqlalchemy.orm import Session

from app.models.review import Notification
from app.utils.firebase import send_push_notification


def create_notification(
    db: Session,
    user_id: str,
    title: str,
    body: str,
    notification_type: str,
    deep_link: str = None,
    fcm_token: str = None,
) -> Notification:
    """Persist a notification and optionally send FCM push."""
    notif = Notification(
        user_id=user_id,
        type=notification_type,
        title=title,
        body=body,
        deep_link=deep_link,
    )
    db.add(notif)
    db.flush()

    # Send push if FCM token is provided
    if fcm_token:
        send_push_notification(
            fcm_token=fcm_token,
            title=title,
            body=body,
            data={"type": notification_type, "deep_link": deep_link or ""},
        )

    return notif


def notify_booking_confirmed(db: Session, booking, customer_fcm: str = None):
    create_notification(
        db=db,
        user_id=str(booking.customer_id),
        title="Booking Confirmed! 🙏",
        body=f"Your pandit has accepted the booking. Get ready for your puja.",
        notification_type="BOOKING_CONFIRMED",
        deep_link=f"panditji://bookings/{booking.id}",
        fcm_token=customer_fcm,
    )


def notify_pandit_late(db: Session, booking, customer_fcm: str = None):
    create_notification(
        db=db,
        user_id=str(booking.customer_id),
        title="Your pandit is running late",
        body="We're monitoring this and have notified the pandit.",
        notification_type="PANDIT_LATE",
        deep_link=f"panditji://bookings/{booking.id}/track",
        fcm_token=customer_fcm,
    )


def notify_puja_completed(db: Session, booking, customer_fcm: str = None):
    create_notification(
        db=db,
        user_id=str(booking.customer_id),
        title="Puja Completed 🕉️",
        body="Please rate your pandit and share your experience.",
        notification_type="PUJA_COMPLETED",
        deep_link=f"panditji://bookings/{booking.id}/review",
        fcm_token=customer_fcm,
    )
