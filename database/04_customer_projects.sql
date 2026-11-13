-- =============================================================================
-- FEATURE: CUSTOMER PROJECTS MARKETPLACE
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.customer_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(100) DEFAULT 'Individual / Homeowner',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('new_residential', 'renovation', 'commercial', 'interior_design', 'structural_work')),
    location_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL CHECK (district IN ('North Goa', 'South Goa')),
    city VARCHAR(100) NOT NULL,
    built_up_area_sqft NUMERIC(10,2) NOT NULL,
    floors_count INT DEFAULT 1,
    estimated_budget NUMERIC(14,2) NOT NULL,
    required_services TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_timeline_months INT DEFAULT 6,
    status VARCHAR(40) NOT NULL DEFAULT 'receiving_enquiries' 
        CHECK (status IN ('draft', 'published', 'receiving_enquiries', 'shortlisted', 'in_progress', 'completed', 'cancelled')),
    enquiries_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_district ON public.customer_projects(district);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.customer_projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.customer_projects(status);

