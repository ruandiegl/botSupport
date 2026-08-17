# Plano 015 — Atendimento em grupos, menções ao bot e etiquetas de chamados

> **Status:** Implementado — aguardando apenas homologação com payload real de grupo na Z-API
> **Data:** 2026-08-17
> **Repositório:** `C:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`
> **Escopo:** webhook Z-API, conversas, etiquetas, RBAC, fila, detalhe do chat e administração Z-API
> **Estratégia:** migração aditiva, grupos desabilitados por padrão e ativação gradual por configuração

## 1. Objetivo

Permitir que o GTF-Bot abra ou reutilize um chamado quando o número da instância for mencionado em um grupo do WhatsApp, sem responder publicamente no grupo por padrão. O chamado será vinculado ao remetente individual, receberá a etiqueta de sistema `GROUP` e manterá o nome do grupo como contexto operacional.

A entrega também introduzirá etiquetas persistentes e múltiplas por conversa, com gerenciamento autorizado, filtro na fila, badges no detalhe e CRUD administrativo.

Resultados esperados:

1. Mensagens privadas continuam funcionando sem mudança de comportamento.
2. Mensagens de grupo sem menção, menção ao próprio número ausente, `fromMe` e broadcasts são ignorados sem abrir chamado.
3. Uma menção válida cria/reabre uma conversa do participante, adiciona `GROUP` de forma idempotente e envia confirmação por DM.
4. Repetições do mesmo remetente no mesmo grupo dentro do cooldown não criam novos chamados.
5. Atendentes veem e filtram etiquetas na fila e no detalhe, respeitando departamento e RBAC.
6. Administradores gerenciam etiquetas customizadas e configurações de grupo sem expor tokens ou JIDs no frontend.

## 2. Referências e diagnóstico do estado atual

Documentação consultada:

- [`docs/README.md`](../docs/README.md)
- [`docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md`](../docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md)
- [`docs/PRD.md`](../docs/PRD.md)
- [`docs/PRD_ZAPI.md`](../docs/PRD_ZAPI.md)
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`docs/API.md`](../docs/API.md)
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md)
- [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md)
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md)
- [`plans/plan-009-socketio-tempo-real-notificacoes-presenca.md`](./plan-009-socketio-tempo-real-notificacoes-presenca.md)
- [`plans/plan-011-fila-priorizada-notificacoes-filtro-data.md`](./plan-011-fila-priorizada-notificacoes-filtro-data.md)
- [`plans/plan-012-ingestao-exibicao-midia-zapi-retencao-30-dias.md`](./plan-012-ingestao-exibicao-midia-zapi-retencao-30-dias.md)
- [`plans/plan-013-auto-close-unified-status.md`](./plan-013-auto-close-unified-status.md)
- [`agents/README.md`](../agents/README.md) e os perfis de arquitetura, backend, frontend, QA, segurança e DevOps

Constatações do código atual:

- O status publicado do projeto é `OPEN`, `IN_PROGRESS` e `CLOSED`; `BOT`/`QUEUED` do PRD antigo já foram unificados por Plan 013. O novo plano deve usar `OPEN` para o chamado originado por menção.
- `parseIncomingMessage` rejeita qualquer `isGroup === true` antes de criar a mensagem.
- `ZApiReceivedWebhookSchema` ainda não possui `participant` nem `mentionedJids`.
- `Conversation` não possui contexto de grupo nem relações de etiquetas.
- `ZApiConfig` possui apenas credenciais, webhook, ativação e auto-reply; não há configuração de grupos ou cache do telefone da instância.
- `Message.externalMessageId` e o mecanismo de claim de eventos existentes devem continuar sendo a barreira de idempotência.
- A arquitetura já possui `conversationEvents`/Socket.IO e projeção `ConversationSummary`, que devem receber etiquetas sem carregar histórico adicional.
- O RBAC atual lista recursos de conversa, fila, Z-API e demais módulos, mas ainda não possui recurso/tela de etiquetas.

## 3. Decisões necessárias antes da implementação

O PRD está marcado como “Em Revisão”. A Fase 0 deve registrar estas decisões, sem iniciar a migration antes de fechá-las:

### 3.1 Identidade do grupo e cooldown

`phone` no callback deve ser tratado como o identificador do chat de origem e `participant` como o remetente individual. O cooldown precisa ser por `(grupo, participante)`. `Contact.lastGroupMentionAt` isolado não é suficiente para vários grupos, portanto a implementação recomendada é uma tabela aditiva `GroupMentionCooldown` com chave única composta e `groupKey` derivado por hash do JID normalizado. O JID bruto não deve ser exibido nem registrado em logs.

### 3.2 Broadcast e JID `@g.us`

O PRD cita `@g.us` como possível broadcast, mas esse sufixo também identifica grupos comuns no WhatsApp. Antes do código, validar um payload real da Z-API e documentar a regra. A implementação deve rejeitar aliases universais (`@all`, `@everyone`, `@broadcast` e equivalentes confirmados) e não pode rejeitar todo grupo normal apenas por conter `@g.us`.

### 3.3 Reutilização da conversa

- Participante sem conversa ativa: criar `Conversation` em `OPEN`.
- Conversa ativa: anexar a mensagem à conversa existente e garantir a etiqueta `GROUP`.
- Conversa encerrada: criar uma nova conversa, preservando o histórico encerrado.
- Nunca criar uma conversa cujo contato seja o JID do grupo; o contato é sempre o telefone normalizado de `participant`.

### 3.4 Confirmação no grupo

DM ao participante é obrigatório. A mensagem pública no grupo é opt-in, desabilitada por padrão, com template configurável e variáveis limitadas `{{nome}}` e `{{grupo}}`. Falha no envio opcional não pode desfazer a persistência do chamado; deve gerar log/métrica e resultado recuperável.

### 3.5 Instância sem telefone conhecido

O recurso deve falhar fechado: se o telefone da instância não estiver disponível no cache nem no endpoint de perfil/status da Z-API, a menção não é considerada válida. A configuração exibida ao administrador deve mascarar o número, quando necessário, e nunca retornar token.

## 4. Modelo de dados e migration

### 4.1 Novos modelos

Adicionar de forma aditiva ao Prisma:

```prisma
model Label {
  id                  String               @id @default(uuid())
  name                String               @unique
  slug                String               @unique
  color               String               @default("#6366f1")
  icon                String?
  isSystem            Boolean              @default(false) @map("is_system")
  createdAt           DateTime             @default(now()) @map("created_at") @db.Timestamptz
  conversationLabels  ConversationLabel[]
  @@map("gtf_labels")
}

model ConversationLabel {
  id             String       @id @default(uuid())
  conversationId String       @map("conversation_id")
  labelId        String       @map("label_id")
  addedByAgentId String?      @map("added_by_agent_id")
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  label          Label        @relation(fields: [labelId], references: [id], onDelete: Cascade)
  addedByAgent   Agent?       @relation(fields: [addedByAgentId], references: [id], onDelete: SetNull)
  @@unique([conversationId, labelId])
  @@index([conversationId])
  @@index([labelId])
  @@map("gtf_conversation_labels")
}

model GroupMentionCooldown {
  id              String   @id @default(uuid())
  groupKey        String   @map("group_key")
  participantKey  String   @map("participant_key")
  lastMentionAt   DateTime @map("last_mention_at") @db.Timestamptz
  @@unique([groupKey, participantKey])
  @@index([lastMentionAt])
  @@map("gtf_group_mention_cooldowns")
}
```

`groupKey` e `participantKey` devem ser hashes estáveis de valores normalizados. Não persistir JIDs brutos nessa tabela.

### 4.2 Alterações nos modelos existentes

Em `Conversation`:

- `groupChatName String? @map("group_chat_name")`;
- `groupParticipant String? @map("group_participant")`, normalizado e protegido;
- relação `labels ConversationLabel[]`;
- índice opcional em `groupChatName` apenas se a consulta de auditoria justificar.

Em `ZApiConfig`:

- `instancePhone String? @map("instance_phone")` (preenchido pelo backend, não aceito livremente do navegador);
- `groupsEnabled Boolean @default(false) @map("groups_enabled")`;
- `groupCooldownSeconds Int @default(60) @map("group_cooldown_seconds")`;
- `groupConfirmInGroup Boolean @default(false) @map("group_confirm_in_group")`;
- `groupConfirmMessage String? @map("group_confirm_message")`.

Não adicionar `lastGroupMentionAt` em `Contact`, pois ele não representa corretamente o par grupo + participante.

### 4.3 Migration e seed

- Criar migration com nome explícito, aditiva e sem alterar dados existentes.
- Backfill de nenhuma conversa: somente as novas colunas ficam `NULL`/default.
- Criar os rótulos de sistema de forma idempotente: `GROUP`, `URGENT`, `WAITING`, `RESOLVED`, `REVIEW`.
- Impedir edição/exclusão de etiquetas `isSystem=true` no service, mesmo que a rota seja chamada diretamente.
- Executar `prisma validate`, `prisma generate`, migration em homologação e verificação de índices antes do rollout.
- Rollback operacional: desabilitar grupos e reverter o deploy; não remover tabelas com dados em produção.

## 5. Contrato do webhook e motor de menção

### 5.1 Schema Zod

Adicionar ao `ZApiReceivedWebhookSchema`:

- `participant: z.string().max(200).optional()`;
- `mentionedJids: z.array(z.string().max(200)).max(100).optional()`.

O schema deve continuar aceitando campos adicionais necessários aos payloads reais da Z-API, mas limitar tamanho e quantidade. O parser deve preservar a mensagem original e produzir uma estrutura discriminada `private | group` para não espalhar `any` pelo service.

### 5.2 Ordem de decisão

```text
callback inválido                         -> 400
fromMe/isNewsletter/isStatusReply         -> ignored
isGroup=false                             -> fluxo privado atual, sem regressão
isGroup=true e groupsEnabled=false         -> ignored_groups_disabled
sem participant ou grupo inválido          -> ignored_invalid_group_context
sem mentionedJids                          -> ignored_no_mention
broadcast confirmado presente              -> ignored_broadcast_mention
instância ausente em mentionedJids         -> ignored_not_mentioned
cooldown ativo                             -> cooldown
menção válida                              -> processar grupo
```

O helper de JID deve:

- normalizar dígitos, sufixo `@s.whatsapp.net`, dispositivos e caixa;
- comparar somente o identificador canônico da instância;
- detectar aliases universais confirmados pela homologação;
- não registrar `mentionedJids` nos logs;
- usar comparação linear O(n), com limite de 100 itens.

### 5.3 Persistência e envio

Para uma menção válida:

1. Normalizar `participant` para o contato individual.
2. Fazer claim pelo `messageId` antes de qualquer envio externo.
3. Buscar/criar a conversa conforme as regras de reutilização da seção 3.3.
4. Persistir a mensagem, `groupChatName`, `groupParticipant` e etiqueta `GROUP` em operação idempotente.
5. Reservar/atualizar o cooldown por `(groupKey, participantKey)` de forma atômica.
6. Enviar a confirmação obrigatória por DM ao participante.
7. Enviar a confirmação no grupo apenas se a configuração estiver ativa.
8. Emitir `message:new`, `conversation:updated` e atualização de etiquetas somente após persistência.

Retentativas do mesmo `messageId` devem retornar `duplicate_event` e nunca duplicar conversa, etiqueta ou confirmação. Falhas externas devem ser observáveis e não podem gerar estado de sucesso falso.

## 6. API de etiquetas e configuração

### 6.1 Etiquetas

Criar o módulo `backend/src/modules/labels/` seguindo Route → Controller → Service → Repository → Schema:

```text
GET    /api/labels?active=true&q=&page=&limit=
POST   /api/labels
PATCH  /api/labels/:id
DELETE /api/labels/:id
POST   /api/conversations/:id/labels
DELETE /api/conversations/:id/labels/:labelId
```

Regras:

- validar UUID, slug único, nome, cor hexadecimal, ícone permitido e limites de paginação;
- adicionar etiqueta deve ser idempotente (`conversationId + labelId`);
- remover etiqueta deve retornar sucesso idempotente quando já não existir;
- `AGENT` só manipula conversas acessíveis e etiquetas permitidas pela fila/departamento;
- `SUPERVISOR` e `ADMIN` podem manipular conversas dentro do escopo definido pelo RBAC;
- apenas `ADMIN` cria/edita/exclui etiquetas do catálogo;
- filtros da fila devem aplicar `labelIds` no banco, combinando com status, departamento, busca e período.

### 6.2 Configuração de grupos

Estender `GET/PUT /api/zapi/config` com os campos de grupos. O schema deve aceitar `groupCooldownSeconds` em faixa segura (recomendação: 5–3600), template limitado e variáveis permitidas. `instancePhone` é somente leitura no painel e deve ser atualizado ao testar status/perfil da instância.

Permissão: reutilizar `zapi:view` para leitura e `zapi:configure` para alteração. O campo de telefone nunca deve permitir substituir a identificação real da instância manualmente.

## 7. RBAC, eventos e observabilidade

Adicionar ao RBAC:

- recurso `labels` com `view`, `create`, `update`, `delete`;
- tela `/admin/labels`;
- permissões de uso/gerenciamento de etiqueta em conversa sem permitir acesso a conversas fora do escopo;
- seed/defaults atualizados para ADMIN, SUPERVISOR e AGENT.

Emitir `conversation:labels_updated` com `{ conversationId, labels }` sem JIDs, tokens ou conteúdo desnecessário. A fila e o detalhe devem invalidar/atualizar apenas a conversa afetada; reconexão sempre recupera via REST.

Logs estruturados devem conter apenas `conversationId`, resultado, tipo, duração e identificador interno do grupo quando necessário. Nunca registrar telefone completo, `participant`, `mentionedJids`, tokens ou template expandido.

Métricas mínimas:

- grupos ignorados por motivo (`disabled`, `no_mention`, `broadcast`, `not_mentioned`, `cooldown`);
- menções processadas, DM enviada/falha e confirmação no grupo;
- duplicidades por `messageId`;
- latência do webhook e do envio;
- quantidade de etiquetas adicionadas/removidas e falhas de RBAC.

## 8. Frontend e UX

Usar os primitives shadcn existentes e os tokens do `DESIGN_SYSTEM.md`; cards e popovers devem ser opacos, com primary `#2D89C8`, estados warning/danger e foco visível.

### Fila (`/` e `/my-conversations`)

- `ConversationRow` exibe badges de etiquetas sem deslocar nome/horário;
- toolbar recebe filtro multi-etiqueta com busca, seleção múltipla, remoção individual e limpeza compatível com os filtros atuais;
- query key inclui `labelIds`; filtro é server-side e paginação permanece em 5 itens;
- receber `conversation:labels_updated` atualiza a linha sem recarregar o histórico.

### Detalhe (`/conversation/:id`)

- seção de etiquetas atuais com `LabelBadge`/`Badge` e botão `+ Etiqueta`;
- Popover/Command ou Select shadcn com busca e estados loading/empty/error;
- remover etiqueta exige confirmação apenas quando aplicável ao design system;
- erros de autorização permanecem visíveis sem perder a conversa ou o rascunho.

### Administração

- nova rota `/admin/labels` com tabela/lista, contador de uso, criação, edição e exclusão lógica/confirmada;
- etiquetas de sistema mostram estado protegido, sem ação de edição/remoção;
- `/admin/zapi` recebe seção “Configurações de Grupos”, com toggle, cooldown, confirmação pública, template e telefone mascarado da instância;
- adicionar rotas ao menu/RBAC sem quebrar permissões existentes.

## 9. Decomposição por arquivos

### Backend

- `backend/prisma/schema.prisma` e migration nova: modelos, relações, índices e campos de grupo/configuração;
- `backend/src/modules/zapi/zapi.schemas.ts`: payload e configuração;
- `backend/src/modules/zapi/zapi.service.ts`: classificação privada/grupo, menção, cooldown e confirmação;
- `backend/src/modules/zapi/zapi.repository.ts`: config, contato/conversa, claim e cooldown transacional;
- `backend/src/modules/labels/labels.{routes,controller,service,repository,schemas}.ts`: catálogo e vínculos;
- `backend/src/modules/conversations/conversations.repository.ts` e `conversations.service.ts`: include de etiquetas e filtro `labelIds`;
- `backend/src/modules/rbac/rbac.service.ts` e seed: recurso/tela/ações;
- `backend/src/app.ts`: registro do módulo;
- `backend/test/`: contratos, unidade de JID, idempotência, RBAC e integração.

### Frontend

- `frontend/src/types/index.ts`: `Label`, `ConversationLabel`, campos e payloads;
- `frontend/src/components/ui/LabelBadge.tsx` e componentes shadcn necessários;
- `frontend/src/pages/queue/hooks/use-queue.ts`, `ConversationRow.tsx` e `index.tsx`;
- `frontend/src/pages/conversation/index.tsx` e hooks de labels;
- `frontend/src/pages/admin/labels/index.tsx` e hooks/API;
- `frontend/src/pages/admin/zapi/index.tsx` e tipos de configuração;
- roteamento/menu e estados de loading/erro/empty.

### Documentação

- atualizar o PRD após decisões da Fase 0;
- atualizar `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/PRD_ZAPI.md`, `docs/PRD_SOCKETIO.md` e `docs/README.md`;
- adicionar runbook de ativação/desativação e homologação de payload real da Z-API;
- documentar o significado de `OPEN`, que é o status atual equivalente à fila no projeto.

## 10. Fases de execução

### F0 — Fechamento do contrato e baseline

- validar payloads reais/fixtures da Z-API para `phone`, `participant`, `mentionedJids` e broadcast;
- decidir regra de `@g.us`, reabertura e confirmação pública;
- congelar contrato OpenAPI/JSON, permissões e templates;
- criar fixtures sem números reais nos testes;
- medir latência atual do webhook e registrar feature flag `groupsEnabled=false`.

**Saída:** decisões registradas no PRD, schemas de contrato e matriz de aceite aprovada.

### F1 — Migration, catálogo e RBAC

- implementar schema/migration aditiva;
- gerar client Prisma e validar índices;
- seed idempotente das cinco etiquetas de sistema;
- criar módulo de labels e permissões;
- testar CRUD, unicidade, proteção de sistema e escopo.

**Saída:** API de etiquetas funcional sem ativar grupos.

### F2 — Runtime de menções em grupo

- adicionar campos Zod e parser discriminado;
- implementar normalização/broadcast/JID da instância;
- buscar/cachear telefone via status/perfil sem expor credenciais;
- implementar cooldown atômico, claim por `messageId` e fluxo de conversa do participante;
- adicionar `GROUP` e contexto de grupo;
- enviar DM e confirmação opcional com falhas observáveis;
- manter fluxo privado byte-a-byte compatível onde possível.

**Saída:** webhook processa fixtures de grupo somente quando a flag estiver habilitada.

### F3 — Projeções, filtros e tempo real

- incluir etiquetas na projeção de fila e no detalhe;
- adicionar filtro `labelIds` validado e paginado;
- emitir/consumir `conversation:labels_updated`;
- atualizar cache React Query sem refetch em cascata;
- validar que RBAC é aplicado no servidor.

### F4 — Frontend de etiquetas e configuração

- badges e filtro multi-select na fila;
- gerenciamento inline no detalhe;
- CRUD `/admin/labels` com confirmação e proteção de sistema;
- seção de grupos em `/admin/zapi` com campos e feedback de status;
- smoke visual em desktop/mobile e teclado.

### F5 — QA, segurança e rollout

- executar matriz unitária, API, PostgreSQL, Socket.IO, E2E Z-API e regressão de mídia/fluxo;
- revisar logs e payloads para ausência de JID/segredo;
- ativar em homologação com grupo de teste e cooldown reduzido apenas no ambiente de teste;
- canary por `groupsEnabled`/instância;
- monitorar duplicidade, ignorados, falha de DM, latência e etiquetas;
- rollback desabilitando grupos sem remover dados.

## 11. Matriz de testes e critérios de aceite

### Webhook e grupos

- privado existente continua abrindo/atualizando conversa;
- grupo sem `mentionedJids` retorna `ignored_no_mention`;
- grupo com menção a outro número retorna `ignored_not_mentioned`;
- menção válida cria contato pelo `participant`, nunca pelo grupo;
- `fromMe`, newsletter e status reply são ignorados;
- broadcast sozinho e broadcast + menção ao bot são ignorados;
- telefone da instância em formatos equivalentes é reconhecido;
- payload malformado, JID gigante e mais de 100 menções retornam 400;
- flag desabilitada ignora grupos sem alterar conversas;
- mesma mensagem repetida não duplica conversa, mensagem, etiqueta ou DM;
- segundo evento do mesmo par grupo/participante dentro do cooldown retorna `cooldown`;
- evento após cooldown processa normalmente;
- falha da Z-API no DM não apaga o chamado e gera métrica/log seguro.

### Etiquetas, API e RBAC

- seed é idempotente;
- slug/nome duplicado retorna 400/409 coerente;
- etiqueta de sistema não pode ser editada/excluída;
- agente só lista/manipula conversa permitida;
- agente não consegue criar catálogo nem alterar etiqueta de outro escopo;
- filtro por uma ou várias etiquetas combina com status, departamento, busca e período;
- adição/remoção repetida é idempotente;
- Socket atualiza somente o detalhe/fila autorizado;
- payloads não contêm tokens, JIDs ou URLs de origem.

### Frontend

- badges aparecem na fila e detalhe após reload;
- seleção de múltiplas etiquetas não perde outros filtros;
- criar/editar/excluir exige o modal padrão de ações críticas;
- etiqueta de sistema fica visualmente protegida;
- loading, empty, erro 403 e retry são tratados;
- teclado, foco, mobile e dropdown para baixo funcionam;
- `/admin/labels` respeita a permissão de tela;
- configuração salva/recarrega sem exibir token.

### Regressão

- mensagens privadas, fluxo v2/triagem, assumir/transferir/encerrar, notificações, mídia temporária e auto-close permanecem verdes;
- builds frontend/backend e `prisma validate` passam;
- migration não altera contagem/status existentes quando `groupsEnabled=false`.

## 12. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Formato de `mentionedJids` divergir entre versões Z-API | Alto | fixtures reais, helper isolado e flag desabilitada por padrão |
| Confundir JID de grupo com broadcast | Alto | confirmar semântica do provedor; não bloquear `@g.us` genericamente |
| Duplicidade por retry/concor­rência do webhook | Alto | unique de `externalMessageId`, claim e cooldown transacional |
| Responder no grupo por engano | Alto | `groupConfirmInGroup=false` default e teste de destino |
| Expor participante/JID no frontend/log | Alto | DTO seguro, hash para cooldown, redaction e auditoria |
| Agente manipular conversa fora do departamento | Alto | `canAccess` no service, testes 403 e filtros server-side |
| Catálogo de etiquetas poluir fila | Médio | limite de etiquetas por conversa, ordenação e filtro paginado |
| Falha no endpoint de perfil da Z-API | Médio | fail-closed, status operacional claro e retry de atualização |
| Migration interromper produção | Médio | aditiva, backup, apply em janela controlada e rollback por flag |

## 13. Rollout e rollback

1. Deploy da migration e seed com `groupsEnabled=false`.
2. Deploy da API de etiquetas e UI administrativa; validar RBAC.
3. Homologar payloads de grupo em uma instância de teste sem confirmação pública.
4. Ativar grupos para uma instância/grupo controlado.
5. Monitorar 24–48 horas: taxa de menção válida, cooldown, duplicidade, falhas de DM, latência e erros 4xx/5xx.
6. Expandir gradualmente após aprovação operacional.

Rollback:

- desligar `groupsEnabled` e/ou remover a permissão de configuração;
- manter mensagens e etiquetas já persistidas para auditoria;
- reverter o deploy de aplicação se necessário;
- não executar `migrate reset`, apagar tabelas ou remover labels em produção;
- investigar/reprocessar falhas apenas com comando idempotente baseado em `messageId`.

## 14. Agentes recomendados e ordem de execução

Os agentes abaixo são referências de responsabilidade do plano, conforme [`agents/README.md`](../agents/README.md):

1. **Product Manager** — fechar ambiguidades de broadcast, reabertura, templates, cooldown e aceite.
2. **Tech Lead & Arquiteto** — validar migration, identidade do grupo, idempotência, contratos e compatibilidade com status `OPEN`.
3. **Backend Developer** — schema Zod, runtime Z-API, cooldown, módulo labels, APIs e RBAC server-side.
4. **Frontend Developer** — badges, filtro, CRUD, configuração e integração React Query/Socket.IO com shadcn.
5. **Security Engineer** — JID, logs, tokens, escopo de departamento, anti-spam e broadcast.
6. **QA Testing Engineer** — fixtures, contratos, concorrência, E2E, regressão privada e smoke visual.
7. **DevOps & Infra** — migration, seed, flags, backup, canary, health checks e rollback.

## 15. Definition of Done

- decisões da Fase 0 registradas no PRD;
- migration aplicada sem perda de dados e seed idempotente;
- endpoints de etiquetas e configuração documentados em `docs/API.md`;
- grupos permanecem desabilitados até a homologação real da Z-API;
- menção válida cria/reutiliza conversa do participante e DM sem resposta pública involuntária;
- broadcast, `fromMe`, ausência de menção, cooldown e duplicidade cobertos por testes;
- etiquetas funcionam na fila, detalhe e admin com RBAC;
- Socket/REST, notificações e mídia existentes não sofrem regressão;
- logs não expõem PII/JID/token;
- builds, `prisma validate`, testes e smoke de produção aprovados;
- runbook de ativação/rollback entregue e equipe de operação ciente.

## 16. Resultado da execução — 2026-08-17

- migrations aditivas aplicadas localmente sem seed e sem exclusão de conversas;
- catálogo de etiquetas, relações, cooldown persistente e cinco etiquetas de sistema criados;
- API CRUD, associação idempotente, filtro de fila e RBAC implementados;
- webhook aceita contexto de grupo, valida menção à instância, rejeita broadcast, aplica cooldown por hash e mantém o fluxo privado inalterado;
- conversa de grupo é vinculada ao participante, recebe `GROUP`, preserva somente o nome legível do grupo na UI e confirma por DM;
- painel Z-API permite configurar flag, cooldown, template e confirmação pública opt-in sem devolver tokens ou telefone completo;
- frontend shadcn inclui badges, filtro multi-select, gerenciamento no detalhe e CRUD administrativo com modais warning/danger;
- Socket.IO sincroniza etiquetas na fila e no detalhe;
- `prisma validate`, migrations, backend build, frontend TypeScript/build e 47 testes automatizados aprovados;
- pendência operacional: validar em uma instância/grupo de homologação o formato real de `mentionedJids` e o envio opcional ao JID do grupo antes de habilitar `groupsEnabled` em produção.
