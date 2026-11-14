from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from app.schemas.supplier import (
    SupplierProfileCreate,
    SupplierProfileUpdate,
    SupplierProfileResponse,
    SupplierCategoryCreate,
    SupplierCategoryResponse,
    SupplierProductCreate,
    SupplierProductUpdate,
    SupplierProductResponse
)
from app.schemas.verification import VerificationSubmissionCreate, VerificationSubmissionResponse
from app.db.store import db, supabase_client

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

def calculate_supplier_completion(s: dict) -> int:
    score = 0
    if s.get("company_name") and s.get("business_email") and s.get("phone") and s.get("description"):
        score += 30
    if s.get("primary_location") or s.get("city"):
        score += 20
    if s.get("delivery_locations") and len(s.get("delivery_locations", [])) > 0:
        score += 20
    if s.get("logo_url"):
        score += 15
    supplier_id = s.get("id")
    products = [p for p in db.supplier_products.values() if p.get("supplier_id") == supplier_id]
    if products:
        score += 15
    return min(score, 100)

def save_supplier_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("supplier_profiles").upsert(payload).execute()
        return res.data
    except Exception as e:
        err = str(e)
        if any(c in err for c in ["subscription_tier", "is_sponsored", "contact_person_name", "business_type", "year_of_establishment", "alt_phone"]):
            # Fallback omitting new columns if migration hasn't been executed
            safe_payload = {k: v for k, v in payload.items() if k in [
                "id", "company_name", "logo_url", "description", "business_email", "phone", 
                "website", "business_address", "primary_location", "delivery_locations", 
                "is_published", "profile_completion_pct", "verification_status", "latitude", "longitude"
            ]}
            try:
                res = supabase_client.table("supplier_profiles").upsert(safe_payload).execute()
                return res.data
            except Exception as e2:
                print(f"Supabase supplier fallback insert error: {e2}")
        else:
            print(f"Supabase supplier insert error: {e}")
    return None

def sync_suppliers_from_supabase():
    if not supabase_client:
        return
    try:
        sup_res = supabase_client.table("supplier_profiles").select("*").execute()
        for row in sup_res.data or []:
            sid = row["id"]
            if sid not in db.supplier_profiles:
                db.supplier_profiles[sid] = row
            else:
                db.supplier_profiles[sid].update(row)

        prod_res = supabase_client.table("supplier_products").select("*").execute()
        for p in prod_res.data or []:
            db.supplier_products[p["id"]] = p

        media_res = supabase_client.table("product_media").select("*").execute()
        for m in media_res.data or []:
            db.product_media[m["id"]] = m
    except Exception as e:
        print(f"Supabase supplier sync notice: {e}")

def assemble_supplier(s: dict) -> dict:
    sid = s["id"]
    categories = [c for c in db.supplier_categories.values() if c.get("supplier_id") == sid]
    
    products = []
    for p in db.supplier_products.values():
        if p.get("supplier_id") == sid:
            p_copy = dict(p)
            pid = p["id"]
            media = [m for m in db.product_media.values() if m.get("product_id") == pid]
            p_copy["media"] = sorted(media, key=lambda x: x.get("display_order", 0))
            products.append(p_copy)

    res = dict(s)
    res["profile_completion_pct"] = calculate_supplier_completion(s)
    res["categories"] = categories
    res["products"] = products
    res["subscription_tier"] = s.get("subscription_tier", "free")
    res["is_sponsored"] = s.get("is_sponsored", False)
    return res

@router.post("", response_model=SupplierProfileResponse, status_code=201)
def create_supplier(payload: SupplierProfileCreate):
    sid = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    categories_data = data.pop("categories", [])

    data["id"] = sid
    data["created_at"] = now
    data["updated_at"] = now
    data["is_published"] = True
    data["verification_status"] = "verified"
    data["profile_completion_pct"] = calculate_supplier_completion(data)

    db.supplier_profiles[sid] = data
    save_supplier_to_supabase(data)

    for c in categories_data:
        cid = str(uuid.uuid4())
        c["id"] = cid
        c["supplier_id"] = sid
        db.supplier_categories[cid] = c

    return assemble_supplier(data)

@router.get("", response_model=List[SupplierProfileResponse])
def list_suppliers(only_published: bool = True):
    sync_suppliers_from_supabase()
    results = []
    for s in db.supplier_profiles.values():
        if only_published and not s.get("is_published", True):
            continue
        results.append(assemble_supplier(s))
    
    # Sort sponsored suppliers first
    def get_sort_key(item: dict):
        tier = item.get("subscription_tier", "free")
        if tier == "premium":
            return 3
        elif tier == "pro":
            return 2
        return 1

    results.sort(key=get_sort_key, reverse=True)
    return results

@router.get("/{id}", response_model=SupplierProfileResponse)
def get_supplier(id: str):
    if id not in db.supplier_profiles:
        sync_suppliers_from_supabase()
    if id not in db.supplier_profiles:
        raise HTTPException(status_code=404, detail="Supplier profile not found")
    return assemble_supplier(db.supplier_profiles[id])

@router.put("/{id}", response_model=SupplierProfileResponse)
def update_supplier(id: str, payload: SupplierProfileUpdate):
    if id not in db.supplier_profiles:
        sync_suppliers_from_supabase()
    if id not in db.supplier_profiles:
        raise HTTPException(status_code=404, detail="Supplier profile not found")
    
    current = db.supplier_profiles[id]
    updates = payload.dict(exclude_unset=True)
    current.update(updates)
    current["updated_at"] = datetime.now()
    current["profile_completion_pct"] = calculate_supplier_completion(current)
    db.supplier_profiles[id] = current
    save_supplier_to_supabase(current)
    return assemble_supplier(current)

# --- Products ---
@router.post("/{id}/products", response_model=SupplierProductResponse, status_code=201)
def add_product(id: str, payload: SupplierProductCreate):
    if id not in db.supplier_profiles:
        sync_suppliers_from_supabase()
    if id not in db.supplier_profiles:
        raise HTTPException(status_code=404, detail="Supplier profile not found")
    
    supplier = db.supplier_profiles[id]
    tier = (supplier.get("subscription_tier") or "free").lower().strip()

    # Rule: Free tier supplier can only list 1 product. Pro & Premium have unlimited listings.
    if tier == "free":
        existing_products = [p for p in db.supplier_products.values() if p.get("supplier_id") == id]
        if len(existing_products) >= 1:
            raise HTTPException(
                status_code=403,
                detail="Free supplier profiles can list only 1 product. Please upgrade to Pro or Premium for unlimited product listings."
            )

    prod_id = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    media_data = data.pop("media", [])

    data["id"] = prod_id
    data["supplier_id"] = id
    data["created_at"] = now
    data["updated_at"] = now
    db.supplier_products[prod_id] = data

    if supabase_client:
        try:
            prod_payload = dict(data)
            prod_payload["created_at"] = now.isoformat()
            prod_payload["updated_at"] = now.isoformat()
            supabase_client.table("supplier_products").insert(prod_payload).execute()
        except Exception as e:
            print(f"Supabase product insert error: {e}")

    saved_media = []
    for m in media_data:
        mid = str(uuid.uuid4())
        m["id"] = mid
        m["product_id"] = prod_id
        db.product_media[mid] = m
        if supabase_client:
            try:
                supabase_client.table("product_media").insert(m).execute()
            except Exception as e:
                print(f"Supabase product media insert error: {e}")
        saved_media.append(m)

    res = dict(data)
    res["media"] = saved_media
    return res

@router.delete("/{id}/products/{product_id}", status_code=200)
def delete_product(id: str, project_id: str):
    if project_id not in db.supplier_products:
        raise HTTPException(status_code=404, detail="Product not found")
    del db.supplier_products[project_id]
    return {"message": "Product removed successfully"}
