-- Normalize fixed system-label identifiers to UUIDs accepted by the public API.
-- Conversation-label foreign keys were created with ON UPDATE CASCADE.
UPDATE "gtf_labels" SET "id" = '00000000-0000-4000-8000-000000000001' WHERE "slug" = 'GROUP';
UPDATE "gtf_labels" SET "id" = '00000000-0000-4000-8000-000000000002' WHERE "slug" = 'URGENT';
UPDATE "gtf_labels" SET "id" = '00000000-0000-4000-8000-000000000003' WHERE "slug" = 'WAITING';
UPDATE "gtf_labels" SET "id" = '00000000-0000-4000-8000-000000000004' WHERE "slug" = 'RESOLVED';
UPDATE "gtf_labels" SET "id" = '00000000-0000-4000-8000-000000000005' WHERE "slug" = 'REVIEW';
