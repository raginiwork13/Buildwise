from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class CustomerProfileBase(BaseModel):
    full_name: str
    email: str
    phone: str
    profile_photo_url: Optional[str] = None
    state: str = "Goa"
    district: str = "North Goa"
    city: str
    pincode: Optional[str] = None
    full_address: Optional[str] = None
    customer_type: str = "Individual / Homeowner"  # "Individual / Homeowner" | "Property developer" | "Company / Organisation" | "Other"
    subscription_tier: str = "free"  # 'free' | 'pro' | 'premium'
    is_sponsored: bool = False

class CustomerProfileCreate(CustomerProfileBase):
    pass

class CustomerProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    profile_photo_url: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    full_address: Optional[str] = None
    customer_type: Optional[str] = None

class CustomerProfileResponse(CustomerProfileBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

