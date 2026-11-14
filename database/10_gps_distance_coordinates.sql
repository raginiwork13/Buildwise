-- =============================================================================
-- FEATURE: GPS COORDINATES & DISTANCE CALCULATION FOR SUPPLIERS & ORDERS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

-- 1. Add GPS coordinates to supplier profiles (Yard / Depot Location)
ALTER TABLE IF EXISTS public.supplier_profiles 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7) DEFAULT 15.3582000,
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7) DEFAULT 73.9314000;

-- 2. Add GPS coordinates & accurate distance tracking to supplier orders
ALTER TABLE IF EXISTS public.supplier_orders
ADD COLUMN IF NOT EXISTS supplier_latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS supplier_longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS customer_latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS customer_longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS calculated_distance_km NUMERIC(8, 2);

-- 3. Optional: update existing demo supplier Mandovi to Verna Industrial Estate coordinates
UPDATE public.supplier_profiles 
SET latitude = 15.3582000, longitude = 73.9314000
WHERE company_name ILIKE '%Mandovi%' AND latitude IS NULL;
