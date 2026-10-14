from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ChatMessageCreate(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_id: int
    sender_id: int
    message: str
    created_at: datetime


class ChatbotMessageIn(BaseModel):
    message: str


class ChatbotMessageOut(BaseModel):
    reply: str


class ChatbotHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    role: str
    message: str
    created_at: datetime
