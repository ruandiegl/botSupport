-- Media metadata for Z-API's temporary 30-day storage. The application stores
-- only encrypted source URLs and never persists the media binary.
CREATE TYPE "MediaProvider" AS ENUM ('ZAPI');
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT');
CREATE TYPE "MediaStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'EXPIRED');

ALTER TABLE "gtf_messages"
  ADD COLUMN "external_message_id" TEXT;

CREATE UNIQUE INDEX "gtf_messages_external_message_id_key"
  ON "gtf_messages"("external_message_id");

CREATE TABLE "gtf_conversation_media" (
  "id" TEXT NOT NULL,
  "message_id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "whatsapp_message_id" TEXT NOT NULL,
  "provider" "MediaProvider" NOT NULL DEFAULT 'ZAPI',
  "type" "MediaType" NOT NULL,
  "status" "MediaStatus" NOT NULL DEFAULT 'AVAILABLE',
  "mime_type" TEXT NOT NULL,
  "caption" TEXT,
  "original_file_name" TEXT,
  "title" TEXT,
  "ptt" BOOLEAN,
  "seconds" INTEGER,
  "width" INTEGER,
  "height" INTEGER,
  "page_count" INTEGER,
  "view_once" BOOLEAN NOT NULL DEFAULT false,
  "source_url_ciphertext" TEXT,
  "thumbnail_url_ciphertext" TEXT,
  "encryption_key_version" INTEGER NOT NULL DEFAULT 1,
  "source_created_at" TIMESTAMPTZ NOT NULL,
  "expires_at" TIMESTAMPTZ NOT NULL,
  "failure_code" TEXT,
  "last_access_error_code" TEXT,
  "last_accessed_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "gtf_conversation_media_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_conversation_media_message_id_fkey"
    FOREIGN KEY ("message_id") REFERENCES "gtf_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_conversation_media_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "gtf_conversation_media_message_id_key"
  ON "gtf_conversation_media"("message_id");
CREATE UNIQUE INDEX "gtf_conversation_media_whatsapp_message_id_key"
  ON "gtf_conversation_media"("whatsapp_message_id");
CREATE INDEX "gtf_conversation_media_conversation_id_created_at_idx"
  ON "gtf_conversation_media"("conversation_id", "created_at");
CREATE INDEX "gtf_conversation_media_status_expires_at_idx"
  ON "gtf_conversation_media"("status", "expires_at");
