ALTER TABLE "gtf_contacts"
  ADD COLUMN IF NOT EXISTS "station" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "state" VARCHAR(2),
  ADD COLUMN IF NOT EXISTS "profile_confirmed_at" TIMESTAMPTZ;

UPDATE "gtf_contacts"
SET "station" = "organization"
WHERE "station" IS NULL
  AND "organization" IS NOT NULL
  AND BTRIM("organization") <> '';
