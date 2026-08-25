ALTER TABLE "gtf_group_outbound_messages"
  ADD COLUMN "message_type" TEXT NOT NULL DEFAULT 'TEXT',
  ADD COLUMN "mime_type" TEXT,
  ADD COLUMN "file_name" TEXT,
  ADD COLUMN "size_bytes" INTEGER,
  ADD COLUMN "caption" TEXT;
