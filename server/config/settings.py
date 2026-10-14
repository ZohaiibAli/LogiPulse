import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")

    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "dev-secret-change-me")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))

    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

    SMTP_HOST: str = os.getenv("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", 587))
    SMTP_USER: str = os.getenv("SMTP_USER", "")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")

    # Used to build the reset-password link emailed to users.
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    RESET_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", 30))

    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    ]

    # Flat per-km / base fare pricing used to estimate delivery cost server-side,
    # so order pricing works even before a Maps billing API is wired up.
    BASE_FARE: float = float(os.getenv("BASE_FARE", 120))
    RATE_PER_KM: float = float(os.getenv("RATE_PER_KM", 45))

    # Day-2 "Peak Hours" priority delivery surcharge, added on top of the base
    # fare+distance price. Every order carries a priority (even "normal"),
    # so there's always a handling fee, not just a surcharge above a free tier.
    PRIORITY_FEE_NORMAL: float = float(os.getenv("PRIORITY_FEE_NORMAL", 200))
    PRIORITY_FEE_HIGH: float = float(os.getenv("PRIORITY_FEE_HIGH", 300))
    PRIORITY_FEE_URGENT: float = float(os.getenv("PRIORITY_FEE_URGENT", 500))


settings = Settings()
