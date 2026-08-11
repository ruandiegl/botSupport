ALTER TABLE "gtf_messages"
ADD COLUMN "read_at" TIMESTAMPTZ;

CREATE INDEX "gtf_messages_conversation_id_direction_read_at_idx"
ON "gtf_messages"("conversation_id", "direction", "read_at");
