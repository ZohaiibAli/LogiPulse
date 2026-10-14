from typing import Optional

from pydantic import BaseModel

from model.rider import RiderStatus


class LocationUpdate(BaseModel):
    lat: float
    lng: float


class OnlineStatusUpdate(BaseModel):
    is_online: bool


class RiderApproval(BaseModel):
    status: RiderStatus


class OnlineRiderOut(BaseModel):
    user_id: int
    full_name: str
    vehicle_type: str
    rating: float
    lat: float
    lng: float
    active_order_id: Optional[int] = None
