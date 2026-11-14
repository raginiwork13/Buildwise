from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime
import uuid

from app.db.store import db, supabase_client

router = APIRouter(prefix="/workspaces", tags=["workspaces"])

# --- Supabase Persistence Helpers ---

def save_workspace_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("project_workspaces").upsert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase workspace upsert notice: {e}")
    return None

def sync_workspaces_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("project_workspaces").select("*").execute()
        for row in res.data or []:
            db.project_workspaces[row["id"]] = row
    except Exception as e:
        print(f"Supabase workspace sync notice: {e}")

def save_milestone_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("project_milestones").upsert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase milestone upsert notice: {e}")
    return None

def save_update_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("progress_updates").insert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase update insert notice: {e}")
    return None

def save_payment_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("payment_milestones").upsert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase payment upsert notice: {e}")
    return None


# ─── Workspaces ────────────────────────────────────────────────────────────────

@router.get("")
def list_workspaces(user_name: Optional[str] = None):
    """List all project workspaces, optionally filtered by user name."""
    sync_workspaces_from_supabase()
    workspaces = list(db.project_workspaces.values())
    if user_name:
        workspaces = [
            w for w in workspaces
            if w.get("customer_name") == user_name or w.get("professional_name") == user_name
        ]
    # Sort newest first
    workspaces.sort(key=lambda w: str(w.get("created_at") or ""), reverse=True)
    return workspaces


@router.post("")
def create_workspace(payload: dict):
    """Create a new project workspace (triggered when quotation approved)."""
    # Deterministic or passed ID, else based on project_id if available
    proj_id = payload.get("project_id", "")
    ws_id = payload.get("id") or (f"ws-{proj_id}" if proj_id else f"ws-{uuid.uuid4().hex[:8]}")
    now = datetime.now().isoformat()
    agreed_amt_val = float(payload.get("agreed_amount", 0) or 0)
    comm_cust = round(agreed_amt_val * 0.02, 2)
    comm_pro  = round(agreed_amt_val * 0.02, 2)
    is_demo   = ws_id == "ws-demo-1"

    workspace = {
        "id": ws_id,
        "project_id": proj_id,
        "project_title": payload.get("project_title", "Unnamed Project"),
        "customer_name": payload.get("customer_name", ""),
        "professional_name": payload.get("professional_name", ""),
        "professional_company": payload.get("professional_company", ""),
        "agreed_amount": agreed_amt_val,
        "expected_start_date": payload.get("expected_start_date", now[:10]),
        "expected_completion_date": payload.get("expected_completion_date", ""),
        "status": "active",
        "overall_progress": 0,
        "amount_paid": 0,
        "start_confirmed_professional": True,
        "start_confirmed_customer": True,
        "completion_confirmed_professional": False,
        "completion_confirmed_customer": False,
        # Commission escrow gate fields
        "commission_paid_customer": is_demo,
        "commission_paid_professional": is_demo,
        "commission_status": "paid" if is_demo else "pending",
        "commission_amount_customer": comm_cust,
        "commission_amount_professional": comm_pro,
        "warning_notices_sent": 0,
        "circumvention_flagged_at": None,
        "created_at": now,
        "updated_at": now,
    }
    db.project_workspaces[ws_id] = workspace
    save_workspace_to_supabase(workspace)
    _ensure_default_milestones(ws_id)
    _ensure_default_payments(ws_id)

    # Automatically record 2% + 2% platform commission for revenue dashboard
    try:
        from app.routers.revenue import record_project_commission, CollectRevenueRequest
        agreed_amt = float(workspace.get("agreed_amount") or 0.0)
        if agreed_amt > 0:
            already_recorded = any(
                t.get("project_id") == proj_id 
                for t in getattr(db, "platform_revenue_transactions", {}).values()
            )
            if not already_recorded:
                record_project_commission(CollectRevenueRequest(
                    project_id=proj_id or ws_id,
                    project_title=workspace.get("project_title", "Agreed Construction Project"),
                    quotation_id=payload.get("quotation_id"),
                    agreed_budget=agreed_amt,
                    customer_name=workspace.get("customer_name", "Customer"),
                    professional_name=workspace.get("professional_name", "Professional"),
                    customer_commission_rate=2.0,
                    professional_commission_rate=2.0
                ))
    except Exception as e:
        print(f"Auto-record workspace commission notice: {e}")

    return workspace


@router.get("/{workspace_id}")
def get_workspace(workspace_id: str):
    ws = db.project_workspaces.get(workspace_id)
    if not ws and supabase_client:
        try:
            res = supabase_client.table("project_workspaces").select("*").eq("id", workspace_id).execute()
            if res.data:
                ws = res.data[0]
                db.project_workspaces[workspace_id] = ws
        except Exception:
            pass
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    return ws


# ─── Dual Approval: Confirm Start ─────────────────────────────────────────────

@router.post("/{workspace_id}/confirm-start")
def confirm_project_start(workspace_id: str, payload: dict):
    ws = db.project_workspaces.get(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    role = payload.get("role", "")
    if role == "professional":
        ws["start_confirmed_professional"] = True
    elif role == "customer":
        ws["start_confirmed_customer"] = True
    if ws.get("start_confirmed_professional") and ws.get("start_confirmed_customer"):
        ws["status"] = "active"
    db.project_workspaces[workspace_id] = ws
    save_workspace_to_supabase(ws)
    return ws


# ─── Dual Approval: Confirm Completion ────────────────────────────────────────

@router.post("/{workspace_id}/confirm-completion")
def confirm_project_completion(workspace_id: str, payload: dict):
    ws = db.project_workspaces.get(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    role = payload.get("role", "")
    if role == "professional":
        ws["completion_confirmed_professional"] = True
    elif role == "customer":
        ws["completion_confirmed_customer"] = True
    if ws.get("completion_confirmed_professional") and ws.get("completion_confirmed_customer"):
        ws["status"] = "completed"
    db.project_workspaces[workspace_id] = ws
    save_workspace_to_supabase(ws)
    return ws


# ─── Commission Escrow Gate ────────────────────────────────────────────────────

@router.post("/{workspace_id}/pay-commission")
def pay_commission(workspace_id: str, payload: dict):
    """Record a commission payment by customer or professional."""
    ws = db.project_workspaces.get(workspace_id)
    if not ws:
        # Try Supabase
        if supabase_client:
            try:
                res = supabase_client.table("project_workspaces").select("*").eq("id", workspace_id).execute()
                if res.data:
                    ws = res.data[0]
                    db.project_workspaces[workspace_id] = ws
            except Exception:
                pass
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    role = payload.get("role", "")  # 'customer' | 'professional'
    payment_ref = payload.get("payment_reference", "")
    now = datetime.now().isoformat()

    if role == "customer":
        ws["commission_paid_customer"] = True
        ws["commission_payment_ref_customer"] = payment_ref
    elif role == "professional":
        ws["commission_paid_professional"] = True
        ws["commission_payment_ref_professional"] = payment_ref
    else:
        raise HTTPException(status_code=400, detail="role must be 'customer' or 'professional'")

    # If both paid → unlock
    if ws.get("commission_paid_customer") and ws.get("commission_paid_professional"):
        ws["commission_status"] = "paid"
    
    ws["updated_at"] = now
    db.project_workspaces[workspace_id] = ws
    save_workspace_to_supabase(ws)
    return ws


@router.post("/{workspace_id}/flag-circumvention")
def flag_circumvention(workspace_id: str, payload: dict):
    """Flag a workspace for potential platform circumvention (bypass)."""
    ws = db.project_workspaces.get(workspace_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")
    now = datetime.now().isoformat()
    ws["commission_status"] = "flagged_bypass"
    ws["warning_notices_sent"] = int(ws.get("warning_notices_sent") or 0) + 1
    ws["circumvention_flagged_at"] = now
    ws["updated_at"] = now
    db.project_workspaces[workspace_id] = ws
    save_workspace_to_supabase(ws)

    # Also log to circumvention_warnings table (Supabase)
    if supabase_client:
        try:
            warning_record = {
                "workspace_id": workspace_id,
                "project_title": ws.get("project_title", ""),
                "customer_name": ws.get("customer_name", ""),
                "customer_email": payload.get("customer_email", ""),
                "professional_name": ws.get("professional_name", ""),
                "professional_email": payload.get("professional_email", ""),
                "agreed_budget": ws.get("agreed_amount", 0),
                "commission_due": float(ws.get("commission_amount_customer", 0) or 0) + float(ws.get("commission_amount_professional", 0) or 0),
                "warning_type": "bypass_detected",
                "notices_sent": ws["warning_notices_sent"],
                "admin_note": payload.get("admin_note", "Circumvention warning sent by admin"),
                "created_at": now,
                "updated_at": now,
            }
            supabase_client.table("circumvention_warnings").insert(warning_record).execute()
        except Exception as e:
            print(f"Circumvention log notice: {e}")

    return {
        "success": True,
        "workspace_id": workspace_id,
        "commission_status": ws["commission_status"],
        "warning_notices_sent": ws["warning_notices_sent"],
        "timestamp": now,
        "message": f"Anti-circumvention warning sent. Total notices: {ws['warning_notices_sent']}",
    }


# ─── Milestones ────────────────────────────────────────────────────────────────

@router.get("/{workspace_id}/milestones")
def list_milestones(workspace_id: str):
    if supabase_client:
        try:
            res = supabase_client.table("project_milestones").select("*").eq("workspace_id", workspace_id).execute()
            for row in res.data or []:
                db.project_milestones[row["id"]] = row
        except Exception:
            pass
    return [m for m in db.project_milestones.values() if m.get("workspace_id") == workspace_id]


@router.post("/{workspace_id}/milestones")
def create_milestone(workspace_id: str, payload: dict):
    if workspace_id not in db.project_workspaces:
        raise HTTPException(status_code=404, detail="Workspace not found")
    mid = f"ms-{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    milestone = {
        "id": mid,
        "workspace_id": workspace_id,
        "name": payload.get("name", "New Milestone"),
        "description": payload.get("description", ""),
        "planned_start": payload.get("planned_start", now[:10]),
        "planned_end": payload.get("planned_end", ""),
        "actual_start": None,
        "actual_end": None,
        "progress_percentage": 0,
        "status": "not_started",
        "payment_amount": payload.get("payment_amount", 0),
        "photos": [],
        "created_at": now,
    }
    db.project_milestones[mid] = milestone
    save_milestone_to_supabase(milestone)
    return milestone


@router.put("/{workspace_id}/milestones/{milestone_id}/status")
def update_milestone_status(workspace_id: str, milestone_id: str, payload: dict):
    ms = db.project_milestones.get(milestone_id)
    if not ms or ms.get("workspace_id") != workspace_id:
        raise HTTPException(status_code=404, detail="Milestone not found")
    ms["status"] = payload.get("status", ms["status"])
    ms["progress_percentage"] = payload.get("progress_percentage", ms["progress_percentage"])
    if payload.get("status") == "in_progress" and not ms.get("actual_start"):
        ms["actual_start"] = datetime.now().isoformat()[:10]
    if payload.get("status") in ("completed",) and not ms.get("actual_end"):
        ms["actual_end"] = datetime.now().isoformat()[:10]
    db.project_milestones[milestone_id] = ms
    save_milestone_to_supabase(ms)
    _recalculate_progress(workspace_id)
    return ms


# ─── Progress Updates ──────────────────────────────────────────────────────────

@router.get("/{workspace_id}/updates")
def list_updates(workspace_id: str):
    if supabase_client:
        try:
            res = supabase_client.table("progress_updates").select("*").eq("workspace_id", workspace_id).execute()
            for row in res.data or []:
                db.progress_updates[row["id"]] = row
        except Exception:
            pass
    updates = [u for u in db.progress_updates.values() if u.get("workspace_id") == workspace_id]
    return sorted(updates, key=lambda u: u.get("created_at", ""), reverse=True)


@router.post("/{workspace_id}/updates")
def post_update(workspace_id: str, payload: dict):
    if workspace_id not in db.project_workspaces:
        raise HTTPException(status_code=404, detail="Workspace not found")
    uid = f"upd-{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    update = {
        "id": uid,
        "workspace_id": workspace_id,
        "title": payload.get("title", "Site Update"),
        "description": payload.get("description", ""),
        "work_in_progress": payload.get("work_in_progress", ""),
        "progress_percentage": payload.get("progress_percentage", 0),
        "photos": payload.get("photos", []),
        "issues_or_delays": payload.get("issues_or_delays", ""),
        "next_activities": payload.get("next_activities", ""),
        "posted_by": payload.get("posted_by", "Professional"),
        "created_at": now,
    }
    db.progress_updates[uid] = update
    save_update_to_supabase(update)
    ws = db.project_workspaces.get(workspace_id)
    if ws:
        ws["overall_progress"] = payload.get("progress_percentage", ws.get("overall_progress", 0))
        ws["updated_at"] = now
        save_workspace_to_supabase(ws)
    return update


# ─── Payments ─────────────────────────────────────────────────────────────────

@router.get("/{workspace_id}/payments")
def list_payments(workspace_id: str):
    if supabase_client:
        try:
            res = supabase_client.table("payment_milestones").select("*").eq("workspace_id", workspace_id).execute()
            for row in res.data or []:
                db.payment_milestones[row["id"]] = row
        except Exception:
            pass
    return [p for p in db.payment_milestones.values() if p.get("workspace_id") == workspace_id]


@router.put("/{workspace_id}/payments/{payment_id}/mark-paid")
def mark_payment_paid(workspace_id: str, payment_id: str, payload: dict):
    pmt = db.payment_milestones.get(payment_id)
    if not pmt or pmt.get("workspace_id") != workspace_id:
        raise HTTPException(status_code=404, detail="Payment milestone not found")
    pmt["status"] = "paid"
    pmt["paid_date"] = datetime.now().isoformat()[:10]
    pmt["reference"] = payload.get("reference", "")
    db.payment_milestones[payment_id] = pmt
    save_payment_to_supabase(pmt)
    
    # Update amount_paid in workspace
    ws = db.project_workspaces.get(workspace_id)
    if ws:
        total_paid = sum(
            p["amount"] for p in db.payment_milestones.values()
            if p.get("workspace_id") == workspace_id and p.get("status") == "paid"
        )
        ws["amount_paid"] = total_paid
        save_workspace_to_supabase(ws)
    return pmt


# ─── Documents ────────────────────────────────────────────────────────────────

@router.get("/{workspace_id}/documents")
def list_documents(workspace_id: str):
    if supabase_client:
        try:
            res = supabase_client.table("workspace_documents").select("*").eq("workspace_id", workspace_id).execute()
            for row in res.data or []:
                db.workspace_documents[row["id"]] = row
        except Exception:
            pass
    return [d for d in db.workspace_documents.values() if d.get("workspace_id") == workspace_id]


@router.post("/{workspace_id}/documents")
def add_document(workspace_id: str, payload: dict):
    did = f"doc-{uuid.uuid4().hex[:8]}"
    doc = {
        "id": did,
        "workspace_id": workspace_id,
        "filename": payload.get("filename", "document.pdf"),
        "category": payload.get("category", "Other"),
        "url": payload.get("url", ""),
        "uploader": payload.get("uploader", "Professional"),
        "uploaded_at": datetime.now().isoformat(),
    }
    db.workspace_documents[did] = doc
    if supabase_client:
        try:
            supabase_client.table("workspace_documents").insert(doc).execute()
        except Exception as e:
            print(f"Supabase document insert notice: {e}")
    return doc


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _recalculate_progress(workspace_id: str):
    milestones = [m for m in db.project_milestones.values() if m.get("workspace_id") == workspace_id]
    if not milestones:
        return
    avg = sum(m.get("progress_percentage", 0) for m in milestones) / len(milestones)
    ws = db.project_workspaces.get(workspace_id)
    if ws:
        ws["overall_progress"] = round(avg)
        save_workspace_to_supabase(ws)


def _ensure_default_milestones(workspace_id: str):
    """Seed default construction milestones for a new workspace."""
    defaults = [
        ("Foundation & Plinth Work", "Excavation, footing, plinth beam casting", "2027-01-15", "2027-03-15", 1200000),
        ("Ground Floor Structure", "Columns, beams, slab casting for ground floor", "2027-03-16", "2027-05-30", 1500000),
        ("First Floor Structure", "First floor columns, beams, roof slab", "2027-06-01", "2027-08-15", 1200000),
        ("Finishing Works", "Plastering, waterproofing, tiling, electrical & plumbing", "2027-08-16", "2027-11-30", 2500000),
        ("Final Handover", "Painting, fixtures, landscaping & swimming pool", "2027-12-01", "2027-12-15", 950000),
    ]
    for name, desc, ps, pe, amt in defaults:
        mid = f"ms-{uuid.uuid4().hex[:8]}"
        m_item = {
            "id": mid,
            "workspace_id": workspace_id,
            "name": name,
            "description": desc,
            "planned_start": ps,
            "planned_end": pe,
            "actual_start": None,
            "actual_end": None,
            "progress_percentage": 0,
            "status": "not_started",
            "payment_amount": amt,
            "photos": [],
            "created_at": datetime.now().isoformat(),
        }
        db.project_milestones[mid] = m_item
        save_milestone_to_supabase(m_item)


def _ensure_default_payments(workspace_id: str):
    ws = db.project_workspaces.get(workspace_id)
    agreed = ws.get("agreed_amount", 8150000) if ws else 8150000
    schedule = [
        ("15% Advance / Mobilisation", 0.15, "pending", "2027-01-10"),
        ("25% Foundation Completion", 0.25, "upcoming", "2027-03-20"),
        ("30% Plinth & Ground Floor Slab", 0.30, "upcoming", "2027-06-10"),
        ("20% First Floor & Roof Slab", 0.20, "upcoming", "2027-09-01"),
        ("10% Handover & Final Clearance", 0.10, "upcoming", "2027-12-20"),
    ]
    for name, pct, status, due in schedule:
        pid = f"pmt-{uuid.uuid4().hex[:8]}"
        p_item = {
            "id": pid,
            "workspace_id": workspace_id,
            "name": name,
            "amount": round(agreed * pct),
            "status": status,
            "due_date": due,
            "paid_date": None,
            "reference": "",
        }
        db.payment_milestones[pid] = p_item
        save_payment_to_supabase(p_item)
