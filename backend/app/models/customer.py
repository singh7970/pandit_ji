import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Customer(Base):
    """Separate table for Customer app users. No conflict with Pandit users table."""
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    city = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships to bookings (customer side)
    bookings = relationship("Booking", foreign_keys="Booking.customer_id", back_populates="customer")
    reviews_given = relationship("Review", foreign_keys="Review.customer_id", back_populates="customer")

    @property
    def role(self) -> str:
        return "CUSTOMER"


