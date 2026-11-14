from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from pydantic import BaseModel
from app.db.store import db, supabase_client

router = APIRouter(prefix="/notifications", tags=["notifications"])

class NotificationCreate(BaseModel):
    title: str
    desc: str
    recipient_role: str # 'customer' | 'professional' | 'supplier' | 'all'
    recipient_id: Optional[str] = None
    recipient_name: Optional[str] = None
    sender_name: Optional[str] = None
    type: str = "general" # 'order' | 'enquiry' | 'system'
    unread: bool = True
    meta: Optional[Dict[str, Any]] = None

def save_notification_to_supabase(notif: dict):
    if not supabase_client:
        return None
    try:
        supabase_client.table("notifications").upsert(notif).execute()
    except Exception as e:
        print(f"Supabase notification sync notice: {e}")

def add_notification(
    title: str,
    desc: str,
    recipient_role: str,
    recipient_id: Optional[str] = None,
    recipient_name: Optional[str] = None,
    sender_name: Optional[str] = None,
    notif_type: str = "general",
    meta: Optional[Dict[str, Any]] = None
) -> dict:
    if not hasattr(db, "notifications"):
        db.notifications = {}
    nid = f"notif-{uuid.uuid4().hex[:8]}"
    notif = {
        "id": nid,
        "title": title,
        "desc": desc,
        "recipient_role": recipient_role,
        "recipient_id": recipient_id,
        "recipient_name": recipient_name,
        "sender_name": sender_name,
        "type": notif_type,
        "unread": True,
        "created_at": datetime.now().isoformat(),
        "meta": meta or {}
    }
    db.notifications[nid] = notif
    save_notification_to_supabase(notif)
    return notif

@router.get("")
def list_notifications(
    role: Optional[str] = Query(None, description="Filter by recipient role: customer, professional, supplier"),
    recipient_id: Optional[str] = Query(None, description="Filter by recipient user ID"),
    recipient_name: Optional[str] = Query(None, description="Filter by recipient name")
):
    if not hasattr(db, "notifications"):
        db.notifications = {}

    all_notifs = list(db.notifications.values())
    filtered = []

    for n in all_notifs:
        notif_role = (n.get("recipient_role") or "all").lower()
        
        # If role filter is provided:
        if role:
            r = role.lower()
            # Match exact role or broadcast 'all'
            if notif_role != "all" and notif_role != r:
                continue

        # Optional recipient_id or name filter if provided
        if recipient_id and n.get("recipient_id") and n.get("recipient_id") != recipient_id:
            continue
        
        filtered.append(n)

    # Sort newest first
    filtered.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    return filtered

@router.post("", status_code=201)
def create_notification(payload: NotificationCreate):
    return add_notification(
        title=payload.title,
        desc=payload.desc,
        recipient_role=payload.recipient_role,
        recipient_id=payload.recipient_id,
        recipient_name=payload.recipient_name,
        sender_name=payload.sender_name,
        notif_type=payload.type,
        meta=payload.meta
    )

@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    if not hasattr(db, "notifications"):
        db.notifications = {}
    if notification_id not in db.notifications:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.notifications[notification_id]["unread"] = False
    return db.notifications[notification_id]

@router.put("/mark-all-read")
def mark_all_notifications_read(role: Optional[str] = None):
    if not hasattr(db, "notifications"):
        db.notifications = {}
    for n in db.notifications.values():
        if not role or n.get("recipient_role") == role or n.get("recipient_role") == "all":
            n["unread"] = False
    return {"status": "ok", "message": "All notifications marked as read"}
