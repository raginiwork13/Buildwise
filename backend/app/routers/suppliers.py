from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
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
from app.db.store import db

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

def calculate_supplier_completion(s: dict) -> int:
    score = 0
    if s.get("company_name") and s.get("business_email") and s.get("phone") and s.get("description"):
        score += 30
    if s.get("primary_location"):
        score += 20
    if s.get("delivery_locations") and len(s.get("delivery_locations", [])) > 0:
        score += 20
    if s.get("logo_url"):
        score += 15
    # Product catalog bonus
    supplier_id = s.get("id")
    products = [p for p in db.supplier_products.values() if p.get("supplier_id") == supplier_id]
    if products:
        score += 15
    return min(score, 100)

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
    data["is_published"] = False
    data["verification_status"] = "not_submitted"
    data["profile_completion_pct"] = calculate_supplier_completion(data)

    db.supplier_profiles[sid] = data

    for c in categories_data:
        cid = str(uuid.uuid4())
        c["id"] = cid
        c["supplier_id"] = sid
        db.supplier_categories[cid] = c

    return assemble_supplier(data)

@router.get("", response_model=List[SupplierProfileResponse])
def list_suppliers(only_published: bool = True):
    results = []
    for s in db.supplier_profiles.values():
        if only_published and not s.get("is_published", False):
            continue
        results.append(assemble_supplier(s))
    return results

@router.get("/{id}", response_model=SupplierProfileResponse)
def get_supplier(id: str):
    if id not in db.supplier_profiles:
        raise HTTPException(status_code=404, detail="Supplier profile not found")
    return assemble_supplier(db.supplier_profiles[id])

@router.put("/{id}", response_model=SupplierProfileResponse)
def update_supplier(id: str, payload: SupplierProfileUpdate):
    if id not in db.supplier_profiles:
        raise HTTPException(status_code=404, detail="Supplier profile not found")
    
    current = db.supplier_profiles[id]
    updates = payload.dict(exclude_unset=True)
    current.update(updates)
    current["updated_at"] = datetime.now()
    current["profile_completion_pct"] = calculate_supplier_completion(current)
    db.supplier_profiles[id] = current
    return assemble_supplier(current)

# --- Products ---
@router.post("/{id}/products", response_model=SupplierProductResponse, status_code=201)
def add_product(id: str, payload: SupplierProductCreate):
    if id not in db.supplier_profiles:
        raise HTTPException(status_code=404, detail="Supplier profile not found")
    prod_id = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    media_data = data.pop("media", [])

    data["id"] = prod_id
    data["supplier_id"] = id
    data["created_at"] = now
    data["updated_at"] = now
    db.supplier_products[prod_id] = data

    saved_media = []
    for m in media_data:
        mid = str(uuid.uuid4())
        m["id"] = mid
        m["product_id"] = prod_id
        db.product_media[mid] = m
        saved_media.append(m)

    res = dict(data)
    res["media"] = saved_media
    return res

@router.put("/{id}/products/{product_id}", response_model=SupplierProductResponse)
def update_product(id: str, product_id: str, payload: SupplierProductUpdate):
    if product_id not in db.supplier_products:
        raise HTTPException(status_code=404, detail="Product not found")
    prod = db.supplier_products[product_id]
    if prod.get("supplier_id") != id:
        raise HTTPException(status_code=400, detail="Product does not belong to this supplier")
    
    updates = payload.dict(exclude_unset=True)
    prod.update(updates)
    prod["updated_at"] = datetime.now()
    db.supplier_products[product_id] = prod

    media = [m for m in db.product_media.values() if m.get("product_id") == product_id]
    res = dict(prod)
    res["media"] = sorted(media, key=lambda x: x.get("display_order", 0))
    return res

@router.delete("/{id}/products/{product_id}", status_code=200)
def delete_product(id: str, product_id: str):
    if product_id not in db.supplier_products:
        raise HTTPException(status_code=404, detail="Product not found")
    prod = db.supplier_products[product_id]
    if prod.get("supplier_id") != id:
        raise HTTPException(status_code=400, detail="Product does not belong to this supplier")
    
    del db.supplier_products[product_id]
    for mid, m in list(db.product_media.items()):
        if m.get("product_id") == product_id:
            del db.product_media[mid]
    return {"message": "Product removed successfully"}

