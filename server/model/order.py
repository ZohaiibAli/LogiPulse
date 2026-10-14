import enum

from sqlalchemy import Column, Integer, String, Float, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from config.db import Base


class OrderStatus(str, enum.Enum):
    pending = "pending"          # waiting for a rider to accept
    accepted = "accepted"        # rider assigned, heading to pickup
    picked_up = "picked_up"      # package collected
    in_transit = "in_transit"    # on the way to receiver
    delivered = "delivered"
    cancelled = "cancelled"


class PackageType(str, enum.Enum):
    document = "document"
    parcel = "parcel"
    fragile = "fragile"
    food = "food"
    other = "other"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    pickup_address = Column(String(500), nullable=False)
    pickup_lat = Column(Float, nullable=False)
    pickup_lng = Column(Float, nullable=False)
    # Flat/floor/block detail for the sender's home address — descriptive only,
    # never geocoded or shown on the map.
    pickup_details = Column(String(255), nullable=True)

    dropoff_address = Column(String(500), nullable=False)
    dropoff_lat = Column(Float, nullable=False)
    dropoff_lng = Column(Float, nullable=False)
    # Same, for the receiver's home address.
    dropoff_details = Column(String(255), nullable=True)

    receiver_name = Column(String(120), nullable=False)
    receiver_phone = Column(String(30), nullable=False)

    package_type = Column(Enum(PackageType), default=PackageType.parcel, nullable=False)
    package_weight = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)

    distance_km = Column(Float, nullable=True)
    price = Column(Float, nullable=False)
    payment_method = Column(String(30), default="cash")

    # Day-2 "Peak Hours" priority delivery system — "normal" | "high" | "urgent".
    # Plain string (not a DB enum) so it can be added to the existing table with
    # a simple ALTER TABLE, validated at the Pydantic layer instead.
    priority = Column(String(10), default="normal", nullable=False)
    priority_fee = Column(Float, default=200.0, nullable=False)

    status = Column(Enum(OrderStatus), default=OrderStatus.pending, nullable=False)

    # Customer's post-delivery rating/review of the rider for this specific order.
    rating = Column(Integer, nullable=True)
    review = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    customer = relationship("User", back_populates="orders_as_customer", foreign_keys=[customer_id])
    rider = relationship("User", back_populates="orders_as_rider", foreign_keys=[rider_id])

    status_history = relationship(
        "OrderStatusHistory", back_populates="order", cascade="all, delete-orphan",
        order_by="OrderStatusHistory.created_at",
    )
    messages = relationship(
        "ChatMessage", back_populates="order", cascade="all, delete-orphan",
        order_by="ChatMessage.created_at",
    )


class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(Enum(OrderStatus), nullable=False)
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    order = relationship("Order", back_populates="status_history")
