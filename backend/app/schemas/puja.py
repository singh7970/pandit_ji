from typing import Optional, List, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class SamagriItem(BaseModel):
    name: str
    quantity: str
    unit: Optional[str] = None


class PujaBase(BaseModel):
    name_en: str
    name_hi: Optional[str] = None
    description: Optional[str] = None
    duration_hrs: Optional[float] = None
    base_price: Optional[float] = None
    tier_required: Optional[str] = None
    samagri_list: Optional[List[str]] = []
    deity: Optional[str] = None
    occasion_tags: Optional[List[str]] = []
    image_url: Optional[str] = None


class PujaCreate(PujaBase):
    pass


class PujaUpdate(BaseModel):
    name_en: Optional[str] = None
    name_hi: Optional[str] = None
    description: Optional[str] = None
    duration_hrs: Optional[float] = None
    base_price: Optional[float] = None
    tier_required: Optional[str] = None
    samagri_list: Optional[List[str]] = None
    deity: Optional[str] = None
    occasion_tags: Optional[List[str]] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class PujaResponse(PujaBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PujaListResponse(BaseModel):
    items: List[PujaResponse]
    total: int
    page: int
    size: int
