import uuid

from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, func, ForeignKey, Date, Time
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class PanditProfile(Base):
    __tablename__ = "pandit_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, unique=True)
    sampraday = Column(String(50), nullable=True)
    specialisations = Column(ARRAY(String), default=[])
    languages = Column(ARRAY(String), default=[])
    experience_years = Column(Integer, default=0)
    tier = Column(String(20), default="VERIFIED")  # VERIFIED | SILVER | GOLD
    rating_avg = Column(Float, default=0.0)
    total_pujas = Column(Integer, default=0)
    status = Column(String(20), default="PENDING")  # PENDING | ACTIVE | SUSPENDED
    suspended_until = Column(DateTime(timezone=True), nullable=True)
    bio = Column(Text, nullable=True)
    photo_url = Column(Text, nullable=True)
    document_urls = Column(ARRAY(String), default=[])
    temple_refs = Column(JSONB, default=list)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="pandit_profile")


class AvailabilitySlot(Base):
    __tablename__ = "availability_slots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pandit_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True)

    pandit = relationship("User", back_populates="availability_slots")
