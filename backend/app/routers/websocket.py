from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
from app.services.websocket_manager import ws_manager

logger = logging.getLogger("buildwise.websocket_router")
router = APIRouter(tags=["Real-time WebSocket"])

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """
    Bidirectional WebSocket connection per user.
    Broadcasts real-time notifications, messages, and read receipts.
    Cleans up gracefully on client disconnect or page unmount.
    """
    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection alive; clients can send 'ping' or heartbeat messages
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text('{"event": "pong"}')
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)
    except Exception as e:
        logger.warning(f"WebSocket exception for user {user_id}: {e}")
        ws_manager.disconnect(user_id, websocket)

