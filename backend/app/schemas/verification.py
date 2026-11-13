from typing import Optional
from pydantic import BaseModel
from datetime import datetime

class VerificationSubmissionCreate(BaseModel):
    entity_type: str  # 'professional' or 'supplier'
    entity_id: str
    business_legal_name: str
    registration_number: Optional[str] = None
    tax_identifier_gstin: Optional[str] = None
    id_proof_doc_url: str
    business_proof_doc_url: Optional[str] = None

class VerificationSubmissionUpdate(BaseModel):
    status: str  # 'approved', 'rejected', 'under_review'
    rejection_reason: Optional[str] = None
    reviewer_notes: Optional[str] = None

class VerificationSubmissionResponse(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    business_legal_name: str
    registration_number: Optional[str] = None
    tax_identifier_gstin: Optional[str] = None
    id_proof_doc_url: str
    business_proof_doc_url: Optional[str] = None
    status: str
    rejection_reason: Optional[str] = None
    reviewer_notes: Optional[str] = None
    submission_date: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None

