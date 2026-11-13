import uuid
from datetime import datetime
from app.config import settings
from app.db.store import supabase_client

def seed_supabase_if_needed():
    if not supabase_client:
        print("Supabase client not configured; skipping Supabase seeding.")
        return

    # Check existing profiles
    try:
        existing = supabase_client.table("professional_profiles").select("id").execute()
        existing_ids = {row["id"] for row in existing.data}
    except Exception as e:
        print(f"Error checking existing Supabase profiles: {e}")
        return

    # Deterministic UUIDs for the 4 profiles
    id_carlos = str(uuid.uuid5(uuid.NAMESPACE_DNS, "carlos-fernandes"))
    id_ananya = str(uuid.uuid5(uuid.NAMESPACE_DNS, "ananya-deshmukh"))
    id_rajesh = str(uuid.uuid5(uuid.NAMESPACE_DNS, "rajesh-kerkar"))
    id_meera  = str(uuid.uuid5(uuid.NAMESPACE_DNS, "meera-shenoy"))

    profiles_to_seed = [
        {
            "id": id_carlos,
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
            "is_sponsored": True
        },
        {
            "id": id_ananya,
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
            "is_sponsored": True
        },
        {
            "id": id_rajesh,
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
            "is_sponsored": False
        },
        {
            "id": id_meera,
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
            "is_sponsored": False
        }
    ]

    for p in profiles_to_seed:
        pid = p["id"]
        # Safe insert with fallback if columns don't exist yet
        try:
            supabase_client.table("professional_profiles").upsert(p).execute()
            print(f"Upserted to Supabase: {p['full_name']}")
        except Exception as e:
            err = str(e)
            if "subscription_tier" in err or "is_sponsored" in err:
                p_safe = {k: v for k, v in p.items() if k not in ("subscription_tier", "is_sponsored")}
                supabase_client.table("professional_profiles").upsert(p_safe).execute()
                print(f"Upserted to Supabase (safe): {p['full_name']}")
            else:
                print(f"Failed upsert for {p['full_name']}: {e}")

    # Seed Portfolio Projects
    proj1_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "villa-sol-de-goa"))
    proj2_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "verem-cliffside"))
    proj3_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "colva-beachfront"))
    proj4_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, "casa-bela-assagao"))

    projects = [
        {
            "id": proj1_id,
            "professional_id": id_carlos,
            "title": "Villa Sol de Goa",
            "project_type": "New Construction",
            "description": "4,200 sq.ft Portuguese-modern villa with sloping clay tile roofs, exposed laterite accents, and infinity pool.",
            "location": "Assagao, North Goa",
            "completion_year": 2024,
            "project_area_sqft": 4200.0,
            "indicative_budget": 8500000.0,
            "role": "General Contractor",
            "display_order": 1
        },
        {
            "id": proj2_id,
            "professional_id": id_ananya,
            "title": "Verem Cliffside Eco Villa",
            "project_type": "Architectural Design",
            "description": "Climate responsive sustainable villa integrating Mandovi river vistas and courtyard ventilation.",
            "location": "Verem, North Goa",
            "completion_year": 2023,
            "project_area_sqft": 3500.0,
            "indicative_budget": 6500000.0,
            "role": "Principal Architect",
            "display_order": 1
        },
        {
            "id": proj3_id,
            "professional_id": id_rajesh,
            "title": "Colva Beachfront Complex",
            "project_type": "Structural Engineering",
            "description": "Seismic Zone III compliant deep pile foundation and post-tensioned slab casting.",
            "location": "Colva, South Goa",
            "completion_year": 2022,
            "project_area_sqft": 14000.0,
            "indicative_budget": 24000000.0,
            "role": "Lead Structural Engineer",
            "display_order": 1
        },
        {
            "id": proj4_id,
            "professional_id": id_meera,
            "title": "Casa Bela Assagao",
            "project_type": "Interior Architecture",
            "description": "Hand-poured green terrazzo floors, lime plaster accents, and reclaimed teakwood cabinetry.",
            "location": "Assagao, North Goa",
            "completion_year": 2024,
            "project_area_sqft": 2800.0,
            "indicative_budget": 4200000.0,
            "role": "Interior Designer",
            "display_order": 1
        }
    ]

    for prj in projects:
        try:
            supabase_client.table("portfolio_projects").upsert(prj).execute()
        except Exception as e:
            print(f"Error seeding project {prj['title']}: {e}")

    # Seed Portfolio Media
    media_items = [
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "med-1-carlos")),
            "portfolio_project_id": proj1_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            "file_name": "exterior_front.jpg",
            "caption": "Front Elevation & Sloping Roof",
            "display_order": 1
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "med-2-ananya")),
            "portfolio_project_id": proj2_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
            "file_name": "verem_exterior.jpg",
            "caption": "Cantilevered deck facing Mandovi estuary",
            "display_order": 1
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "med-3-rajesh")),
            "portfolio_project_id": proj3_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1541888946425-d0fbb186156f?auto=format&fit=crop&w=800&q=80",
            "file_name": "colva_structural.jpg",
            "caption": "Deep RCC foundation casting",
            "display_order": 1
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "med-4-meera")),
            "portfolio_project_id": proj4_id,
            "media_type": "image",
            "file_url": "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
            "file_name": "casa_bela_living.jpg",
            "caption": "Terrazzo and lime plaster living space",
            "display_order": 1
        }
    ]

    for m in media_items:
        try:
            supabase_client.table("portfolio_media").upsert(m).execute()
        except Exception as e:
            print(f"Error seeding media {m['file_name']}: {e}")

    # Seed Reviews
    reviews = [
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "rev-1-carlos")),
            "professional_id": id_carlos,
            "reviewer_name": "Dr. Amit Roy",
            "rating": 5.0,
            "review_text": "Carlos and his team completed our Assagao villa on schedule. Structural quality and transparency during milestone slab castings were outstanding.",
            "project_reference": "Villa Sol de Goa",
            "moderation_status": "approved",
            "is_verified_purchase": True
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "rev-2-ananya")),
            "professional_id": id_ananya,
            "reviewer_name": "Siddharth Sen",
            "rating": 4.9,
            "review_text": "Ananya is simply the best architect in Goa for getting CRZ clearances and delivering breathtaking natural ventilation.",
            "project_reference": "Verem Cliffside Villa",
            "moderation_status": "approved",
            "is_verified_purchase": True
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "rev-3-rajesh")),
            "professional_id": id_rajesh,
            "reviewer_name": "Goa Coastal Developers",
            "rating": 4.8,
            "review_text": "Rock-solid engineering calculations and strict safety checks. Top-tier civil consultant.",
            "project_reference": "Colva Complex",
            "moderation_status": "approved",
            "is_verified_purchase": True
        },
        {
            "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "rev-4-meera")),
            "professional_id": id_meera,
            "reviewer_name": "Kavita Singhal",
            "rating": 4.9,
            "review_text": "Meera gave our Portuguese home an authentic yet modern vibe. Outstanding sense of color and materials.",
            "project_reference": "Casa Bela",
            "moderation_status": "approved",
            "is_verified_purchase": True
        }
    ]

    for r in reviews:
        try:
            supabase_client.table("professional_reviews").upsert(r).execute()
        except Exception as e:
            print(f"Error seeding review {r['reviewer_name']}: {e}")

    print("Supabase seed check completed successfully!")

if __name__ == "__main__":
    seed_supabase_if_needed()

