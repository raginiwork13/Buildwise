from fastapi import Header, Query, HTTPException, status
from typing import Optional

# Known profiles lookup for demo identities and fallback metadata
KNOWN_PROFILES = {
    "demo-cust-1": {
        "id": "demo-cust-1",
        "full_name": "Rahul Naik",
        "role": "customer",
        "company_name": None,
        "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        "city": "Margao",
        "district": "South Goa"
    },
    "demo-prof-1": {
        "id": "demo-prof-1",
        "full_name": "Carlos Fernandes",
        "role": "professional",
        "company_name": "Fernandes & Sons Civil Construction",
        "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        "city": "Panaji",
        "district": "North Goa"
    },
    "demo-supp-1": {
        "id": "demo-supp-1",
        "full_name": "Sunil Silva",
        "role": "supplier",
        "company_name": "Mandovi Building Solutions",
        "avatar_url": "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
        "city": "Margao",
        "district": "South Goa"
    }
}

def get_current_user_id(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    authorization: Optional[str] = Header(None),
    user_id_query: Optional[str] = Query(None, alias="user_id")
) -> str:
    """
    Respects existing authentication architecture:
    1. Reads explicit X-User-Id header from frontend persona state
    2. Fallback to Supabase JWT Bearer token if present
    3. Fallback to query parameter (useful for EventSource/WebSocket handshakes)
    """
    if x_user_id:
        return x_user_id.strip()

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split("Bearer ")[1].strip()
        # In real Supabase JWT, this would decode jwt payload sub
        if token and token != "undefined":
            return token

    if user_id_query:
        return user_id_query.strip()

    # Reject unauthenticated access: require explicit user header, token, or query param
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required. No user persona or authorization token provided."
    )

def get_profile_info(user_id: str) -> dict:
    if user_id in KNOWN_PROFILES:
        return KNOWN_PROFILES[user_id]
    
    # Generic fallback for dynamic registered users
    return {
        "id": user_id,
        "full_name": f"User {user_id[-6:]}" if len(user_id) > 6 else user_id,
        "role": "customer",
        "company_name": None,
        "avatar_url": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
        "city": "Goa",
        "district": "North Goa"
    }

