from typing import List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.pandit import PanditProfile, AvailabilitySlot
from app.models.user import User
from app.schemas.booking import AvailabilitySlotCreate, AvailabilitySlotResponse
from app.services.booking import find_top_pandits
from app.utils.s3 import upload_file

from pydantic import BaseModel

class PanditApplyRequest(BaseModel):
    sampraday: str
    specialisations: List[str]
    languages: List[str]
    experience_years: int
    bio: str = ""
    photo_url: Optional[str] = None
    document_urls: Optional[List[str]] = None

router = APIRouter()


@router.post("/apply", summary="Submit pandit application with documents")
async def apply_as_pandit(
    body: PanditApplyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role not in ("CUSTOMER", "PANDIT"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid role")

    # Check if profile already exists
    existing = db.query(PanditProfile).filter(PanditProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Application already submitted")

    profile = PanditProfile(
        user_id=current_user.id,
        sampraday=body.sampraday,
        specialisations=body.specialisations,
        languages=body.languages,
        experience_years=body.experience_years,
        bio=body.bio,
        photo_url=body.photo_url,
        document_urls=body.document_urls or [],
        status="PENDING",
    )
    db.add(profile)

    # Update user role
    current_user.role = "PANDIT"
    db.commit()
    db.refresh(profile)

    return {"message": "Application submitted. Under review.", "profile_id": str(profile.id)}


@router.get("/available", summary="Get available pandits for a booking")
def get_available_pandits(
    city: str = Query(...),
    puja_id: str = Query(...),
    scheduled_at: str = Query(...),  # ISO datetime string
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    from datetime import datetime
    try:
        scheduled = datetime.fromisoformat(scheduled_at)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid datetime format")

    pandits = find_top_pandits(db, city, puja_id, scheduled, lat, lng)

    result = []
    for pandit in pandits:
        profile = db.query(PanditProfile).filter(PanditProfile.user_id == pandit.id).first()
        result.append({
            "user_id": str(pandit.id),
            "name": pandit.name,
            "city": pandit.city,
            "profile": {
                "tier": profile.tier if profile else "VERIFIED",
                "rating_avg": profile.rating_avg if profile else 0.0,
                "total_pujas": profile.total_pujas if profile else 0,
                "specialisations": profile.specialisations if profile else [],
                "languages": profile.languages if profile else [],
                "photo_url": profile.photo_url if profile else None,
            },
        })
    return result


@router.get("/{pandit_id}", summary="Get pandit public profile")
def get_pandit(pandit_id: str, db: Session = Depends(get_db)):
    profile = db.query(PanditProfile).filter(PanditProfile.user_id == pandit_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pandit profile not found")

    user = db.query(User).filter(User.id == pandit_id).first()
    from app.models.review import Review
    reviews = (
        db.query(Review)
        .filter(Review.pandit_id == pandit_id)
        .order_by(Review.created_at.desc())
        .limit(10)
        .all()
    )

    return {
        "user_id": str(user.id),
        "name": user.name,
        "city": user.city,
        "profile": profile,
        "reviews": reviews,
    }


@router.put("/me", summary="Update own pandit profile")
def update_pandit_profile(
    bio: Optional[str] = Form(None),
    specialisations: Optional[str] = Form(None),
    languages: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "PANDIT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pandits only")

    profile = db.query(PanditProfile).filter(PanditProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    if bio is not None:
        profile.bio = bio
    if specialisations is not None:
        profile.specialisations = [s.strip() for s in specialisations.split(",")]
    if languages is not None:
        profile.languages = [l.strip() for l in languages.split(",")]

    db.commit()
    db.refresh(profile)
    return profile


@router.put("/me/availability", summary="Set availability slots")
def set_availability(
    slots: List[AvailabilitySlotCreate],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "PANDIT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Pandits only")

    # Clear existing future slots
    from datetime import date as date_type
    today = date_type.today()
    db.query(AvailabilitySlot).filter(
        AvailabilitySlot.pandit_id == current_user.id,
        AvailabilitySlot.date >= today,
    ).delete()

    for slot in slots:
        db_slot = AvailabilitySlot(pandit_id=current_user.id, **slot.dict())
        db.add(db_slot)

    db.commit()
    return {"message": f"{len(slots)} availability slots saved"}
