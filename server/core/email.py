import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config.settings import settings


def send_email(to_email: str, subject: str, html_body: str) -> None:
    """Fire-and-forget SMTP send via Gmail. Raises on failure so callers can
    decide whether to surface or swallow the error."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise RuntimeError("SMTP_USER / SMTP_PASSWORD not configured")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"LogiPulse <{settings.SMTP_USER}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#4f46e5;">Reset your LogiPulse password</h2>
      <p>We received a request to reset your password. Click the button below to choose a new one.
      This link expires in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
      <p style="text-align:center; margin: 24px 0;">
        <a href="{reset_link}" style="background:#4f46e5;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;">
          Reset password
        </a>
      </p>
      <p>If you didn't request this, you can safely ignore this email.</p>
    </div>
    """
    send_email(to_email, "Reset your LogiPulse password", html)
