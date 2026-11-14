from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class QuotationItem(BaseModel):
    description: str
    quantity: Optional[float] = None
    unit: Optional[str] = None
    rate: Optional[float] = None
    amount: Optional[float] = None

class ExtractedQuotation(BaseModel):
    contractor: str
    project: Optional[str] = "Goa Residential Construction"
    total_amount: float
    gst: Optional[str] = "Standard applicable GST"
    completion_period: Optional[str] = None
    timeline_months: Optional[float] = None
    warranty: Optional[str] = None
    warranty_months: Optional[float] = None
    payment_terms: Optional[str] = None
    advance_pct: Optional[float] = None
    items: List[QuotationItem] = []

class ContractorScoreRow(BaseModel):
    rank: int = Field(..., alias="Rank")
    contractor: str = Field(..., alias="Contractor")
    price_score: float = Field(..., alias="Price Score")
    scope_score: float = Field(..., alias="Scope Score")
    material_score: float = Field(..., alias="Material Score")
    completeness_score: float = Field(..., alias="Completeness (%)")
    timeline_score: float = Field(..., alias="Timeline Score")
    warranty_score: float = Field(..., alias="Warranty Score")
    payment_score: float = Field(..., alias="Payment Score")
    overall_score: float = Field(..., alias="Overall Score")

    # Extra rich metadata for UI cards
    total_price: float = 0.0
    completion_period: str = ""
    warranty: str = ""
    payment_terms: str = ""
    technical_spec_score: float = 0.0
    brand_id_score: float = 0.0
    highlights: List[str] = []
    risk_flags: List[str] = []

    class Config:
        populate_by_name = True

class ComparisonResponse(BaseModel):
    status: str = "success"
    project_title: str = "Contractor Quotation Comparison"
    total_contractors: int
    winner: str
    leaderboard: List[ContractorScoreRow]
    criteria_weights: Dict[str, float] = {
        "Price Score": 0.25,
        "Scope Score": 0.25,
        "Material Score": 0.15,
        "Completeness (%)": 0.10,
        "Timeline Score": 0.10,
        "Warranty Score": 0.10,
        "Payment Score": 0.05
    }
