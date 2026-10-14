from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from model.order import OrderStatus, PackageType
from schemas.user import UserOut


class OrderCreate(BaseModel):
    pickup_address: str
    pickup_lat: float
    pickup_lng: float

    dropoff_address: str
    dropoff_lat: float
    dropoff_lng: float

    receiver_name: str
    receiver_phone: str

    package_type: PackageType = PackageType.parcel
    package_weight: Optional[float] = None
    notes: Optional[str] = None
    payment_method: str = "cash"


class OrderEstimate(BaseModel):
    pickup_lat: float
    pickup_lng: float
    dropoff_lat: float
    dropoff_lng: float


class OrderEstimateOut(BaseModel):
    distance_km: float
    price: float


class StatusUpdate(BaseModel):
    status: OrderStatus
    note: Optional[str] = None


class StatusHistoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    status: OrderStatus
    note: Optional[str] = None
    created_at: datetime


class OrderOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer: UserOut
    rider: Optional[UserOut] = None

    pickup_address: str
    pickup_lat: float
    pickup_lng: float
    dropoff_address: str
    dropoff_lat: float
    dropoff_lng: float

    receiver_name: str
    receiver_phone: str

    package_type: PackageType
    package_weight: Optional[float] = None
    notes: Optional[str] = None

    distance_km: Optional[float] = None
    # Live distance from the requesting rider's current position to the pickup
    # point — only populated by GET /orders/available, null everywhere else.
    distance_from_rider_km: Optional[float] = None
    price: float
    payment_method: str
    status: OrderStatus

    created_at: datetime
    updated_at: datetime
    delivered_at: Optional[datetime] = None

    status_history: list[StatusHistoryOut] = Field(default_factory=list)
