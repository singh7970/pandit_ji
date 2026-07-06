from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime
import uuid


class UserBase(BaseModel):
    phone: str
    name: Optional[str] = None
    city: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None


class PanditProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    sampraday: Optional[str] = None
    specialisations: List[str] = []
    languages: List[str] = []
    experience_years: int = 0
    tier: str
    rating_avg: float
    total_pujas: int
    status: str
    bio: Optional[str] = None
    photo_url: Optional[str] = None
    document_urls: List[str] = []
    rejection_reason: Optional[str] = None

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    id: uuid.UUID
    role: str
    is_active: bool
    created_at: datetime
    pandit_profile: Optional[PanditProfileResponse] = None

    class Config:
        from_attributes = True


class AddressCreate(BaseModel):
    label: str = Field(..., example="Home")
    address: str
    lat: Optional[float] = None
    lng: Optional[float] = None


class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15, example="9876543210")
    mode: Optional[str] = Field(None, description="login or signup")
    role: Optional[str] = Field(None, description="CUSTOMER or PANDIT")


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    otp: str = Field(..., min_length=6, max_length=6)
    name: Optional[str] = None
    role: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshRequest(BaseModel):
    refresh_token: str
