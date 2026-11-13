-- =============================================================================
-- BUILDWISE: AI-POWERED CONSTRUCTION MARKETPLACE
-- FEATURE 8: NOTIFICATIONS & COMMUNICATION SCHEMA MIGRATION
-- Compatible with both demo string IDs ('demo-cust-1', 'demo-prof-1') and UUIDs
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'project_update', 
        'enquiry', 
        'quotation', 
        'message', 
        'milestone', 
        'supplier_enquiry',
        'system'
    )),
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    is_dismissed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. CONVERSATIONS TABLE
-- Supports Project-linked and Supplier Product/RFQ-linked communication
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
    id VARCHAR(64) PRIMARY KEY,
    context_type VARCHAR(30) NOT NULL DEFAULT 'general' CHECK (context_type IN ('project', 'product_rfq', 'direct', 'general')),
    project_id VARCHAR(64),
    product_id VARCHAR(64),
    context_title VARCHAR(255),
    title VARCHAR(255),
    created_by VARCHAR(64) NOT NULL,
    last_message_preview TEXT,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. CONVERSATION PARTICIPANTS TABLE
-- Maps participants (customers, contractors, suppliers) with unread tracking
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    conversation_id VARCHAR(64) NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id VARCHAR(64) NOT NULL,
    role VARCHAR(30) DEFAULT 'participant',
    user_name VARCHAR(255),
    user_role VARCHAR(30),
    company_name VARCHAR(255),
    avatar_url TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (conversation_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 4. MESSAGES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
    id VARCHAR(64) PRIMARY KEY,
    conversation_id VARCHAR(64) NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id VARCHAR(64) NOT NULL,
    sender_name VARCHAR(255),
    sender_role VARCHAR(30),
    content TEXT NOT NULL,
    message_type VARCHAR(30) NOT NULL DEFAULT 'text' CHECK (message_type IN (
        'text', 
        'system', 
        'quotation_link', 
        'project_link', 
        'product_rfq',
        'file'
    )),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
    ON public.notifications (user_id, is_read) 
    WHERE is_dismissed = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
    ON public.notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON public.messages (conversation_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_participants_user 
    ON public.conversation_participants (user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_last_msg 
    ON public.conversations (last_message_at DESC);

-- -----------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Safe for both authenticated Supabase JWT sessions and token/header demo auth
-- -----------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Notifications: Only recipient OR verified service_role can view or mutate
DROP POLICY IF EXISTS "Notifications access policy" ON public.notifications;
CREATE POLICY "Notifications access policy"
    ON public.notifications FOR ALL
    USING (
        auth.uid()::text = user_id OR 
        current_setting('request.jwt.claims', true)::json->>'sub' = user_id OR
        auth.role() = 'service_role'
    );

-- Conversations: Only participating members OR verified service_role can access
DROP POLICY IF EXISTS "Conversations participant access policy" ON public.conversations;
CREATE POLICY "Conversations participant access policy"
    ON public.conversations FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = id AND (
                cp.user_id = auth.uid()::text OR 
                cp.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            )
        )
    );

-- Conversation participants: Members OR verified service_role can view co-participants
DROP POLICY IF EXISTS "Conversation participants policy" ON public.conversation_participants;
CREATE POLICY "Conversation participants policy"
    ON public.conversation_participants FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND (
                cp.user_id = auth.uid()::text OR 
                cp.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            )
        )
    );

-- Messages: Only participants OR verified service_role can read and post
DROP POLICY IF EXISTS "Messages participant policy" ON public.messages;
CREATE POLICY "Messages participant policy"
    ON public.messages FOR ALL
    USING (
        auth.role() = 'service_role' OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp
            WHERE cp.conversation_id = conversation_id AND (
                cp.user_id = auth.uid()::text OR 
                cp.user_id = current_setting('request.jwt.claims', true)::json->>'sub'
            )
        )
    );
