import os
import joblib
import pandas as pd
from fastapi import APIRouter, HTTPException
from app.schemas.estimator import CostEstimateRequest, CostEstimateResponse

router = APIRouter(prefix="/cost-estimator", tags=["AI Cost Estimator"])

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
    "ml", 
    "construction_cost_model.pkl"
)

ml_model = None

# Load model on startup
if os.path.exists(MODEL_PATH):
    try:
        ml_model = joblib.load(MODEL_PATH)
        print("ML Construction Cost Model (.pkl) loaded successfully!")
    except Exception as e:
        print(f"Warning: Failed to load .pkl model: {e}")
else:
    print(f"Warning: Model file not found at {MODEL_PATH}")

# Mapping dictionary for model training label compatibility
CONSTRUCTION_TYPE_MAP = {
    "RCC Frame": "RCC",
    "RCC": "RCC",
    "Steel Frame": "Steel Frame",
    "Load Bearing": "Load Bearing"
}

# Micro-market mapping for Goa locations to closest training clusters
LOCATION_PROXIMITY_MAP = {
    "Panaji": "Panaji",
    "Margao": "Margao",
    "Vasco": "Vasco",
    "Mapusa": "Mapusa",
    "Ponda": "Ponda",
    "Calangute": "Mapusa",
    "Bicholim": "Mapusa",
    "Pernem": "Mapusa",
    "Canacona": "Margao",
    "Quepem": "Margao"
}

@router.get("/status")
def get_model_status():
    return {
        "status": "ready" if ml_model is not None else "model_missing",
        "model_file": os.path.basename(MODEL_PATH),
        "model_loaded": ml_model is not None
    }

@router.post("/predict", response_model=CostEstimateResponse)
def predict_cost(payload: CostEstimateRequest):
    if ml_model is None:
        raise HTTPException(
            status_code=503,
            detail="Machine learning model is not loaded on the server."
        )

    try:
        mapped_construction_type = CONSTRUCTION_TYPE_MAP.get(payload.construction_type, "RCC")
        mapped_location = LOCATION_PROXIMITY_MAP.get(payload.location, payload.location)

        # Prepare DataFrame matching the model's exact expected columns
        input_df = pd.DataFrame([{
            "location": mapped_location,
            "state": payload.state or "Goa",
            "project_type": payload.project_type,
            "area_sqft": float(payload.area_sqft),
            "num_floors": int(payload.num_floors),
            "construction_type": mapped_construction_type,
            "foundation_type": payload.foundation_type,
            "material_quality": payload.material_quality,
            "finishing_quality": payload.finishing_quality,
            "year": int(payload.year or 2026)
        }])

        # Generate ML model prediction
        prediction_val = float(ml_model.predict(input_df)[0])
        # Ensure positive non-zero prediction
        prediction = max(100000.0, prediction_val)

        rate_per_sqft = round(prediction / payload.area_sqft, 2)
        total_lakhs = f"{(prediction / 100000):.2f}"
        min_lakhs = f"{((prediction * 0.94) / 100000):.2f}"
        max_lakhs = f"{((prediction * 1.06) / 100000):.2f}"

        # Dynamic breakdown percentages
        foundation_pct = 0.16 if payload.foundation_type == 'Raft' else 0.13 if payload.foundation_type == 'Combined' else 0.11
        superstructure_pct = 0.36 if payload.construction_type == 'Steel Frame' else 0.30 if payload.construction_type == 'Load Bearing' else 0.34
        materials_pct = 0.23
        labour_pct = 0.14
        mep_pct = 0.11 if payload.project_type == 'Commercial' else 0.08
        finishing_pct = round(1.0 - (foundation_pct + superstructure_pct + materials_pct + labour_pct + mep_pct), 2)

        breakdown = {
            "foundation": round(prediction * foundation_pct, 2),
            "superstructure": round(prediction * superstructure_pct, 2),
            "materials": round(prediction * materials_pct, 2),
            "labour": round(prediction * labour_pct, 2),
            "mep": round(prediction * mep_pct, 2),
            "finishing": round(prediction * finishing_pct, 2),
        }

        breakdown_percentages = {
            "foundation": int(foundation_pct * 100),
            "superstructure": int(superstructure_pct * 100),
            "materials": int(materials_pct * 100),
            "labour": int(labour_pct * 100),
            "mep": int(mep_pct * 100),
            "finishing": int(finishing_pct * 100),
        }

        # Key Material BOQ Estimates
        safe_floors = max(1, payload.num_floors)
        steel_factor = 5.2 if payload.construction_type == 'Steel Frame' else 2.4 if payload.construction_type == 'Load Bearing' else 3.8

        boq = {
            "cement_bags": int(payload.area_sqft * 0.42 * (1.05 if safe_floors > 1 else 1.0)),
            "steel_tonnes": round((payload.area_sqft * steel_factor) / 1000.0, 1),
            "sand_cuft": int(payload.area_sqft * 1.85),
            "aggregates_cuft": int(payload.area_sqft * 1.35),
        }

        # Timeline forecast
        if payload.project_type == 'Renovation':
            timeline = '4 — 7 Months'
        elif safe_floors == 1:
            timeline = '8 — 10 Months'
        elif safe_floors == 2:
            timeline = '11 — 14 Months'
        elif safe_floors == 3:
            timeline = '14 — 18 Months'
        else:
            timeline = f"{14 + (safe_floors - 3) * 3} — {18 + (safe_floors - 3) * 3} Months"

        return CostEstimateResponse(
            status="success",
            model_name="GradientBoostingRegressor (construction_cost_model.pkl)",
            predicted_cost=round(prediction, 2),
            total_cost_lakhs=total_lakhs,
            rate_per_sqft=rate_per_sqft,
            min_range_lakhs=min_lakhs,
            max_range_lakhs=max_lakhs,
            breakdown=breakdown,
            breakdown_percentages=breakdown_percentages,
            boq=boq,
            timeline_months=timeline
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Model prediction error: {str(e)}")
