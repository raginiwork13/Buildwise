-- =============================================================================
-- FEATURE: SUPPLIER PRODUCTS & ORDERS WITH MEMBERSHIP DELIVERY TIERS
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.supplier_orders (
    id VARCHAR(100) PRIMARY KEY,
    product_id VARCHAR(100),
    product_name VARCHAR(255) NOT NULL,
    product_category VARCHAR(100) DEFAULT 'Building Materials',
    product_image TEXT,
    supplier_id VARCHAR(100),
    supplier_name VARCHAR(255) NOT NULL,
    supplier_address TEXT,
    customer_name VARCHAR(255) NOT NULL,
    customer_role VARCHAR(50) DEFAULT 'customer',
    customer_tier VARCHAR(50) DEFAULT 'free',
    delivery_type VARCHAR(50) NOT NULL DEFAULT 'home_delivery', -- 'home_delivery' | 'pickup'
    delivery_address TEXT,
    distance_km NUMERIC(8,2) DEFAULT 10.0,
    delivery_fee NUMERIC(10,2) DEFAULT 0.0,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL DEFAULT 0.0,
    total_amount NUMERIC(14,2) NOT NULL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'
    tracking_notes TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_orders_supplier ON public.supplier_orders(supplier_name);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_customer ON public.supplier_orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_supplier_orders_status ON public.supplier_orders(status);

ALTER TABLE IF EXISTS public.supplier_orders DISABLE ROW LEVEL SECURITY;
