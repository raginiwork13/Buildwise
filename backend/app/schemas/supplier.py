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
    logo_url: Optional[str] = None
    description: str
    business_email: str
    phone: str
    website: Optional[str] = None
    business_address: Optional[str] = None
    primary_location: str
    delivery_locations: List[str] = []

class SupplierProfileCreate(SupplierProfileBase):
    categories: Optional[List[SupplierCategoryCreate]] = []

class SupplierProfileUpdate(BaseModel):
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    business_email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    business_address: Optional[str] = None
    primary_location: Optional[str] = None
    delivery_locations: Optional[List[str]] = None
    is_published: Optional[bool] = None

class SupplierProfileResponse(SupplierProfileBase):
    id: str
    is_published: bool = False
    profile_completion_pct: int = 20
    verification_status: str = "not_submitted"
    categories: List[SupplierCategoryResponse] = []
    products: List[SupplierProductResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

