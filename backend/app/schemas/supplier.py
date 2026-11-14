from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# --- Product Media ---
class ProductMediaBase(BaseModel):
    media_url: str
    display_order: int = 0

class ProductMediaCreate(ProductMediaBase):
    pass

class ProductMediaResponse(ProductMediaBase):
    id: str
    product_id: str

# --- Supplier Product ---
class SupplierProductBase(BaseModel):
    product_name: str
    category: str
    brand: Optional[str] = None
    description: str
    specifications: Optional[str] = None
    unit_of_measurement: str
    indicative_price: float
    currency: str = "INR"
    in_stock: bool = True
    delivery_available: bool = True
    primary_image_url: Optional[str] = None

class SupplierProductCreate(SupplierProductBase):
    media: Optional[List[ProductMediaCreate]] = []

class SupplierProductUpdate(BaseModel):
    product_name: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[str] = None
    unit_of_measurement: Optional[str] = None
    indicative_price: Optional[float] = None
    currency: Optional[str] = None
    in_stock: Optional[bool] = None
    delivery_available: Optional[bool] = None
    primary_image_url: Optional[str] = None

class SupplierProductResponse(SupplierProductBase):
    id: str
    supplier_id: str
    media: List[ProductMediaResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Supplier Category ---
class SupplierCategoryBase(BaseModel):
    category_name: str

class SupplierCategoryCreate(SupplierCategoryBase):
    pass

class SupplierCategoryResponse(SupplierCategoryBase):
    id: str
    supplier_id: str

# --- Supplier Profile ---
class SupplierProfileBase(BaseModel):
    company_name: str
    contact_person_name: Optional[str] = None
    business_type: str = "Individual proprietor"  # 'Individual proprietor' | 'Partnership' | 'Private limited company' | 'Other'
    year_of_establishment: Optional[int] = None
    description: str = ""
    logo_url: Optional[str] = None
    business_email: str
    phone: str
    alt_phone: Optional[str] = None
    website: Optional[str] = None
    state: str = "Goa"
    district: str = "South Goa"
    city: str = "Verna"
    pincode: Optional[str] = None
    business_address: Optional[str] = None
    latitude: Optional[float] = 15.3582
    longitude: Optional[float] = 73.9314
    primary_location: str = "Verna Industrial Estate, Goa"
    delivery_locations: List[str] = ["North Goa", "South Goa"]
    subscription_tier: str = "free"  # 'free' | 'pro' | 'premium'
    is_sponsored: bool = False

class SupplierProfileCreate(SupplierProfileBase):
    categories: Optional[List[SupplierCategoryCreate]] = []
    is_published: bool = True

class SupplierProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    contact_person_name: Optional[str] = None
    business_type: Optional[str] = None
    year_of_establishment: Optional[int] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    business_email: Optional[str] = None
    phone: Optional[str] = None
    alt_phone: Optional[str] = None
    website: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    business_address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    primary_location: Optional[str] = None
    delivery_locations: Optional[List[str]] = None
    subscription_tier: Optional[str] = None
    is_sponsored: Optional[bool] = None
    is_published: Optional[bool] = None

class SupplierProfileResponse(SupplierProfileBase):
    id: str
    is_published: bool = True
    profile_completion_pct: int = 20
    verification_status: str = "verified"
    categories: List[SupplierCategoryResponse] = []
    products: List[SupplierProductResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
