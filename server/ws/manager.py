from collections import defaultdict

from fastapi import WebSocket


class OrderConnectionManager:
    """Keeps a room of websocket connections per order id (customer + rider + any admins watching)."""

    def __init__(self) -> None:
        self.rooms: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, order_id: int, websocket: WebSocket) -> None:
        await websocket.accept()
        self.rooms[order_id].append(websocket)

    def disconnect(self, order_id: int, websocket: WebSocket) -> None:
        if websocket in self.rooms[order_id]:
            self.rooms[order_id].remove(websocket)
        if not self.rooms[order_id]:
            self.rooms.pop(order_id, None)

    async def broadcast(self, order_id: int, payload: dict) -> None:
        dead: list[WebSocket] = []
        for connection in self.rooms.get(order_id, []):
            try:
                await connection.send_json(payload)
            except Exception:
                dead.append(connection)
        for connection in dead:
            self.disconnect(order_id, connection)


manager = OrderConnectionManager()
