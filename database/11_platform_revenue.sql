-- =============================================================================
-- FEATURE: PLATFORM REVENUE & 2% DUAL-SIDED PROJECT COMMISSION BUSINESS MODEL
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

-- 1. Create Platform Revenue Transactions Table
CREATE TABLE IF NOT EXISTS public.platform_revenue_transactions (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    project_title TEXT NOT NULL,
    quotation_id VARCHAR(100),
    agreed_budget NUMERIC(14,2) NOT NULL DEFAULT 0.0,
    customer_name VARCHAR(255) NOT NULL,
    customer_commission_rate NUMERIC(5,2) DEFAULT 2.0, -- 2% from customer
    customer_commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    professional_name VARCHAR(255) NOT NULL,
    professional_commission_rate NUMERIC(5,2) DEFAULT 2.0, -- 2% from professional
    professional_commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    total_platform_revenue NUMERIC(14,2) NOT NULL DEFAULT 0.0, -- 4% total platform revenue
    status VARCHAR(50) NOT NULL DEFAULT 'collected', -- 'collected', 'pending', 'settled'
    payment_method VARCHAR(100) DEFAULT 'Direct Platform Escrow',
    transaction_type VARCHAR(100) DEFAULT 'project_approval_commission',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revenue_project ON public.platform_revenue_transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_revenue_status ON public.platform_revenue_transactions(status);
CREATE INDEX IF NOT EXISTS idx_revenue_created_at ON public.platform_revenue_transactions(created_at DESC);

ALTER TABLE IF EXISTS public.platform_revenue_transactions DISABLE ROW LEVEL SECURITY;

-- 2. Update Role Check Constraint on user_accounts to allow 'admin'
ALTER TABLE public.user_accounts 
DROP CONSTRAINT IF EXISTS user_accounts_role_check;

ALTER TABLE public.user_accounts 
ADD CONSTRAINT user_accounts_role_check 
CHECK (role IN ('customer', 'professional', 'supplier', 'admin'));

-- 3. Seed Master Admin Account in user_accounts (Email: admin@buildwise.goa | Password: admin123)
INSERT INTO public.user_accounts (
    id, email, password_hash, full_name, role, phone, city, district, default_location, subscription_tier, is_sponsored, is_verified, created_at, last_login_at
) VALUES (
    'a0000000-0000-0000-0000-000000000001'::uuid,
    'admin@buildwise.goa',
    'admin123',
    'BuildWise Admin Master',
    'admin',
    '+91 832 2420000',
    'Panaji',
    'North Goa',
    'HQ Panaji, Goa',
    'premium',
    TRUE,
    TRUE,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    full_name = 'BuildWise Admin Master',
    is_verified = TRUE;

-- 4. Seed Demo Initial Revenue Transaction for the approved Villa engagement (Rahul x Carlos)
INSERT INTO public.platform_revenue_transactions (
    id, project_id, project_title, quotation_id, agreed_budget, 
    customer_name, customer_commission_rate, customer_commission_amount,
    professional_name, professional_commission_rate, professional_commission_amount,
    total_platform_revenue, status, payment_method, transaction_type, created_at
) VALUES (
    'rev-demo-1',
    'proj-c1',
    '4BHK Contemporary Portuguese Villa with Swimming Pool',
    'quot-1',
    8150000.0,
    'Rahul Naik',
    2.0,
    163000.0,
    'Carlos Fernandes',
    2.0,
    163000.0,
    326000.0,
    'collected',
    'Direct Platform Escrow',
    'project_approval_commission',
    NOW() - INTERVAL '3 days'
) ON CONFLICT (id) DO NOTHING;
