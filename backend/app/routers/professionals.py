from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
from app.config import settings
from pydantic import BaseModel

from app.schemas.professional import (
    ProfessionalProfileCreate,
    ProfessionalProfileUpdate,
    ProfessionalProfileResponse,
    ServiceCreate,
    ServiceResponse,
    LocationCreate,
    LocationResponse,
    PortfolioProjectCreate,
    PortfolioProjectUpdate,
    PortfolioProjectResponse,
    CertificationCreate,
    CertificationResponse
)
from app.schemas.verification import VerificationSubmissionCreate, VerificationSubmissionResponse
from app.db.store import db, supabase_client
from app.routers.notifications import add_notification

router = APIRouter(prefix="/professionals", tags=["professionals"])

def save_to_supabase_safe(table_name: str, payload: dict):
    if not supabase_client:
        return None
    data = dict(payload)
    for k, v in list(data.items()):
        if isinstance(v, datetime):
            data[k] = v.isoformat()
    try:
        res = supabase_client.table(table_name).insert(data).execute()
        return res.data
    except Exception as e:
        err = str(e)
        if "subscription_tier" in err or "is_sponsored" in err:
            safe_data = {k: v for k, v in data.items() if k not in ("subscription_tier", "is_sponsored")}
            try:
                res = supabase_client.table(table_name).insert(safe_data).execute()
                return res.data
            except Exception as e2:
                print(f"Supabase fallback insert failed for {table_name}: {e2}")
        else:
            print(f"Supabase insert failed for {table_name}: {e}")
    return None

def calculate_completion(p: dict) -> int:
    score = 0
    # 1. Basic Info (25%)
    if p.get("full_name") and p.get("email") and p.get("phone") and p.get("bio"):
        score += 25
    # 2. Category & Experience (20%)
    if p.get("category") and p.get("experience_years") is not None:
        score += 20
    # 3. Location (15%)
    if p.get("district") and p.get("city"):
        score += 15
    # 4. Specialisations (15%)
    if p.get("specialisations") and len(p.get("specialisations", [])) > 0:
        score += 15
    # 5. Media (10%)
    if p.get("profile_photo_url"):
        score += 10
    # 6. Budget & availability (15%)
    if p.get("min_budget") and p.get("availability_status"):
        score += 15
    return min(score, 100)

def assemble_profile(p: dict) -> dict:
    pid = p["id"]
    services = [s for s in db.professional_services.values() if s.get("professional_id") == pid]
    locations = [l for l in db.professional_locations.values() if l.get("professional_id") == pid]
    
    # Portfolio projects with media
    projects = []
    for proj in db.portfolio_projects.values():
        if proj.get("professional_id") == pid:
            proj_copy = dict(proj)
            proj_id = proj["id"]
            proj_media = [m for m in db.portfolio_media.values() if m.get("portfolio_project_id") == proj_id]
            proj_copy["media"] = sorted(proj_media, key=lambda x: x.get("display_order", 0))
            projects.append(proj_copy)
    projects = sorted(projects, key=lambda x: x.get("display_order", 0))

    certifications = [c for c in db.certifications.values() if c.get("professional_id") == pid]
    reviews = [r for r in db.professional_reviews.values() if r.get("professional_id") == pid and r.get("moderation_status") == "approved"]

    avg_rating = None
    if reviews:
        avg_rating = round(sum(r["rating"] for r in reviews) / len(reviews), 2)

    res = dict(p)
    res["profile_completion_pct"] = calculate_completion(p)
    res["services"] = services
    res["locations"] = locations
    res["portfolio_projects"] = projects
    res["certifications"] = certifications
    res["reviews"] = reviews
    res["average_rating"] = avg_rating
    res["review_count"] = len(reviews)
    res["subscription_tier"] = p.get("subscription_tier", "free")
    res["is_sponsored"] = p.get("is_sponsored", False)
    return res

@router.post("", response_model=ProfessionalProfileResponse, status_code=201)
def create_professional(payload: ProfessionalProfileCreate):
    pid = str(uuid.uuid4())
    now = datetime.now()
    raw_data = payload.dict()
    is_pub = raw_data.get("is_published", True)
    services_data = raw_data.pop("services", [])
    locations_data = raw_data.pop("locations", [])

    data = dict(raw_data)
    data["id"] = pid
    data["created_at"] = now
    data["updated_at"] = now
    data["is_published"] = is_pub
    data["verification_status"] = "verified"
    data["profile_completion_pct"] = calculate_completion(data)

    # Save to local store
    db.professional_profiles[pid] = data

    # Save to Supabase
    save_to_supabase_safe("professional_profiles", data)

    for s in services_data:
        sid = str(uuid.uuid4())
        s["id"] = sid
        s["professional_id"] = pid
        s["created_at"] = now
        db.professional_services[sid] = s
        save_to_supabase_safe("professional_services", s)

    for l in locations_data:
        lid = str(uuid.uuid4())
        l["id"] = lid
        l["professional_id"] = pid
        l["created_at"] = now
        db.professional_locations[lid] = l
        save_to_supabase_safe("professional_locations", l)

    # Persist locally so profile survives server restarts
    db.persist("professional_profiles")
    db.persist("professional_services")
    db.persist("professional_locations")

    # Record subscription revenue if registering with pro or premium
    tier = (data.get("subscription_tier") or "free").lower().strip()
    if tier in ["pro", "premium"]:
        try:
            from app.routers.auth import record_subscription_revenue
            record_subscription_revenue(
                email=data.get("email") or f"{pid}@example.com",
                role="professional",
                tier=tier,
                full_name=data.get("full_name")
            )
        except Exception as e:
            print(f"Subscription revenue recording error for professional: {e}")

    return assemble_profile(data)

class AISearchRequest(BaseModel):
    query: str

class AISearchResponse(BaseModel):
    understood_criteria: Dict[str, Any]
    detected_keywords: List[str]
    suggested_category: Optional[str] = None
    suggested_district: Optional[str] = None
    suggested_min_experience: Optional[int] = None
    suggested_budget_range: Optional[Dict[str, Optional[float]]] = None

def sync_supabase_data():
    if not supabase_client:
        return
    try:
        profiles_res = supabase_client.table("professional_profiles").select("*").execute()
        for row in profiles_res.data or []:
            pid = row["id"]
            if pid not in db.professional_profiles:
                db.professional_profiles[pid] = row
            else:
                db.professional_profiles[pid].update(row)

        srv_res = supabase_client.table("professional_services").select("*").execute()
        for s in srv_res.data or []:
            db.professional_services[s["id"]] = s

        loc_res = supabase_client.table("professional_locations").select("*").execute()
        for l in loc_res.data or []:
            db.professional_locations[l["id"]] = l

        proj_res = supabase_client.table("portfolio_projects").select("*").execute()
        for prj in proj_res.data or []:
            db.portfolio_projects[prj["id"]] = prj

        med_res = supabase_client.table("portfolio_media").select("*").execute()
        for m in med_res.data or []:
            db.portfolio_media[m["id"]] = m
    except Exception as e:
        print(f"Supabase sync warning: {e}")

@router.get("", response_model=List[ProfessionalProfileResponse])
def list_professionals(
    q: Optional[str] = None,
    category: Optional[str] = None,
    district: Optional[str] = None,
    min_experience: Optional[int] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    availability: Optional[str] = None,
    min_rating: Optional[float] = None,
    only_published: bool = True
):
    sync_supabase_data()
    results = []
    q_norm = q.lower().strip() if q else None

    for p in db.professional_profiles.values():
        if only_published and not p.get("is_published", False):
            continue
        if category and category != "all" and p.get("category") != category:
            continue
        if district and district != "all" and p.get("district") != district:
            continue
        if min_experience is not None and p.get("experience_years", 0) < min_experience:
            continue
        if availability and availability != "all" and p.get("availability_status") != availability:
            continue
        
        # Check budget range overlap
        prof_min = p.get("min_budget", 0)
        prof_max = p.get("max_budget", 100000000)
        if min_budget is not None and prof_max < min_budget:
            continue
        if max_budget is not None and prof_min > max_budget:
            continue

        # Check full text / keyword match across name, company, bio, specialisations
        if q_norm:
            name_match = q_norm in p.get("full_name", "").lower()
            company_match = q_norm in (p.get("company_name") or "").lower()
            bio_match = q_norm in (p.get("bio") or "").lower()
            cat_match = q_norm in p.get("category", "").lower()
            spec_match = any(q_norm in spec.lower() for spec in p.get("specialisations", []))
            city_match = q_norm in p.get("city", "").lower()
            
            if not (name_match or company_match or bio_match or cat_match or spec_match or city_match):
                continue

        assembled = assemble_profile(p)
        
        # Rating filter
        if min_rating is not None and assembled.get("average_rating"):
            if assembled["average_rating"] < min_rating:
                continue

        results.append(assembled)

    # AMAZON/OLX TIER-BASED SEGREGATION & RANKING:
    # 1. Premium tier first (Sponsored)
    # 2. Pro tier second (Sponsored)
    # 3. Free tier segregated and sorted organically: rating DESC, review count DESC, experience DESC
    def get_sort_key(item: dict):
        tier = item.get("subscription_tier", "free")
        tier_weight = 0
        if tier == "premium":
            tier_weight = 3
        elif tier == "pro":
            tier_weight = 2
        else:
            tier_weight = 1

        rating = item.get("average_rating") or 0.0
        reviews = item.get("review_count") or 0
        exp = item.get("experience_years") or 0

        # We return a tuple for descending order: (tier_weight, rating, reviews, exp)
        return (tier_weight, rating, reviews, exp)

    results.sort(key=get_sort_key, reverse=True)
    return results

@router.post("/ai-search", response_model=AISearchResponse)
def ai_search_query_parse(payload: AISearchRequest):
    """
    Parses natural language construction requirements using Google AI Studio / Gemini API.
    Gracefully falls back to rule-based keyword extraction if Gemini API key is missing or offline.
    """
    req_text = payload.query.strip()
    understood = {
        "raw_query": req_text,
        "mode": "rule_based"
    }
    suggested_category = None
    suggested_district = None
    suggested_min_experience = None
    suggested_budget = {}

    # Check if Gemini API Key is configured
    gemini_key = settings.GEMINI_API_KEY
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-1.5-flash")
            
            prompt = f"""
            You are an AI assistant for a Construction Marketplace in Goa, India.
            A user submitted this natural language search:
            "{req_text}"

            Extract the search parameters into valid JSON with these exact keys:
            {{
                "category": string or null (one of "contractor", "architect", "civil_engineer", "interior_designer"),
                "district": string or null (one of "North Goa", "South Goa"),
                "min_experience": integer or null,
                "min_budget": number or null (in INR, e.g. 25 lakh = 2500000),
                "max_budget": number or null (in INR, e.g. 50 lakh = 5000000),
                "keywords": list of string
            }}
            Return ONLY raw JSON, no markdown formatting.
            """
            response = model.generate_content(prompt)
            clean_text = response.text.strip().replace("```json", "").replace("```", "").strip()
            parsed = json.loads(clean_text)
            
            understood["mode"] = "gemini_ai_studio"
            suggested_category = parsed.get("category")
            suggested_district = parsed.get("district")
            suggested_min_experience = parsed.get("min_experience")
            if parsed.get("min_budget") or parsed.get("max_budget"):
                suggested_budget = {
                    "min": parsed.get("min_budget"),
                    "max": parsed.get("max_budget")
                }
            keywords = parsed.get("keywords", [])
            return AISearchResponse(
                understood_criteria=understood,
                detected_keywords=keywords,
                suggested_category=suggested_category,
                suggested_district=suggested_district,
                suggested_min_experience=suggested_min_experience,
                suggested_budget_range=suggested_budget
            )
        except Exception as e:
            understood["mode"] = f"fallback_rule_based (gemini: {str(e)[:50]})"

    # Rule-based fallback parser
    q_lower = req_text.lower()
    keywords = []

    # Category matching
    if any(w in q_lower for w in ["contractor", "builder", "construction company", "civil work"]):
        suggested_category = "contractor"
        keywords.append("contractor")
    elif any(w in q_lower for w in ["architect", "architecture", "villa design", "floor plan"]):
        suggested_category = "architect"
        keywords.append("architect")
    elif any(w in q_lower for w in ["structural", "engineer", "civil engineer", "foundation"]):
        suggested_category = "civil_engineer"
        keywords.append("civil_engineer")
    elif any(w in q_lower for w in ["interior", "interior designer", "decor", "kitchen"]):
        suggested_category = "interior_designer"
        keywords.append("interior_designer")

    # District matching
    if "north" in q_lower or any(p in q_lower for p in ["panaji", "mapusa", "assagao", "porvorim", "anjuna", "calangute"]):
        suggested_district = "North Goa"
    elif "south" in q_lower or any(p in q_lower for p in ["margao", "vasco", "colva", "benaulim"]):
        suggested_district = "South Goa"

    # Experience matching (e.g. 8 years, 5+ yrs)
    import re
    exp_match = re.search(r'(\d+)\+?\s*(?:years?|yrs?)', q_lower)
    if exp_match:
        suggested_min_experience = int(exp_match.group(1))

    # Budget matching (e.g. 25 lakh, 50 lakh, 1 cr)
    if "lakh" in q_lower or "crore" in q_lower or "cr" in q_lower:
        lakh_matches = re.findall(r'(\d+)\s*(?:lakh|lac|lacs)', q_lower)
        if len(lakh_matches) >= 2:
            suggested_budget = {
                "min": float(lakh_matches[0]) * 100000,
                "max": float(lakh_matches[1]) * 100000
            }
        elif len(lakh_matches) == 1:
            suggested_budget = {
                "min": float(lakh_matches[0]) * 100000,
                "max": None
            }

    return AISearchResponse(
        understood_criteria=understood,
        detected_keywords=keywords or [req_text],
        suggested_category=suggested_category,
        suggested_district=suggested_district,
        suggested_min_experience=suggested_min_experience,
        suggested_budget_range=suggested_budget
    )

@router.get("/{id}", response_model=ProfessionalProfileResponse)
def get_professional(id: str):
    if id not in db.professional_profiles:
        sync_supabase_data()
    if id not in db.professional_profiles:
        raise HTTPException(status_code=404, detail="Professional profile not found")
    return assemble_profile(db.professional_profiles[id])

@router.put("/{id}", response_model=ProfessionalProfileResponse)
def update_professional(id: str, payload: ProfessionalProfileUpdate):
    if id not in db.professional_profiles:
        raise HTTPException(status_code=404, detail="Professional profile not found")
    
    current = db.professional_profiles[id]
    updates = payload.dict(exclude_unset=True)
    current.update(updates)
    current["updated_at"] = datetime.now()
    current["profile_completion_pct"] = calculate_completion(current)
    db.professional_profiles[id] = current
    return assemble_profile(current)

# --- Services ---
@router.post("/{id}/services", response_model=ServiceResponse, status_code=201)
def add_service(id: str, payload: ServiceCreate):
    if id not in db.professional_profiles:
        raise HTTPException(status_code=404, detail="Professional profile not found")
    sid = str(uuid.uuid4())
    s_data = payload.dict()
    s_data["id"] = sid
    s_data["professional_id"] = id
    s_data["created_at"] = datetime.now()
    db.professional_services[sid] = s_data
    return s_data

# --- Locations ---
@router.post("/{id}/locations", response_model=LocationResponse, status_code=201)
def add_location(id: str, payload: LocationCreate):
    if id not in db.professional_profiles:
        raise HTTPException(status_code=404, detail="Professional profile not found")
    lid = str(uuid.uuid4())
    l_data = payload.dict()
    l_data["id"] = lid
    l_data["professional_id"] = id
    l_data["created_at"] = datetime.now()
    db.professional_locations[lid] = l_data
    return l_data

# --- Portfolio Projects ---
@router.post("/{id}/portfolio", response_model=PortfolioProjectResponse, status_code=201)
def add_portfolio_project(id: str, payload: PortfolioProjectCreate):
    if id not in db.professional_profiles:
        raise HTTPException(status_code=404, detail="Professional profile not found")
    proj_id = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    media_data = data.pop("media", [])

    data["id"] = proj_id
    data["professional_id"] = id
    data["created_at"] = now
    data["updated_at"] = now
    db.portfolio_projects[proj_id] = data
    save_to_supabase_safe("portfolio_projects", data)

    saved_media = []
    for m in media_data:
        mid = str(uuid.uuid4())
        m["id"] = mid
        m["portfolio_project_id"] = proj_id
        m["created_at"] = now
        db.portfolio_media[mid] = m
        save_to_supabase_safe("portfolio_media", m)
        saved_media.append(m)

    res = dict(data)
    res["media"] = saved_media
    return res

@router.put("/{id}/portfolio/{project_id}", response_model=PortfolioProjectResponse)
def update_portfolio_project(id: str, project_id: str, payload: PortfolioProjectUpdate):
    if project_id not in db.portfolio_projects:
        raise HTTPException(status_code=404, detail="Portfolio project not found")
    proj = db.portfolio_projects[project_id]
    if proj.get("professional_id") != id:
        raise HTTPException(status_code=400, detail="Project does not belong to this professional")
    
    updates = payload.dict(exclude_unset=True)
    proj.update(updates)
    proj["updated_at"] = datetime.now()
    db.portfolio_projects[project_id] = proj

    proj_media = [m for m in db.portfolio_media.values() if m.get("portfolio_project_id") == project_id]
    res = dict(proj)
    res["media"] = sorted(proj_media, key=lambda x: x.get("display_order", 0))
    return res

@router.delete("/{id}/portfolio/{project_id}", status_code=200)
def delete_portfolio_project(id: str, project_id: str):
    if project_id not in db.portfolio_projects:
        raise HTTPException(status_code=404, detail="Portfolio project not found")
    proj = db.portfolio_projects[project_id]
    if proj.get("professional_id") != id:
        raise HTTPException(status_code=400, detail="Project does not belong to this professional")
    
    del db.portfolio_projects[project_id]
    # Delete related media
    for mid, m in list(db.portfolio_media.items()):
        if m.get("portfolio_project_id") == project_id:
            del db.portfolio_media[mid]
    return {"message": "Portfolio project deleted successfully"}

# --- Certifications ---
@router.post("/{id}/certifications", response_model=CertificationResponse, status_code=201)
def add_certification(id: str, payload: CertificationCreate):
    if id not in db.professional_profiles:
        raise HTTPException(status_code=404, detail="Professional profile not found")
    cid = str(uuid.uuid4())
    c_data = payload.dict()
    c_data["id"] = cid
    c_data["professional_id"] = id
    c_data["verification_status"] = "pending"
    c_data["created_at"] = datetime.now()
    db.certifications[cid] = c_data
    return c_data

# --- Verification Submission ---
@router.post("/{id}/verification", response_model=VerificationSubmissionResponse, status_code=201)
def submit_verification(id: str, payload: VerificationSubmissionCreate):
    if id not in db.professional_profiles:
        raise HTTPException(status_code=404, detail="Professional profile not found")
    vid = str(uuid.uuid4())
    v_data = payload.dict()
    v_data["id"] = vid
    v_data["entity_type"] = "professional"
    v_data["entity_id"] = id
    v_data["status"] = "pending"
    v_data["submission_date"] = datetime.now()
    v_data["reviewed_at"] = None
    v_data["rejection_reason"] = None
    v_data["reviewer_notes"] = None
    db.verification_submissions[vid] = v_data

    # Update profile status to pending
    db.professional_profiles[id]["verification_status"] = "pending"
    return v_data

# --- Enquiries from Consumers or Suppliers ---
class ProfessionalEnquiryCreate(BaseModel):
    professional_id: str
    professional_name: str
    professional_company: Optional[str] = None
    sender_name: str
    sender_role: str = "customer" # 'customer' | 'supplier'
    sender_email: Optional[str] = None
    sender_phone: Optional[str] = None
    project_location: str
    budget_range: Optional[str] = None
    requirements: str

@router.post("/enquire", status_code=201)
def submit_professional_enquiry(payload: ProfessionalEnquiryCreate):
    enq_id = f"enq-{uuid.uuid4().hex[:8]}"
    now = datetime.now().isoformat()
    enq_data = payload.dict()
    enq_data["id"] = enq_id
    enq_data["created_at"] = now

    if not hasattr(db, "enquiries"):
        db.enquiries = {}
    db.enquiries[enq_id] = enq_data

    # 1. Professional Notification: "so and so person enquired for your profile"
    role_label = "Supplier" if payload.sender_role.lower() == "supplier" else "Consumer"
    add_notification(
        title="📋 New Enquiry Received",
        desc=f"{payload.sender_name} ({role_label}) enquired for your profile! Location: {payload.project_location}. Requirements: '{payload.requirements[:90]}...'",
        recipient_role="professional",
        recipient_id=payload.professional_id,
        recipient_name=payload.professional_name,
        sender_name=payload.sender_name,
        notif_type="enquiry",
        meta={
            "enquiry_id": enq_id,
            "sender_name": payload.sender_name,
            "sender_role": payload.sender_role,
            "sender_phone": payload.sender_phone,
            "location": payload.project_location,
            "budget": payload.budget_range,
            "requirements": payload.requirements
        }
    )

    # 2. Sender Notification (Consumer or Supplier): "Enquiry Sent"
    add_notification(
        title="Enquiry Sent",
        desc=f"Your enquiry has been successfully sent to {payload.professional_company or payload.professional_name}.",
        recipient_role=payload.sender_role.lower(),
        recipient_name=payload.sender_name,
        sender_name=payload.professional_name,
        notif_type="enquiry",
        meta={
            "enquiry_id": enq_id,
            "professional_name": payload.professional_name,
            "professional_id": payload.professional_id
        }
    )

    return {"status": "success", "enquiry_id": enq_id, "data": enq_data}

@router.post("/{id}/enquire", status_code=201)
def submit_professional_enquiry_by_id(id: str, payload: ProfessionalEnquiryCreate):
    payload.professional_id = id
    return submit_professional_enquiry(payload)


