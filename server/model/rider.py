import enum

from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.db import Base


class RiderStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class RiderProfile(Base):
    __tablename__ = "rider_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    vehicle_type = Column(String(50), nullable=False, default="bike")
    vehicle_number = Column(String(50), nullable=True)
    cnic = Column(String(30), nullable=True)

    status = Column(Enum(RiderStatus), default=RiderStatus.pending, nullable=False)
    is_online = Column(Boolean, default=False)

    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)

    rating = Column(Float, default=5.0)
    total_deliveries = Column(Integer, default=0)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="rider_profile")
