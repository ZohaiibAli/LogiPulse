"""One-off script to create the demo admin account.

Run with the venv active:
    python seed_admin.py
"""
from config.db import SessionLocal, Base, engine
from core.security import hash_password
from model.user import User, UserRole
from model import rider, order, chat  # noqa: F401  (register tables on Base.metadata)

ADMIN_EMAIL = "admin@swiftship.com"
ADMIN_PASSWORD = "admin12345"

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    existing = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if existing:
        print(f"Admin already exists: {ADMIN_EMAIL}")
    else:
        admin = User(
            full_name="SwiftShip Admin",
            email=ADMIN_EMAIL,
            password_hash=hash_password(ADMIN_PASSWORD),
            role=UserRole.admin,
        )
        db.add(admin)
        db.commit()
        print(f"Created admin: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
finally:
    db.close()
