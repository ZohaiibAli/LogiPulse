from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base

from config.settings import settings

DATABASE_URL = settings.DATABASE_URL

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set. Add it to server/.env")

# Force the psycopg2 driver explicitly (SQLAlchemy 2.1 otherwise defaults
# a bare "postgresql://" URL to the psycopg (v3) driver, which isn't installed).
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_connection():
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
