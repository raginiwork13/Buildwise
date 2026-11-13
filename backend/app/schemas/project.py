from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    description: str
    category: str = "new_residential"  # 'new_residential' | 'renovation' | 'commercial' | 'interior_design' | 'structural_work'
    customer_name: str
    customer_type: str = "Individual / Homeowner"
    location_address: str
    district: str = "North Goa"
    city: str = "Panaji"
    built_up_area_sqft: float
    floors_count: int = 1
    estimated_budget: float
    required_services: List[str] = []
    preferred_timeline_months: int = 6
    status: str = "receiving_enquiries"

class ProjectCreate(ProjectBase):
    customer_id: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: str
    customer_id: Optional[str] = None
    enquiries_count: int = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

