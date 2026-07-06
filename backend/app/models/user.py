import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=True)
    city = Column(String(50), nullable=True)
    role = Column(String(20), default="CUSTOMER")  # CUSTOMER | PANDIT | ADMIN
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    pandit_profile = relationship("PanditProfile", back_populates="user", uselist=False)
    bookings_as_pandit = relationship(
        "Booking", foreign_keys="Booking.pandit_id", back_populates="pandit"
    )
    reviews_received = relationship(
        "Review", foreign_keys="Review.pandit_id", back_populates="pandit"
    )
    availability_slots = relationship("AvailabilitySlot", back_populates="pandit")
    strikes = relationship("Strike", back_populates="pandit")
    notifications = relationship("Notification", back_populates="user")
    support_tickets = relationship(
        "SupportTicket", foreign_keys="SupportTicket.user_id", back_populates="user"
    )
