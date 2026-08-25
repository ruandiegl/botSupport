ALTER TABLE "gtf_conversations"
  ADD COLUMN "channel" TEXT NOT NULL DEFAULT 'PRIVATE',
  ADD COLUMN "remote_chat_id" TEXT,
  ADD COLUMN "group_chat_id" TEXT;

ALTER TABLE "gtf_zapi_config"
  ADD COLUMN "group_conversation_mode" TEXT NOT NULL DEFAULT 'PRIVATE_LEGACY',
  ADD COLUMN "group_response_mode" TEXT NOT NULL DEFAULT 'ANY_PARTICIPANT';

CREATE TABLE "gtf_group_chats" (
  "id" TEXT NOT NULL,
  "remote_chat_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "unread_count" INTEGER NOT NULL DEFAULT 0,
  "last_message_at" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_group_chats_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gtf_group_messages" (
  "id" TEXT NOT NULL,
  "group_chat_id" TEXT NOT NULL,
  "conversation_id" TEXT,
  "external_message_id" TEXT,
  "direction" TEXT NOT NULL,
  "sender_type" TEXT NOT NULL,
  "sender_contact_id" TEXT,
  "sender_name_snapshot" TEXT,
  "message_type" TEXT NOT NULL DEFAULT 'TEXT',
  "content" TEXT NOT NULL,
  "is_mention" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "read_at" TIMESTAMPTZ,
  CONSTRAINT "gtf_group_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gtf_group_chats_remote_chat_id_key" ON "gtf_group_chats"("remote_chat_id");
CREATE UNIQUE INDEX "gtf_group_messages_external_message_id_key" ON "gtf_group_messages"("external_message_id");
CREATE INDEX "gtf_group_chats_is_active_last_message_at_idx" ON "gtf_group_chats"("is_active", "last_message_at");
CREATE INDEX "gtf_group_messages_group_chat_id_created_at_idx" ON "gtf_group_messages"("group_chat_id", "created_at");
CREATE INDEX "gtf_group_messages_conversation_id_created_at_idx" ON "gtf_group_messages"("conversation_id", "created_at");
CREATE INDEX "gtf_group_messages_sender_contact_id_idx" ON "gtf_group_messages"("sender_contact_id");
CREATE INDEX "gtf_conversations_channel_remote_chat_id_status_idx" ON "gtf_conversations"("channel", "remote_chat_id", "status");
CREATE INDEX "gtf_conversations_group_chat_id_status_idx" ON "gtf_conversations"("group_chat_id", "status");

ALTER TABLE "gtf_conversations"
  ADD CONSTRAINT "gtf_conversations_group_chat_id_fkey"
  FOREIGN KEY ("group_chat_id") REFERENCES "gtf_group_chats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "gtf_group_messages"
  ADD CONSTRAINT "gtf_group_messages_group_chat_id_fkey"
  FOREIGN KEY ("group_chat_id") REFERENCES "gtf_group_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "gtf_group_messages_conversation_id_fkey"
  FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "gtf_group_messages_sender_contact_id_fkey"
  FOREIGN KEY ("sender_contact_id") REFERENCES "gtf_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Only one active ticket may exist for a group. Historical closed tickets are preserved.
CREATE UNIQUE INDEX "gtf_conversations_one_open_group_idx"
  ON "gtf_conversations"("remote_chat_id")
  WHERE "channel" = 'GROUP' AND "status" NOT IN ('CLOSED', 'DRAFT');
