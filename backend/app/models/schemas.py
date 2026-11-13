from datetime import datetime
from enum import Enum
from typing import Optional, Any
from pydantic import BaseModel, Field

class NotificationCategory(str, Enum):
    PROJECT_UPDATE = "project_update"
    ENQUIRY = "enquiry"
    QUOTATION = "quotation"
    MESSAGE = "message"
    MILESTONE = "milestone"
    SUPPLIER_ENQUIRY = "supplier_enquiry"
    SYSTEM = "system"

class MessageType(str, Enum):
    TEXT = "text"
    SYSTEM = "system"
    QUOTATION_LINK = "quotation_link"
    PROJECT_LINK = "project_link"
    PRODUCT_RFQ = "product_rfq"
    FILE = "file"

# -----------------------------------------------------------------------------
# NOTIFICATION SCHEMAS
# -----------------------------------------------------------------------------
class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    category: NotificationCategory
    action_url: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)

class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    category: NotificationCategory
    action_url: Optional[str] = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    is_read: bool = False
    is_dismissed: bool = False
    created_at: datetime

class NotificationStats(BaseModel):
    total: int
    unread_count: int
    by_category: dict[str, int] = Field(default_factory=dict)

# -----------------------------------------------------------------------------
# MESSAGING SCHEMAS
# -----------------------------------------------------------------------------
class ParticipantInfo(BaseModel):
    user_id: str
    full_name: str
    role: str
    company_name: Optional[str] = None
    avatar_url: Optional[str] = None
    last_read_at: datetime
    is_pinned: bool = False

class MessageCreate(BaseModel):
    content: str
    message_type: MessageType = MessageType.TEXT
    metadata: dict[str, Any] = Field(default_factory=dict)

class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    sender_role: str
    content: str
    message_type: MessageType = MessageType.TEXT
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    is_outgoing: bool = False

class ConversationCreate(BaseModel):
    participant_ids: list[str]
    project_id: Optional[str] = None
    title: Optional[str] = None
    initial_message: Optional[str] = None

class ConversationResponse(BaseModel):
    id: str
    project_id: Optional[str] = None
    project_title: Optional[str] = None
    title: str
    created_by: str
    participants: list[ParticipantInfo]
    last_message_preview: Optional[str] = None
    last_message_at: datetime
    unread_count: int = 0
    created_at: datetime

# -----------------------------------------------------------------------------
# EVENT SCHEMAS (Connecting Real Marketplace Actions to Notifications)
# -----------------------------------------------------------------------------
class EnquiryEvent(BaseModel):
    project_id: str
    project_title: str
    customer_id: str
    professional_id: str
    professional_name: str
    pitch_message: Optional[str] = None
    action: str = Field(..., description="'submit', 'shortlist', 'decline'")

class QuotationEvent(BaseModel):
    quotation_id: str
    project_id: str
    project_title: str
    customer_id: str
    professional_id: str
    professional_name: str
    total_price: float
    action: str = Field(..., description="'submit', 'revise', 'accept', 'reject'")

class MilestoneEvent(BaseModel):
    project_id: str
    project_title: str
    customer_id: str
    professional_id: str
    milestone_name: str
    sequence_order: int
    amount: float
    action: str = Field(..., description="'created', 'submitted_for_verification', 'verified'")

class SupplierRFQEvent(BaseModel):
    product_id: str
    product_name: str
    supplier_id: str
    buyer_id: str
    buyer_name: str
    buyer_role: str
    quantity: int = 1
    notes: Optional[str] = None
