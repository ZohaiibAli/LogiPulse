from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from config.db import get_db
from core.deps import require_roles
from model.user import User, UserRole
from model.rider import RiderProfile
from schemas.rider import LocationUpdate, OnlineStatusUpdate
from schemas.user import RiderProfileOut

router = APIRouter(prefix="/riders", tags=["riders"])


def _get_own_profile(db: Session, user: User) -> RiderProfile:
    profile = db.query(RiderProfile).filter(RiderProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    return profile


@router.get("/me", response_model=RiderProfileOut)
def my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.rider)),
):
    return _get_own_profile(db, current_user)


@router.patch("/me/location", response_model=RiderProfileOut)
def update_location(
    payload: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.rider)),
):
    profile = _get_own_profile(db, current_user)
    profile.current_lat = payload.lat
    profile.current_lng = payload.lng
    db.commit()
    db.refresh(profile)
    return profile


@router.patch("/me/online", response_model=RiderProfileOut)
def toggle_online(
    payload: OnlineStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.rider)),
):
    profile = _get_own_profile(db, current_user)
    profile.is_online = payload.is_online
    db.commit()
    db.refresh(profile)
    return profile
