CREATE TABLE "gtf_group_outbound_messages" (
  "id" TEXT NOT NULL,
  "group_chat_id" TEXT NOT NULL,
  "agent_id" TEXT NOT NULL,
  "client_message_id" TEXT NOT NULL,
  "provider_message_id" TEXT,
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "failure_code" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "sent_at" TIMESTAMPTZ,
  CONSTRAINT "gtf_group_outbound_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gtf_group_outbound_messages_client_message_id_key"
  ON "gtf_group_outbound_messages"("client_message_id");
CREATE INDEX "gtf_group_outbound_messages_group_chat_id_created_at_idx"
  ON "gtf_group_outbound_messages"("group_chat_id", "created_at");
CREATE INDEX "gtf_group_outbound_messages_agent_id_created_at_idx"
  ON "gtf_group_outbound_messages"("agent_id", "created_at");

ALTER TABLE "gtf_group_outbound_messages"
  ADD CONSTRAINT "gtf_group_outbound_messages_group_chat_id_fkey"
  FOREIGN KEY ("group_chat_id") REFERENCES "gtf_group_chats"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT "gtf_group_outbound_messages_agent_id_fkey"
  FOREIGN KEY ("agent_id") REFERENCES "gtf_agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
