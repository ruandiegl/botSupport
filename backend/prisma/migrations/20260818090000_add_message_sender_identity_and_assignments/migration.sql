-- Plano 016: identidade estável do remetente e auditoria de delegação.
-- Migration aditiva: não remove nem reescreve mensagens existentes.
ALTER TABLE "gtf_messages"
  ADD COLUMN IF NOT EXISTS "sender_contact_id" TEXT,
  ADD COLUMN IF NOT EXISTS "sender_name_snapshot" TEXT,
  ADD COLUMN IF NOT EXISTS "sender_department_snapshot" TEXT;

CREATE INDEX IF NOT EXISTS "gtf_messages_sender_contact_id_idx"
  ON "gtf_messages"("sender_contact_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'gtf_messages_sender_contact_id_fkey') THEN
    ALTER TABLE "gtf_messages"
      ADD CONSTRAINT "gtf_messages_sender_contact_id_fkey"
      FOREIGN KEY ("sender_contact_id") REFERENCES "gtf_contacts"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "gtf_conversation_assignments" (
  "id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "from_agent_id" TEXT,
  "to_agent_id" TEXT NOT NULL,
  "actor_agent_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "reason" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_conversation_assignments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_conversation_assignments_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_conversation_assignments_from_agent_id_fkey"
    FOREIGN KEY ("from_agent_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "gtf_conversation_assignments_to_agent_id_fkey"
    FOREIGN KEY ("to_agent_id") REFERENCES "gtf_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "gtf_conversation_assignments_actor_agent_id_fkey"
    FOREIGN KEY ("actor_agent_id") REFERENCES "gtf_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "gtf_conversation_assignments_conversation_created_idx"
  ON "gtf_conversation_assignments"("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "gtf_conversation_assignments_to_agent_created_idx"
  ON "gtf_conversation_assignments"("to_agent_id", "created_at");

UPDATE "gtf_messages" m
SET "sender_name_snapshot" = a."name",
    "sender_department_snapshot" = d."name"
FROM "gtf_agents" a
LEFT JOIN "gtf_departments" d ON d."id" = a."department_id"
WHERE m."sender_agent_id" = a."id"
  AND m."sender_name_snapshot" IS NULL;

UPDATE "gtf_messages" m
SET "sender_contact_id" = c."id",
    "sender_name_snapshot" = c."name"
FROM "gtf_conversations" cv
JOIN "gtf_contacts" c ON c."id" = cv."contact_id"
WHERE m."conversation_id" = cv."id"
  AND m."sender_type" IN ('CLIENT', 'CONTACT')
  AND m."sender_name_snapshot" IS NULL;

-- Keep existing role rows compatible with the new explicit delegation action.
UPDATE "gtf_role_permissions"
SET "actions" = array_append("actions", 'delegate')
WHERE "resource" = 'conversations'
  AND "role" IN ('ADMIN', 'SUPERVISOR')
  AND NOT ('delegate' = ANY("actions"));
