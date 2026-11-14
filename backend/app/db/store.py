import os
import json
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from app.config import settings

# ─── Local JSON persistence helpers ──────────────────────────────────────────
# Stored in backend/data/ so data survives server restarts (Supabase RLS fallback)
_DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data")
os.makedirs(_DATA_DIR, exist_ok=True)

def _data_path(collection: str) -> str:
    return os.path.join(_DATA_DIR, f"{collection}.json")

def _load_collection(collection: str) -> dict:
    path = _data_path(collection)
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[LocalDB] Failed to load {collection}: {e}")
    return {}

def _save_collection(collection: str, data: dict):
    path = _data_path(collection)
    try:
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, default=str, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[LocalDB] Failed to save {collection}: {e}")

# Collections that are user-generated and should be persisted across restarts
PERSISTED_COLLECTIONS = [
    "user_accounts",
    "professional_profiles",
    "professional_services",
    "professional_locations",
    "portfolio_projects",
    "portfolio_media",
    "certifications",
    "professional_reviews",
    "supplier_profiles",
    "supplier_products",
    "customer_profiles",
    "customer_projects",
    "project_quotations",
    "project_interests",
    "chat_messages",
    "notifications",
    "supplier_orders",
    "project_workspaces",
    "project_milestones",
    "progress_updates",
    "payment_milestones",
    "workspace_documents",
    "platform_revenue_transactions",
]

# Initialize Supabase client if configured
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("Connected to Supabase successfully!")
    except Exception as e:
        print(f"Supabase connection error: {e}, falling back to local state repository.")

# In-memory store with seeded initial demonstration data
class InMemoryDB:
    def __init__(self):
        self.customer_profiles: Dict[str, Dict[str, Any]] = {}
        self.customer_projects: Dict[str, Dict[str, Any]] = {}
        self.professional_profiles: Dict[str, Dict[str, Any]] = {}
        self.professional_services: Dict[str, Dict[str, Any]] = {}
        self.professional_locations: Dict[str, Dict[str, Any]] = {}
        self.portfolio_projects: Dict[str, Dict[str, Any]] = {}
        self.portfolio_media: Dict[str, Dict[str, Any]] = {}
        self.certifications: Dict[str, Dict[str, Any]] = {}
        self.supplier_profiles: Dict[str, Dict[str, Any]] = {}
        self.supplier_categories: Dict[str, Dict[str, Any]] = {}
        self.supplier_products: Dict[str, Dict[str, Any]] = {}
        self.product_media: Dict[str, Dict[str, Any]] = {}
        self.verification_submissions: Dict[str, Dict[str, Any]] = {}
        self.professional_reviews: Dict[str, Dict[str, Any]] = {}
        self.project_quotations: Dict[str, Dict[str, Any]] = {}
        self.project_interests: Dict[str, Dict[str, Any]] = {}
        self.chat_messages: Dict[str, Dict[str, Any]] = {}
        self.user_accounts: Dict[str, Dict[str, Any]] = {}
        # Project Workspace collections
        self.project_workspaces: Dict[str, Dict[str, Any]] = {}
        self.project_milestones: Dict[str, Dict[str, Any]] = {}
        self.progress_updates: Dict[str, Dict[str, Any]] = {}
        self.payment_milestones: Dict[str, Dict[str, Any]] = {}
        self.workspace_documents: Dict[str, Dict[str, Any]] = {}
        self.supplier_orders: Dict[str, Dict[str, Any]] = {}
        self.notifications: Dict[str, Dict[str, Any]] = {}
        self.enquiries: Dict[str, Dict[str, Any]] = {}
        self.platform_revenue_transactions: Dict[str, Dict[str, Any]] = {}
        self._seed_initial_data()
        self._load_persisted_data()

    def _load_persisted_data(self):
        """
        Load user-created data from local JSON files and merge it on top of
        seed data. User records (by id/key) override seeds with the same key,
        but seed data fills in anything missing.
        """
        for col in PERSISTED_COLLECTIONS:
            saved = _load_collection(col)
            if saved:
                target: dict = getattr(self, col, {})
                target.update(saved)
                setattr(self, col, target)
        print(f"[LocalDB] Persistent data loaded from {_DATA_DIR}")

    def persist(self, collection: str):
        """Call this whenever a user-generated record is added/changed."""
        data = getattr(self, collection, {})
        _save_collection(collection, data)

    def _seed_initial_data(self):
        # Seed 1 Professional (Carlos Fernandes - Premium)
        p1_id = "prof-carlos-1"
        self.professional_profiles[p1_id] = {
            "id": p1_id,
            "full_name": "Carlos Fernandes",
            "company_name": "Fernandes & Sons Civil Construction",
            "profile_photo_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
            "company_logo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=100&q=80",
            "category": "contractor",
            "email": "carlos@fernandesconstruct.in",
            "phone": "+91 94220 88210",
            "website": "https://fernandesconstruct.in",
            "bio": "Specialists in Goan villas, RCC framed structures, and traditional Portuguese restorations across North and South Goa with over 14 years of proven field expertise.",
            "experience_years": 14,
            "specialisations": ["RCC Framed Structures", "Heritage Portuguese Restorations", "Luxury Villas", "Waterproofing"],
            "project_types_handled": ["Residential Villa", "Renovation", "Commercial Boutique"],
            "min_budget": 2500000.0,
            "max_budget": 30000000.0,
            "currency": "INR",
            "availability_status": "available",
            "country": "India",
            "state": "Goa",
            "district": "North Goa",
            "city": "Panaji",
            "business_address": "Shop 4, Miramar Circle, Panaji, Goa",
            "is_published": True,
            "profile_completion_pct": 100,
            "verification_status": "verified",
            "subscription_tier": "premium",
            "is_sponsored": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Seed Professional 2: Ar. Ananya Deshmukh (Pro - Sponsored)
        p2_id = "prof-ananya-2"
        self.professional_profiles[p2_id] = {
            "id": p2_id,
            "full_name": "Ar. Ananya Deshmukh",
            "company_name": "Atelier Goa Architecture",
            "profile_photo_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
            "company_logo_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=100&q=80",
            "category": "architect",
            "email": "ananya@ateliergoa.com",
            "phone": "+91 98221 44556",
            "website": "https://ateliergoa.com",
            "bio": "Biophilic tropical architecture, climate-responsive Portuguese contemporary villas, and CRZ regulatory planning across coastal Goa.",
            "experience_years": 9,
            "specialisations": ["Tropical Modernism", "CRZ Approvals", "Biophilic Homes", "Sustainable Architecture"],
            "project_types_handled": ["Residential Villa", "Luxury Holiday Home", "Eco Resort"],
            "min_budget": 1500000.0,
            "max_budget": 25000000.0,
            "currency": "INR",
            "availability_status": "available",
            "country": "India",
            "state": "Goa",
            "district": "North Goa",
            "city": "Porvorim",
            "business_address": "Atelier House, CHOGM Road, Porvorim, Goa",
            "is_published": True,
            "profile_completion_pct": 95,
            "verification_status": "verified",
            "subscription_tier": "pro",
            "is_sponsored": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Seed Professional 3: Er. Rajesh Kerkar (Free - High Experience & Organic Ranking)
        p3_id = "prof-rajesh-3"
        self.professional_profiles[p3_id] = {
            "id": p3_id,
            "full_name": "Er. Rajesh Kerkar",
            "company_name": "Kerkar Structural & Civil Engineering",
            "profile_photo_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
            "company_logo_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=100&q=80",
            "category": "civil_engineer",
            "email": "kerkar.structures@gmail.com",
            "phone": "+91 94238 12345",
            "website": "https://kerkarstructures.in",
            "bio": "18 years of high-load seismic RCC structural engineering, foundation design on saline coastal soils, and civil inspections across South Goa.",
            "experience_years": 18,
            "specialisations": ["Seismic RCC Design", "Coastal Soil Foundation", "Structural Audits", "Pile Foundations"],
            "project_types_handled": ["Commercial Complex", "High-rise Apartments", "Coastal Villas"],
            "min_budget": 3500000.0,
            "max_budget": 60000000.0,
            "currency": "INR",
            "availability_status": "available",
            "country": "India",
            "state": "Goa",
            "district": "South Goa",
            "city": "Margao",
            "business_address": "Kerkar Chambers, Station Road, Margao, Goa",
            "is_published": True,
            "profile_completion_pct": 90,
            "verification_status": "verified",
            "subscription_tier": "free",
            "is_sponsored": False,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Seed Professional 4: Meera Shenoy (Free)
        p4_id = "prof-meera-4"
        self.professional_profiles[p4_id] = {
            "id": p4_id,
            "full_name": "Meera Shenoy",
            "company_name": "Studio Terra Goa Interiors",
            "profile_photo_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
            "company_logo_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=100&q=80",
            "category": "interior_designer",
            "email": "meera@studioterra.in",
            "phone": "+91 98229 98877",
            "website": "https://studioterra.in",
            "bio": "Creating grounded, bespoke Goan interior spaces using terrazzo, locally turned teak wood, and natural lime plaster finishes.",
            "experience_years": 7,
            "specialisations": ["Bespoke Villa Interiors", "Modular Kitchens", "Lime Wash Finishes", "Lighting Architecture"],
            "project_types_handled": ["Residential Villa", "Boutique Cafe", "Homestay"],
            "min_budget": 1000000.0,
            "max_budget": 12000000.0,
            "currency": "INR",
            "availability_status": "limited_availability",
            "country": "India",
            "state": "Goa",
            "district": "North Goa",
            "city": "Assagao",
            "business_address": "Badem Junction, Assagao, Goa",
            "is_published": True,
            "profile_completion_pct": 88,
            "verification_status": "verified",
            "subscription_tier": "free",
            "is_sponsored": False,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Services for p1
        s1_id = "srv-1"
        self.professional_services[s1_id] = {
            "id": s1_id,
            "professional_id": p1_id,
            "service_name": "Turnkey Villa Construction",
            "description": "End-to-end civil execution including foundation, masonry, RCC slab, and plastering.",
            "pricing_model": "per_sqft",
            "indicative_rate": 2150.0,
            "created_at": datetime.now()
        }

        # Locations for p1
        l1_id = "loc-1"
        self.professional_locations[l1_id] = {
            "id": l1_id,
            "professional_id": p1_id,
            "location_name": "Panaji, Porvorim, Mapusa",
            "district": "North Goa",
            "created_at": datetime.now()
        }

        # Portfolio for p1
        proj1_id = "proj-1"
        self.portfolio_projects[proj1_id] = {
            "id": proj1_id,
            "professional_id": p1_id,
            "title": "Villa Sol de Goa",
            "project_type": "New Construction",
            "description": "4,200 sq.ft Portuguese-modern villa with sloping clay tile roofs, exposed laterite accents, and infinity pool.",
            "location": "Assagao, North Goa",
            "completion_year": 2024,
            "project_area_sqft": 4200.0,
            "indicative_budget": 8500000.0,
            "role": "General Contractor",
            "display_order": 1,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        m1_id = "med-1"
        self.portfolio_media[m1_id] = {
            "id": m1_id,
            "portfolio_project_id": proj1_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            "file_name": "exterior_front.jpg",
            "caption": "Front Elevation & Sloping Roof",
            "display_order": 1,
            "created_at": datetime.now()
        }

        # Certification for p1
        c1_id = "cert-1"
        self.certifications[c1_id] = {
            "id": c1_id,
            "professional_id": p1_id,
            "certification_name": "PWD Goa Class-1 Civil Contractor",
            "issuing_authority": "Public Works Department Goa",
            "certificate_number": "GOA-PWD-CLASS1-2018",
            "issue_date": datetime(2018, 5, 10).date(),
            "expiry_date": datetime(2028, 5, 10).date(),
            "document_url": "https://example.com/private/cert-carlos.pdf",
            "verification_status": "verified",
            "created_at": datetime.now()
        }

        # Reviews for p1
        r1_id = "rev-1"
        self.professional_reviews[r1_id] = {
            "id": r1_id,
            "professional_id": p1_id,
            "reviewer_name": "Dr. Amit Roy",
            "rating": 5.0,
            "review_text": "Carlos and his team completed our Assagao villa on schedule. Structural quality and transparency during milestone slab castings were outstanding.",
            "project_reference": "Villa Sol de Goa",
            "moderation_status": "approved",
            "is_verified_purchase": True,
            "created_at": datetime.now()
        }

        # Media & Reviews for p2 (Ananya)
        proj2_id = "proj-2"
        self.portfolio_projects[proj2_id] = {
            "id": proj2_id,
            "professional_id": p2_id,
            "title": "Verem Cliffside Eco Villa",
            "project_type": "Architectural Design",
            "description": "Climate responsive sustainable villa integrating Mandovi river vistas and courtyard ventilation.",
            "location": "Verem, North Goa",
            "completion_year": 2023,
            "project_area_sqft": 3500.0,
            "indicative_budget": 6500000.0,
            "role": "Principal Architect",
            "display_order": 1,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.portfolio_media["med-2"] = {
            "id": "med-2",
            "portfolio_project_id": proj2_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
            "file_name": "verem_exterior.jpg",
            "caption": "Cantilevered deck facing Mandovi estuary",
            "display_order": 1,
            "created_at": datetime.now()
        }
        self.professional_reviews["rev-2"] = {
            "id": "rev-2",
            "professional_id": p2_id,
            "reviewer_name": "Siddharth Sen",
            "rating": 4.9,
            "review_text": "Ananya is simply the best architect in Goa for getting CRZ clearances and delivering breathtaking natural ventilation.",
            "project_reference": "Verem Cliffside Villa",
            "moderation_status": "approved",
            "is_verified_purchase": True,
            "created_at": datetime.now()
        }

        # Media & Reviews for p3 (Rajesh Kerkar)
        proj3_id = "proj-3"
        self.portfolio_projects[proj3_id] = {
            "id": proj3_id,
            "professional_id": p3_id,
            "title": "Colva Beachfront Complex",
            "project_type": "Structural Engineering",
            "description": "Seismic Zone III compliant deep pile foundation and post-tensioned slab casting.",
            "location": "Colva, South Goa",
            "completion_year": 2022,
            "project_area_sqft": 14000.0,
            "indicative_budget": 24000000.0,
            "role": "Lead Structural Engineer",
            "display_order": 1,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.portfolio_media["med-3"] = {
            "id": "med-3",
            "portfolio_project_id": proj3_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
            "file_name": "colva_structural.jpg",
            "caption": "Deep RCC foundation casting",
            "display_order": 1,
            "created_at": datetime.now()
        }
        self.professional_reviews["rev-3"] = {
            "id": "rev-3",
            "professional_id": p3_id,
            "reviewer_name": "Goa Coastal Developers",
            "rating": 4.8,
            "review_text": "Rock-solid engineering calculations and strict safety checks. Top-tier civil consultant.",
            "project_reference": "Colva Complex",
            "moderation_status": "approved",
            "is_verified_purchase": True,
            "created_at": datetime.now()
        }

        # Media & Reviews for p4 (Meera Shenoy)
        proj4_id = "proj-4"
        self.portfolio_projects[proj4_id] = {
            "id": proj4_id,
            "professional_id": p4_id,
            "title": "Casa Bela Assagao",
            "project_type": "Interior Architecture",
            "description": "Hand-poured green terrazzo floors, lime plaster accents, and reclaimed teakwood cabinetry.",
            "location": "Assagao, North Goa",
            "completion_year": 2024,
            "project_area_sqft": 2800.0,
            "indicative_budget": 4200000.0,
            "role": "Interior Designer",
            "display_order": 1,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        self.portfolio_media["med-4"] = {
            "id": "med-4",
            "portfolio_project_id": proj4_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
            "file_name": "casa_bela_living.jpg",
            "caption": "Terrazzo and lime plaster living space",
            "display_order": 1,
            "created_at": datetime.now()
        }
        self.professional_reviews["rev-4"] = {
            "id": "rev-4",
            "professional_id": p4_id,
            "reviewer_name": "Kavita Singhal",
            "rating": 4.9,
            "review_text": "Meera gave our Portuguese home an authentic yet modern vibe. Outstanding sense of color and materials.",
            "project_reference": "Casa Bela",
            "moderation_status": "approved",
            "is_verified_purchase": True,
            "created_at": datetime.now()
        }

        # Seed 1 Supplier (Mandovi Building Solutions)
        supp1_id = "supp-mandovi-1"
        self.supplier_profiles[supp1_id] = {
            "id": supp1_id,
            "company_name": "Mandovi Building Solutions & Steel Yard",
            "logo_url": "https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=100&q=80",
            "description": "Goa's premier distributor of UltraTech Weather Plus Cement, Tata Tiscon 550D TMT rebar, sand, and locally quarried laterite stones.",
            "business_email": "mandovi.supplies@gmail.com",
            "phone": "+91 98900 12345",
            "website": "https://mandovibuilding.in",
            "business_address": "Plot 42, Phase II, Verna Industrial Estate, Goa",
            "latitude": 15.3582,
            "longitude": 73.9314,
            "primary_location": "Verna Industrial Estate, South Goa",
            "delivery_locations": ["North Goa", "South Goa", "Panaji", "Margao", "Vasco", "Mapusa"],
            "is_published": True,
            "profile_completion_pct": 100,
            "verification_status": "verified",
            "subscription_tier": "premium",
            "is_sponsored": True,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Product for supp1
        prod1_id = "prod-1"
        self.supplier_products[prod1_id] = {
            "id": prod1_id,
            "supplier_id": supp1_id,
            "product_name": "UltraTech Weather Plus Cement (PPC)",
            "category": "Cement",
            "brand": "UltraTech",
            "description": "Water-repellent Portland Pozzolana Cement formulated for coastal Goan humidity and high rain resistance.",
            "specifications": "50kg HDPE Bag · IS 1489 Part 1 compliant",
            "unit_of_measurement": "per 50kg bag",
            "indicative_price": 385.0,
            "currency": "INR",
            "in_stock": True,
            "delivery_available": True,
            "primary_image_url": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Seed Customer Projects
        self.customer_projects["proj-c1"] = {
            "id": "proj-c1",
            "customer_id": "cust-rahul-1",
            "customer_name": "Rahul Naik",
            "customer_type": "Individual / Homeowner",
            "title": "4BHK Contemporary Portuguese Villa with Swimming Pool",
            "description": "Looking for an experienced turnkey contractor to build a 3,800 sq.ft villa with exposed laterite stone features, sloping clay tiled roof, double-height living room, and salt-water plunge pool. Architectural drawings and CRZ clearances already approved.",
            "category": "new_residential",
            "location_address": "Near St. Anthony Church, Badem Junction, Assagao",
            "district": "North Goa",
            "city": "Assagao",
            "built_up_area_sqft": 3800.0,
            "floors_count": 2,
            "estimated_budget": 8500000.0,
            "required_services": ["Turnkey Civil Execution", "RCC Framing", "Waterproofing", "Laterite Masonry"],
            "preferred_timeline_months": 12,
            "status": "receiving_enquiries",
            "enquiries_count": 6,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        self.customer_projects["proj-c2"] = {
            "id": "proj-c2",
            "customer_id": "cust-savio-2",
            "customer_name": "Dr. Savio Coutinho",
            "customer_type": "Individual / Homeowner",
            "title": "120-Year Heritage Indo-Portuguese Mansion Restoration",
            "description": "Restoration of heritage ancestral mansion in Fontainhas Latin Quarter. Requires timber beam replacement, lime plaster re-pointing, mother-of-pearl oyster shell window refurbishment, and Portuguese roof tile replacement.",
            "category": "renovation",
            "location_address": "Rua 31 de Janeiro, Fontainhas, Panaji",
            "district": "North Goa",
            "city": "Panaji",
            "built_up_area_sqft": 4500.0,
            "floors_count": 2,
            "estimated_budget": 4500000.0,
            "required_services": ["Heritage Conservation", "Teakwood Structural Work", "Lime Wash", "Roof Overhaul"],
            "preferred_timeline_months": 8,
            "status": "receiving_enquiries",
            "enquiries_count": 4,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        self.customer_projects["proj-c3"] = {
            "id": "proj-c3",
            "customer_id": "cust-hospitality-3",
            "customer_name": "Coastal Hospitality LLP",
            "customer_type": "Company / Organisation",
            "title": "Boutique Beachfront Cafe & 8 Eco-Cottages",
            "description": "Eco-friendly commercial hospitality project near Colva beach. Demands climate-responsive bamboo-composite structures, rammed earth walls, solar integration, and wastewater bio-digester setup.",
            "category": "commercial",
            "location_address": "Beach Road, 4th Cross, Colva",
            "district": "South Goa",
            "city": "Colva",
            "built_up_area_sqft": 6200.0,
            "floors_count": 1,
            "estimated_budget": 12000000.0,
            "required_services": ["Commercial Civil Works", "Eco Architecture", "MEP Engineering", "Bio STP"],
            "preferred_timeline_months": 10,
            "status": "receiving_enquiries",
            "enquiries_count": 9,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        self.customer_projects["proj-c4"] = {
            "id": "proj-c4",
            "customer_id": "cust-ananya-4",
            "customer_name": "Ananya Roy",
            "customer_type": "Individual / Homeowner",
            "title": "Modern Minimalist Penthouse Interior Architecture",
            "description": "Complete interior design, modular kitchen with quartz countertop, false ceiling with cove lighting, and customized teak furniture for a sea-facing 3BHK penthouse.",
            "category": "interior_design",
            "location_address": "Dona Paula View Tower, Miramar Beach Road, Panaji",
            "district": "North Goa",
            "city": "Panaji",
            "built_up_area_sqft": 2600.0,
            "floors_count": 1,
            "estimated_budget": 2800000.0,
            "required_services": ["Interior Architecture", "Modular Kitchen", "Lighting Design", "False Ceiling"],
            "preferred_timeline_months": 4,
            "status": "receiving_enquiries",
            "enquiries_count": 3,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        self.customer_projects["proj-c5"] = {
            "id": "proj-c5",
            "customer_id": "cust-sunita-5",
            "customer_name": "Sunita Borkar",
            "customer_type": "Individual / Homeowner",
            "title": "Coastal RCC Structural Retrofitting & Saline Waterproofing",
            "description": "Seismic retrofitting, anti-corrosion micro-concreting of beams, and saline waterproofing for a coastal residential building subjected to high monsoon winds and ocean salt air.",
            "category": "structural_work",
            "location_address": "Baina Beach Road, Mormugao, Vasco",
            "district": "South Goa",
            "city": "Vasco da Gama",
            "built_up_area_sqft": 3200.0,
            "floors_count": 3,
            "estimated_budget": 1800000.0,
            "required_services": ["Structural Audit", "Beam Jacketing", "Saline Waterproofing", "Epoxy Injection"],
            "preferred_timeline_months": 3,
            "status": "receiving_enquiries",
            "enquiries_count": 5,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # Seed Project Quotations
        self.project_quotations["quot-1"] = {
            "id": "quot-1",
            "project_id": "proj-c1",
            "project_title": "4BHK Contemporary Portuguese Villa with Swimming Pool",
            "customer_id": "cust-rahul-1",
            "customer_name": "Rahul Naik",
            "provider_id": "prof-carlos-1",
            "provider_name": "Carlos Fernandes",
            "provider_role": "professional",
            "provider_company": "Fernandes & Sons Civil Construction",
            "total_estimated_price": 8150000.0,
            "material_costs": 4900000.0,
            "labour_costs": 2400000.0,
            "transport_charges": 250000.0,
            "service_charges": 600000.0,
            "expected_completion_time": "11 Months",
            "payment_milestones": "15% Advance on site handover, 25% Plinth completion, 30% RCC Slab casting, 20% Masonry & Plastering, 10% Final handover",
            "materials_included": "UltraTech PPC Cement, Tata Tiscon 550D TMT Steel, Local Laterite Stone blocks, Dr. Fixit Damp-proof coating",
            "materials_excluded": "Sanitary fixtures, Italian marble/vitrified tiles (client supplied)",
            "terms_and_conditions": "Rates valid for 30 days. PWD Class-1 execution standards with 5-year structural warranty.",
            "quotation_validity_days": 30,
            "status": "submitted",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        self.project_quotations["quot-2"] = {
            "id": "quot-2",
            "project_id": "proj-c1",
            "project_title": "4BHK Contemporary Portuguese Villa with Swimming Pool",
            "customer_id": "cust-rahul-1",
            "customer_name": "Rahul Naik",
            "provider_id": "prof-ananya-2",
            "provider_name": "Ar. Ananya Deshmukh",
            "provider_role": "professional",
            "provider_company": "Atelier Goa Architecture",
            "total_estimated_price": 680000.0,
            "material_costs": 0.0,
            "labour_costs": 480000.0,
            "transport_charges": 20000.0,
            "service_charges": 180000.0,
            "expected_completion_time": "3 Months for Detailed Drawings & CRZ Liasoning",
            "payment_milestones": "30% Concept Masterplan, 40% Municipal/CRZ Drawings, 30% Site Supervision Milestone checks",
            "materials_included": "Complete Architectural, Structural & MEP CAD/BIM blueprints with 3D walkthroughs",
            "materials_excluded": "Municipal council scrutiny fees (paid directly to govt)",
            "terms_and_conditions": "Includes 12 scheduled site inspection visits during crucial casting phases.",
            "quotation_validity_days": 45,
            "status": "submitted",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        self.project_quotations["quot-3"] = {
            "id": "quot-3",
            "project_id": "proj-c1",
            "project_title": "4BHK Contemporary Portuguese Villa with Swimming Pool",
            "customer_id": "cust-rahul-1",
            "customer_name": "Rahul Naik",
            "provider_id": "supp-mandovi-1",
            "provider_name": "Sunil Silva",
            "provider_role": "supplier",
            "provider_company": "Mandovi Building Solutions & Steel Yard",
            "total_estimated_price": 1450000.0,
            "material_costs": 1380000.0,
            "labour_costs": 0.0,
            "transport_charges": 70000.0,
            "service_charges": 0.0,
            "expected_completion_time": "Immediate staged deliveries across 8 months",
            "payment_milestones": "30% against Proforma Invoice, 70% staggered upon delivery per truckload",
            "materials_included": "1,200 Bags UltraTech Weather Plus Cement, 18 Metric Tons Tata Tiscon 550D Rebar, 8,000 Goan Laterite stones",
            "materials_excluded": "Unloading crane fees if site access is restricted",
            "terms_and_conditions": "Price locked against market price fluctuations for 60 days.",
            "quotation_validity_days": 60,
            "status": "submitted",
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }

        # ── Demo Project Workspace (Carlos x Rahul - Villa Project) ──────────────
        ws_id = "ws-demo-1"
        self.project_workspaces[ws_id] = {
            "id": ws_id,
            "project_id": "proj-c1",
            "project_title": "4BHK Contemporary Portuguese Villa with Swimming Pool",
            "customer_name": "Rahul Naik",
            "professional_name": "Carlos Fernandes",
            "professional_company": "Fernandes & Sons Civil Construction",
            "agreed_amount": 8150000,
            "expected_start_date": "2027-01-15",
            "expected_completion_date": "2027-12-15",
            "status": "active",
            "overall_progress": 15,
            "amount_paid": 1222500,
            "start_confirmed_professional": True,
            "start_confirmed_customer": True,
            "completion_confirmed_professional": False,
            "completion_confirmed_customer": False,
            # Commission escrow — demo workspace is PAID (always unlocked)
            "commission_paid_customer": True,
            "commission_paid_professional": True,
            "commission_status": "paid",
            "commission_amount_customer": 163000.0,
            "commission_amount_professional": 163000.0,
            "warning_notices_sent": 0,
            "circumvention_flagged_at": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }

        # Milestones for ws-demo-1
        milestone_data = [
            ("ms-d1", "Foundation & Plinth Work", "Excavation, footing, plinth beam casting, DPC treatment",
             "2027-01-15", "2027-03-15", "in_progress", 60, 1222500, "2027-01-15"),
            ("ms-d2", "Ground Floor RCC Structure", "Columns, beams, slab casting for ground floor",
             "2027-03-16", "2027-05-30", "not_started", 0, 1832500, None),
            ("ms-d3", "First Floor & Roof Slab", "First floor columns, beams, roof slab & waterproofing",
             "2027-06-01", "2027-08-15", "not_started", 0, 1222500, None),
            ("ms-d4", "Finishing Works", "Plastering, waterproofing, tiling, electrical & plumbing rough-in",
             "2027-08-16", "2027-11-30", "not_started", 0, 2037500, None),
            ("ms-d5", "Final Handover", "Painting, fixtures, landscaping & swimming pool completion",
             "2027-12-01", "2027-12-15", "not_started", 0, 1832500, None),
        ]
        for mid, name, desc, ps, pe, status, pct, amt, actual_start in milestone_data:
            self.project_milestones[mid] = {
                "id": mid,
                "workspace_id": ws_id,
                "name": name,
                "description": desc,
                "planned_start": ps,
                "planned_end": pe,
                "actual_start": actual_start,
                "actual_end": None,
                "progress_percentage": pct,
                "status": status,
                "payment_amount": amt,
                "photos": [],
                "created_at": datetime.now().isoformat(),
            }

        # Progress Updates for ws-demo-1
        self.progress_updates["upd-d1"] = {
            "id": "upd-d1",
            "workspace_id": ws_id,
            "title": "Foundation Excavation Completed – Week 2",
            "description": "Excavation work for all 6 footing locations completed as per drawing. Soil strata found suitable at -1.8m depth. PCC bed laid and curing in progress.",
            "work_in_progress": "Footing reinforcement cage binding and form-work preparation",
            "progress_percentage": 15,
            "photos": [
                "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80",
                "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=400&q=80"
            ],
            "issues_or_delays": "Minor utility pipe found at north-west corner. Rerouting in coordination with PWD. No major schedule impact expected.",
            "next_activities": "Footing reinforcement, shuttering, concrete pour (M25) for 6 footings",
            "posted_by": "Carlos Fernandes",
            "created_at": datetime.now().isoformat(),
            "comments": [
                {
                    "id": "cmt-d1",
                    "update_id": "upd-d1",
                    "author": "Rahul Naik",
                    "author_role": "customer",
                    "text": "Good progress! Please send me site photos daily. When will the first concrete pour happen?",
                    "created_at": datetime.now().isoformat(),
                }
            ]
        }

        # Payment Milestones for ws-demo-1
        pmt_data = [
            ("pmt-d1", "15% Advance / Mobilisation", 1222500, "paid", "2027-01-10", "2027-01-12", "NEFT/UPI-20270112"),
            ("pmt-d2", "25% Foundation Completion", 2037500, "pending", "2027-03-20", None, ""),
            ("pmt-d3", "30% Ground Floor Slab", 2445000, "upcoming", "2027-06-10", None, ""),
            ("pmt-d4", "20% First Floor & Roof", 1630000, "upcoming", "2027-09-01", None, ""),
            ("pmt-d5", "10% Final Handover", 815000, "upcoming", "2027-12-20", None, ""),
        ]
        for pid, name, amt, status, due, paid, ref in pmt_data:
            self.payment_milestones[pid] = {
                "id": pid,
                "workspace_id": ws_id,
                "name": name,
                "amount": amt,
                "status": status,
                "due_date": due,
                "paid_date": paid,
                "reference": ref,
            }

        # Documents for ws-demo-1
        self.workspace_documents["doc-d1"] = {
            "id": "doc-d1",
            "workspace_id": ws_id,
            "filename": "Carlos_Villa_BOQ_Quotation_v1.pdf",
            "category": "Approved Quotation",
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "uploader": "Carlos Fernandes",
            "uploaded_at": datetime.now().isoformat(),
        }
        self.workspace_documents["doc-d2"] = {
            "id": "doc-d2",
            "workspace_id": ws_id,
            "filename": "Work_Agreement_Rahul_Carlos_Villa.pdf",
            "category": "Work Agreement",
            "url": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            "uploader": "System",
            "uploaded_at": datetime.now().isoformat(),
        }

        # Seed Demo Supplier Order
        oid = "ord-demo-1"
        self.supplier_orders[oid] = {
            "id": oid,
            "product_id": "prod-1",
            "product_name": "UltraTech Weather Plus Cement (50kg)",
            "product_category": "Cement",
            "product_image": "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80",
            "supplier_id": "supp-mandovi-1",
            "supplier_name": "Mandovi Building Solutions & Steel Yard",
            "supplier_address": "Plot 42, Verna Industrial Estate, Goa",
            "customer_name": "Rahul Naik",
            "customer_role": "customer",
            "customer_tier": "pro",
            "delivery_type": "home_delivery",
            "delivery_address": "Villa #4, Borda, Margao, South Goa",
            "distance_km": 12.0,
            "delivery_fee": 360.0,
            "quantity": 50,
            "unit_price": 420.0,
            "total_amount": 21360.0,
            "status": "shipped",
            "tracking_notes": "Dispatched via Tata 407 (GA-08-T-4521). Expected delivery today by 4 PM.",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        # Seed Chat Messages
        # (Cleaned - users chat dynamically in real time without static preset messages)
        # Seed User Accounts for Multi-Account Switcher & Login
        self.user_accounts["rahul.naik@example.com"] = {
            "id": "demo-cust-1",
            "email": "rahul.naik@example.com",
            "password_hash": "pass123",
            "full_name": "Rahul Naik",
            "role": "customer",
            "phone": "+91 98221 45091",
            "default_location": "Margao, South Goa",
            "city": "Margao",
            "district": "South Goa",
            "subscription_tier": "free",
            "is_sponsored": False,
            "is_verified": True,
            "created_at": datetime.now(),
            "last_login_at": datetime.now()
        }

        self.user_accounts["carlos@fernandesconstruct.in"] = {
            "id": "demo-prof-1",
            "email": "carlos@fernandesconstruct.in",
            "password_hash": "pass123",
            "full_name": "Carlos Fernandes",
            "role": "professional",
            "phone": "+91 94220 88210",
            "company_name": "Fernandes & Sons Civil Construction",
            "professional_category": "contractor",
            "city": "Panaji",
            "district": "North Goa",
            "subscription_tier": "premium",
            "is_sponsored": True,
            "is_verified": True,
            "created_at": datetime.now(),
            "last_login_at": datetime.now()
        }

        self.user_accounts["mandovi.supplies@gmail.com"] = {
            "id": "demo-supp-1",
            "email": "mandovi.supplies@gmail.com",
            "password_hash": "pass123",
            "full_name": "Sunil Silva",
            "role": "supplier",
            "phone": "+91 98900 12345",
            "business_name": "Mandovi Building Solutions & Steel Yard",
            "city": "Verna",
            "district": "South Goa",
            "warehouse_location": "Verna Industrial Estate, South Goa",
            "subscription_tier": "premium",
            "is_sponsored": True,
            "is_verified": True,
            "created_at": datetime.now(),
            "last_login_at": datetime.now()
        }

        # Seed initial notifications
        self.notifications["notif-seed-1"] = {
            "id": "notif-seed-1",
            "title": "New Villa Lead in Porvorim",
            "desc": "Customer Rahul posted a 3,200 sq.ft residential project matching your area.",
            "recipient_role": "professional",
            "recipient_id": "prof-carlos-1",
            "recipient_name": "Carlos Fernandes",
            "sender_name": "Rahul Naik",
            "type": "enquiry",
            "unread": True,
            "created_at": datetime.now().isoformat()
        }
        self.notifications["notif-seed-2"] = {
            "id": "notif-seed-2",
            "title": "License Verification Approved",
            "desc": "Your PWD Class-1 certificate was verified by admin.",
            "recipient_role": "professional",
            "recipient_id": "prof-carlos-1",
            "recipient_name": "Carlos Fernandes",
            "sender_name": "Admin",
            "type": "system",
            "unread": False,
            "created_at": datetime.now().isoformat()
        }
        self.notifications["notif-seed-3"] = {
            "id": "notif-seed-3",
            "title": "Welcome to BuildWise Material Yard",
            "desc": "Your supplier store is live. Consumers in Goa can now place direct orders for cement, steel, and stone.",
            "recipient_role": "supplier",
            "recipient_id": "demo-supp-1",
            "recipient_name": "Sunil Silva",
            "sender_name": "BuildWise Marketplace",
            "type": "system",
            "unread": True,
            "created_at": datetime.now().isoformat()
        }
        self.notifications["notif-seed-4"] = {
            "id": "notif-seed-4",
            "title": "Welcome to BuildWise Goa",
            "desc": "Explore verified contractors, architects, and order materials directly with site delivery.",
            "recipient_role": "customer",
            "recipient_id": "demo-cust-1",
            "recipient_name": "Rahul Naik",
            "sender_name": "BuildWise Team",
            "type": "system",
            "unread": True,
            "created_at": datetime.now().isoformat()
        }

        # Seed Master Admin Account (Single Fixed Account)
        self.user_accounts["admin@buildwise.goa"] = {
            "id": "a0000000-0000-0000-0000-000000000001",
            "email": "admin@buildwise.goa",
            "password_hash": "admin123",
            "full_name": "BuildWise Admin Master",
            "role": "admin",
            "phone": "+91 832 2420000",
            "city": "Panaji",
            "district": "North Goa",
            "default_location": "HQ Panaji, Goa",
            "subscription_tier": "premium",
            "is_sponsored": True,
            "is_verified": True,
            "created_at": datetime.now(),
            "last_login_at": datetime.now()
        }

        # Seed Initial Platform Revenue (Rahul x Carlos Approved Villa Project: Budget ₹81,50,000)
        self.platform_revenue_transactions["rev-demo-1"] = {
            "id": "rev-demo-1",
            "project_id": "proj-c1",
            "project_title": "4BHK Contemporary Portuguese Villa with Swimming Pool",
            "quotation_id": "quot-1",
            "agreed_budget": 8150000.0,
            "customer_name": "Rahul Naik",
            "customer_commission_rate": 2.0,
            "customer_commission_amount": 163000.0,
            "professional_name": "Carlos Fernandes",
            "professional_commission_rate": 2.0,
            "professional_commission_amount": 163000.0,
            "total_platform_revenue": 326000.0,
            "status": "collected",
            "payment_method": "Direct Platform Escrow",
            "transaction_type": "project_approval_commission",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        # Seed initial Pro & Premium subscription membership revenues
        self.platform_revenue_transactions["sub-rev-1"] = {
            "id": "sub-rev-1",
            "project_id": "sub-premium-carlos@fernandesconstruct.in",
            "project_title": "PREMIUM Membership Subscription (Professional)",
            "quotation_id": None,
            "agreed_budget": 799.0,
            "customer_name": "-",
            "customer_commission_rate": 0.0,
            "customer_commission_amount": 0.0,
            "professional_name": "Carlos Fernandes",
            "professional_commission_rate": 0.0,
            "professional_commission_amount": 799.0,
            "total_platform_revenue": 799.0,
            "status": "collected",
            "payment_method": "Subscription Recurring Gateway",
            "transaction_type": "subscription_premium",
            "subscriber_email": "carlos@fernandesconstruct.in",
            "subscriber_name": "Carlos Fernandes",
            "subscriber_role": "professional",
            "subscription_tier": "premium",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        self.platform_revenue_transactions["sub-rev-2"] = {
            "id": "sub-rev-2",
            "project_id": "sub-pro-ananya@ateliergoa.com",
            "project_title": "PRO Membership Subscription (Professional)",
            "quotation_id": None,
            "agreed_budget": 299.0,
            "customer_name": "-",
            "customer_commission_rate": 0.0,
            "customer_commission_amount": 0.0,
            "professional_name": "Ar. Ananya Deshmukh",
            "professional_commission_rate": 0.0,
            "professional_commission_amount": 299.0,
            "total_platform_revenue": 299.0,
            "status": "collected",
            "payment_method": "Subscription Recurring Gateway",
            "transaction_type": "subscription_pro",
            "subscriber_email": "ananya@ateliergoa.com",
            "subscriber_name": "Ar. Ananya Deshmukh",
            "subscriber_role": "professional",
            "subscription_tier": "pro",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

        self.platform_revenue_transactions["sub-rev-3"] = {
            "id": "sub-rev-3",
            "project_id": "sub-premium-mandovi.supplies@gmail.com",
            "project_title": "PREMIUM Membership Subscription (Supplier)",
            "quotation_id": None,
            "agreed_budget": 799.0,
            "customer_name": "-",
            "customer_commission_rate": 0.0,
            "customer_commission_amount": 0.0,
            "professional_name": "Mandovi Building Solutions & Steel Yard",
            "professional_commission_rate": 0.0,
            "professional_commission_amount": 799.0,
            "total_platform_revenue": 799.0,
            "status": "collected",
            "payment_method": "Subscription Recurring Gateway",
            "transaction_type": "subscription_premium",
            "subscriber_email": "mandovi.supplies@gmail.com",
            "subscriber_name": "Sunil Silva",
            "subscriber_role": "supplier",
            "subscription_tier": "premium",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }

db = InMemoryDB()

