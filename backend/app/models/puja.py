import uuid

from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship

from app.core.database import Base


class Puja(Base):
    __tablename__ = "pujas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name_en = Column(String(100), nullable=False)
    name_hi = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    duration_hrs = Column(Float, nullable=True)
    base_price = Column(Float, nullable=True)
    tier_required = Column(String(20), nullable=True)  # VERIFIED | SILVER | GOLD
    samagri_list = Column(JSONB, default=list)
    deity = Column(String(50), nullable=True)
    occasion_tags = Column(ARRAY(String), default=[])
    image_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    bookings = relationship("Booking", back_populates="puja")
