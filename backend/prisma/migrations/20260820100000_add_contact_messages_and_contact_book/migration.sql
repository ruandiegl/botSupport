ALTER TABLE "gtf_contacts"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "organization" TEXT,
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "gtf_messages"
  ADD COLUMN "message_type" TEXT NOT NULL DEFAULT 'TEXT';

CREATE TABLE "gtf_contact_phones" (
  "id" TEXT NOT NULL,
  "contact_id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "label" TEXT,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_contact_phones_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_contact_phones_phone_key" UNIQUE ("phone"),
  CONSTRAINT "gtf_contact_phones_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "gtf_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "gtf_contact_phones_contact_id_is_primary_idx" ON "gtf_contact_phones"("contact_id", "is_primary");

CREATE TABLE "gtf_contact_shares" (
  "id" TEXT NOT NULL,
  "message_id" TEXT NOT NULL,
  "canonical_contact_id" TEXT,
  "display_name" TEXT NOT NULL,
  "phones" JSONB NOT NULL,
  "primary_phone" TEXT,
  "email" TEXT,
  "organization" TEXT,
  "note" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_contact_shares_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_contact_shares_message_id_key" UNIQUE ("message_id"),
  CONSTRAINT "gtf_contact_shares_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "gtf_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "gtf_contact_shares_canonical_contact_id_fkey" FOREIGN KEY ("canonical_contact_id") REFERENCES "gtf_contacts"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "gtf_contact_shares_canonical_contact_id_idx" ON "gtf_contact_shares"("canonical_contact_id");

INSERT INTO "gtf_contact_phones" ("id", "contact_id", "phone", "is_primary")
SELECT md5("id" || clock_timestamp()::text), "id", "phone", true
FROM "gtf_contacts"
ON CONFLICT ("phone") DO NOTHING;
