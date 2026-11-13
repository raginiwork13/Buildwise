-- =============================================================================
-- FEATURE: CUSTOMER PROFILES & MARKET SUPPLIER PROFILES
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. CUSTOMER PROFILES TABLE
-- Stores homeowner / client registration data (private, not listed on public marketplace)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    profile_photo_url TEXT,
    state VARCHAR(100) DEFAULT 'Goa',
    district VARCHAR(100) NOT NULL DEFAULT 'North Goa',
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    full_address TEXT,
    customer_type VARCHAR(50) NOT NULL DEFAULT 'Individual / Homeowner' 
        CHECK (customer_type IN ('Individual / Homeowner', 'Property developer', 'Company / Organisation', 'Other')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_email ON public.customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_district ON public.customer_profiles(district);

-- -----------------------------------------------------------------------------
-- 2. MARKET SUPPLIER PROFILES TABLE & COLUMN MIGRATION
-- Stores construction material supplier profiles (listed in Supplier Marketplace)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.supplier_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_person_name VARCHAR(255),
    business_type VARCHAR(50) DEFAULT 'Individual proprietor' 
        CHECK (business_type IN ('Individual proprietor', 'Partnership', 'Private limited company', 'Other')),
    year_of_establishment INT,
    description TEXT,
    logo_url TEXT,
    business_email VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    alt_phone VARCHAR(30),
    website TEXT,
    state VARCHAR(100) DEFAULT 'Goa',
    district VARCHAR(100) NOT NULL DEFAULT 'South Goa',
    city VARCHAR(100) NOT NULL DEFAULT 'Verna',
    pincode VARCHAR(20),
    business_address TEXT,
    primary_location VARCHAR(255) DEFAULT 'Verna Industrial Estate, Goa',
    delivery_locations TEXT[] DEFAULT ARRAY['North Goa', 'South Goa']::TEXT[],
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    is_sponsored BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT TRUE,
    profile_completion_pct INT DEFAULT 80,
    verification_status VARCHAR(30) DEFAULT 'verified' CHECK (verification_status IN ('not_submitted', 'pending', 'under_review', 'verified', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if supplier_profiles table was already created
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS contact_person_name VARCHAR(255);
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS business_type VARCHAR(50) DEFAULT 'Individual proprietor';
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS year_of_establishment INT;
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS alt_phone VARCHAR(30);
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'Goa';
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS district VARCHAR(100) DEFAULT 'South Goa';
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(100) DEFAULT 'Verna';
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS pincode VARCHAR(20);
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free';
ALTER TABLE public.supplier_profiles ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_supp_district ON public.supplier_profiles(district);
CREATE INDEX IF NOT EXISTS idx_supp_subscription ON public.supplier_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_supp_is_published ON public.supplier_profiles(is_published);

-- Verify created tables
SELECT 'customer_profiles' AS table_name, count(*) FROM information_schema.tables WHERE table_name = 'customer_profiles'
UNION ALL
SELECT 'supplier_profiles' AS table_name, count(*) FROM information_schema.tables WHERE table_name = 'supplier_profiles';

