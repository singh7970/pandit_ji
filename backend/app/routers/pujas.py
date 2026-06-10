from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.puja import Puja
from app.models.user import User
from app.schemas.puja import PujaCreate, PujaUpdate, PujaResponse, PujaListResponse

router = APIRouter()


@router.get("/", response_model=PujaListResponse, summary="List pujas with filters")
def list_pujas(
    q: Optional[str] = Query(None, description="Search by name"),
    occasion: Optional[str] = Query(None),
    deity: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    max_duration: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Puja).filter(Puja.is_active == True)

    if q:
        query = query.filter(
            (Puja.name_en.ilike(f"%{q}%")) | (Puja.name_hi.ilike(f"%{q}%"))
        )
    if occasion:
        query = query.filter(Puja.occasion_tags.contains([occasion]))
    if deity:
        query = query.filter(Puja.deity.ilike(f"%{deity}%"))
    if min_price is not None:
        query = query.filter(Puja.base_price >= min_price)
    if max_price is not None:
        query = query.filter(Puja.base_price <= max_price)
    if max_duration is not None:
        query = query.filter(Puja.duration_hrs <= max_duration)

    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()

    return PujaListResponse(items=items, total=total, page=page, size=size)


@router.get("/{puja_id}", response_model=PujaResponse, summary="Get puja detail")
def get_puja(puja_id: str, db: Session = Depends(get_db)):
    puja = db.query(Puja).filter(Puja.id == puja_id, Puja.is_active == True).first()
    if not puja:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puja not found")
    return puja


@router.post("/", response_model=PujaResponse, summary="Create puja (admin only)")
def create_puja(
    body: PujaCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    puja = Puja(**body.dict())
    db.add(puja)
    db.commit()
    db.refresh(puja)
    return puja


@router.put("/{puja_id}", response_model=PujaResponse, summary="Update puja (admin only)")
def update_puja(
    puja_id: str,
    body: PujaUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    puja = db.query(Puja).filter(Puja.id == puja_id).first()
    if not puja:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puja not found")
    for field, value in body.dict(exclude_unset=True).items():
        setattr(puja, field, value)
    db.commit()
    db.refresh(puja)
    return puja


@router.delete("/{puja_id}", summary="Soft delete puja (admin only)")
def delete_puja(
    puja_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    puja = db.query(Puja).filter(Puja.id == puja_id).first()
    if not puja:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Puja not found")
    puja.is_active = False
    db.commit()
    return {"message": "Puja deactivated"}
