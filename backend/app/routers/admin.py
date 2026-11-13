from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from app.schemas.verification import VerificationSubmissionResponse, VerificationSubmissionUpdate
from app.db.store import db

router = APIRouter(prefix="/admin/verifications", tags=["admin"])

@router.get("", response_model=List[VerificationSubmissionResponse])
def list_verifications():
    return list(db.verification_submissions.values())

@router.get("/{id}", response_model=VerificationSubmissionResponse)
def get_verification(id: str):
    if id not in db.verification_submissions:
        raise HTTPException(status_code=404, detail="Verification submission not found")
    return db.verification_submissions[id]

@router.put("/{id}", response_model=VerificationSubmissionResponse)
def review_verification(id: str, payload: VerificationSubmissionUpdate):
    if id not in db.verification_submissions:
        raise HTTPException(status_code=404, detail="Verification submission not found")
    
    sub = db.verification_submissions[id]
    sub["status"] = payload.status
    sub["rejection_reason"] = payload.rejection_reason
    sub["reviewer_notes"] = payload.reviewer_notes
    sub["reviewed_at"] = datetime.now()
    db.verification_submissions[id] = sub

    # Propagate verification status to the corresponding entity profile
    entity_type = sub.get("entity_type")
    entity_id = sub.get("entity_id")

    if payload.status == "approved":
        new_status = "verified"
    elif payload.status == "rejected":
        new_status = "rejected"
    else:
        new_status = "under_review"

    if entity_type == "professional" and entity_id in db.professional_profiles:
        db.professional_profiles[entity_id]["verification_status"] = new_status
    elif entity_type == "supplier" and entity_id in db.supplier_profiles:
        db.supplier_profiles[entity_id]["verification_status"] = new_status

    return sub

