-- Permite ao destinatário aceitar ou recusar uma delegação sem apagar a auditoria.
ALTER TABLE "gtf_conversation_assignments"
  ADD COLUMN IF NOT EXISTS "response" TEXT,
  ADD COLUMN IF NOT EXISTS "responded_at" TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS "gtf_conversation_assignments_response_idx"
  ON "gtf_conversation_assignments"("to_agent_id", "response", "responded_at");
