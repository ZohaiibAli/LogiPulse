import enum

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.db import Base


class UserRole(str, enum.Enum):
    customer = "customer"
    rider = "rider"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(190), unique=True, index=True, nullable=False)
    phone = Column(String(30), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.customer, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rider_profile = relationship(
        "RiderProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    orders_as_customer = relationship(
        "Order", back_populates="customer", foreign_keys="Order.customer_id"
    )
    orders_as_rider = relationship(
        "Order", back_populates="rider", foreign_keys="Order.rider_id"
    )
