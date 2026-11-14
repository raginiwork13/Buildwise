-- =============================================================================
-- BUILDWISE COMPLETE SUPABASE DATABASE MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/eqcmbhejdhejrrhhqmuk/sql
-- =============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. USER ACCOUNTS (MULTI-ROLE AUTH & SWITCHER)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_accounts (
    id VARCHAR(100) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'professional', 'supplier')),
    phone VARCHAR(50),
    company_name VARCHAR(255),
    business_name VARCHAR(255),
    professional_category VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    default_location VARCHAR(255),
    warehouse_location VARCHAR(255),
    subscription_tier VARCHAR(50) DEFAULT 'free',
    is_sponsored BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. CUSTOMER PROJECTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.customer_projects (
    id VARCHAR(100) PRIMARY KEY,
    customer_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    customer_type VARCHAR(100) DEFAULT 'Individual / Homeowner',
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    location_address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    pincode VARCHAR(20),
    property_type VARCHAR(100),
    project_type VARCHAR(100),
    project_stage VARCHAR(100),
    plot_area_sqft NUMERIC(10,2),
    built_up_area_sqft NUMERIC(10,2) NOT NULL,
    floors_count INT DEFAULT 1,
    bedrooms_count INT,
    bathrooms_count INT,
    parking_requirement VARCHAR(100),
    construction_style VARCHAR(100),
    structural_requirements VARCHAR(100),
    min_budget NUMERIC(14,2),
    max_budget NUMERIC(14,2),
    estimated_budget NUMERIC(14,2) NOT NULL,
    budget_flexibility VARCHAR(50),
    materials_included VARCHAR(50),
    labour_included VARCHAR(50),
    required_services TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_timeline_months INT DEFAULT 6,
    urgency VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'receiving_enquiries',
    enquiries_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_projects_district ON public.customer_projects(district);
CREATE INDEX IF NOT EXISTS idx_customer_projects_category ON public.customer_projects(category);
CREATE INDEX IF NOT EXISTS idx_customer_projects_customer ON public.customer_projects(customer_name);

-- =============================================================================
-- 3. PROJECT QUOTATIONS TABLE (WITH FILE UPLOAD / BOQ ATTACHMENTS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_quotations (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    customer_id VARCHAR(100),
    customer_name VARCHAR(255) NOT NULL,
    provider_id VARCHAR(100) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_role VARCHAR(50) DEFAULT 'professional',
    provider_company VARCHAR(255),
    total_estimated_price NUMERIC(14,2) NOT NULL,
    material_costs NUMERIC(14,2) DEFAULT 0.0,
    labour_costs NUMERIC(14,2) DEFAULT 0.0,
    transport_charges NUMERIC(14,2) DEFAULT 0.0,
    service_charges NUMERIC(14,2) DEFAULT 0.0,
    expected_completion_time VARCHAR(100),
    payment_milestones TEXT,
    materials_included TEXT,
    materials_excluded TEXT,
    terms_and_conditions TEXT,
    quotation_validity_days INT DEFAULT 30,
    document_url TEXT,
    document_filename VARCHAR(255),
    notes TEXT,
    status VARCHAR(30) DEFAULT 'submitted', -- 'submitted', 'approved', 'rejected', 'work_started'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotations_project_id ON public.project_quotations(project_id);
CREATE INDEX IF NOT EXISTS idx_quotations_provider_name ON public.project_quotations(provider_name);
CREATE INDEX IF NOT EXISTS idx_quotations_customer_name ON public.project_quotations(customer_name);

-- =============================================================================
-- 4. PROJECT INTERESTS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_interests (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    provider_id VARCHAR(100) NOT NULL,
    provider_name VARCHAR(255) NOT NULL,
    provider_role VARCHAR(50) DEFAULT 'professional',
    provider_company VARCHAR(255),
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_interests_project_id ON public.project_interests(project_id);

-- =============================================================================
-- 5. CHAT MESSAGES (REAL-TIME BIDIRECTIONAL MESSENGER)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id VARCHAR(100) PRIMARY KEY,
    conversation_id VARCHAR(150) NOT NULL,
    project_id VARCHAR(100),
    project_title VARCHAR(255),
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(255) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    recipient_id VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_role VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_sender_name ON public.chat_messages(sender_name);
CREATE INDEX IF NOT EXISTS idx_chat_recipient_name ON public.chat_messages(recipient_name);

-- =============================================================================
-- 6. PROJECT WORKSPACES (PROJECT PROGRESS & BUDGET MONITORING)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_workspaces (
    id VARCHAR(100) PRIMARY KEY,
    project_id VARCHAR(100) NOT NULL,
    project_title VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    professional_name VARCHAR(255) NOT NULL,
    professional_company VARCHAR(255),
    agreed_amount NUMERIC(14,2) NOT NULL,
    expected_start_date DATE,
    expected_completion_date DATE,
    status VARCHAR(50) DEFAULT 'agreement_pending', -- 'agreement_pending', 'active', 'paused', 'completed'
    overall_progress INT DEFAULT 0,
    amount_paid NUMERIC(14,2) DEFAULT 0.0,
    start_confirmed_professional BOOLEAN DEFAULT FALSE,
    start_confirmed_customer BOOLEAN DEFAULT FALSE,
    completion_confirmed_professional BOOLEAN DEFAULT FALSE,
    completion_confirmed_customer BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ws_customer ON public.project_workspaces(customer_name);
CREATE INDEX IF NOT EXISTS idx_ws_professional ON public.project_workspaces(professional_name);

-- =============================================================================
-- 7. PROJECT MILESTONES (STEP-BY-STEP PROGRESS MANAGED BY PROFESSIONAL)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id VARCHAR(100) PRIMARY KEY,
    workspace_id VARCHAR(100) NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    planned_start DATE,
    planned_end DATE,
    actual_start DATE,
    actual_end DATE,
    progress_percentage INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'submitted_for_review', 'completed', 'delayed'
    payment_amount NUMERIC(14,2) DEFAULT 0.0,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_workspace ON public.project_milestones(workspace_id);

-- =============================================================================
-- 8. PROGRESS UPDATES (SITE UPDATES POSTED BY PROFESSIONAL)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.progress_updates (
    id VARCHAR(100) PRIMARY KEY,
    workspace_id VARCHAR(100) NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    work_in_progress TEXT,
    progress_percentage INT DEFAULT 0,
    photos TEXT[] DEFAULT ARRAY[]::TEXT[],
    issues_or_delays TEXT,
    next_activities TEXT,
    posted_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_updates_workspace ON public.progress_updates(workspace_id);

-- =============================================================================
-- 9. PAYMENT MILESTONES (CUSTOMER BUDGET & PAYMENT TRACKING)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_milestones (
    id VARCHAR(100) PRIMARY KEY,
    workspace_id VARCHAR(100) NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(14,2) NOT NULL,
    status VARCHAR(30) DEFAULT 'upcoming', -- 'paid', 'pending', 'upcoming'
    due_date DATE,
    paid_date DATE,
    reference VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_workspace ON public.payment_milestones(workspace_id);

-- =============================================================================
-- 10. WORKSPACE DOCUMENTS (SHARED REPOSITORY FOR CONTRACTS, BOQ & DRAWINGS)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.workspace_documents (
    id VARCHAR(100) PRIMARY KEY,
    workspace_id VARCHAR(100) NOT NULL REFERENCES public.project_workspaces(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Other',
    url TEXT NOT NULL,
    uploader VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_workspace ON public.workspace_documents(workspace_id);

-- =============================================================================
-- DISABLE RLS FOR HACKATHON ACCESS (SO API SERVICE ROLE & ANON KEYS CAN READ/WRITE)
-- =============================================================================
ALTER TABLE IF EXISTS public.customer_projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_quotations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_interests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.chat_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_workspaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_updates DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_milestones DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workspace_documents DISABLE ROW LEVEL SECURITY;

