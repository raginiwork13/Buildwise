import os
from typing import List, Optional, Any
from datetime import datetime
import uuid
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, UploadFile, File, HTTPException, Query

from app.schemas.quotation import (
    ComparisonResponse, 
    ExtractedQuotation,
    QuotationCreate,
    QuotationUpdate,
    QuotationResponse,
    InterestCreate,
    InterestResponse
)
from app.services.quotation_analyzer import (
    extract_text_from_pdf,
    parse_quotation_text,
    evaluate_and_rank_quotations,
    get_default_goa_benchmark_quotes
)
from app.db.store import db, supabase_client
from app.routers.notifications import add_notification

router = APIRouter(prefix="/quotations", tags=["Quotations and AI Comparison"])

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

# =============================================================================
# 1. CORE QUOTATIONS CRUD ENDPOINTS
# =============================================================================

@router.get("", response_model=List[QuotationResponse])
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

@router.post("", response_model=QuotationResponse, status_code=201)
def create_quotation(payload: QuotationCreate):
    qid = f"quot-{uuid.uuid4().hex[:8]}"
    now = datetime.now()
    data = payload.dict()
    data["id"] = qid
    data["created_at"] = now.isoformat()
    data["updated_at"] = now.isoformat()
    data["status"] = "submitted"

    db.project_quotations[qid] = data
    save_quotation_to_supabase(data)

    # Increment project enquiry count if project exists
    proj_id = data.get("project_id")
    if proj_id in db.customer_projects:
        db.customer_projects[proj_id]["enquiries_count"] = db.customer_projects[proj_id].get("enquiries_count", 0) + 1

    # --- Trigger Notification to Consumer ---
    # "when the quotation is uploaded by the professionals that time consumer should receive notification you received quotation from this so and so professional"
    c_name = data.get("customer_name") or "Valued Client"
    p_name = data.get("provider_name") or "Professional"
    p_comp = data.get("provider_company") or p_name
    proj_title = data.get("project_title") or "Project"
    price = float(data.get("total_estimated_price") or 0.0)

    add_notification(
        title="📄 Received Quotation",
        desc=f"You received a quotation from {p_name} ({p_comp}) for project '{proj_title}'. Estimated: ₹{price:,.2f}",
        recipient_role="customer",
        recipient_name=c_name,
        recipient_id=data.get("customer_id"),
        sender_name=p_name,
        notif_type="quotation",
        meta={"quotation_id": qid, "project_id": proj_id, "amount": price, "provider_name": p_name}
    )

    return data

@router.get("/{id}", response_model=QuotationResponse)
def get_quotation(id: str):
    if id not in db.project_quotations:
        sync_quotations_from_supabase()
    if id not in db.project_quotations:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return db.project_quotations[id]

@router.put("/{id}/status", response_model=QuotationResponse)
def update_quotation_status(id: str, payload: QuotationUpdate):
    if id not in db.project_quotations:
        sync_quotations_from_supabase()
    if id not in db.project_quotations:
        raise HTTPException(status_code=404, detail="Quotation not found")

    current = db.project_quotations[id]
    if payload.status:
        current["status"] = payload.status
    if payload.notes:
        current["notes"] = payload.notes
    current["updated_at"] = datetime.now().isoformat()
    db.project_quotations[id] = current

    if supabase_client:
        try:
            supabase_client.table("project_quotations").update({
                "status": current["status"], 
                "updated_at": current["updated_at"]
            }).eq("id", id).execute()
        except Exception as e:
            print(f"Supabase quotation update notice: {e}")

    c_name = current.get("customer_name") or "Valued Client"
    p_name = current.get("provider_name") or "Professional"
    p_comp = current.get("provider_company") or p_name
    proj_title = current.get("project_title") or "Project"
    price = float(current.get("total_estimated_price") or 0.0)

    # --- Trigger Notification on Status Change ---
    # 1. When the quotation is approved by consumer:
    # "when the quotation approved by consumer professional should receive notification"
    if payload.status == "approved":
        # Notification to Professional:
        add_notification(
            title="✅ Quotation Approved by Consumer",
            desc=f"{c_name} approved your quotation for project '{proj_title}' (₹{price:,.2f}). Please review and accept project commencement.",
            recipient_role="professional",
            recipient_name=p_name,
            recipient_id=current.get("provider_id"),
            sender_name=c_name,
            notif_type="quotation",
            meta={"quotation_id": id, "project_id": current.get("project_id"), "status": "approved"}
        )
        # Notification to Consumer:
        add_notification(
            title="Quotation Approval Sent",
            desc=f"You approved the quotation from {p_name} for '{proj_title}'. Awaiting professional confirmation to start work.",
            recipient_role="customer",
            recipient_name=c_name,
            recipient_id=current.get("customer_id"),
            sender_name=p_name,
            notif_type="quotation",
            meta={"quotation_id": id, "status": "approved"}
        )

    # 2. When the professional approves / accepts work commencement:
    # "and also the professional will approve consumer will receive the notification"
    elif payload.status == "work_started":
        # Notification to Consumer:
        add_notification(
            title="🎉 Quotation Approved by Professional!",
            desc=f"{p_name} ({p_comp}) has approved project commencement for '{proj_title}'! Work agreement active and milestone tracking ready.",
            recipient_role="customer",
            recipient_name=c_name,
            recipient_id=current.get("customer_id"),
            sender_name=p_name,
            notif_type="project",
            meta={"quotation_id": id, "project_id": current.get("project_id"), "status": "work_started"}
        )
        # Notification to Professional:
        add_notification(
            title="🚀 Project Commenced",
            desc=f"You confirmed project commencement for '{proj_title}' with {c_name}. Milestone workspace is live.",
            recipient_role="professional",
            recipient_name=p_name,
            recipient_id=current.get("provider_id"),
            sender_name=c_name,
            notif_type="project",
            meta={"quotation_id": id, "status": "work_started"}
        )

    return current

# =============================================================================
# 2. AI QUOTATION COMPARISON & MCDA ENDPOINTS
# =============================================================================

@router.get("/benchmark", response_model=ComparisonResponse)
def get_benchmark_comparison():
    quotes = get_default_goa_benchmark_quotes()
    return evaluate_and_rank_quotations(quotes)

@router.post("/compare", response_model=ComparisonResponse)
def compare_custom_quotations(quotes: List[ExtractedQuotation]):
    if len(quotes) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please provide at least 2 contractor quotations for comparison."
        )

    dict_quotes = [q.dict() for q in quotes]
    return evaluate_and_rank_quotations(dict_quotes)

@router.post("/upload-pdfs", response_model=ComparisonResponse)
async def upload_and_compare_pdfs(files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least 2 PDF quotation files to run side-by-side comparison."
        )

    file_payloads = []
    for file in files:
        if file.filename.lower().endswith(".pdf"):
            content = await file.read()
            file_payloads.append((file.filename, content))

    if len(file_payloads) < 2:
        raise HTTPException(
            status_code=400,
            detail="Please upload at least 2 valid PDF documents (.pdf)."
        )

    def process_single_pdf(item):
        fname, content = item
        try:
            text = extract_text_from_pdf(content)
            return parse_quotation_text(fname, text)
        except Exception as e:
            print(f"Error processing {fname}: {e}")
            return None

    with ThreadPoolExecutor(max_workers=min(5, len(file_payloads))) as executor:
        extracted_quotes = list(executor.map(process_single_pdf, file_payloads))

    valid_quotes = [q for q in extracted_quotes if q and q.get("contractor")]

    if len(valid_quotes) < 2:
        raise HTTPException(
            status_code=400,
            detail="Could not extract sufficient quotation data from the uploaded files. Please ensure the PDFs contain readable contractor text."
        )

    return evaluate_and_rank_quotations(valid_quotes)
