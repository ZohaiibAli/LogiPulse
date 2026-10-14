"""Bulk demo-data seed for the three primary demo accounts
(customer@gmail.com, rider@gmail.com, admin@logipulse.com) so their
dashboards — trend charts, status/priority breakdowns, earnings, revenue —
have a realistic volume of history to render instead of looking sparse.

This is NOT random junk: every order is built the same way the real app
builds one —
  - real Karachi neighborhood coordinates
  - real haversine distance (core.pricing.haversine_km)
  - real fare formula (core.pricing.estimate_price + priority_fee)
  - status progressed through the same VALID_TRANSITIONS the API enforces,
    with a matching order_status_history row per step and plausible time
    gaps between them (not instantaneous, not random noise)
  - ratings only on delivered orders, rider_profiles.rating/total_deliveries
    recomputed from the actual order rows afterward, exactly like the real
    POST /orders/{id}/rate endpoint does

created_at/delivered_at/status_history timestamps are backdated across the
last 30 days, which the live API can't do (it always stamps "now"), so this
runs as a direct DB script rather than through HTTP — the values it computes
are still the product of the app's real pricing/validation logic.

Run with the venv active:
    python seed_bulk_demo_data.py
"""
import random
from datetime import datetime, timedelta, timezone

from config.db import SessionLocal, Base, engine
from model import user as user_mod, rider, order as order_mod, chat  # noqa: F401
from model.user import User
from model.rider import RiderProfile
from model.order import Order, OrderStatus, PackageType, OrderStatusHistory
from core.pricing import haversine_km, estimate_price, priority_fee

random.seed(42)

Base.metadata.create_all(bind=engine)

CUSTOMER_EMAIL = "customer@gmail.com"
RIDER_EMAIL = "rider@gmail.com"

# Real Karachi-area neighborhoods with approximate coordinates.
PLACES = [
    ("Clifton Block 2", 24.8142, 67.0300),
    ("DHA Phase 5", 24.8000, 67.0500),
    ("Gulshan-e-Iqbal Block 13", 24.9200, 67.0850),
    ("Saddar Town", 24.8600, 67.0100),
    ("North Nazimabad Block H", 24.9400, 67.0350),
    ("Korangi Industrial Area", 24.8450, 67.1350),
    ("Malir Cantonment", 24.8900, 67.2000),
    ("Nazimabad No. 2", 24.9100, 67.0330),
    ("PECHS Block 6", 24.8700, 67.0600),
    ("Bahadurabad", 24.8750, 67.0620),
    ("Gulistan-e-Johar Block 15", 24.9200, 67.1300),
    ("Defence Phase 2", 24.8050, 67.0600),
    ("Tariq Road", 24.8690, 67.0570),
    ("Shah Faisal Colony", 24.8650, 67.1900),
    ("Federal B Area", 24.9290, 67.0530),
]

PACKAGE_TYPES = [PackageType.document, PackageType.parcel, PackageType.fragile, PackageType.food, PackageType.other]
PACKAGE_WEIGHTS = [0.4, 0.35, 0.1, 0.1, 0.05]

PRIORITIES = ["normal", "high", "urgent"]
PRIORITY_WEIGHTS = [0.68, 0.22, 0.10]

RECEIVER_NAMES = [
    "Ahmed Raza", "Fatima Khan", "Bilal Hussain", "Ayesha Siddiqui", "Usman Tariq",
    "Sana Malik", "Hamza Sheikh", "Zainab Abbasi", "Imran Qureshi", "Mariam Javed",
    "Danish Iqbal", "Hira Farooq", "Saad Ansari", "Nida Baig", "Faisal Mehmood",
]

REVIEWS = [
    "Rider was very professional and on time!",
    "Quick delivery, thank you!",
    "Good service but a bit late.",
    "Package arrived in perfect condition, great job.",
    "Fast and friendly rider, will order again.",
    "Delivery took longer than expected but rider kept me updated.",
    "Smooth experience from start to finish.",
    "Very polite rider, handled the package carefully.",
    None,  # some ratings have no written review
    None,
]

NOTES_POOL = [
    "Handle with care, fragile items inside.",
    "Please call on arrival.",
    "Leave with the security guard if no one answers.",
    "Keep upright.",
    None, None, None,  # most orders have no special notes
]

VALID_TRANSITIONS_ORDER = ["pending", "accepted", "picked_up", "in_transit", "delivered"]


def pick(weighted_list, weights):
    return random.choices(weighted_list, weights=weights, k=1)[0]


def random_place_pair():
    a, b = random.sample(PLACES, 2)
    return a, b


def jitter(lat, lng):
    # Small realistic jitter so two orders to "the same area" aren't pixel-identical.
    return lat + random.uniform(-0.004, 0.004), lng + random.uniform(-0.004, 0.004)


# Which final outcomes mean the order was never accepted by a rider —
# everything else gets rider_id set at creation, exactly as it would be the
# moment a real rider calls POST /orders/{id}/accept.
NEVER_ACCEPTED = {"pending", "cancelled_pending"}


def build_order(customer_id, rider_id, final_status, created_at):
    pickup, dropoff = random_place_pair()
    p_lat, p_lng = jitter(pickup[1], pickup[2])
    d_lat, d_lng = jitter(dropoff[1], dropoff[2])

    distance_km = round(haversine_km(p_lat, p_lng, d_lat, d_lng), 2)
    priority = pick(PRIORITIES, PRIORITY_WEIGHTS)
    fee = priority_fee(priority)
    price = round(estimate_price(distance_km) + fee, 2)

    order = Order(
        customer_id=customer_id,
        rider_id=None if final_status in NEVER_ACCEPTED else rider_id,
        pickup_address=f"{pickup[0]}, Karachi",
        pickup_lat=p_lat,
        pickup_lng=p_lng,
        pickup_details=random.choice([None, None, "Flat 3B, 2nd Floor", "House 12, Block C", "Office 501"]),
        dropoff_address=f"{dropoff[0]}, Karachi",
        dropoff_lat=d_lat,
        dropoff_lng=d_lng,
        dropoff_details=random.choice([None, None, "Flat 3B, 2nd Floor", "House 12, Block C", "Office 501"]),
        receiver_name=random.choice(RECEIVER_NAMES),
        receiver_phone=f"03{random.randint(0,9)}{random.randint(1000000,9999999)}",
        package_type=pick(PACKAGE_TYPES, PACKAGE_WEIGHTS),
        package_weight=round(random.uniform(0.5, 8.0), 1) if random.random() < 0.6 else None,
        notes=random.choice(NOTES_POOL),
        payment_method="cash",
        distance_km=distance_km,
        price=price,
        priority=priority,
        priority_fee=fee,
        status=OrderStatus.pending,
        created_at=created_at,
        updated_at=created_at,
    )
    return order


def progress_history(db, order, final_status, start_time):
    """Walk the order through the same VALID_TRANSITIONS the live API enforces,
    writing one order_status_history row per step with a plausible time gap,
    and updating order.status/updated_at/delivered_at to match — never leaves
    the row's own status out of sync with its history."""
    t = start_time
    db.add(OrderStatusHistory(order=order, status=OrderStatus.pending, note="Order placed", created_at=t))

    if final_status == "pending":
        return

    if final_status == "cancelled_pending":
        t += timedelta(minutes=random.randint(2, 20))
        order.status = OrderStatus.cancelled
        order.updated_at = t
        db.add(OrderStatusHistory(order=order, status=OrderStatus.cancelled, note="Cancelled by customer", created_at=t))
        return

    t += timedelta(minutes=random.randint(1, 8))
    order.status = OrderStatus.accepted
    order.updated_at = t
    db.add(OrderStatusHistory(order=order, status=OrderStatus.accepted, note="Accepted by rider", created_at=t))
    if final_status == "accepted":
        return

    if final_status == "cancelled_accepted":
        t += timedelta(minutes=random.randint(2, 15))
        order.status = OrderStatus.cancelled
        order.updated_at = t
        db.add(OrderStatusHistory(order=order, status=OrderStatus.cancelled, note="Cancelled by customer", created_at=t))
        return

    t += timedelta(minutes=random.randint(8, 25))
    order.status = OrderStatus.picked_up
    order.updated_at = t
    db.add(OrderStatusHistory(order=order, status=OrderStatus.picked_up, created_at=t))
    if final_status == "picked_up":
        return

    t += timedelta(minutes=random.randint(3, 10))
    order.status = OrderStatus.in_transit
    order.updated_at = t
    db.add(OrderStatusHistory(order=order, status=OrderStatus.in_transit, created_at=t))
    if final_status == "in_transit":
        return

    t += timedelta(minutes=random.randint(15, 45))
    order.status = OrderStatus.delivered
    order.delivered_at = t
    order.updated_at = t
    db.add(OrderStatusHistory(order=order, status=OrderStatus.delivered, created_at=t))


def main():
    db = SessionLocal()
    try:
        customer = db.query(User).filter(User.email == CUSTOMER_EMAIL).first()
        rider_user = db.query(User).filter(User.email == RIDER_EMAIL).first()
        if not customer or not rider_user:
            raise SystemExit(f"Expected both {CUSTOMER_EMAIL} and {RIDER_EMAIL} to already exist.")

        now = datetime.now(timezone.utc)
        created = 0

        # Historical, resolved orders spread across the last 30 days —
        # the bulk of what feeds the 14-day trend charts and revenue.
        HISTORICAL_PLAN = (
            ["delivered"] * 34
            + ["cancelled_pending"] * 3
            + ["cancelled_accepted"] * 3
        )
        random.shuffle(HISTORICAL_PLAN)

        for i, plan in enumerate(HISTORICAL_PLAN):
            days_ago = random.randint(1, 30)
            created_at = now - timedelta(days=days_ago, hours=random.randint(0, 20), minutes=random.randint(0, 59))
            order = build_order(customer.id, rider_user.id, plan, created_at)
            db.add(order)
            db.flush()
            progress_history(db, order, plan, created_at)
            created += 1

        db.flush()

        # A handful of "live" in-flight orders, dated very recently, so the
        # dashboards also show current activity (not just closed history).
        LIVE_PLAN = ["pending", "pending", "accepted", "picked_up", "in_transit"]
        for plan in LIVE_PLAN:
            created_at = now - timedelta(hours=random.randint(0, 6), minutes=random.randint(0, 59))
            order = build_order(customer.id, rider_user.id, plan, created_at)
            db.add(order)
            db.flush()
            progress_history(db, order, plan, created_at)
            created += 1

        db.commit()
        print(f"Created {created} orders.")

        # Ratings on a majority of the rider's delivered orders — same shape
        # as the real POST /orders/{id}/rate endpoint would produce.
        delivered = (
            db.query(Order)
            .filter(Order.rider_id == rider_user.id, Order.status == "delivered", Order.rating.is_(None))
            .all()
        )
        rated = 0
        for o in delivered:
            if random.random() < 0.75:
                o.rating = random.choices([5, 4, 3], weights=[0.6, 0.3, 0.1], k=1)[0]
                o.review = random.choice(REVIEWS)
                rated += 1
        db.commit()
        print(f"Rated {rated} delivered orders.")

        # Recompute the rider's aggregate rating/total_deliveries from the
        # actual order rows, exactly like the real rating endpoint does.
        profile = db.query(RiderProfile).filter(RiderProfile.user_id == rider_user.id).first()
        all_delivered = db.query(Order).filter(Order.rider_id == rider_user.id, Order.status == "delivered").all()
        rated_values = [o.rating for o in all_delivered if o.rating is not None]
        if rated_values:
            profile.rating = round(sum(rated_values) / len(rated_values), 2)
        profile.total_deliveries = len(all_delivered)
        db.commit()
        print(f"Rider profile: rating={profile.rating}, total_deliveries={profile.total_deliveries}")

    finally:
        db.close()


if __name__ == "__main__":
    main()
