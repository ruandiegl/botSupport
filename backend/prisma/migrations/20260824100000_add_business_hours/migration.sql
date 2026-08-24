DO $$ BEGIN
  CREATE TYPE "BusinessHoursMode" AS ENUM ('SCHEDULE_ONLY', 'SCHEDULE_AND_ONLINE', 'ONLINE_ONLY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BusinessHoursExceptionKind" AS ENUM ('CLOSED', 'SPECIAL_HOURS');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BusinessHoursNoticeReason" AS ENUM ('OUTSIDE_HOURS', 'NO_AGENT_ONLINE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BusinessHoursNoticeStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "gtf_business_hours_policies" (
  "id" TEXT NOT NULL,
  "zapi_config_id" TEXT NOT NULL,
  "department_id" TEXT,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "mode" "BusinessHoursMode" NOT NULL DEFAULT 'SCHEDULE_AND_ONLINE',
  "timezone" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
  "outside_message" TEXT NOT NULL,
  "no_agent_message" TEXT,
  "notice_frequency" TEXT NOT NULL DEFAULT 'ONCE_PER_WINDOW',
  "message_cooldown_minutes" INTEGER NOT NULL DEFAULT 60,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "updated_by_agent_id" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_business_hours_policies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_business_hours_policies_zapi_config_id_fkey" FOREIGN KEY ("zapi_config_id") REFERENCES "gtf_zapi_config"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_business_hours_policies_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "gtf_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "gtf_business_hours_intervals" (
  "id" TEXT NOT NULL,
  "policy_id" TEXT NOT NULL,
  "weekday" INTEGER NOT NULL,
  "start_minute" INTEGER NOT NULL,
  "end_minute" INTEGER NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "gtf_business_hours_intervals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_business_hours_intervals_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "gtf_business_hours_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_business_hours_intervals_weekday_check" CHECK ("weekday" BETWEEN 0 AND 6),
  CONSTRAINT "gtf_business_hours_intervals_start_check" CHECK ("start_minute" BETWEEN 0 AND 1439),
  CONSTRAINT "gtf_business_hours_intervals_end_check" CHECK ("end_minute" BETWEEN 1 AND 1440),
  CONSTRAINT "gtf_business_hours_intervals_order_check" CHECK ("end_minute" > "start_minute")
);

CREATE TABLE IF NOT EXISTS "gtf_business_hours_exceptions" (
  "id" TEXT NOT NULL,
  "policy_id" TEXT NOT NULL,
  "local_date" DATE NOT NULL,
  "kind" "BusinessHoursExceptionKind" NOT NULL,
  "intervals_json" JSONB,
  "reason" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_business_hours_exceptions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_business_hours_exceptions_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "gtf_business_hours_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "gtf_business_hours_notices" (
  "id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "policy_id" TEXT NOT NULL,
  "reason" "BusinessHoursNoticeReason" NOT NULL,
  "window_key" TEXT NOT NULL,
  "status" "BusinessHoursNoticeStatus" NOT NULL DEFAULT 'PENDING',
  "message_id" TEXT,
  "sent_at" TIMESTAMPTZ,
  "last_error" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_business_hours_notices_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_business_hours_notices_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_business_hours_notices_policy_id_fkey" FOREIGN KEY ("policy_id") REFERENCES "gtf_business_hours_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "gtf_business_hours_policies_zapi_department_key"
  ON "gtf_business_hours_policies" ("zapi_config_id", "department_id");
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_business_hours_policies_global_key"
  ON "gtf_business_hours_policies" ("zapi_config_id", COALESCE("department_id", '__GLOBAL__'));
CREATE INDEX IF NOT EXISTS "gtf_business_hours_policies_zapi_enabled_idx"
  ON "gtf_business_hours_policies" ("zapi_config_id", "enabled");
CREATE INDEX IF NOT EXISTS "gtf_business_hours_policies_department_enabled_idx"
  ON "gtf_business_hours_policies" ("department_id", "enabled");
CREATE INDEX IF NOT EXISTS "gtf_business_hours_intervals_policy_weekday_order_idx"
  ON "gtf_business_hours_intervals" ("policy_id", "weekday", "sort_order");
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_business_hours_exceptions_policy_date_key"
  ON "gtf_business_hours_exceptions" ("policy_id", "local_date");
CREATE INDEX IF NOT EXISTS "gtf_business_hours_exceptions_local_date_idx"
  ON "gtf_business_hours_exceptions" ("local_date");
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_business_hours_notices_dedupe_key"
  ON "gtf_business_hours_notices" ("conversation_id", "policy_id", "reason", "window_key");
CREATE INDEX IF NOT EXISTS "gtf_business_hours_notices_status_updated_idx"
  ON "gtf_business_hours_notices" ("status", "updated_at");
CREATE INDEX IF NOT EXISTS "gtf_business_hours_notices_conversation_created_idx"
  ON "gtf_business_hours_notices" ("conversation_id", "created_at");
