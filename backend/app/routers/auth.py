from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime

from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserAccountResponse
)
from app.db.store import db, supabase_client

router = APIRouter(prefix="/auth", tags=["authentication"])

def save_account_to_supabase(account: dict):
    if not supabase_client:
        return None
    payload = dict(account)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("user_accounts").upsert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase user_account notice: {e}")
    return None

def sync_accounts_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("user_accounts").select("*").execute()
        for row in res.data or []:
            db.user_accounts[row["email"]] = row
    except Exception as e:
        print(f"Supabase accounts sync notice: {e}")

@router.post("/register", response_model=UserAccountResponse, status_code=201)
def register(payload: UserRegisterRequest):
    email = payload.email.lower().strip()
    now = datetime.now()
    aid = str(uuid.uuid4())
    data = payload.dict()
    data["id"] = aid
    data["email"] = email
    data["password_hash"] = payload.password or "pass123"
    data["is_verified"] = True
    data["created_at"] = now
    data["last_login_at"] = now

    # Store in memory
    db.user_accounts[email] = data

    # Store in Supabase
    save_account_to_supabase(data)

    return data

@router.post("/login", response_model=UserAccountResponse)
def login(payload: UserLoginRequest):
    email = payload.email.lower().strip()
    sync_accounts_from_supabase()

    # 1. Search in user_accounts
    if email in db.user_accounts:
        user = db.user_accounts[email]
        user["last_login_at"] = datetime.now()
        save_account_to_supabase(user)
        return user

    # 2. Check professional profiles
    for p in db.professional_profiles.values():
        if p.get("email", "").lower().strip() == email:
            acct = {
                "id": p["id"],
                "email": email,
                "password_hash": "pass123",
                "full_name": p["full_name"],
                "role": "professional",
                "phone": p.get("phone"),
                "company_name": p.get("company_name"),
                "professional_category": p.get("category"),
                "city": p.get("city"),
                "district": p.get("district"),
                "subscription_tier": p.get("subscription_tier", "free"),
                "is_sponsored": p.get("is_sponsored", False),
                "is_verified": True,
                "created_at": datetime.now(),
                "last_login_at": datetime.now()
            }
            db.user_accounts[email] = acct
            save_account_to_supabase(acct)
            return acct

    # 3. Check customer profiles
    for c in db.customer_profiles.values():
        if c.get("email", "").lower().strip() == email:
            acct = {
                "id": c["id"],
                "email": email,
                "password_hash": "pass123",
                "full_name": c["full_name"],
                "role": "customer",
                "phone": c.get("phone"),
                "city": c.get("city"),
                "district": c.get("district"),
                "default_location": f"{c.get('city')}, {c.get('district')}",
                "subscription_tier": "free",
                "is_sponsored": False,
                "is_verified": True,
                "created_at": datetime.now(),
                "last_login_at": datetime.now()
            }
            db.user_accounts[email] = acct
            save_account_to_supabase(acct)
            return acct

    # 4. Check supplier profiles
    for s in db.supplier_profiles.values():
        if s.get("business_email", "").lower().strip() == email:
            acct = {
                "id": s["id"],
                "email": email,
                "password_hash": "pass123",
                "full_name": s.get("contact_person_name") or s["company_name"],
                "role": "supplier",
                "phone": s.get("phone"),
                "business_name": s["company_name"],
                "city": s.get("city"),
                "district": s.get("district"),
                "warehouse_location": s.get("primary_location"),
                "subscription_tier": s.get("subscription_tier", "free"),
                "is_sponsored": s.get("is_sponsored", False),
                "is_verified": True,
                "created_at": datetime.now(),
                "last_login_at": datetime.now()
            }
            db.user_accounts[email] = acct
            save_account_to_supabase(acct)
            return acct

    # If user doesn't exist, auto-create a session account for immediate frictionless access
    name_prefix = email.split("@")[0].replace(".", " ").title()
    new_acct = {
        "id": str(uuid.uuid4()),
        "email": email,
        "password_hash": "pass123",
        "full_name": name_prefix,
        "role": "customer",
        "phone": "+91 98221 00000",
        "city": "Panaji",
        "district": "North Goa",
        "default_location": "Panaji, North Goa",
        "subscription_tier": "free",
        "is_sponsored": False,
        "is_verified": True,
        "created_at": datetime.now(),
        "last_login_at": datetime.now()
    }
    db.user_accounts[email] = new_acct
    save_account_to_supabase(new_acct)
    return new_acct

@router.get("/accounts", response_model=List[UserAccountResponse])
def list_accounts():
    sync_accounts_from_supabase()
    results = list(db.user_accounts.values())
    # Sort recently logged in first
    results.sort(key=lambda x: str(x.get("last_login_at") or ""), reverse=True)
    return results

class UpdateTierRequest(BaseModel):
    email: str
    subscription_tier: str # 'free' | 'pro' | 'premium'
    role: Optional[str] = None

@router.post("/update-tier")
def update_user_tier(payload: UpdateTierRequest):
    email = payload.email.lower().strip()
    tier = payload.subscription_tier.lower().strip()
    is_sponsored = tier in ["premium", "pro"]

    sync_accounts_from_supabase()
    account = db.user_accounts.get(email)
    if not account:
        account = {
            "id": str(uuid.uuid4()),
            "email": email,
            "full_name": email.split("@")[0].title(),
            "role": payload.role or "customer",
            "subscription_tier": tier,
            "is_sponsored": is_sponsored,
            "created_at": datetime.now(),
            "last_login_at": datetime.now()
        }
    else:
        account["subscription_tier"] = tier
        account["is_sponsored"] = is_sponsored
        account["last_login_at"] = datetime.now()

    db.user_accounts[email] = account
    save_account_to_supabase(account)

    # Also update role-specific profiles in Supabase if connected
    if supabase_client:
        try:
            supabase_client.table("customer_profiles").update({
                "subscription_tier": tier,
                "is_sponsored": is_sponsored
            }).eq("email", email).execute()
        except Exception as e:
            print(f"Customer profile tier update notice: {e}")

        try:
            supabase_client.table("supplier_profiles").update({
                "subscription_tier": tier,
                "is_sponsored": is_sponsored
            }).eq("business_email", email).execute()
        except Exception as e:
            print(f"Supplier profile tier update notice: {e}")

        try:
            supabase_client.table("professional_profiles").update({
                "subscription_tier": tier,
                "is_sponsored": is_sponsored
            }).eq("email", email).execute()
        except Exception as e:
            print(f"Professional profile tier update notice: {e}")

    return {
        "success": True,
        "email": email,
        "subscription_tier": tier,
        "is_sponsored": is_sponsored,
        "message": f"Successfully updated subscription to {tier.upper()} plan!"
    }

