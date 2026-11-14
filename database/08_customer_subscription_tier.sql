-- =============================================================================
-- FEATURE: CUSTOMER SUBSCRIPTION TIER SUPPORT
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

-- 1. Add subscription_tier & is_sponsored columns to customer_profiles if not present
ALTER TABLE IF EXISTS public.customer_profiles 
    ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;

-- 2. Ensure user_accounts has subscription_tier & is_sponsored
ALTER TABLE IF EXISTS public.user_accounts 
    ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(50) DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;

-- 3. Update existing customer records to default 'free' if null
UPDATE public.customer_profiles 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL;

UPDATE public.user_accounts 
SET subscription_tier = 'free' 
WHERE subscription_tier IS NULL;

-- 4. Create index for fast tier lookups
CREATE INDEX IF NOT EXISTS idx_customer_profiles_tier ON public.customer_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_user_accounts_tier ON public.user_accounts(subscription_tier);
