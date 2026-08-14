-- Migration: 20260814160000_open_status_inactivity_fields
-- Unifies BOT and QUEUED into OPEN status
-- Adds warningSentAt and closeReason fields for inactivity auto-close

-- 1. Add new columns to conversations table
ALTER TABLE "gtf_conversations"
  ADD COLUMN IF NOT EXISTS "warning_sent_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "close_reason" TEXT;

-- 2. Migrate existing status values: BOT and QUEUED -> OPEN
UPDATE "gtf_conversations"
  SET "status" = 'OPEN'
  WHERE "status" IN ('BOT', 'QUEUED');

-- 3. Create index for inactivity worker queries
CREATE INDEX IF NOT EXISTS "gtf_conversations_warning_sent_at_idx"
  ON "gtf_conversations" ("warning_sent_at");
