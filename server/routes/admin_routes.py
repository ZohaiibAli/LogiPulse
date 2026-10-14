from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from config.db import get_db
from core.deps import require_roles
from model.user import User, UserRole
from model.rider import RiderProfile, RiderStatus
from model.order import Order, OrderStatus
from schemas.user import UserOut
from schemas.rider import RiderApproval, OnlineRiderOut

router = APIRouter(prefix="/admin", tags=["admin"])

admin_only = require_roles(UserRole.admin)


@router.get("/stats")
def stats(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    total_users = db.query(func.count(User.id)).filter(User.role == UserRole.customer).scalar()
    total_riders = db.query(func.count(User.id)).filter(User.role == UserRole.rider).scalar()
    pending_riders = db.query(func.count(RiderProfile.id)).filter(RiderProfile.status == "pending").scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    active_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status.in_([OrderStatus.pending, OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit]))
        .scalar()
    )
    delivered_orders = db.query(func.count(Order.id)).filter(Order.status == OrderStatus.delivered).scalar()
    revenue = (
        db.query(func.coalesce(func.sum(Order.price), 0))
        .filter(Order.status == OrderStatus.delivered)
        .scalar()
    )

    priority_rows = db.query(Order.priority, func.count(Order.id)).group_by(Order.priority).all()
    priority_counts = {"normal": 0, "high": 0, "urgent": 0}
    for p, count in priority_rows:
        if p in priority_counts:
            priority_counts[p] = count

    return {
        "total_customers": total_users,
        "total_riders": total_riders,
        "pending_riders": pending_riders,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "delivered_orders": delivered_orders,
        "revenue": float(revenue or 0),
        "priority_counts": priority_counts,
    }


@router.get("/users", response_model=list[UserOut])
def list_users(
    role: UserRole | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.order_by(User.created_at.desc()).all()


@router.patch("/users/{user_id}/active")
def set_user_active(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = is_active
    db.commit()
    return {"id": user.id, "is_active": user.is_active}


@router.get("/riders/pending", response_model=list[UserOut])
def pending_riders(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    return (
        db.query(User)
        .join(RiderProfile, RiderProfile.user_id == User.id)
        .filter(RiderProfile.status == "pending")
        .all()
    )


@router.get("/riders/online", response_model=list[OnlineRiderOut])
def online_riders(db: Session = Depends(get_db), _: User = Depends(admin_only)):
    rows = (
        db.query(User, RiderProfile)
        .join(RiderProfile, RiderProfile.user_id == User.id)
        .filter(
            RiderProfile.is_online.is_(True),
            RiderProfile.status == RiderStatus.approved,
            RiderProfile.current_lat.isnot(None),
            RiderProfile.current_lng.isnot(None),
        )
        .all()
    )

    active_order_by_rider = dict(
        db.query(Order.rider_id, Order.id)
        .filter(Order.status.in_([OrderStatus.accepted, OrderStatus.picked_up, OrderStatus.in_transit]))
        .all()
    )

    return [
        OnlineRiderOut(
            user_id=user.id,
            full_name=user.full_name,
            vehicle_type=profile.vehicle_type,
            rating=profile.rating,
            lat=profile.current_lat,
            lng=profile.current_lng,
            active_order_id=active_order_by_rider.get(user.id),
        )
        for user, profile in rows
    ]


@router.patch("/riders/{user_id}/approval")
def set_rider_approval(
    user_id: int,
    payload: RiderApproval,
    db: Session = Depends(get_db),
    _: User = Depends(admin_only),
):
    profile = db.query(RiderProfile).filter(RiderProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Rider profile not found")
    profile.status = payload.status
    db.commit()
    return {"user_id": user_id, "status": profile.status}
