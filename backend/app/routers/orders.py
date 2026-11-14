from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel

from app.db.store import db, supabase_client
import math

def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Earth radius in kilometers
    r = 6371.0
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    # Multiply by 1.25 for typical Goan road winding route factor
    return round(r * c * 1.25, 1)

router = APIRouter(prefix="/orders", tags=["orders"])

class OrderItemCreate(BaseModel):
    product_id: Optional[str] = None
    product_name: str
    product_category: Optional[str] = "Building Materials"
    product_image: Optional[str] = None
    supplier_id: Optional[str] = None
    supplier_name: str
    supplier_address: Optional[str] = None
    supplier_latitude: Optional[float] = None
    supplier_longitude: Optional[float] = None
    customer_name: str
    customer_role: str = "customer"  # 'customer' | 'professional'
    customer_tier: str = "free"      # 'free' | 'pro' | 'premium'
    customer_latitude: Optional[float] = None
    customer_longitude: Optional[float] = None
    delivery_type: str = "home_delivery" # 'home_delivery' | 'pickup'
    delivery_address: Optional[str] = None
    distance_km: float = 10.0
    delivery_fee: float = 0.0
    quantity: int = 1
    unit_price: float = 0.0
    total_amount: float = 0.0
    status: str = "pending"          # 'pending' | 'confirmed' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled'
    notes: Optional[str] = None

class OrderStatusUpdate(BaseModel):
    status: str
    tracking_notes: Optional[str] = None

def save_order_to_supabase(data: dict):
    if not supabase_client:
        return None
    payload = dict(data)
    for k, v in list(payload.items()):
        if isinstance(v, datetime):
            payload[k] = v.isoformat()
    try:
        res = supabase_client.table("supplier_orders").upsert(payload).execute()
        return res.data
    except Exception as e:
        print(f"Supabase order upsert notice: {e}")
    return None

def sync_orders_from_supabase():
    if not supabase_client:
        return
    try:
        res = supabase_client.table("supplier_orders").select("*").execute()
        for row in res.data or []:
            db.supplier_orders[row["id"]] = row
    except Exception as e:
        print(f"Supabase orders sync notice: {e}")

@router.get("")
def list_orders(
    user_name: Optional[str] = None,
    business_name: Optional[str] = None,
    supplier_name: Optional[str] = None,
    role: Optional[str] = None
):
    sync_orders_from_supabase()
    results = list(getattr(db, "supplier_orders", {}).values())

    filter_terms = [t.strip().lower() for t in [user_name, business_name, supplier_name] if t and t.strip()]

    if filter_terms:
        # Match either customer name or supplier name case-insensitively
        filtered = []
        for o in results:
            c_name = (o.get("customer_name") or "").lower()
            s_name = (o.get("supplier_name") or "").lower()
            if any(term in c_name or term in s_name for term in filter_terms):
                filtered.append(o)
        # If filtered matched records, use them; if empty and role is supplier, return all orders for easy monitoring
        if filtered or role != "supplier":
            results = filtered

    # Sort newest first
    results.sort(key=lambda o: str(o.get("created_at") or ""), reverse=True)
    return results

@router.post("", status_code=201)
def create_order(payload: OrderItemCreate):
    oid = f"ord-{uuid.uuid4().hex[:8]}"
    now = datetime.now()
    data = payload.dict()
    data["id"] = oid
    data["created_at"] = now.isoformat()
    data["updated_at"] = now.isoformat()
    data["status"] = "pending"

    # Delivery charge calculation based on membership tier:
    # Premium: Free delivery at all times (₹0)
    # Pro: ₹30 per km
    # Free: ₹90 per km
    # Pickup: ₹0
    # Calculate dynamic distance if coordinates are present
    s_lat = data.get("supplier_latitude")
    s_lon = data.get("supplier_longitude")
    c_lat = data.get("customer_latitude")
    c_lon = data.get("customer_longitude")

    if s_lat and s_lon and c_lat and c_lon:
        dist = calculate_haversine_km(float(s_lat), float(s_lon), float(c_lat), float(c_lon))
        data["distance_km"] = max(1.0, dist)
        data["calculated_distance_km"] = max(1.0, dist)
    else:
        dist = float(data.get("distance_km") or 10.0)
        data["calculated_distance_km"] = dist
    tier = (data.get("customer_tier") or "free").lower()
    del_type = data.get("delivery_type")

    if del_type == "pickup":
        calculated_fee = 0.0
    elif tier == "premium":
        calculated_fee = 0.0
    elif tier == "pro":
        calculated_fee = round(dist * 30.0, 2)
    else:
        calculated_fee = round(dist * 90.0, 2)

    data["delivery_fee"] = calculated_fee
    subtotal = float(data.get("unit_price", 0.0)) * int(data.get("quantity", 1))
    data["total_amount"] = round(subtotal + calculated_fee, 2)

    if not hasattr(db, "supplier_orders"):
        db.supplier_orders = {}
    db.supplier_orders[oid] = data
    save_order_to_supabase(data)
    return data

@router.put("/{order_id}/status")
def update_order_status(order_id: str, payload: OrderStatusUpdate):
    if not hasattr(db, "supplier_orders"):
        db.supplier_orders = {}
    if order_id not in db.supplier_orders:
        sync_orders_from_supabase()
    if order_id not in db.supplier_orders:
        raise HTTPException(status_code=404, detail="Order not found")

    order = db.supplier_orders[order_id]
    order["status"] = payload.status
    if payload.tracking_notes:
        order["tracking_notes"] = payload.tracking_notes
    order["updated_at"] = datetime.now().isoformat()
    db.supplier_orders[order_id] = order
    save_order_to_supabase(order)
    return order
