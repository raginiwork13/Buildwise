-- =============================================================================
-- FEATURE: PROJECT QUOTATIONS, INTERESTS & CHAT SYSTEM
-- SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

-- 1. Project Quotations Table
CREATE TABLE IF NOT EXISTS public.project_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(100) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    customer_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    provider_id VARCHAR(100) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_role VARCHAR(50) DEFAULT 'professional', -- 'professional' | 'supplier'
    provider_company VARCHAR(255),
    total_estimated_price NUMERIC(14,2) NOT NULL,
    material_costs NUMERIC(14,2) DEFAULT 0.0,
    labour_costs NUMERIC(14,2) DEFAULT 0.0,
    transport_charges NUMERIC(14,2) DEFAULT 0.0,
    service_charges NUMERIC(14,2) DEFAULT 0.0,
    expected_completion_time VARCHAR(100) NOT NULL,
    payment_milestones TEXT,
    materials_included TEXT,
    materials_excluded TEXT,
    terms_and_conditions TEXT,
    quotation_validity_days INT DEFAULT 30,
    status VARCHAR(30) DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'work_started')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotations_project ON public.project_quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_customer ON public.project_quotations(customer_name);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON public.project_quotations(status);

-- 2. Project Interests Table
CREATE TABLE IF NOT EXISTS public.project_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id VARCHAR(100) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    provider_id VARCHAR(100) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_role VARCHAR(50) DEFAULT 'professional', -- 'professional' | 'supplier'
    provider_company VARCHAR(255),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interests_project ON public.project_interests(project_id);

-- 3. Live Chat Messages Table (OLX / WhatsApp style)
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id VARCHAR(100) NOT NULL,
    project_id VARCHAR(100),
    project_title VARCHAR(255),
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL, -- 'customer' | 'professional' | 'supplier'
    recipient_id VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversation ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_recipient ON public.chat_messages(recipient_id);

