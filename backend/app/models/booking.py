import uuid

from sqlalchemy import Column, String, Float, Boolean, Text, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pandit_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    puja_id = Column(UUID(as_uuid=True), ForeignKey("pujas.id"), nullable=False)
    city = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(30), default="PENDING")
    # PENDING | CONFIRMED | PANDIT_ARRIVED | IN_PROGRESS | COMPLETED | CANCELLED
    amount = Column(Float, nullable=True)
    platform_fee = Column(Float, nullable=True)
    pandit_payout = Column(Float, nullable=True)
    kit_ordered = Column(Boolean, default=False)
    cancel_reason = Column(Text, nullable=True)
    cancelled_by = Column(String(20), nullable=True)  # CUSTOMER | PANDIT | ADMIN
    match_attempt = Column(String(1), default="1")  # tracks which pandit slot (1,2,3) was tried
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    customer = relationship("User", foreign_keys=[customer_id], back_populates="bookings_as_customer")
    pandit = relationship("User", foreign_keys=[pandit_id], back_populates="bookings_as_pandit")
    puja = relationship("Puja", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
    review = relationship("Review", back_populates="booking", uselist=False)
    strikes = relationship("Strike", back_populates="booking")
