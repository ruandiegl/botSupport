import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { SearchConversationsQuerySchema } from "../dist/modules/conversations/conversations.schemas.js";

const read = (relative) => readFileSync(join(process.cwd(), relative), "utf8");

test("busca global valida defaults, limites e filtros", () => {
  const parsed = SearchConversationsQuerySchema.parse({ q: " sistema " });
  assert.equal(parsed.q, "sistema");
  assert.equal(parsed.scope, "all");
  assert.equal(parsed.status, "ALL");
  assert.equal(parsed.page, 1);
  assert.equal(parsed.limit, 20);
  assert.equal(SearchConversationsQuerySchema.safeParse({ q: "" }).success, false);
  assert.equal(SearchConversationsQuerySchema.safeParse({ q: "x", limit: 51 }).success, false);
  assert.equal(SearchConversationsQuerySchema.safeParse({ q: "x", scope: "private" }).success, false);
  assert.equal(SearchConversationsQuerySchema.safeParse({ q: "x", from: "2026-08-20T12:00:00Z", to: "2026-08-20T11:00:00Z" }).success, false);
});

test("contrato global usa a lista da fila, escopo no servidor e snippet seguro", () => {
  const routes = read("src/modules/conversations/conversations.routes.ts");
  const controller = read("src/modules/conversations/conversations.controller.ts");
  const service = read("src/modules/conversations/conversations.service.ts");
  const repository = read("src/modules/conversations/conversations.repository.ts");
  const frontend = read("../frontend/src/pages/queue/components/GlobalConversationSearch.tsx");
  const queuePage = read("../frontend/src/pages/queue/index.tsx");
  const conversationRow = read("../frontend/src/pages/queue/components/ConversationRow.tsx");
  assert.match(routes, /get\("\/conversations"/);
  assert.match(routes, /get\("\/conversations\/search"/);
  assert.match(routes, /requirePermission\("queue", "view_own"\)/);
  assert.match(controller, /assignedAgentId/);
  assert.match(controller, /departmentId/);
  assert.match(service, /createSearchSnippet/);
  assert.match(repository, /Prisma\.sql/);
  assert.match(repository, /ct\.\"email\"/);
  assert.match(repository, /group_chat_name/);
  assert.match(repository, /gtf_contact_phones/);
  assert.match(repository, /ROW_NUMBER\(\) OVER/);
  assert.match(service, /source: SearchMatchSource/);
  assert.match(service, /source: \"email\"/);
  assert.match(service, /searchMatches:/);
  assert.match(frontend, /role="search"/);
  assert.match(frontend, /Buscar em todas as conversas e mensagens/);
  assert.doesNotMatch(frontend, /Popover/);
  assert.doesNotMatch(frontend, /ToggleGroup/);
  assert.doesNotMatch(frontend, /ScrollArea/);
  assert.doesNotMatch(frontend, /message:new/);
  assert.doesNotMatch(frontend, /dangerouslySetInnerHTML/);
  assert.match(queuePage, /isGlobalSearch/);
  assert.match(queuePage, /status: isGlobalSearch \? "ALL"/);
  assert.match(queuePage, /openOnly: isGlobalSearch \? false/);
  assert.match(queuePage, />Conversas<\/h3>/);
  assert.match(queuePage, />Mensagens<\/h3>/);
  assert.match(conversationRow, /search-highlight/);
  assert.match(conversationRow, /source === "message"/);
});
