-- Additive flow-v2 migration. Legacy gtf_flow_definitions columns stay intact for rollback.
DO $$ BEGIN
  CREATE TYPE "FlowRevisionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "FlowNodeType" AS ENUM ('ENTRY', 'MESSAGE', 'DECISION', 'ROUTE', 'TRIAGE', 'HANDOFF', 'END');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "gtf_flow_revisions" (
  "id" TEXT NOT NULL,
  "flow_definition_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "status" "FlowRevisionStatus" NOT NULL DEFAULT 'DRAFT',
  "schema_version" INTEGER NOT NULL DEFAULT 2,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "published_at" TIMESTAMPTZ,
  "published_by_id" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_flow_revisions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_flow_revisions_definition_fkey" FOREIGN KEY ("flow_definition_id") REFERENCES "gtf_flow_definitions"("id") ON DELETE CASCADE,
  CONSTRAINT "gtf_flow_revisions_publisher_fkey" FOREIGN KEY ("published_by_id") REFERENCES "gtf_agents"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "gtf_flow_nodes" (
  "id" TEXT NOT NULL,
  "stable_key" TEXT NOT NULL,
  "flow_revision_id" TEXT NOT NULL,
  "type" "FlowNodeType" NOT NULL,
  "name" TEXT NOT NULL,
  "content" TEXT NOT NULL DEFAULT '',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "config" JSONB,
  "department_id" TEXT,
  CONSTRAINT "gtf_flow_nodes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_flow_nodes_revision_fkey" FOREIGN KEY ("flow_revision_id") REFERENCES "gtf_flow_revisions"("id") ON DELETE CASCADE,
  CONSTRAINT "gtf_flow_nodes_department_fkey" FOREIGN KEY ("department_id") REFERENCES "gtf_departments"("id") ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "gtf_flow_transitions" (
  "id" TEXT NOT NULL,
  "flow_revision_id" TEXT NOT NULL,
  "from_node_id" TEXT NOT NULL,
  "to_node_id" TEXT NOT NULL,
  "option_key" TEXT,
  "label" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "gtf_flow_transitions_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_flow_transitions_revision_fkey" FOREIGN KEY ("flow_revision_id") REFERENCES "gtf_flow_revisions"("id") ON DELETE CASCADE,
  CONSTRAINT "gtf_flow_transitions_from_fkey" FOREIGN KEY ("from_node_id") REFERENCES "gtf_flow_nodes"("id") ON DELETE CASCADE,
  CONSTRAINT "gtf_flow_transitions_to_fkey" FOREIGN KEY ("to_node_id") REFERENCES "gtf_flow_nodes"("id") ON DELETE CASCADE
);

ALTER TABLE "gtf_conversations" ADD COLUMN IF NOT EXISTS "flow_revision_id" TEXT;
ALTER TABLE "gtf_conversations" ADD COLUMN IF NOT EXISTS "current_flow_node_id" TEXT;
ALTER TABLE "gtf_conversations" ADD COLUMN IF NOT EXISTS "flow_context" JSONB;

CREATE TABLE IF NOT EXISTS "gtf_flow_execution_events" (
  "id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "flow_revision_id" TEXT NOT NULL,
  "flow_node_id" TEXT,
  "external_event_id" TEXT,
  "type" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gtf_flow_execution_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "gtf_flow_events_conversation_fkey" FOREIGN KEY ("conversation_id") REFERENCES "gtf_conversations"("id") ON DELETE CASCADE,
  CONSTRAINT "gtf_flow_events_revision_fkey" FOREIGN KEY ("flow_revision_id") REFERENCES "gtf_flow_revisions"("id") ON DELETE CASCADE,
  CONSTRAINT "gtf_flow_events_node_fkey" FOREIGN KEY ("flow_node_id") REFERENCES "gtf_flow_nodes"("id") ON DELETE SET NULL
);

DO $$ BEGIN
  ALTER TABLE "gtf_conversations" ADD CONSTRAINT "gtf_conversations_flow_revision_fkey" FOREIGN KEY ("flow_revision_id") REFERENCES "gtf_flow_revisions"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "gtf_conversations" ADD CONSTRAINT "gtf_conversations_flow_node_fkey" FOREIGN KEY ("current_flow_node_id") REFERENCES "gtf_flow_nodes"("id") ON DELETE SET NULL;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "gtf_flow_revisions_definition_version_key" ON "gtf_flow_revisions"("flow_definition_id", "version");
CREATE INDEX IF NOT EXISTS "gtf_flow_revisions_definition_status_idx" ON "gtf_flow_revisions"("flow_definition_id", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_flow_one_published_per_definition" ON "gtf_flow_revisions"("flow_definition_id") WHERE "status" = 'PUBLISHED';
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_flow_nodes_revision_stable_key_key" ON "gtf_flow_nodes"("flow_revision_id", "stable_key");
CREATE INDEX IF NOT EXISTS "gtf_flow_nodes_revision_type_order_idx" ON "gtf_flow_nodes"("flow_revision_id", "type", "sort_order");
CREATE INDEX IF NOT EXISTS "gtf_flow_nodes_department_idx" ON "gtf_flow_nodes"("department_id");
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_flow_transitions_revision_option_key_key" ON "gtf_flow_transitions"("flow_revision_id", "option_key");
CREATE INDEX IF NOT EXISTS "gtf_flow_transitions_from_order_idx" ON "gtf_flow_transitions"("from_node_id", "sort_order");
CREATE INDEX IF NOT EXISTS "gtf_flow_transitions_to_idx" ON "gtf_flow_transitions"("to_node_id");
CREATE INDEX IF NOT EXISTS "gtf_conversations_flow_revision_idx" ON "gtf_conversations"("flow_revision_id");
CREATE INDEX IF NOT EXISTS "gtf_conversations_current_flow_node_idx" ON "gtf_conversations"("current_flow_node_id");
CREATE UNIQUE INDEX IF NOT EXISTS "gtf_flow_execution_events_external_event_id_key" ON "gtf_flow_execution_events"("external_event_id");
CREATE INDEX IF NOT EXISTS "gtf_flow_events_conversation_created_idx" ON "gtf_flow_execution_events"("conversation_id", "created_at");
CREATE INDEX IF NOT EXISTS "gtf_flow_events_revision_node_idx" ON "gtf_flow_execution_events"("flow_revision_id", "flow_node_id");

-- Backfill every legacy definition into an immutable published v2 revision.
INSERT INTO "gtf_flow_revisions" ("id", "flow_definition_id", "version", "status", "schema_version", "revision", "published_at")
SELECT 'legacy-revision-' || fd."id", fd."id", 1, 'PUBLISHED', 2, 1, CURRENT_TIMESTAMP
FROM "gtf_flow_definitions" fd
WHERE NOT EXISTS (SELECT 1 FROM "gtf_flow_revisions" fr WHERE fr."flow_definition_id" = fd."id");

INSERT INTO "gtf_flow_nodes" ("id", "stable_key", "flow_revision_id", "type", "name", "content", "sort_order", "config")
SELECT 'legacy-entry-' || fd."id", 'entry', 'legacy-revision-' || fd."id", 'ENTRY', 'Entrada', '', 0, '{}'::jsonb
FROM "gtf_flow_definitions" fd ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_nodes" ("id", "stable_key", "flow_revision_id", "type", "name", "content", "sort_order", "config")
SELECT 'legacy-greeting-' || fd."id", 'greeting', 'legacy-revision-' || fd."id", 'MESSAGE', 'Saudação', fd."greeting", 1, '{}'::jsonb
FROM "gtf_flow_definitions" fd ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_nodes" ("id", "stable_key", "flow_revision_id", "type", "name", "content", "sort_order", "config")
SELECT 'legacy-decision-' || fd."id", 'team-decision', 'legacy-revision-' || fd."id", 'DECISION', 'Escolha da equipe', fd."menu_message", 2, '{"buttonMessage":"Escolha uma equipe para iniciar o atendimento:"}'::jsonb
FROM "gtf_flow_definitions" fd ON CONFLICT DO NOTHING;

INSERT INTO "gtf_flow_nodes" ("id", "stable_key", "flow_revision_id", "type", "name", "content", "sort_order", "config", "department_id")
SELECT 'legacy-route-' || fd."id" || '-' || opt.ord, 'route-' || opt.ord, 'legacy-revision-' || fd."id", 'ROUTE', COALESCE(opt.value->>'label', 'Rota'), COALESCE(opt.value->>'procedureMessage', ''), opt.ord::int, '{}'::jsonb, CASE WHEN EXISTS (SELECT 1 FROM "gtf_departments" d WHERE d."id" = opt.value->>'departmentId') THEN opt.value->>'departmentId' ELSE NULL END
FROM "gtf_flow_definitions" fd CROSS JOIN LATERAL jsonb_array_elements(fd."options"::jsonb) WITH ORDINALITY opt(value, ord)
ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_nodes" ("id", "stable_key", "flow_revision_id", "type", "name", "content", "sort_order", "config", "department_id")
SELECT 'legacy-triage-' || fd."id" || '-' || opt.ord, 'triage-' || opt.ord, 'legacy-revision-' || fd."id", 'TRIAGE', 'Triagem ' || COALESCE(opt.value->>'label', ''),
  CASE WHEN lower(COALESCE(opt.value->>'label','')) LIKE '%suporte%' THEN E'Você selecionou a equipe Suporte.\nPor favor, informe-nos os dados abaixo para que possamos entrar em contato com você em breve:\n\nSeu nome\nSua emissora\nSua cidade/UF\nSua necessidade de suporte'
       ELSE COALESCE(NULLIF(opt.value->>'procedureMessage',''), 'Informe os detalhes necessários para o atendimento.') END,
  opt.ord::int, jsonb_build_object('responseKey', 'triageDetails'), CASE WHEN EXISTS (SELECT 1 FROM "gtf_departments" d WHERE d."id" = opt.value->>'departmentId') THEN opt.value->>'departmentId' ELSE NULL END
FROM "gtf_flow_definitions" fd CROSS JOIN LATERAL jsonb_array_elements(fd."options"::jsonb) WITH ORDINALITY opt(value, ord)
ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_nodes" ("id", "stable_key", "flow_revision_id", "type", "name", "content", "sort_order", "config", "department_id")
SELECT 'legacy-handoff-' || fd."id" || '-' || opt.ord, 'handoff-' || opt.ord, 'legacy-revision-' || fd."id", 'HANDOFF', 'Encaminhar para ' || COALESCE(opt.value->>'label', 'equipe'), '', opt.ord::int, '{}'::jsonb, CASE WHEN EXISTS (SELECT 1 FROM "gtf_departments" d WHERE d."id" = opt.value->>'departmentId') THEN opt.value->>'departmentId' ELSE NULL END
FROM "gtf_flow_definitions" fd CROSS JOIN LATERAL jsonb_array_elements(fd."options"::jsonb) WITH ORDINALITY opt(value, ord)
ON CONFLICT DO NOTHING;

INSERT INTO "gtf_flow_transitions" ("id", "flow_revision_id", "from_node_id", "to_node_id", "sort_order")
SELECT 'legacy-transition-entry-' || fd."id", 'legacy-revision-' || fd."id", 'legacy-entry-' || fd."id", 'legacy-greeting-' || fd."id", 0 FROM "gtf_flow_definitions" fd ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_transitions" ("id", "flow_revision_id", "from_node_id", "to_node_id", "sort_order")
SELECT 'legacy-transition-greeting-' || fd."id", 'legacy-revision-' || fd."id", 'legacy-greeting-' || fd."id", 'legacy-decision-' || fd."id", 0 FROM "gtf_flow_definitions" fd ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_transitions" ("id", "flow_revision_id", "from_node_id", "to_node_id", "option_key", "label", "sort_order")
SELECT 'legacy-transition-decision-' || fd."id" || '-' || opt.ord, 'legacy-revision-' || fd."id", 'legacy-decision-' || fd."id", 'legacy-route-' || fd."id" || '-' || opt.ord, 'legacy-option-' || fd."id" || '-' || opt.ord, opt.value->>'label', opt.ord::int
FROM "gtf_flow_definitions" fd CROSS JOIN LATERAL jsonb_array_elements(fd."options"::jsonb) WITH ORDINALITY opt(value, ord) ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_transitions" ("id", "flow_revision_id", "from_node_id", "to_node_id", "sort_order")
SELECT 'legacy-transition-route-' || fd."id" || '-' || opt.ord, 'legacy-revision-' || fd."id", 'legacy-route-' || fd."id" || '-' || opt.ord, 'legacy-triage-' || fd."id" || '-' || opt.ord, 0
FROM "gtf_flow_definitions" fd CROSS JOIN LATERAL jsonb_array_elements(fd."options"::jsonb) WITH ORDINALITY opt(value, ord) ON CONFLICT DO NOTHING;
INSERT INTO "gtf_flow_transitions" ("id", "flow_revision_id", "from_node_id", "to_node_id", "sort_order")
SELECT 'legacy-transition-triage-' || fd."id" || '-' || opt.ord, 'legacy-revision-' || fd."id", 'legacy-triage-' || fd."id" || '-' || opt.ord, 'legacy-handoff-' || fd."id" || '-' || opt.ord, 0
FROM "gtf_flow_definitions" fd CROSS JOIN LATERAL jsonb_array_elements(fd."options"::jsonb) WITH ORDINALITY opt(value, ord) ON CONFLICT DO NOTHING;
