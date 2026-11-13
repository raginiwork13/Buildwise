from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid
from datetime import datetime

from app.schemas.quotation import (
    QuotationCreate,
    QuotationUpdate,
    QuotationResponse,
    InterestCreate,
    InterestResponse,
    ChatMessageCreate,
    ChatMessageResponse
)
from app.db.store import db, supabase_client

router = APIRouter(tags=["quotations_and_chat"])

# --- Helper functions for Supabase persistence ---
def save_quotation_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("project_quotations").insert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase quotation insert notice: {e}")
    return None

def sync_quotations_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("project_quotations").select("*").execute()
        for row in res.data or []:
            db.project_quotations[row["id"]] = row
    except Exception as e:
        print(f"Supabase quotations sync notice: {e}")

def save_chat_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("chat_messages").insert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase chat insert notice: {e}")
    return None

def sync_chat_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("chat_messages").select("*").execute()
        for row in res.data or []:
            db.chat_messages[row["id"]] = row
    except Exception as e:
        print(f"Supabase chat sync notice: {e}")

# =============================================================================
# 1. QUOTATIONS ENDPOINTS
# =============================================================================
@router.post("/quotations", response_model=QuotationResponse, status_code=201)
def create_quotation(payload: QuotationCreate):
    qid = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    data["id"] = qid
    data["created_at"] = now
    data["updated_at"] = now
    data["status"] = "submitted"

    db.project_quotations[qid] = data
    save_quotation_to_supabase(data)

    # Increment project enquiry count if present
    proj_id = data.get("project_id")
    if proj_id in db.customer_projects:
        db.customer_projects[proj_id]["enquiries_count"] = db.customer_projects[proj_id].get("enquiries_count", 0) + 1

    return data

@router.get("/quotations", response_model=List[QuotationResponse])
def list_quotations(
    project_id: Optional[str] = None,
    customer_name: Optional[str] = None,
    provider_id: Optional[str] = None
):
    sync_quotations_from_supabase()
    results = []
    for q in db.project_quotations.values():
        if project_id and q.get("project_id") != project_id:
            continue
        if customer_name and q.get("customer_name") != customer_name:
            continue
        if provider_id and q.get("provider_id") != provider_id:
            continue
        results.append(q)

    # Sort newest first
    results.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    return results

@router.put("/quotations/{id}/status", response_model=QuotationResponse)
def update_quotation_status(id: str, payload: QuotationUpdate):
    if id not in db.project_quotations:
        sync_quotations_from_supabase()
    if id not in db.project_quotations:
        raise HTTPException(status_code=404, detail="Quotation not found")

    current = db.project_quotations[id]
    if payload.status:
        current["status"] = payload.status
    current["updated_at"] = datetime.now()
    db.project_quotations[id] = current

    if supabase_client:
        try:
            supabase_client.table("project_quotations").update({"status": current["status"], "updated_at": current["updated_at"].isoformat()}).eq("id", id).execute()
        except Exception as e:
            print(f"Supabase quotation update notice: {e}")

    return current

# =============================================================================
# 2. INTERESTS ENDPOINTS
# =============================================================================
@router.post("/interests", response_model=InterestResponse, status_code=201)
def submit_interest(payload: InterestCreate):
    iid = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    data["id"] = iid
    data["created_at"] = now

    db.project_interests[iid] = data
    if supabase_client:
        try:
            supa_p = dict(data)
            supa_p["created_at"] = now.isoformat()
            supabase_client.table("project_interests").insert(supa_p).execute()
        except Exception as e:
            print(f"Supabase interest insert notice: {e}")

    # Increment enquiry count
    proj_id = data.get("project_id")
    if proj_id in db.customer_projects:
        db.customer_projects[proj_id]["enquiries_count"] = db.customer_projects[proj_id].get("enquiries_count", 0) + 1

    return data

@router.get("/interests", response_model=List[InterestResponse])
def list_interests(project_id: Optional[str] = None):
    results = []
    for i in db.project_interests.values():
        if project_id and i.get("project_id") != project_id:
            continue
        results.append(i)
    return results

# =============================================================================
# 3. CHAT MESSAGES ENDPOINTS (OLX / WhatsApp style)
# =============================================================================
@router.post("/chat/messages", response_model=ChatMessageResponse, status_code=201)
def send_chat_message(payload: ChatMessageCreate):
    mid = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    data["id"] = mid
    data["is_read"] = False
    data["created_at"] = now

    db.chat_messages[mid] = data
    save_chat_to_supabase(data)

    return data

@router.get("/chat/messages", response_model=List[ChatMessageResponse])
def get_chat_messages(
    conversation_id: Optional[str] = None,
    user_name: Optional[str] = None
):
    sync_chat_from_supabase()
    results = []
    
    # Normalize helper for conversation ID comparison
    target_conv = conversation_id.strip().lower() if conversation_id else None

    for m in db.chat_messages.values():
        msg_conv = str(m.get("conversation_id") or "").strip().lower()
        
        # Check conversation_id
        if target_conv:
            # Match directly or match by token components (e.g. sender & recipient in any order)
            if msg_conv != target_conv:
                # Also check cross-party matching
                parts = target_conv.split("__")
                if len(parts) == 2:
                    rev_conv = f"{parts[1]}__{parts[0]}"
                    if msg_conv != rev_conv:
                        continue
                else:
                    continue

        # Check user_name filter if provided
        if user_name:
            uname = user_name.strip().lower()
            sname = str(m.get("sender_name") or "").strip().lower()
            rname = str(m.get("recipient_name") or "").strip().lower()
            if uname != sname and uname != rname:
                continue

        results.append(m)

    # Sort oldest to newest for chronological conversation thread
    results.sort(key=lambda x: str(x.get("created_at") or ""))
    return results

