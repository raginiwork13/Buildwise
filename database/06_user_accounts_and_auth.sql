-- =============================================================================
-- FEATURE: USER ACCOUNTS, AUTH & MULTI-USER ACCOUNT SWITCHER
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT 'default_hash',
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'professional', 'supplier')),
    phone VARCHAR(30),
    company_name VARCHAR(255),
    business_name VARCHAR(255),
    professional_category VARCHAR(100),
    city VARCHAR(100) DEFAULT 'Panaji',
    district VARCHAR(100) DEFAULT 'North Goa',
    default_location VARCHAR(255),
    warehouse_location VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    is_sponsored BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_email ON public.user_accounts(email);
CREATE INDEX IF NOT EXISTS idx_accounts_role ON public.user_accounts(role);

-- Seed initial accounts so they are immediately available in Supabase
INSERT INTO public.user_accounts (email, full_name, role, phone, default_location, city, district)
VALUES 
    ('rahul.naik@example.com', 'Rahul Naik', 'customer', '+91 98221 45091', 'Margao, South Goa', 'Margao', 'South Goa')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_accounts (email, full_name, role, phone, company_name, professional_category, city, district, subscription_tier, is_sponsored)
VALUES 
    ('carlos@fernandesconstruct.in', 'Carlos Fernandes', 'professional', '+91 94220 88210', 'Fernandes & Sons Civil Construction', 'contractor', 'Panaji', 'North Goa', 'premium', TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.user_accounts (email, full_name, role, phone, business_name, city, district, warehouse_location, subscription_tier, is_sponsored)
VALUES 
    ('mandovi.supplies@gmail.com', 'Sunil Silva', 'supplier', '+91 98900 12345', 'Mandovi Building Solutions & Steel Yard', 'Verna', 'South Goa', 'Verna Industrial Estate, South Goa', 'premium', TRUE)
ON CONFLICT (email) DO NOTHING;

