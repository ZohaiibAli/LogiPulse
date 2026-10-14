from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict, Field, field_validator

from model.user import UserRole

# Admin accounts are never created through public self-registration.
PUBLIC_ROLES = {UserRole.customer, UserRole.rider}


class UserRegister(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: Optional[str] = None
    password: str = Field(min_length=6, max_length=72)
    role: UserRole = UserRole.customer

    @field_validator("role")
    @classmethod
    def only_public_roles(cls, value: UserRole) -> UserRole:
        if value not in PUBLIC_ROLES:
            raise ValueError("role must be 'customer' or 'rider'")
        return value

    @field_validator("phone", mode="before")
    @classmethod
    def blank_phone_to_none(cls, value: Optional[str]) -> Optional[str]:
        # An empty string is a real value for a UNIQUE column, so two blank
        # submissions would collide. Treat "no phone entered" as NULL instead.
        if value is None or not value.strip():
            return None
        return value

    # Rider-only fields, required when role == rider
    vehicle_type: Optional[str] = None
    vehicle_number: Optional[str] = None
    cnic: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=72)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=72)


class RiderProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    vehicle_type: str
    vehicle_number: Optional[str] = None
    cnic: Optional[str] = None
    status: str
    is_online: bool
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    rating: float
    total_deliveries: int


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    avatar_url: Optional[str] = None
    is_active: bool
    created_at: datetime
    rider_profile: Optional[RiderProfileOut] = None


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
