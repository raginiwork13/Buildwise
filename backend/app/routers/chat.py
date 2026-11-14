import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.db.store import db, supabase_client
from app.routers.notifications import add_notification

router = APIRouter(prefix="/chat", tags=["Chat Messaging"])


# ─── Schemas ────────────────────────────────────────────────────────────────

class ChatMessageCreate(BaseModel):
    conversation_id: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    sender_id: str
    sender_name: str
    sender_role: str
    recipient_id: str
    recipient_name: str
    recipient_role: str
    message_text: str


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    sender_id: str
    sender_name: str
    sender_role: str
    recipient_id: str
    recipient_name: str
    recipient_role: str
    message_text: str
    is_read: bool = False
    created_at: Optional[str] = None


# ─── Helpers ────────────────────────────────────────────────────────────────

def _save_to_supabase(data: dict):
    if not supabase_client:
        return
    try:
        supabase_client.table("chat_messages").insert(data).execute()
    except Exception as e:
        print(f"Supabase chat insert notice: {e}")


def _sync_from_supabase(conversation_id: str):
    """Pull messages for this conversation from Supabase into in-memory store."""
    if not supabase_client:
        return
    try:
        res = (
            supabase_client.table("chat_messages")
            .select("*")
            .eq("conversation_id", conversation_id)
            .execute()
        )
        for row in res.data or []:
            db.chat_messages[row["id"]] = row
    except Exception as e:
        print(f"Supabase chat sync notice: {e}")


# ─── Routes ─────────────────────────────────────────────────────────────────

@router.get("/messages", response_model=List[ChatMessageResponse])
def get_messages(conversation_id: str):
    """
    Return all messages for a conversation thread.
    conversation_id is a sorted slug of the two participant names, e.g.
    'carlos fernandes__rahul naik'
    """
    _sync_from_supabase(conversation_id)

    results = [
        m for m in db.chat_messages.values()
        if m.get("conversation_id") == conversation_id
    ]
    results.sort(key=lambda x: str(x.get("created_at") or ""))
    return results


@router.post("/messages", response_model=ChatMessageResponse, status_code=201)
def send_message(payload: ChatMessageCreate):
    """
    Store a chat message and push a notification to the recipient.
    """
    mid = f"msg-{uuid.uuid4().hex[:10]}"
    now = datetime.now().isoformat()

    data = payload.dict()
    data["id"] = mid
    data["is_read"] = False
    data["created_at"] = now

    # Persist in-memory (always available)
    db.chat_messages[mid] = data

    # Persist to Supabase (best-effort)
    _save_to_supabase(data)

    # ── Push notification to recipient ──────────────────────────────────────
    proj_ctx = f" regarding '{payload.project_title}'" if payload.project_title else ""
    add_notification(
        title=f"💬 New message from {payload.sender_name}",
        desc=f"{payload.sender_name} ({payload.sender_role}) sent you a message{proj_ctx}: \"{payload.message_text[:80]}{'...' if len(payload.message_text) > 80 else ''}\"",
        recipient_role=payload.recipient_role,
        recipient_name=payload.recipient_name,
        recipient_id=payload.recipient_id,
        sender_name=payload.sender_name,
        notif_type="chat",
        meta={
            "message_id": mid,
            "conversation_id": payload.conversation_id,
            "project_id": payload.project_id,
        }
    )

    return data


@router.put("/messages/{message_id}/read")
def mark_message_read(message_id: str):
    """Mark a specific message as read."""
    if message_id not in db.chat_messages:
        raise HTTPException(status_code=404, detail="Message not found")
    db.chat_messages[message_id]["is_read"] = True
    return {"ok": True}


@router.put("/messages/read-all")
def mark_conversation_read(conversation_id: str):
    """Mark all messages in a conversation as read for the current recipient."""
    count = 0
    for msg in db.chat_messages.values():
        if msg.get("conversation_id") == conversation_id and not msg.get("is_read"):
            msg["is_read"] = True
            count += 1
    return {"ok": True, "marked_read": count}
