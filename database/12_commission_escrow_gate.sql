-- ═══════════════════════════════════════════════════════════════════════════════
-- BuildWise Goa — Migration 12: Commission Escrow Gate + Anti-Circumvention
-- ═══════════════════════════════════════════════════════════════════════════════
-- Run this in your Supabase SQL Editor

-- 1. Add commission escrow columns to project_workspaces
ALTER TABLE public.project_workspaces
  ADD COLUMN IF NOT EXISTS commission_paid_customer      BOOLEAN        DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS commission_paid_professional  BOOLEAN        DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS commission_status             VARCHAR(50)    DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS commission_amount_customer    NUMERIC(12,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS commission_amount_professional NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS warning_notices_sent          INT            DEFAULT 0,
  ADD COLUMN IF NOT EXISTS circumvention_flagged_at      TIMESTAMPTZ;

-- 2. Create circumvention_warnings table for audit trail
CREATE TABLE IF NOT EXISTS public.circumvention_warnings (
  id                  UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id        TEXT          NOT NULL,
  project_title       TEXT,
  customer_name       TEXT,
  customer_email      TEXT,
  professional_name   TEXT,
  professional_email  TEXT,
  agreed_budget       NUMERIC(14,2),
  commission_due      NUMERIC(12,2),
  warning_type        VARCHAR(50)   DEFAULT 'bypass_detected',
  notices_sent        INT           DEFAULT 0,
  admin_note          TEXT,
  created_at          TIMESTAMPTZ   DEFAULT NOW(),
  updated_at          TIMESTAMPTZ   DEFAULT NOW()
);

-- 3. Mark DEMO workspace as commission PAID (so it stays unlocked for demo)
UPDATE public.project_workspaces
SET
  commission_paid_customer      = TRUE,
  commission_paid_professional  = TRUE,
  commission_status             = 'paid',
  commission_amount_customer    = 163000,
  commission_amount_professional = 163000
WHERE id = 'ws-demo-1';

-- ═══════════════════════════════════════════════════════════════════════════════
-- Done. Run this once in Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════════
