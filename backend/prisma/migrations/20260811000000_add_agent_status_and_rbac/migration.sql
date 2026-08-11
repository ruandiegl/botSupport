ALTER TABLE "gtf_agents"
ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE IF NOT EXISTS "gtf_role_permissions" (
  "id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "actions" TEXT[] NOT NULL,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_role_permissions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gtf_role_permissions_role_resource_key"
ON "gtf_role_permissions"("role", "resource");

CREATE INDEX IF NOT EXISTS "gtf_role_permissions_role_idx"
ON "gtf_role_permissions"("role");
