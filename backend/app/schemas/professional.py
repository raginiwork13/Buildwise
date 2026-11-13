from typing import Optional, List
from pydantic import BaseModel, Field, HttpUrl
from datetime import date, datetime

# --- Professional Location ---
class LocationBase(BaseModel):
    location_name: str
    district: str

class LocationCreate(LocationBase):
    pass

class LocationResponse(LocationBase):
    id: str
    professional_id: str
    created_at: Optional[datetime] = None

# --- Professional Service ---
class ServiceBase(BaseModel):
    service_name: str
    description: Optional[str] = None
    pricing_model: str = "per_sqft"
    indicative_rate: float = 0.0

class ServiceCreate(ServiceBase):
    pass

class ServiceResponse(ServiceBase):
    id: str
    professional_id: str
    created_at: Optional[datetime] = None

# --- Portfolio Media ---
class PortfolioMediaBase(BaseModel):
    media_type: str = "image"
    file_url: str
    file_name: str
    caption: Optional[str] = None
    display_order: int = 0

class PortfolioMediaCreate(PortfolioMediaBase):
    pass

class PortfolioMediaResponse(PortfolioMediaBase):
    id: str
    portfolio_project_id: str
    created_at: Optional[datetime] = None

# --- Portfolio Project ---
class PortfolioProjectBase(BaseModel):
    title: str
    project_type: str
    description: str
    location: str
    completion_year: int
    project_area_sqft: Optional[float] = None
    indicative_budget: Optional[float] = None
    role: str
    display_order: int = 0

class PortfolioProjectCreate(PortfolioProjectBase):
    media: Optional[List[PortfolioMediaCreate]] = []

class PortfolioProjectUpdate(BaseModel):
    title: Optional[str] = None
    project_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    completion_year: Optional[int] = None
    project_area_sqft: Optional[float] = None
    indicative_budget: Optional[float] = None
    role: Optional[str] = None
    display_order: Optional[int] = None

class PortfolioProjectResponse(PortfolioProjectBase):
    id: str
    professional_id: str
    media: List[PortfolioMediaResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Certification ---
class CertificationBase(BaseModel):
    certification_name: str
    issuing_authority: str
    certificate_number: Optional[str] = None
    issue_date: date
    expiry_date: Optional[date] = None
    document_url: Optional[str] = None

class CertificationCreate(CertificationBase):
    pass

class CertificationResponse(CertificationBase):
    id: str
    professional_id: str
    verification_status: str = "pending"
    created_at: Optional[datetime] = None

# --- Professional Review ---
class ReviewResponse(BaseModel):
    id: str
    professional_id: str
    reviewer_name: str
    rating: float
    review_text: str
    project_reference: Optional[str] = None
    moderation_status: str = "approved"
    is_verified_purchase: bool = True
    created_at: Optional[datetime] = None

# --- Professional Profile ---
class ProfessionalProfileBase(BaseModel):
    full_name: str
    company_name: Optional[str] = None
    profile_photo_url: Optional[str] = None
    company_logo_url: Optional[str] = None
    category: str
    email: str
    phone: str
    website: Optional[str] = None
    bio: Optional[str] = None
    experience_years: int = 0
    specialisations: List[str] = []
    project_types_handled: List[str] = []
    min_budget: float = 100000.0
    max_budget: float = 50000000.0
    currency: str = "INR"
    availability_status: str = "available"
    country: str = "India"
    state: str = "Goa"
    district: str = "North Goa"
    city: str = "Panaji"
    business_address: Optional[str] = None
    subscription_tier: str = "free"  # "free" | "pro" | "premium"
    is_sponsored: bool = False

class ProfessionalProfileCreate(ProfessionalProfileBase):
    services: Optional[List[ServiceCreate]] = []
    locations: Optional[List[LocationCreate]] = []

class ProfessionalProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    profile_photo_url: Optional[str] = None
    company_logo_url: Optional[str] = None
    category: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    bio: Optional[str] = None
    experience_years: Optional[int] = None
    specialisations: Optional[List[str]] = None
    project_types_handled: Optional[List[str]] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    currency: Optional[str] = None
    availability_status: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    business_address: Optional[str] = None
    subscription_tier: Optional[str] = None
    is_sponsored: Optional[bool] = None
    is_published: Optional[bool] = None

class ProfessionalProfileResponse(ProfessionalProfileBase):
    id: str
    is_published: bool = False
    profile_completion_pct: int = 20
    verification_status: str = "not_submitted"
    services: List[ServiceResponse] = []
    locations: List[LocationResponse] = []
    portfolio_projects: List[PortfolioProjectResponse] = []
    certifications: List[CertificationResponse] = []
    reviews: List[ReviewResponse] = []
    average_rating: Optional[float] = None
    review_count: int = 0
    subscription_tier: str = "free"
    is_sponsored: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

