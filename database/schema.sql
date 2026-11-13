-- =============================================================================
-- BUILDWISE: AI-POWERED CONSTRUCTION MARKETPLACE
-- SUPABASE POSTGRESQL SCHEMA (3 ROLES: Customer, Professional, Supplier)
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES & ROLES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(30) NOT NULL CHECK (role IN ('customer', 'professional', 'supplier')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professional specific profiles (Contractor, Architect, Engineer, Interior Designer)
CREATE TABLE IF NOT EXISTS public.professional_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('contractor', 'architect', 'civil_engineer', 'interior_designer', 'structural_consultant')),
    experience_years INT NOT NULL DEFAULT 0,
    license_number VARCHAR(100),
    gstin VARCHAR(20),
    location_district VARCHAR(100) NOT NULL DEFAULT 'North Goa',
    city VARCHAR(100) DEFAULT 'Panaji',
    service_regions TEXT[] DEFAULT ARRAY['North Goa', 'South Goa'],
    budget_tier VARCHAR(30) DEFAULT 'mid-range' CHECK (budget_tier IN ('economy', 'mid-range', 'premium', 'luxury')),
    bio TEXT,
    website TEXT,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    lead_credits_balance INT DEFAULT 50, -- Initial sign-up credits
    is_available BOOLEAN DEFAULT TRUE,
    subscription_tier VARCHAR(30) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer specific profiles
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    default_location VARCHAR(100) DEFAULT 'Goa',
    preferred_contact VARCHAR(20) DEFAULT 'phone',
    projects_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Material Supplier specific profiles
CREATE TABLE IF NOT EXISTS public.supplier_profiles (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    gstin VARCHAR(20) NOT NULL,
    warehouse_location VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Margao',
    delivery_districts TEXT[] DEFAULT ARRAY['North Goa', 'South Goa'],
    minimum_order_value NUMERIC(12,2) DEFAULT 0.00,
    rating NUMERIC(3,2) DEFAULT 0.00,
    categories TEXT[] DEFAULT ARRAY['cement', 'steel', 'tiles', 'electrical', 'plumbing'],
    subscription_tier VARCHAR(30) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. PROJECTS TABLE (Customer project posting)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('new_residential', 'renovation', 'commercial', 'interior_design', 'structural_work')),
    location_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL CHECK (district IN ('North Goa', 'South Goa', 'Other')),
    built_up_area_sqft NUMERIC(10,2) NOT NULL,
    floors_count INT DEFAULT 1,
    estimated_budget NUMERIC(14,2) NOT NULL,
    required_services TEXT[] NOT NULL,
    preferred_timeline_months INT DEFAULT 6,
    status VARCHAR(40) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'receiving_enquiries', 'shortlisted', 'professional_selected', 'in_progress', 'completed', 'cancelled')),
    selected_professional_id UUID REFERENCES public.professional_profiles(id),
    agreed_project_value NUMERIC(14,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. PROJECT ENQUIRIES & LEADS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    pitch_message TEXT,
    credits_deducted INT NOT NULL DEFAULT 10,
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN ('submitted', 'shortlisted', 'declined', 'quotation_requested', 'awarded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_project_pro_enquiry UNIQUE (project_id, professional_id)
);

-- -----------------------------------------------------------------------------
-- 4. QUOTATIONS & ITEMS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    version INT DEFAULT 1,
    total_estimated_price NUMERIC(14,2) NOT NULL,
    material_cost NUMERIC(14,2) NOT NULL,
    labour_cost NUMERIC(14,2) NOT NULL,
    transport_charges NUMERIC(10,2) DEFAULT 0.00,
    service_fee NUMERIC(10,2) DEFAULT 0.00,
    completion_timeline_days INT NOT NULL,
    validity_date DATE NOT NULL,
    terms_and_conditions TEXT,
    included_services TEXT[],
    excluded_services TEXT[],
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'superseded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. SUPPLIER PRODUCTS CATALOG
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_id UUID NOT NULL REFERENCES public.supplier_profiles(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('cement', 'steel', 'bricks', 'tiles', 'paint', 'electrical', 'plumbing', 'sanitary')),
    brand VARCHAR(100),
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- 'bag', 'ton', 'sqft', 'piece'
    unit_price NUMERIC(10,2) NOT NULL,
    in_stock BOOLEAN DEFAULT TRUE,
    minimum_order_qty INT DEFAULT 1,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. REVIEWS & RATINGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    work_quality_rating INT CHECK (work_quality_rating BETWEEN 1 AND 5),
    timeliness_rating INT CHECK (timeliness_rating BETWEEN 1 AND 5),
    communication_rating INT CHECK (communication_rating BETWEEN 1 AND 5),
    review_title VARCHAR(255),
    review_text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

