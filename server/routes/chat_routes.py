from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from config.db import get_db, SessionLocal
from core.deps import get_current_user
from core.security import decode_access_token
from model.user import User, UserRole
from model.order import Order
from model.rider import RiderProfile
from model.chat import ChatMessage
from schemas.chat import ChatMessageOut
from ws.manager import manager

router = APIRouter(tags=["chat"])


def _assert_participant(order: Order, user: User):
    if user.role == UserRole.admin:
        return
    if order.customer_id == user.id or order.rider_id == user.id:
        return
    raise HTTPException(status_code=403, detail="You can't access this conversation")


@router.get("/orders/{order_id}/messages", response_model=list[ChatMessageOut])
def get_messages(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    _assert_participant(order, current_user)
    return (
        db.query(ChatMessage)
        .filter(ChatMessage.order_id == order_id)
        .order_by(ChatMessage.created_at)
        .all()
    )


@router.websocket("/ws/orders/{order_id}")
async def order_socket(websocket: WebSocket, order_id: int, token: str):
    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4401)
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == int(payload.get("sub"))).first()
        order = db.query(Order).filter(Order.id == order_id).first()
        if not user or not order:
            await websocket.close(code=4404)
            return
        if user.role != UserRole.admin and user.id not in (order.customer_id, order.rider_id):
            await websocket.close(code=4403)
            return

        await manager.connect(order_id, websocket)
        try:
            while True:
                data = await websocket.receive_json()
                msg_type = data.get("type")

                if msg_type == "chat":
                    text = (data.get("message") or "").strip()
                    if not text:
                        continue
                    chat_msg = ChatMessage(order_id=order_id, sender_id=user.id, message=text)
                    db.add(chat_msg)
                    db.commit()
                    db.refresh(chat_msg)
                    await manager.broadcast(order_id, {
                        "type": "chat",
                        "id": chat_msg.id,
                        "order_id": order_id,
                        "sender_id": user.id,
                        "sender_name": user.full_name,
                        "sender_role": user.role.value,
                        "message": chat_msg.message,
                        "created_at": chat_msg.created_at.isoformat(),
                    })

                elif msg_type == "location" and user.role == UserRole.rider:
                    lat, lng = data.get("lat"), data.get("lng")
                    if lat is None or lng is None:
                        continue
                    profile = db.query(RiderProfile).filter(RiderProfile.user_id == user.id).first()
                    if profile:
                        profile.current_lat = lat
                        profile.current_lng = lng
                        db.commit()
                    await manager.broadcast(order_id, {
                        "type": "location",
                        "order_id": order_id,
                        "rider_id": user.id,
                        "lat": lat,
                        "lng": lng,
                    })
        except WebSocketDisconnect:
            pass
        finally:
            manager.disconnect(order_id, websocket)
    finally:
        db.close()
