-- Additive support for group mentions and conversation labels.
ALTER TABLE "gtf_conversations"
  ADD COLUMN IF NOT EXISTS "group_chat_name" TEXT,
  ADD COLUMN IF NOT EXISTS "group_participant" TEXT;

ALTER TABLE "gtf_zapi_config"
  ADD COLUMN IF NOT EXISTS "instance_phone" TEXT,
  ADD COLUMN IF NOT EXISTS "groups_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "group_cooldown_seconds" INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS "group_confirm_in_group" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "group_confirm_message" TEXT;

ALTER TABLE "gtf_zapi_config"
  ADD CONSTRAINT "gtf_zapi_config_group_cooldown_check"
  CHECK ("group_cooldown_seconds" BETWEEN 5 AND 3600);

CREATE TABLE "gtf_labels" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#6366f1',
  "icon" TEXT,
  "is_system" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_labels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gtf_labels_name_key" ON "gtf_labels"("name");
CREATE UNIQUE INDEX "gtf_labels_slug_key" ON "gtf_labels"("slug");

CREATE TABLE "gtf_conversation_labels" (
  "id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "label_id" TEXT NOT NULL,
  "added_by_agent_id" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_conversation_labels_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_conversation_labels_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_conversation_labels_label_id_fkey"
    FOREIGN KEY ("label_id") REFERENCES "gtf_labels"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_conversation_labels_added_by_agent_id_fkey"
    FOREIGN KEY ("added_by_agent_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "gtf_conversation_labels_conversation_id_label_id_key"
  ON "gtf_conversation_labels"("conversation_id", "label_id");
CREATE INDEX "gtf_conversation_labels_conversation_id_idx"
  ON "gtf_conversation_labels"("conversation_id");
CREATE INDEX "gtf_conversation_labels_label_id_idx"
  ON "gtf_conversation_labels"("label_id");

CREATE TABLE "gtf_group_mention_cooldowns" (
  "id" TEXT NOT NULL,
  "group_key" TEXT NOT NULL,
  "participant_key" TEXT NOT NULL,
  "last_mention_at" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "gtf_group_mention_cooldowns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gtf_group_mention_cooldowns_group_key_participant_key_key"
  ON "gtf_group_mention_cooldowns"("group_key", "participant_key");
CREATE INDEX "gtf_group_mention_cooldowns_last_mention_at_idx"
  ON "gtf_group_mention_cooldowns"("last_mention_at");

INSERT INTO "gtf_labels" ("id", "name", "slug", "color", "icon", "is_system") VALUES
  ('label-system-group', 'Grupo', 'GROUP', '#2D89C8', 'Users', true),
  ('label-system-urgent', 'Urgente', 'URGENT', '#DC2626', 'TriangleAlert', true),
  ('label-system-waiting', 'Aguardando', 'WAITING', '#D97706', 'Clock3', true),
  ('label-system-resolved', 'Resolvido', 'RESOLVED', '#059669', 'CircleCheck', true),
  ('label-system-review', 'Revisão', 'REVIEW', '#7C3AED', 'SearchCheck', true)
ON CONFLICT ("slug") DO NOTHING;
