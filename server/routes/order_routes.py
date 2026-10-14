from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from config.db import get_db
from core.deps import get_current_user, require_roles
from core.pricing import haversine_km, estimate_price
from model.user import User, UserRole
from model.order import Order, OrderStatus, OrderStatusHistory
from model.rider import RiderProfile, RiderStatus
from schemas.order import (
    OrderCreate, OrderOut, StatusUpdate, OrderEstimate, OrderEstimateOut,
)
from ws.manager import manager

router = APIRouter(prefix="/orders", tags=["orders"])


def _record_history(db: Session, order: Order, status_: OrderStatus, note: str | None = None):
    db.add(OrderStatusHistory(order_id=order.id, status=status_, note=note))


@router.post("/estimate", response_model=OrderEstimateOut)
def estimate(payload: OrderEstimate, current_user: User = Depends(get_current_user)):
    distance_km = haversine_km(
        payload.pickup_lat, payload.pickup_lng, payload.dropoff_lat, payload.dropoff_lng
    )
    return OrderEstimateOut(distance_km=round(distance_km, 2), price=estimate_price(distance_km))


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.customer)),
):
    distance_km = haversine_km(
        payload.pickup_lat, payload.pickup_lng, payload.dropoff_lat, payload.dropoff_lng
    )
    order = Order(
        customer_id=current_user.id,
        pickup_address=payload.pickup_address,
        pickup_lat=payload.pickup_lat,
        pickup_lng=payload.pickup_lng,
        dropoff_address=payload.dropoff_address,
        dropoff_lat=payload.dropoff_lat,
        dropoff_lng=payload.dropoff_lng,
        receiver_name=payload.receiver_name,
        receiver_phone=payload.receiver_phone,
        package_type=payload.package_type,
        package_weight=payload.package_weight,
        notes=payload.notes,
        payment_method=payload.payment_method,
        distance_km=round(distance_km, 2),
        price=estimate_price(distance_km),
        status=OrderStatus.pending,
    )
    db.add(order)
    db.flush()
    _record_history(db, order, OrderStatus.pending, "Order placed")
    db.commit()
    db.refresh(order)
    return order


@router.get("/mine", response_model=list[OrderOut])
def my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Order)
    if current_user.role == UserRole.customer:
        query = query.filter(Order.customer_id == current_user.id)
    elif current_user.role == UserRole.rider:
        query = query.filter(Order.rider_id == current_user.id)
    # admin sees everything
    return query.order_by(Order.created_at.desc()).all()


@router.get("/available", response_model=list[OrderOut])
def available_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.rider)),
):
    """Pending orders with no rider yet — the InDrive-style request feed."""
    return (
        db.query(Order)
        .filter(Order.status == OrderStatus.pending, Order.rider_id.is_(None))
        .order_by(Order.created_at.desc())
        .all()
    )


def _get_order_or_404(db: Session, order_id: int) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def _assert_can_view(order: Order, user: User):
    if user.role == UserRole.admin:
        return
    if user.role == UserRole.customer and order.customer_id == user.id:
        return
    if user.role == UserRole.rider and order.rider_id == user.id:
        return
    raise HTTPException(status_code=403, detail="You can't access this order")


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = _get_order_or_404(db, order_id)
    _assert_can_view(order, current_user)
    return order


@router.post("/{order_id}/accept", response_model=OrderOut)
async def accept_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.rider)),
):
    profile = db.query(RiderProfile).filter(RiderProfile.user_id == current_user.id).first()
    if not profile or profile.status != RiderStatus.approved:
        raise HTTPException(status_code=403, detail="Your rider account isn't approved yet")

    order = _get_order_or_404(db, order_id)
    if order.status != OrderStatus.pending or order.rider_id is not None:
        raise HTTPException(status_code=400, detail="This order is no longer available")

    order.rider_id = current_user.id
    order.status = OrderStatus.accepted
    _record_history(db, order, OrderStatus.accepted, f"Accepted by {current_user.full_name}")
    db.commit()
    db.refresh(order)

    await manager.broadcast(order.id, {
        "type": "status",
        "order_id": order.id,
        "status": order.status.value,
        "rider_id": order.rider_id,
        "rider_name": current_user.full_name,
    })
    return order


VALID_TRANSITIONS = {
    OrderStatus.accepted: {OrderStatus.picked_up, OrderStatus.cancelled},
    OrderStatus.picked_up: {OrderStatus.in_transit, OrderStatus.cancelled},
    OrderStatus.in_transit: {OrderStatus.delivered},
}


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_status(
    order_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.rider, UserRole.admin)),
):
    order = _get_order_or_404(db, order_id)
    if current_user.role == UserRole.rider and order.rider_id != current_user.id:
        raise HTTPException(status_code=403, detail="This isn't your delivery")

    allowed = VALID_TRANSITIONS.get(order.status, set())
    if payload.status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Can't move order from {order.status.value} to {payload.status.value}",
        )

    order.status = payload.status
    if payload.status == OrderStatus.delivered:
        order.delivered_at = datetime.now(timezone.utc)
        if order.rider_id:
            profile = db.query(RiderProfile).filter(RiderProfile.user_id == order.rider_id).first()
            if profile:
                profile.total_deliveries = (profile.total_deliveries or 0) + 1

    _record_history(db, order, payload.status, payload.note)
    db.commit()
    db.refresh(order)

    await manager.broadcast(order.id, {
        "type": "status",
        "order_id": order.id,
        "status": order.status.value,
        "note": payload.note,
    })
    return order


@router.post("/{order_id}/cancel", response_model=OrderOut)
def cancel_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = _get_order_or_404(db, order_id)
    _assert_can_view(order, current_user)
    if order.status not in (OrderStatus.pending, OrderStatus.accepted):
        raise HTTPException(status_code=400, detail="This order can no longer be cancelled")

    order.status = OrderStatus.cancelled
    _record_history(db, order, OrderStatus.cancelled, f"Cancelled by {current_user.full_name}")
    db.commit()
    db.refresh(order)
    return order
