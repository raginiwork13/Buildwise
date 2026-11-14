from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class QuotationBase(BaseModel):
    project_id: str
    project_title: str
    customer_id: Optional[str] = None
    customer_name: str
    provider_id: str
    provider_name: str
    provider_role: str = "professional"  # 'professional' | 'supplier'
    provider_company: Optional[str] = None
    total_estimated_price: float = 0.0
    material_costs: float = 0.0
    labour_costs: float = 0.0
    transport_charges: float = 0.0
    service_charges: float = 0.0
    expected_completion_time: Optional[str] = "As per document"
    payment_milestones: Optional[str] = None
    materials_included: Optional[str] = None
    materials_excluded: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    quotation_validity_days: int = 30
    document_url: Optional[str] = None
    document_filename: Optional[str] = None
    notes: Optional[str] = None
    status: str = "submitted"  # 'submitted' | 'approved' | 'rejected' | 'work_started'

class QuotationCreate(QuotationBase):
    pass

class QuotationUpdate(BaseModel):
    status: Optional[str] = None

class QuotationResponse(QuotationBase):
    id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

# --- Interests ---
class InterestCreate(BaseModel):
    project_id: str
    project_title: str
    provider_id: str
    provider_name: str
    provider_role: str = "professional"
    provider_company: Optional[str] = None
    message: Optional[str] = None

class InterestResponse(InterestCreate):
    id: str
    created_at: Optional[datetime] = None

# --- Chat Messages ---
class ChatMessageCreate(BaseModel):
    conversation_id: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    sender_id: str
    sender_name: str
    sender_role: str
    recipient_id: str
    recipient_name: str
    recipient_role: str
    message_text: str

class ChatMessageResponse(ChatMessageCreate):
    id: str
    is_read: bool = False
    created_at: Optional[datetime] = None

