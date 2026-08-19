CREATE TABLE IF NOT EXISTS "gtf_bot_exclusions" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "label" TEXT,
    "reason" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_agent_id" TEXT,
    "updated_by_agent_id" TEXT,
    "disabled_at" TIMESTAMPTZ,
    "disabled_by_agent_id" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gtf_bot_exclusions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gtf_bot_exclusions_phone_key" ON "gtf_bot_exclusions"("phone");
CREATE INDEX IF NOT EXISTS "gtf_bot_exclusions_is_active_phone_idx" ON "gtf_bot_exclusions"("is_active", "phone");

DO $$ BEGIN
  ALTER TABLE "gtf_bot_exclusions" ADD CONSTRAINT "gtf_bot_exclusions_created_by_agent_id_fkey"
    FOREIGN KEY ("created_by_agent_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "gtf_bot_exclusions" ADD CONSTRAINT "gtf_bot_exclusions_updated_by_agent_id_fkey"
    FOREIGN KEY ("updated_by_agent_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "gtf_bot_exclusions" ADD CONSTRAINT "gtf_bot_exclusions_disabled_by_agent_id_fkey"
    FOREIGN KEY ("disabled_by_agent_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
