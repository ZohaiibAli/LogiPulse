from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, func
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from config.db import get_db
from core.deps import get_current_user, require_roles
from core.pricing import haversine_km, estimate_price, priority_fee, PRIORITY_RANK
from model.user import User, UserRole
from model.order import Order, OrderStatus, OrderStatusHistory
from model.rider import RiderProfile, RiderStatus
from schemas.order import (
    OrderCreate, OrderOut, StatusUpdate, OrderEstimate, OrderEstimateOut, OrderRating,
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
    fee = priority_fee(payload.priority)
    return OrderEstimateOut(
        distance_km=round(distance_km, 2),
        price=estimate_price(distance_km) + fee,
        priority_fee=fee,
    )


@router.post("", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_order(
    payload: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.customer)),
):
    distance_km = haversine_km(
        payload.pickup_lat, payload.pickup_lng, payload.dropoff_lat, payload.dropoff_lng
    )
    fee = priority_fee(payload.priority)
    order = Order(
        customer_id=current_user.id,
        pickup_address=payload.pickup_address,
        pickup_lat=payload.pickup_lat,
        pickup_lng=payload.pickup_lng,
        pickup_details=payload.pickup_details,
        dropoff_address=payload.dropoff_address,
        dropoff_lat=payload.dropoff_lat,
        dropoff_lng=payload.dropoff_lng,
        dropoff_details=payload.dropoff_details,
        receiver_name=payload.receiver_name,
        receiver_phone=payload.receiver_phone,
        package_type=payload.package_type,
        package_weight=payload.package_weight,
        notes=payload.notes,
        payment_method=payload.payment_method,
        distance_km=round(distance_km, 2),
        price=estimate_price(distance_km) + fee,
        priority=payload.priority,
        priority_fee=fee,
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
    priority: str | None = Query(None, description="Filter to one priority: normal, high, or urgent"),
    sort_by: str = Query("distance", description="'distance' (nearest first) or 'priority' (urgent first)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.rider)),
):
    """Pending orders with no rider yet — the InDrive-style request feed.

    Sorted nearest-first by default, using the real haversine distance from
    the rider's current (live-tracked) position to each order's pickup point
    — not a hardcoded label and not the order's own pickup->dropoff trip
    distance. Riders can also filter by priority and/or re-sort by priority
    (Day-2 "Peak Hours" feature) so they can weigh both distance and urgency
    themselves.
    """
    query = db.query(Order).filter(Order.status == OrderStatus.pending, Order.rider_id.is_(None))
    if priority:
        query = query.filter(Order.priority == priority)
    orders = query.order_by(Order.created_at.desc()).all()

    profile = db.query(RiderProfile).filter(RiderProfile.user_id == current_user.id).first()

    if profile and profile.current_lat is not None and profile.current_lng is not None:
        for order in orders:
            order.distance_from_rider_km = round(
                haversine_km(profile.current_lat, profile.current_lng, order.pickup_lat, order.pickup_lng), 2
            )
        has_distance = True
    else:
        for order in orders:
            order.distance_from_rider_km = None
        has_distance = False

    if sort_by == "priority":
        orders.sort(key=lambda o: (
            PRIORITY_RANK.get(o.priority, 9),
            o.distance_from_rider_km if has_distance else 0,
        ))
    elif has_distance:
        orders.sort(key=lambda o: o.distance_from_rider_km)

    return orders


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


@router.post("/{order_id}/rate", response_model=OrderOut)
def rate_order(
    order_id: int,
    payload: OrderRating,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(UserRole.customer)),
):
    order = _get_order_or_404(db, order_id)
    if order.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can't rate this order")
    if order.status != OrderStatus.delivered:
        raise HTTPException(status_code=400, detail="You can only rate a delivered order")
    if order.rating is not None:
        raise HTTPException(status_code=400, detail="This order has already been rated")

    order.rating = payload.rating
    order.review = payload.review
    db.commit()

    if order.rider_id:
        profile = db.query(RiderProfile).filter(RiderProfile.user_id == order.rider_id).first()
        if profile:
            avg = (
                db.query(func.avg(Order.rating))
                .filter(Order.rider_id == order.rider_id, Order.rating.isnot(None))
                .scalar()
            )
            profile.rating = round(float(avg), 2) if avg is not None else profile.rating
            db.commit()

    db.refresh(order)
    return order
