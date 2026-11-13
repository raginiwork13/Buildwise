-- =============================================================================
-- MIGRATION: Add subscription_tier and is_sponsored to professional_profiles
-- Run this in Supabase SQL Editor if 01_profiles_and_portfolios.sql was
-- already executed WITHOUT these columns.
-- =============================================================================

-- Add subscription tier column
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(20) DEFAULT 'free'
CHECK (subscription_tier IN ('free', 'pro', 'premium'));

-- Add sponsored flag
ALTER TABLE public.professional_profiles
ADD COLUMN IF NOT EXISTS is_sponsored BOOLEAN DEFAULT FALSE;

-- Add indexes for marketplace ranking queries
CREATE INDEX IF NOT EXISTS idx_prof_subscription ON public.professional_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_prof_sponsored ON public.professional_profiles(is_sponsored);

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'professional_profiles'
AND column_name IN ('subscription_tier', 'is_sponsored');

