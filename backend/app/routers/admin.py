from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.booking import Booking
from app.models.pandit import PanditProfile
from app.models.payment import Payment
from app.models.user import User
from app.utils.firebase import send_multicast_notification

router = APIRouter()


def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user


@router.get("/pandits/queue", summary="Pending pandit applications queue")
def pandit_queue(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    profiles = (
        db.query(PanditProfile)
        .filter(PanditProfile.status == "PENDING")
        .order_by(PanditProfile.created_at.asc())
        .all()
    )
    result = []
    for p in profiles:
        user = db.query(User).filter(User.id == p.user_id).first()
        result.append({"profile": p, "user": user})
    return result


@router.put("/pandits/{pandit_id}/approve", summary="Approve pandit application")
def approve_pandit(
    pandit_id: str,
    tier: str = Query("VERIFIED", enum=["VERIFIED", "SILVER", "GOLD"]),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    profile = db.query(PanditProfile).filter(PanditProfile.user_id == pandit_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    profile.status = "ACTIVE"
    profile.tier = tier
    db.commit()
    return {"message": f"Pandit approved with tier {tier}"}


@router.put("/pandits/{pandit_id}/reject", summary="Reject pandit application")
def reject_pandit(
    pandit_id: str,
    reason: str = Query(...),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    profile = db.query(PanditProfile).filter(PanditProfile.user_id == pandit_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    profile.status = "REJECTED"
    profile.rejection_reason = reason
    db.commit()
    return {"message": "Pandit application rejected"}


@router.get("/bookings", summary="All bookings with filters (admin)")
def all_bookings(
    status_filter: Optional[str] = Query(None, alias="status"),
    city: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    query = db.query(Booking)
    if status_filter:
        query = query.filter(Booking.status == status_filter)
    if city:
        query = query.filter(Booking.city == city)
    total = query.count()
    bookings = query.order_by(Booking.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return {"items": bookings, "total": total, "page": page, "size": size}


@router.get("/analytics", summary="Platform KPI analytics")
def analytics(
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    total_bookings = db.query(Booking).count()
    completed = db.query(Booking).filter(Booking.status == "COMPLETED").count()
    total_customers = db.query(User).filter(User.role == "CUSTOMER").count()
    total_pandits = db.query(PanditProfile).filter(PanditProfile.status == "ACTIVE").count()
    pending_pandits = db.query(PanditProfile).filter(PanditProfile.status == "PENDING").count()

    gmv_result = db.query(func.sum(Booking.amount)).filter(Booking.status == "COMPLETED").scalar()
    gmv = float(gmv_result or 0)

    # Revenue (platform fee)
    revenue_result = db.query(func.sum(Booking.platform_fee)).filter(Booking.status == "COMPLETED").scalar()
    revenue = float(revenue_result or 0)

    return {
        "gmv": gmv,
        "revenue": revenue,
        "total_bookings": total_bookings,
        "completed_bookings": completed,
        "total_customers": total_customers,
        "active_pandits": total_pandits,
        "pending_pandits": pending_pandits,
        "completion_rate": round(completed / total_bookings * 100, 1) if total_bookings else 0,
    }


@router.post("/notifications/broadcast", summary="Broadcast FCM push to all users")
def broadcast_notification(
    title: str,
    body: str,
    target_role: Optional[str] = Query(None, enum=["CUSTOMER", "PANDIT", "ALL"]),
    db: Session = Depends(get_db),
    _: User = Depends(_require_admin),
):
    query = db.query(User).filter(User.is_active == True)
    if target_role and target_role != "ALL":
        query = query.filter(User.role == target_role)
    users = query.all()

    # In a real app, store FCM tokens on the User model
    # For now we return the count of users targeted
    return {
        "message": f"Broadcast sent to {len(users)} users",
        "title": title,
        "body": body,
    }
