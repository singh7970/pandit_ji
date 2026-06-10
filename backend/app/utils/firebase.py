import firebase_admin
from firebase_admin import credentials, messaging, db as realtime_db

from app.core.config import settings

_firebase_app = None


def init_firebase():
    """Initialize Firebase Admin SDK (idempotent)."""
    global _firebase_app
    if _firebase_app is None:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        _firebase_app = firebase_admin.initialize_app(
            cred,
            {"databaseURL": settings.FIREBASE_REALTIME_DB_URL},
        )
    return _firebase_app


def send_push_notification(
    fcm_token: str,
    title: str,
    body: str,
    data: dict = None,
) -> bool:
    """Send a single FCM push notification. Returns True on success."""
    init_firebase()
    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data={str(k): str(v) for k, v in (data or {}).items()},
        token=fcm_token,
        android=messaging.AndroidConfig(priority="high"),
        apns=messaging.APNSConfig(
            headers={"apns-priority": "10"},
        ),
    )
    try:
        messaging.send(message)
        return True
    except Exception:
        return False


def send_multicast_notification(
    fcm_tokens: list[str],
    title: str,
    body: str,
    data: dict = None,
) -> dict:
    """Send FCM to multiple tokens. Returns success/failure counts."""
    init_firebase()
    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=title, body=body),
        data={str(k): str(v) for k, v in (data or {}).items()},
        tokens=fcm_tokens,
        android=messaging.AndroidConfig(priority="high"),
    )
    try:
        response = messaging.send_each_for_multicast(message)
        return {"success": response.success_count, "failure": response.failure_count}
    except Exception as e:
        return {"success": 0, "failure": len(fcm_tokens), "error": str(e)}


def update_pandit_location(pandit_id: str, lat: float, lng: float) -> None:
    """Push pandit GPS coords to Firebase Realtime DB for live tracking."""
    init_firebase()
    ref = realtime_db.reference(f"locations/{pandit_id}")
    ref.set({"lat": lat, "lng": lng, "updated_at": {".sv": "timestamp"}})


def get_pandit_location(pandit_id: str) -> dict:
    """Fetch pandit's last known location from Firebase Realtime DB."""
    init_firebase()
    ref = realtime_db.reference(f"locations/{pandit_id}")
    return ref.get() or {}
