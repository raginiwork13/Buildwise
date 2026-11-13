from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserRegisterRequest(BaseModel):
    email: str
    password: Optional[str] = "pass123"
    full_name: str
    role: str  # 'customer' | 'professional' | 'supplier'
    phone: Optional[str] = "+91 98221 00000"
    company_name: Optional[str] = None
    business_name: Optional[str] = None
    professional_category: Optional[str] = None
    city: Optional[str] = "Panaji"
    district: Optional[str] = "North Goa"
    default_location: Optional[str] = None
    warehouse_location: Optional[str] = None
    subscription_tier: Optional[str] = "free"
    is_sponsored: Optional[bool] = False

class UserLoginRequest(BaseModel):
    email: str
    password: Optional[str] = None

class UserAccountResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    business_name: Optional[str] = None
    professional_category: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    default_location: Optional[str] = None
    warehouse_location: Optional[str] = None
    subscription_tier: str = "free"
    is_sponsored: bool = False
    is_verified: bool = True
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None

