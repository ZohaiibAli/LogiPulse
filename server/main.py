from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config.db import engine, check_connection, Base
from config.settings import settings

# Import models so they're registered on Base.metadata before create_all runs.
from model import user, rider, order, chat  # noqa: F401

from routes import auth_routes, order_routes, rider_routes, admin_routes, chat_routes, chatbot_routes

app = FastAPI(
    title="SwiftShip Logistics API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(order_routes.router)
app.include_router(rider_routes.router)
app.include_router(admin_routes.router)
app.include_router(chat_routes.router)
app.include_router(chatbot_routes.router)


@app.on_event("startup")
def on_startup():
    try:
        check_connection()
        print("PostgreSQL (Neon) Connected Successfully")
        Base.metadata.create_all(bind=engine)
        print("Tables ensured")
    except Exception as e:
        print("PostgreSQL Connection Error:", e)


@app.get("/")
def home():
    return {
        "message": "SwiftShip Logistics Backend Running",
        "database": "PostgreSQL (Neon)"
    }


@app.get("/health")
def health():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "OK", "database": "Connected"}
    except Exception as e:
        return {"status": "ERROR", "database": str(e)}


@app.get("/ping")
def ping():
    """Zero-dependency liveness check — point an uptime pinger (UptimeRobot,
    cron-job.org, etc.) at this every ~10 minutes to stop Render's free tier
    from spinning the service down after 15 minutes of inactivity. Deliberately
    does not touch the database, so it stays fast and never false-fails."""
    return {"status": "alive", "time": datetime.now(timezone.utc).isoformat()}
