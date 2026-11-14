from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid
from datetime import datetime

from app.schemas.project import ProjectCreate, ProjectResponse
from app.db.store import db, supabase_client

router = APIRouter(prefix="/projects", tags=["projects"])

def save_project_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("customer_projects").insert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase project insert notice: {e}")
    return None

def sync_projects_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("customer_projects").select("*").execute()
        for row in res.data or []:
            db.customer_projects[row["id"]] = row
    except Exception as e:
        print(f"Supabase projects sync notice: {e}")

@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(payload: ProjectCreate):
    pid = str(uuid.uuid4())
    now = datetime.now()
    data = payload.dict()
    data["id"] = pid
    data["created_at"] = now
    data["updated_at"] = now
    data["enquiries_count"] = 0

    # Store locally
    db.customer_projects[pid] = data

    # Store in Supabase
    save_project_to_supabase(data)

    # Persist locally so projects survive server restarts
    db.persist("customer_projects")

    return data

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    q: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None
):
    sync_projects_from_supabase()
    results = []
    q_norm = q.lower().strip() if q else None

    for p in db.customer_projects.values():
        if district and district != "all" and p.get("district") != district:
            continue
        if category and category != "all" and p.get("category") != category:
            continue
        if q_norm:
            title_m = q_norm in p.get("title", "").lower()
            desc_m = q_norm in p.get("description", "").lower()
            city_m = q_norm in p.get("city", "").lower()
            cust_m = q_norm in p.get("customer_name", "").lower()
            if not (title_m or desc_m or city_m or cust_m):
                continue
        results.append(p)

    # Sort newest first
    results.sort(key=lambda x: str(x.get("created_at") or ""), reverse=True)
    return results

@router.get("/{id}", response_model=ProjectResponse)
def get_project(id: str):
    if id not in db.customer_projects:
        sync_projects_from_supabase()
    if id not in db.customer_projects:
        raise HTTPException(status_code=404, detail="Project not found")
    return db.customer_projects[id]

