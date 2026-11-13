from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class CostEstimateRequest(BaseModel):
    location: str = Field(..., description="Goa location (e.g. Panaji, Margao, etc.)")
    state: str = Field(default="Goa", description="State name")
    project_type: str = Field(..., description="Residential, Commercial, or Renovation")
    area_sqft: float = Field(..., ge=100, description="Built-up area in square feet")
    num_floors: int = Field(..., ge=1, le=25, description="Number of floors")
    construction_type: str = Field(..., description="RCC Frame, Steel Frame, or Load Bearing")
    foundation_type: str = Field(..., description="Isolated, Combined, or Raft")
    material_quality: str = Field(..., description="Economy, Standard, or Premium")
    finishing_quality: str = Field(..., description="Basic, Medium, or High")
    year: int = Field(default=2026, description="Construction year")

class CostEstimateResponse(BaseModel):
    status: str = "success"
    model_name: str = "GradientBoostingRegressor Pipeline"
    predicted_cost: float
    total_cost_lakhs: str
    rate_per_sqft: float
    min_range_lakhs: str
    max_range_lakhs: str
    breakdown: Dict[str, float]
    breakdown_percentages: Dict[str, int]
    boq: Dict[str, Any]
    timeline_months: str
