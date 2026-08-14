ALTER TABLE "gtf_conversations"
  ADD COLUMN IF NOT EXISTS "queued_at" TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS "last_activity_at" TIMESTAMPTZ;

UPDATE "gtf_conversations"
SET "last_activity_at" = COALESCE("last_activity_at", "started_at"),
    "queued_at" = CASE WHEN "status" = 'QUEUED' THEN COALESCE("queued_at", "started_at") ELSE "queued_at" END;

ALTER TABLE "gtf_conversations"
  ALTER COLUMN "last_activity_at" SET DEFAULT CURRENT_TIMESTAMP,
  ALTER COLUMN "last_activity_at" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "gtf_conversations_status_department_last_activity_idx"
  ON "gtf_conversations" ("status", "department_id", "last_activity_at");
CREATE INDEX IF NOT EXISTS "gtf_conversations_status_queued_at_idx"
  ON "gtf_conversations" ("status", "queued_at");
CREATE INDEX IF NOT EXISTS "gtf_conversations_assigned_status_last_activity_idx"
  ON "gtf_conversations" ("assigned_agent_id", "status", "last_activity_at");
CREATE INDEX IF NOT EXISTS "gtf_conversations_last_activity_idx"
  ON "gtf_conversations" ("last_activity_at");

CREATE TABLE IF NOT EXISTS "gtf_notifications" (
  "id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "conversation_id" TEXT,
  "department_id" TEXT,
  "dedupe_key" TEXT NOT NULL,
  "payload" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read_at" TIMESTAMPTZ,
  "dismissed_at" TIMESTAMPTZ,
  CONSTRAINT "gtf_notifications_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_notifications_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "gtf_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_notifications_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "gtf_notifications_agent_id_dedupe_key_key"
  ON "gtf_notifications" ("agent_id", "dedupe_key");
CREATE INDEX IF NOT EXISTS "gtf_notifications_agent_read_created_idx"
  ON "gtf_notifications" ("agent_id", "read_at", "created_at");
CREATE INDEX IF NOT EXISTS "gtf_notifications_conversation_type_created_idx"
  ON "gtf_notifications" ("conversation_id", "type", "created_at");

CREATE TABLE IF NOT EXISTS "gtf_notification_preferences" (
  "id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "sound_enabled" BOOLEAN NOT NULL DEFAULT false,
  "browser_enabled" BOOLEAN NOT NULL DEFAULT false,
  "unresolved_reminders_enabled" BOOLEAN NOT NULL DEFAULT true,
  "unresolved_reminder_minutes" INTEGER NOT NULL DEFAULT 30,
  "reminder_repeat_minutes" INTEGER NOT NULL DEFAULT 30,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_notification_preferences_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_notification_preferences_agent_id_key" UNIQUE ("agent_id"),
  CONSTRAINT "gtf_notification_preferences_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "gtf_agents"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_notification_preferences_minutes_check" CHECK ("unresolved_reminder_minutes" BETWEEN 5 AND 1440 AND "reminder_repeat_minutes" BETWEEN 5 AND 1440)
);
