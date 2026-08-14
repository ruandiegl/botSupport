-- Additive index for cursor-based conversation history reads.
-- No rows or message contents are changed.
CREATE INDEX IF NOT EXISTS "gtf_messages_conversation_created_at_idx"
  ON "gtf_messages" ("conversation_id", "created_at" DESC);
