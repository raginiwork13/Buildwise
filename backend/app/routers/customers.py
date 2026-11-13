from fastapi import APIRouter, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime

from app.schemas.customer import (
    CustomerProfileCreate,
    CustomerProfileUpdate,
    CustomerProfileResponse
)
from app.db.store import db, supabase_client

router = APIRouter(prefix="/customers", tags=["customers"])

def save_customer_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("customer_profiles").insert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase customer insert notice: {e}")
    return None

def sync_customers_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("customer_profiles").select("*").execute()
        for row in res.data or []:
            db.customer_profiles[row["id"]] = row
    except Exception as e:
        print(f"Supabase customer sync notice: {e}")

@router.post("", response_model=CustomerProfileResponse, status_code=201)
def create_customer(payload: CustomerProfileCreate):
    cid = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    data["id"] = cid
    data["created_at"] = now
    data["updated_at"] = now

    # Save to local store
    db.customer_profiles[cid] = data

    # Save to Supabase customer_profiles table
    save_customer_to_supabase(data)

    return data

@router.get("/{id}", response_model=CustomerProfileResponse)
def get_customer(id: str):
    if id not in db.customer_profiles:
        sync_customers_from_supabase()
    if id not in db.customer_profiles:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    return db.customer_profiles[id]

@router.put("/{id}", response_model=CustomerProfileResponse)
def update_customer(id: str, payload: CustomerProfileUpdate):
    if id not in db.customer_profiles:
        sync_customers_from_supabase()
    if id not in db.customer_profiles:
        raise HTTPException(status_code=404, detail="Customer profile not found")

    current = db.customer_profiles[id]
    updates = payload.dict(exclude_unset=True)
    current.update(updates)
    current["updated_at"] = datetime.now()
    db.customer_profiles[id] = current

    if supabase_client:
        try:
            supabase_client.table("customer_profiles").update(current).eq("id", id).execute()
        except Exception as e:
            print(f"Supabase customer update notice: {e}")

    return current

