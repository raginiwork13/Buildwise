-- =============================================================================
-- FEATURE 1: PROFESSIONAL PROFILES, PORTFOLIOS & SUPPLIER CATALOGUES
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFESSIONAL PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    profile_photo_url TEXT,
    company_logo_url TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('contractor', 'architect', 'civil_engineer', 'interior_designer', 'structural_consultant')),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    website TEXT,
    bio TEXT,
    experience_years INT NOT NULL DEFAULT 0,
    specialisations TEXT[] DEFAULT ARRAY[]::TEXT[],
    project_types_handled TEXT[] DEFAULT ARRAY[]::TEXT[],
    min_budget NUMERIC(14,2) DEFAULT 100000.00,
    max_budget NUMERIC(14,2) DEFAULT 50000000.00,
    currency VARCHAR(10) DEFAULT 'INR',
    availability_status VARCHAR(30) DEFAULT 'available' CHECK (availability_status IN ('available', 'limited_availability', 'unavailable')),
    country VARCHAR(100) DEFAULT 'India',
    state VARCHAR(100) DEFAULT 'Goa',
    district VARCHAR(100) NOT NULL DEFAULT 'North Goa',
    city VARCHAR(100) NOT NULL DEFAULT 'Panaji',
    business_address TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    profile_completion_pct INT DEFAULT 20,
    verification_status VARCHAR(30) DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'under_review', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prof_category ON public.professional_profiles(category);
CREATE INDEX IF NOT EXISTS idx_prof_district ON public.professional_profiles(district);
CREATE INDEX IF NOT EXISTS idx_prof_is_published ON public.professional_profiles(is_published);
CREATE INDEX IF NOT EXISTS idx_prof_verification ON public.professional_profiles(verification_status);

-- -----------------------------------------------------------------------------
-- 2. PROFESSIONAL SERVICES OFFERED
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    pricing_model VARCHAR(50) DEFAULT 'per_sqft' CHECK (pricing_model IN ('per_sqft', 'fixed_quote', 'percentage_of_cost', 'per_day')),
    indicative_rate NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prof_services_pid ON public.professional_services(professional_id);

-- -----------------------------------------------------------------------------
-- 3. PROFESSIONAL SERVICE LOCATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    location_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prof_locations_pid ON public.professional_locations(professional_id);

-- -----------------------------------------------------------------------------
-- 4. PORTFOLIO PROJECTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    project_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    completion_year INT NOT NULL,
    project_area_sqft NUMERIC(10,2),
    indicative_budget NUMERIC(14,2),
    role VARCHAR(150) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_proj_pid ON public.portfolio_projects(professional_id);

-- -----------------------------------------------------------------------------
-- 5. PORTFOLIO MEDIA (IMAGES & DESIGN FILES)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_project_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
    media_type VARCHAR(30) DEFAULT 'image' CHECK (media_type IN ('image', 'document', 'floor_plan', '3d_render')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    caption TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_media_proj ON public.portfolio_media(portfolio_project_id);

-- -----------------------------------------------------------------------------
-- 6. PROFESSIONAL CERTIFICATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    certification_name VARCHAR(255) NOT NULL,
    issuing_authority VARCHAR(255) NOT NULL,
    certificate_number VARCHAR(100),
    issue_date DATE NOT NULL,
    expiry_date DATE,
    document_url TEXT, -- Private verification document
    verification_status VARCHAR(30) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_pid ON public.certifications(professional_id);

-- -----------------------------------------------------------------------------
-- 7. SUPPLIER PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    description TEXT NOT NULL,
    business_email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    website TEXT,
    business_address TEXT,
    primary_location VARCHAR(255) NOT NULL,
    delivery_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    profile_completion_pct INT DEFAULT 20,
    verification_status VARCHAR(30) DEFAULT 'not_submitted' CHECK (verification_status IN ('not_submitted', 'pending', 'under_review', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supp_is_published ON public.supplier_profiles(is_published);
CREATE INDEX IF NOT EXISTS idx_supp_verification ON public.supplier_profiles(verification_status);

-- -----------------------------------------------------------------------------
-- 8. SUPPLIER PRODUCT CATEGORIES
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles(id) ON DELETE CASCADE,
    category_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supp_cat_sid ON public.supplier_categories(supplier_id);

-- -----------------------------------------------------------------------------
-- 9. SUPPLIER PRODUCTS CATALOGUE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (category IN (
        'Cement', 'Steel', 'Bricks and blocks', 'Tiles', 'Paint', 
        'Electrical products', 'Plumbing products', 'Sanitary products', 'Other construction materials'
    )),
    brand VARCHAR(100),
    description TEXT NOT NULL,
    specifications TEXT,
    unit_of_measurement VARCHAR(50) NOT NULL, -- 'per 50kg bag', 'per metric ton', 'per piece', 'per sq.ft'
    indicative_price NUMERIC(12,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    in_stock BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT TRUE,
    primary_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supp_prod_sid ON public.supplier_products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supp_prod_cat ON public.supplier_products(category);

-- -----------------------------------------------------------------------------
-- 10. PRODUCT MEDIA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.supplier_products(id) ON DELETE CASCADE,
    media_url TEXT NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prod_media_pid ON public.product_media(product_id);

-- -----------------------------------------------------------------------------
-- 11. VERIFICATION SUBMISSIONS (ADMIN AUDITING)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.verification_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(30) NOT NULL CHECK (entity_type IN ('professional', 'supplier')),
    entity_id UUID NOT NULL,
    business_legal_name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100),
    tax_identifier_gstin VARCHAR(50),
    id_proof_doc_url TEXT NOT NULL, -- Private document
    business_proof_doc_url TEXT,    -- Private document
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN ('not_submitted', 'pending', 'under_review', 'verified', 'rejected')),
    rejection_reason TEXT,
    reviewer_notes TEXT,
    submission_date TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_verif_entity ON public.verification_submissions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_verif_status ON public.verification_submissions(status);

-- -----------------------------------------------------------------------------
-- 12. PROFESSIONAL REVIEWS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.professional_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    reviewer_name VARCHAR(255) NOT NULL,
    rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1.0 AND rating <= 5.0),
    review_text TEXT NOT NULL,
    project_reference VARCHAR(255),
    moderation_status VARCHAR(30) DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prof_reviews_pid ON public.professional_reviews(professional_id);

