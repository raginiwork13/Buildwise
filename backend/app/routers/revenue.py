from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel

from app.db.store import db, supabase_client

router = APIRouter(prefix="/admin/revenue", tags=["revenue"])

class CollectRevenueRequest(BaseModel):
    project_id: str
    project_title: str
    quotation_id: Optional[str] = None
    agreed_budget: float
    customer_name: str
    professional_name: str
    customer_commission_rate: float = 2.0 # 2% from customer
    professional_commission_rate: float = 2.0 # 2% from professional
    payment_method: Optional[str] = "Direct Platform Escrow"
    transaction_type: Optional[str] = "project_approval_commission"

class CircumventionWarningRequest(BaseModel):
    workspace_id: str
    project_title: Optional[str] = ""
    customer_name: Optional[str] = ""
    customer_email: Optional[str] = ""
    professional_name: Optional[str] = ""
    professional_email: Optional[str] = ""
    agreed_budget: Optional[float] = 0.0
    admin_note: Optional[str] = "Platform anti-circumvention notice sent by admin"

def save_revenue_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("platform_revenue_transactions").upsert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase platform revenue upsert notice: {e}")
    return None

def sync_revenue_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("platform_revenue_transactions").select("*").execute()
        for row in res.data or []:
            db.platform_revenue_transactions[row["id"]] = row
    except Exception as e:
        print(f"Supabase platform revenue sync notice: {e}")

@router.get("")
def get_platform_revenue_overview():
    sync_revenue_from_supabase()
    transactions = list(getattr(db, "platform_revenue_transactions", {}).values())

    # Sort newest first
    transactions.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)

    total_revenue = sum(float(t.get("total_platform_revenue") or 0.0) for t in transactions)
    total_customer_commissions = sum(float(t.get("customer_commission_amount") or 0.0) for t in transactions)
    total_pro_commissions = sum(float(t.get("professional_commission_amount") or 0.0) for t in transactions)
    
    # Commission project transactions vs subscription transactions
    project_txs = [t for t in transactions if not str(t.get("transaction_type", "")).startswith("subscription")]
    total_contract_value = sum(float(t.get("agreed_budget") or 0.0) for t in project_txs)

    subscription_txs = [t for t in transactions if str(t.get("transaction_type", "")).startswith("subscription")]
    total_subscription_revenue = sum(float(t.get("total_platform_revenue") or 0.0) for t in subscription_txs)
    
    # Subscriptions breakdown
    pro_txs = [t for t in subscription_txs if t.get("subscription_tier") == "pro" or t.get("transaction_type") == "subscription_pro"]
    premium_txs = [t for t in subscription_txs if t.get("subscription_tier") == "premium" or t.get("transaction_type") == "subscription_premium"]

    pro_count = len(pro_txs)
    pro_revenue = sum(float(t.get("total_platform_revenue") or 0.0) for t in pro_txs)

    premium_count = len(premium_txs)
    premium_revenue = sum(float(t.get("total_platform_revenue") or 0.0) for t in premium_txs)

    return {
        "success": True,
        "kpis": {
            "total_platform_revenue": round(total_revenue, 2),
            "total_customer_commissions_2pct": round(total_customer_commissions, 2),
            "total_pro_commissions_2pct": round(total_pro_commissions, 2),
            "total_contract_value_managed": round(total_contract_value, 2),
            "total_approved_engagements": len(project_txs),
            "commission_rate_customer": "2.0%",
            "commission_rate_professional": "2.0%",
            "total_platform_commission_take": "4.0%",
            # Subscription Metrics
            "total_subscription_revenue": round(total_subscription_revenue, 2),
            "pro_profile_count": pro_count,
            "pro_revenue": round(pro_revenue, 2),
            "premium_profile_count": premium_count,
            "premium_revenue": round(premium_revenue, 2)
        },
        "transactions": transactions
    }

@router.post("/collect", status_code=201)
def record_project_commission(payload: CollectRevenueRequest):
    rid = f"rev-{uuid.uuid4().hex[:8]}"
    now = datetime.now()

    cust_amt = round(payload.agreed_budget * (payload.customer_commission_rate / 100.0), 2)
    pro_amt = round(payload.agreed_budget * (payload.professional_commission_rate / 100.0), 2)
    tot_rev = round(cust_amt + pro_amt, 2)

    data = {
        "id": rid,
        "project_id": payload.project_id,
        "project_title": payload.project_title,
        "quotation_id": payload.quotation_id,
        "agreed_budget": payload.agreed_budget,
        "customer_name": payload.customer_name,
        "customer_commission_rate": payload.customer_commission_rate,
        "customer_commission_amount": cust_amt,
        "professional_name": payload.professional_name,
        "professional_commission_rate": payload.professional_commission_rate,
        "professional_commission_amount": pro_amt,
        "total_platform_revenue": tot_rev,
        "status": "collected",
        "payment_method": payload.payment_method or "Direct Platform Escrow",
        "transaction_type": payload.transaction_type or "project_approval_commission",
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }

    if not hasattr(db, "platform_revenue_transactions"):
        db.platform_revenue_transactions = {}

    db.platform_revenue_transactions[rid] = data
    db.persist("platform_revenue_transactions")
    save_revenue_to_supabase(data)

    return {
        "success": True,
        "message": f"Collected 2% commission (₹{cust_amt:,}) from customer and 2% (₹{pro_amt:,}) from professional. Total platform revenue: ₹{tot_rev:,}.",
        "transaction": data
    }


# ─── Admin: Send Circumvention Warning ────────────────────────────────────────

@router.post("/send-circumvention-warning")
def send_circumvention_warning(payload: CircumventionWarningRequest):
    """Admin triggers anti-circumvention warning for a workspace that has unpaid commission."""
    from app.db.store import db as _db
    from app.routers.workspace import flag_circumvention, save_workspace_to_supabase

    ws_id = payload.workspace_id
    ws = _db.project_workspaces.get(ws_id)
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    now = datetime.now().isoformat()
    ws["commission_status"] = "flagged_bypass"
    ws["warning_notices_sent"] = int(ws.get("warning_notices_sent") or 0) + 1
    ws["circumvention_flagged_at"] = now
    ws["updated_at"] = now
    _db.project_workspaces[ws_id] = ws
    save_workspace_to_supabase(ws)

    # Log warning record
    if not hasattr(_db, "circumvention_warnings"):
        _db.circumvention_warnings = {}
    warn_id = f"warn-{uuid.uuid4().hex[:8]}"
    comm_total = float(ws.get("commission_amount_customer", 0) or 0) + float(ws.get("commission_amount_professional", 0) or 0)
    warning_record = {
        "id": warn_id,
        "workspace_id": ws_id,
        "project_title": payload.project_title or ws.get("project_title", ""),
        "customer_name": payload.customer_name or ws.get("customer_name", ""),
        "customer_email": payload.customer_email or "",
        "professional_name": payload.professional_name or ws.get("professional_name", ""),
        "professional_email": payload.professional_email or "",
        "agreed_budget": payload.agreed_budget or float(ws.get("agreed_amount", 0) or 0),
        "commission_due": comm_total,
        "warning_type": "bypass_detected",
        "notices_sent": ws["warning_notices_sent"],
        "admin_note": payload.admin_note,
        "created_at": now,
        "updated_at": now,
    }
    _db.circumvention_warnings[warn_id] = warning_record

    if supabase_client:
        try:
            supabase_client.table("circumvention_warnings").insert(warning_record).execute()
        except Exception as e:
            print(f"Circumvention log notice: {e}")

    return {
        "success": True,
        "warn_id": warn_id,
        "workspace_id": ws_id,
        "notices_sent": ws["warning_notices_sent"],
        "timestamp": now,
        "message": f"Anti-circumvention notice #{ws['warning_notices_sent']} sent for workspace {ws_id}. Customer & Professional have been alerted.",
    }


# ─── Admin: List Flagged Workspaces ───────────────────────────────────────────

@router.get("/flagged-workspaces")
def get_flagged_workspaces():
    """Return workspaces with pending or flagged commission status for admin monitoring."""
    from app.routers.workspace import sync_workspaces_from_supabase
    sync_workspaces_from_supabase()
    all_ws = list(_db_workspaces())
    flagged = [
        ws for ws in all_ws
        if ws.get("commission_status") in ("pending", "flagged_bypass")
    ]
    flagged.sort(key=lambda w: str(w.get("created_at") or ""), reverse=True)
    return {"success": True, "count": len(flagged), "workspaces": flagged}

def _db_workspaces():
    from app.db.store import db as _db
    return _db.project_workspaces.values()
