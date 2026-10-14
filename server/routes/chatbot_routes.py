from google import genai
from google.genai import types
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from config.db import get_db
from config.settings import settings
from core.deps import get_current_user
from model.user import User
from model.chat import ChatbotMessage
from schemas.chat import ChatbotMessageIn, ChatbotMessageOut, ChatbotHistoryItem

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

SYSTEM_PROMPT = (
    "You are the friendly support assistant for LogiPulse, a courier & delivery platform "
    "(book parcels, track live deliveries, riders pick up and deliver packages). "
    "Answer questions about booking a courier, tracking an order, pricing, rider payouts, "
    "and general delivery/logistics help. Keep answers short, clear, and helpful. "
    "If asked something unrelated to the platform, answer briefly and steer back to how you can help with deliveries."
)

_client = genai.Client(api_key=settings.GEMINI_API_KEY) if settings.GEMINI_API_KEY else None


@router.post("/message", response_model=ChatbotMessageOut)
def chat_with_bot(
    payload: ChatbotMessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db.add(ChatbotMessage(user_id=current_user.id, role="user", message=payload.message))

    if not _client:
        reply = (
            "The AI assistant isn't configured yet — add GEMINI_API_KEY to server/.env to enable it."
        )
    else:
        try:
            response = _client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=payload.message,
                config=types.GenerateContentConfig(system_instruction=SYSTEM_PROMPT),
            )
            reply = response.text or "Sorry, I couldn't come up with a response. Please try again."
        except Exception as e:
            reply = f"The assistant is temporarily unavailable ({e})."

    db.add(ChatbotMessage(user_id=current_user.id, role="assistant", message=reply))
    db.commit()

    return ChatbotMessageOut(reply=reply)


@router.get("/history", response_model=list[ChatbotHistoryItem])
def chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(ChatbotMessage)
        .filter(ChatbotMessage.user_id == current_user.id)
        .order_by(ChatbotMessage.created_at)
        .all()
    )
