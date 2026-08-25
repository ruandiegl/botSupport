DO $$ BEGIN
  CREATE TYPE "OutgoingMediaStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "gtf_outgoing_media" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_name" TEXT,
    "caption" TEXT,
    "size_bytes" INTEGER NOT NULL,
    "status" "OutgoingMediaStatus" NOT NULL DEFAULT 'PENDING',
    "provider_message_id" TEXT,
    "client_message_id" TEXT NOT NULL,
    "failure_code" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "gtf_outgoing_media_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gtf_outgoing_media_message_id_key" ON "gtf_outgoing_media"("message_id");
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_outgoing_media_client_message_id_key" ON "gtf_outgoing_media"("client_message_id");
CREATE INDEX IF NOT EXISTS "gtf_outgoing_media_conversation_id_created_at_idx" ON "gtf_outgoing_media"("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "gtf_outgoing_media_provider_message_id_idx" ON "gtf_outgoing_media"("provider_message_id");

DO $$ BEGIN
  ALTER TABLE "gtf_outgoing_media"
    ADD CONSTRAINT "gtf_outgoing_media_message_id_fkey"
    FOREIGN KEY ("message_id") REFERENCES "gtf_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "gtf_outgoing_media"
    ADD CONSTRAINT "gtf_outgoing_media_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
