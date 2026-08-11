CREATE TYPE "ShortcutType" AS ENUM ('GREETING', 'CLOSING', 'DEPARTMENT', 'PERSONAL', 'GENERAL');
CREATE TYPE "ShortcutScope" AS ENUM ('GLOBAL', 'DEPARTMENT', 'PERSONAL');

CREATE TABLE "gtf_shortcuts" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" "ShortcutType" NOT NULL,
  "scope" "ShortcutScope" NOT NULL,
  "department_id" TEXT,
  "owner_id" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_by_id" TEXT NOT NULL,
  "updated_by_id" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archived_at" TIMESTAMPTZ,
  CONSTRAINT "gtf_shortcuts_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_shortcuts_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "gtf_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "gtf_shortcuts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "gtf_shortcuts_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "gtf_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "gtf_shortcuts_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "gtf_shortcut_audits" (
  "id" TEXT NOT NULL,
  "shortcut_id" TEXT,
  "actor_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_shortcut_audits_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_shortcut_audits_shortcut_id_fkey" FOREIGN KEY ("shortcut_id") REFERENCES "gtf_shortcuts"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "gtf_shortcut_audits_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "gtf_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "gtf_shortcuts_is_active_scope_type_idx" ON "gtf_shortcuts"("is_active", "scope", "type");
CREATE INDEX "gtf_shortcuts_department_id_is_active_idx" ON "gtf_shortcuts"("department_id", "is_active");
CREATE INDEX "gtf_shortcuts_owner_id_is_active_idx" ON "gtf_shortcuts"("owner_id", "is_active");
CREATE INDEX "gtf_shortcut_audits_shortcut_id_action_idx" ON "gtf_shortcut_audits"("shortcut_id", "action");
CREATE INDEX "gtf_shortcut_audits_actor_id_created_at_idx" ON "gtf_shortcut_audits"("actor_id", "created_at");

-- Rollback manual: DROP TABLE "gtf_shortcut_audits"; DROP TABLE "gtf_shortcuts";
-- DROP TYPE "ShortcutScope"; DROP TYPE "ShortcutType";
