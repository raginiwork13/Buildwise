from typing import Dict, Set
from fastapi import WebSocket
import json
import logging
import asyncio

logger = logging.getLogger("buildwise.websocket")

class WebSocketManager:
    def __init__(self):
        # Maps user_id -> Set of active WebSockets (supports multiple tabs)
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        self.active_connections[user_id].add(websocket)
        logger.info(f"User {user_id} connected via WebSocket. Active sessions: {len(self.active_connections[user_id])}")

    def disconnect(self, user_id: str, websocket: WebSocket):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected from WebSocket.")

    async def send_to_user(self, user_id: str, event_type: str, data: dict):
        """Sends an event payload to all open sessions of a given user."""
        if user_id not in self.active_connections:
            return False

        dead_connections = set()
        payload = json.dumps({"event": event_type, "data": data}, default=str)

        for websocket in list(self.active_connections[user_id]):
            try:
                await websocket.send_text(payload)
            except Exception as e:
                logger.warning(f"Failed to send to user {user_id} websocket: {e}")
                dead_connections.add(websocket)

        for dead in dead_connections:
            self.disconnect(user_id, dead)

        return True

    def send_to_user_sync(self, user_id: str, event_type: str, data: dict) -> bool:
        """Safe synchronous dispatcher: schedules WebSocket send if event loop is running."""
        if user_id not in self.active_connections:
            return False
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(self.send_to_user(user_id, event_type, data))
            return True
        except RuntimeError:
            # No running event loop (e.g. sync test or direct invocation)
            return False

    def broadcast_sync(self, user_ids: list[str], event_type: str, data: dict):
        """Broadcasts event payload to multiple users simultaneously."""
        for uid in user_ids:
            self.send_to_user_sync(uid, event_type, data)

ws_manager = WebSocketManager()
