import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from app.config import settings

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
        self._seed_initial_data()

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

db = InMemoryDB()

