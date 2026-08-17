# PRD — Atendimento via Grupos WhatsApp com Menção ao Bot e Etiquetas de Chamado

> **Número do PRD**: PRD-GRUPOS-BOT-001  
> **Data**: 2026-08-17  
> **Status**: Em Revisão  
> **Agentes Responsáveis**: Product Manager · Tech Lead & Arquiteto · Backend Developer · Frontend Developer · QA Engineer · Security Engineer  

---

## 1. Visão Geral

Atualmente, o **GTF-Bot** processa exclusivamente mensagens de **conversas privadas** (1:1) entre o número do suporte e os usuários. O sistema ignora explicitamente mensagens provenientes de grupos (`isGroup: true`).

Este PRD especifica a extensão do sistema para que o bot **receba e processe mensagens enviadas em grupos do WhatsApp**, mas **somente quando o número do suporte for diretamente mencionado** (`@suporte`) na mensagem — evitando spam, processamento de ruído e abertura de chamados não intencionais. Adicionalmente, será introduzido o sistema de **etiquetas de chamados** para categorização e auditoria dos atendimentos.

---

## 2. Problema / Motivação

| Problema | Impacto |
|---|---|
| Equipes técnicas frequentemente comunicam-se por grupos no WhatsApp | Usuários precisam sair do contexto do grupo para abrir um chamado no privado |
| O bot ignora 100% das mensagens de grupo | Perda de chamados que poderiam ser abertos diretamente no contexto da equipe |
| Sem etiquetas nos chamados | Dificulta auditoria, métricas por categoria e triagem visual da fila |
| Risco de `@todos` acionar o bot indevidamente | Spam operacional e abertura de chamados sem intenção real |

---

## 3. Objetivos

1. **Atender chamados via grupos** quando o número do suporte for explicitamente mencionado com `@`.
2. **Ignorar `@todos`** (`@everyone`, `@all`) para não gerar chamados não intencionais.
3. **Associar etiquetas** (labels) a chamados para auditoria, métricas e filtragem visual.
4. **Manter o thread de grupo separado** do atendimento privado, garantindo que o bot responda ao remetente via mensagem privada, não no grupo.
5. **Não gerar spam no grupo** — todas as respostas do bot são enviadas em mensagem direta (DM) para o autor da menção.

---

## 4. Contexto Técnico Atual

### 4.1. Payload Z-API — Campos Relevantes (já presentes no schema)

O schema `ZApiReceivedWebhookSchema` já contempla os campos:

```typescript
isGroup: z.boolean().optional(),       // true = mensagem de grupo
chatName: z.string().max(300).optional(), // nome do grupo
senderName: z.string().max(300).optional(), // nome de quem enviou
```

**Campos ausentes que precisam ser adicionados ao schema Zod:**

```typescript
participant: z.string().optional(),         // JID do remetente no grupo (ex: 55219XXXXXXXX@s.whatsapp.net)
mentionedJids: z.array(z.string()).optional(), // JIDs mencionados na mensagem
```

### 4.2. Lógica Atual de Ignorar Grupos

Atualmente, em `zapi.service.ts`, a função `handleIncomingWebhook` descarta silenciosamente mensagens de grupos sem qualquer tratamento:

```typescript
// Linha implícita — groups são ignorados no parseIncomingMessage
if (incoming.isGroup) return { status: "ignored" };
```

Essa lógica será substituída pelo filtro inteligente de menção descrito na seção 6.

### 4.3. Identificação do Número Próprio da Instância

Para verificar se o bot foi mencionado, é necessário comparar `mentionedJids` com o número de telefone da própria instância Z-API. O número pode ser obtido via:
- **Endpoint Z-API**: `GET /instances/{instanceId}/token/{token}/profile` → campo `phone`.
- **Armazenamento**: cache em `ZApiConfig` como novo campo `instancePhone` (opcional, preenchido automaticamente na primeira verificação de status bem-sucedida).

---

## 5. Requisitos Funcionais

### RF-01 — Recepção de Menções em Grupos

- O sistema **deve** processar mensagens de grupos quando o número da instância Z-API estiver presente em `mentionedJids`.
- O sistema **não deve** processar a mensagem caso `mentionedJids` inclua o JID universal de todos os participantes do grupo (ex: sufixo `@g.us` ou equivalente `@broadcast`).
- O sistema **deve** ignorar mensagens onde o mencionado seja `@all`, `@every`, ou equivalente broadcast detectável pelo sufixo do JID.
- O sistema **deve** ignorar mensagens enviadas pelo próprio número (`fromMe: true`).

**Critério de aceite**: Uma mensagem em grupo com `@suporte` na mensagem → chamado aberto; uma mensagem com `@todos` na mesma mensagem → chamado **não** aberto.

### RF-02 — Abertura de Chamado a Partir do Grupo

- Ao detectar uma menção válida, o bot **deve** criar ou reabrir a conversa com o **remetente individual** (`participant`), não com o grupo.
- O chamado é identificado pelo número individual do remetente (extraído de `participant`), seguindo o mesmo fluxo de conversas privadas.
- A conversa recebe automaticamente a etiqueta `GRUPO` e o nome do grupo de origem (`chatName`) como metadado.
- O bot **deve** confirmar a abertura do chamado com uma mensagem privada para o remetente:
  > 📋 *"Olá, [Nome]! Recebi sua solicitação enviada no grupo *[Nome do Grupo]*. Vou abrir um chamado de suporte em nosso sistema. Um momento..."*
- Opcionalmente, o bot pode enviar uma notificação discreta no grupo (configurável):
  > *"✅ @[nome_remetente], seu chamado foi registrado! Continuaremos o atendimento em conversa privada."*

### RF-03 — Etiquetas (Labels) de Chamados

As etiquetas serão armazenadas no banco de dados e exibidas na UI como badges coloridos. As etiquetas iniciais do sistema são:

| Etiqueta | Slug | Cor | Descrição |
|---|---|---|---|
| Grupo | `GROUP` | Azul | Chamado originado de mensagem em grupo |
| Urgente | `URGENT` | Vermelho | Marcado como urgente pelo atendente |
| Aguardando | `WAITING` | Amarelo | Aguardando retorno do cliente |
| Resolvido | `RESOLVED` | Verde | Resolvido sem encerrar formalmente |
| Revisão | `REVIEW` | Roxo | Chamado em revisão técnica |

**Regras de negócio de etiquetas:**
- Uma conversa pode ter **múltiplas etiquetas** simultaneamente.
- Etiquetas são adicionadas/removidas por atendentes ou automaticamente pelo sistema.
- A etiqueta `GROUP` é adicionada **automaticamente** quando o chamado origina-se de menção em grupo.
- Etiquetas são visíveis na fila, no detalhe do chamado e filtráveis.
- Atendentes `AGENT` podem gerenciar etiquetas apenas em suas próprias conversas (ou na fila do departamento). `SUPERVISOR` e `ADMIN` gerenciam qualquer conversa.

### RF-04 — Filtro Anti-Spam de Grupo

- O sistema **deve** manter um período de cooldown por grupo + remetente de **60 segundos** para não processar menções repetidas num curto intervalo.
- Uma menção do mesmo remetente no mesmo grupo em menos de 60 segundos retorna `{ status: "cooldown" }` sem criar novo chamado.
- O cooldown pode ser implementado via campo `lastGroupMentionAt` no modelo `Contact` ou via cache em memória com fallback.

### RF-05 — Configuração no Painel Admin

- **Nova seção em `/admin/zapi`**: "Configurações de Grupos"
  - **Toggle**: Habilitar/Desabilitar atendimento via grupos.
  - **Campo**: Número da instância (para comparação com `mentionedJids`) — preenchido automaticamente pela verificação de status.
  - **Toggle**: Enviar confirmação no grupo (além da DM).
  - **Campo**: Mensagem de confirmação no grupo (personalizável, com variáveis `{{nome}}` e `{{grupo}}`).
  - **Campo**: Cooldown em segundos (padrão: 60).

### RF-06 — Painel de Etiquetas na UI

**Fila de Atendimento (`/` e `/my-conversations`):**
- Exibir as etiquetas de cada conversa como badges coloridos na linha da conversa.
- Filtrar conversas por etiqueta (dropdown multi-select no toolbar).

**Detalhe da Conversa (`/conversation/:id`):**
- Exibir etiquetas atuais com botão `+ Etiqueta` para adicionar.
- Clicar em uma etiqueta exibe opção de removê-la.
- Dropdown com busca das etiquetas disponíveis.
- Mudanças em etiquetas emitem evento Socket.IO `conversation:labels_updated`.

**Admin (`/admin/etiquetas`):** (Novo)
- CRUD de etiquetas customizáveis (nome, slug único, cor hex, ícone Lucide opcional).
- Listagem com contador de uso por etiqueta.

---

## 6. Regras de Decisão — Motor de Filtro de Menção em Grupo

```
Recebeu webhook
  │
  ├── fromMe === true → IGNORE
  ├── isGroup !== true → fluxo existente de conversa privada
  └── isGroup === true
        │
        ├── mentionedJids ausente ou vazio → IGNORE (ninguém foi mencionado)
        ├── mentionedJids contém JID de broadcast (@g.us, @all, @broadcast) → IGNORE
        ├── mentionedJids NÃO contém JID da instância → IGNORE
        └── mentionedJids contém JID da instância
              │
              ├── cooldown ativo (mesmo remetente+grupo < 60s) → IGNORE (cooldown)
              └── PROCESSAR MENÇÃO
                    ├── Extrair phone do `participant`
                    ├── Criar/Buscar Contact com phone do participant
                    ├── Criar Conversa com status OPEN
                    ├── Adicionar etiqueta GROUP automaticamente
                    ├── Registrar metadado: chatName (nome do grupo)
                    ├── Enviar DM ao remetente com confirmação
                    └── (Opcional) Enviar menção no grupo
```

---

## 7. Modelo de Dados

### 7.1. Novos Modelos Prisma

```prisma
// Etiquetas de chamados
model Label {
  id                String              @id @default(uuid())
  name              String              @unique
  slug              String              @unique
  color             String              @default("#6366f1") // hex
  icon              String?             // nome do ícone Lucide (opcional)
  isSystem          Boolean             @default(false) @map("is_system") // etiquetas de sistema não editáveis
  createdAt         DateTime            @default(now()) @map("created_at") @db.Timestamptz
  conversationLabels ConversationLabel[]

  @@map("gtf_labels")
}

// Relação N:N Conversa ↔ Etiqueta
model ConversationLabel {
  id             String       @id @default(uuid())
  conversationId String       @map("conversation_id")
  labelId        String       @map("label_id")
  addedByAgentId String?      @map("added_by_agent_id") // null = adicionado automaticamente
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  label          Label        @relation(fields: [labelId], references: [id], onDelete: Cascade)
  addedByAgent   Agent?       @relation(fields: [addedByAgentId], references: [id], onDelete: SetNull)

  @@unique([conversationId, labelId])
  @@index([conversationId])
  @@index([labelId])
  @@map("gtf_conversation_labels")
}
```

### 7.2. Alterações nos Modelos Existentes

```prisma
// Em Conversation — adicionar:
groupChatName     String?   @map("group_chat_name")     // nome do grupo de origem (se mensagem de grupo)
groupParticipant  String?   @map("group_participant")   // JID do remetente no grupo
labels            ConversationLabel[]

// Em ZApiConfig — adicionar:
instancePhone       String?   @map("instance_phone")       // número da instância (preenchido auto)
groupsEnabled       Boolean   @default(false) @map("groups_enabled")
groupCooldownSeconds Int      @default(60) @map("group_cooldown_seconds")
groupConfirmInGroup Boolean   @default(false) @map("group_confirm_in_group")
groupConfirmMessage String?   @map("group_confirm_message")

// Em Contact — adicionar:
lastGroupMentionAt DateTime?  @map("last_group_mention_at") @db.Timestamptz
```

### 7.3. Schema Zod Atualizado (Z-API Webhook)

```typescript
// Adicionar ao ZApiReceivedWebhookSchema:
participant: z.string().max(200).optional(),          // remetente no grupo
mentionedJids: z.array(z.string().max(200)).optional(), // JIDs mencionados
```

---

## 8. Novos Endpoints REST

| Método | Rota | Descrição | Permissão |
|---|---|---|---|
| `GET` | `/api/labels` | Listar todas as etiquetas | AGENT+ |
| `POST` | `/api/labels` | Criar etiqueta | ADMIN |
| `PATCH` | `/api/labels/:id` | Editar etiqueta | ADMIN |
| `DELETE` | `/api/labels/:id` | Remover etiqueta (não-sistema) | ADMIN |
| `POST` | `/api/conversations/:id/labels` | Adicionar etiqueta a uma conversa | AGENT+ |
| `DELETE` | `/api/conversations/:id/labels/:labelId` | Remover etiqueta de uma conversa | AGENT+ |

---

## 9. Eventos Socket.IO

| Evento | Payload | Descrição |
|---|---|---|
| `conversation:labels_updated` | `{ conversationId, labels: Label[] }` | Emitido ao adicionar/remover etiqueta |

---

## 10. Requisitos de Segurança

| Requisito | Detalhe |
|---|---|
| **Anti-spam de grupo** | Cooldown por `(phone_remetente, chatId_grupo)` — evita flood de menções |
| **Validação de JID** | Comparação sanitizada do JID da instância nos `mentionedJids` (normalização de formato `@s.whatsapp.net`) |
| **Proteção contra `@todos`** | Rejeitar JIDs com sufixo `@g.us`, `@broadcast` ou que contenham palavras reservadas do WhatsApp |
| **RBAC em etiquetas** | `AGENT` gerencia apenas etiquetas de conversas acessíveis; `ADMIN`/`SUPERVISOR` tem acesso total |
| **Etiquetas de sistema** | Não podem ser editadas ou excluídas via API (campo `isSystem = true`) |
| **Idempotência** | Mesmo `messageId` de grupo não pode gerar dois chamados (mesmo mecanismo de deduplicação existente) |

---

## 11. Mapeamento de Agentes Responsáveis

| Agente | Responsabilidades Nesta Feature |
|---|---|
| **[`product-manager`](../agents/product-manager.agent.md)** | Definição das etiquetas de sistema, templates de mensagens para grupos, regras de cooldown e UX do admin de etiquetas |
| **[`tech-lead-architect`](../agents/tech-lead-architect.agent.md)** | Desenho do modelo `Label` e `ConversationLabel`, alterações no `Conversation` e `ZApiConfig`, estratégia de comparação de JIDs, isolamento do fluxo grupo vs. privado |
| **[`backend-developer`](../agents/backend-developer.agent.md)** | Implementação do filtro de menção em `zapi.service.ts`, novo módulo `labels/`, novos campos no schema Zod de webhook, endpoints REST de etiquetas, envio de DM e confirmação no grupo |
| **[`frontend-developer`](../agents/frontend-developer.agent.md)** | Badges de etiquetas na fila e detalhe, dropdown de gerenciamento de etiquetas, filtro multi-etiqueta na toolbar, página `/admin/etiquetas`, toggles na tela `/admin/zapi` |
| **[`qa-testing-engineer`](../agents/qa-testing-engineer.agent.md)** | Testes de cenário: menção válida, `@todos`, menção duplicada (cooldown), mensagem de grupo sem menção, mensagem privada (regressão), adição/remoção de etiquetas, RBAC de etiquetas |
| **[`security-engineer`](../agents/security-engineer.agent.md)** | Auditoria do filtro anti-spam, validação de JID (injeção, formato), segurança do RBAC de etiquetas, proteção contra manipulação de `mentionedJids` |

---

## 12. Critérios de Aceite (User Stories)

### US-01 — Chamado a partir de menção em grupo
> Como **usuário de um grupo do WhatsApp**, ao digitar `@suporte preciso de ajuda com minha VPN`, quero receber uma **mensagem privada** confirmando que meu chamado foi aberto, sem que o bot polua o grupo com respostas.

**Aceite:**
- [x] Chamado criado no status `OPEN`
- [x] Conversa vinculada ao número do remetente (`participant`), não ao grupo
- [x] Metadado `groupChatName` preenchido com o nome do grupo
- [x] Etiqueta `GROUP` adicionada automaticamente
- [x] Bot envia DM de confirmação ao remetente
- [x] Bot NÃO responde no grupo (a menos que `groupConfirmInGroup = true`)

### US-02 — @todos não abre chamado
> Como **administrador**, não quero que o bot abra chamados quando alguém digitar `@todos` no grupo.

**Aceite:**
- [x] Mensagem com `@todos` (ou equivalente JID broadcast) é descartada
- [x] Nenhum chamado criado
- [x] Log registra `{ status: "ignored_broadcast_mention" }`

### US-03 — Cooldown anti-spam
> Como **administrador**, quero que um usuário que mande múltiplas menções em sequência não abra múltiplos chamados em menos de 60 segundos.

**Aceite:**
- [x] Segunda menção dentro de 60s retorna `{ status: "cooldown" }`
- [x] Nenhum chamado duplicado criado
- [x] Timer reinicia a cada nova menção processada com sucesso

### US-04 — Gerenciar etiquetas em chamado
> Como **atendente**, quero adicionar a etiqueta `URGENT` a uma conversa para sinalizar prioridade.

**Aceite:**
- [x] Dropdown de etiquetas exibido no detalhe da conversa
- [x] Etiqueta adicionada em tempo real via Socket.IO
- [x] Badge exibido na linha da conversa na fila
- [x] Possível filtrar a fila por etiqueta `URGENT`

### US-05 — Filtrar fila por etiqueta
> Como **supervisor**, quero filtrar a fila para ver somente conversas etiquetadas como `GRUPO`.

**Aceite:**
- [x] Filtro multi-select de etiquetas disponível no toolbar da fila
- [x] Resultados correspondem somente a conversas com a etiqueta selecionada
- [x] Filtros de etiqueta combinam com filtros existentes (status, departamento, data)

### US-06 — Configuração de grupos no admin
> Como **administrador**, quero habilitar/desabilitar o atendimento via grupos e personalizar a mensagem de confirmação.

**Aceite:**
- [x] Toggle `groupsEnabled` em `/admin/zapi`
- [x] Quando desabilitado, mensagens de grupo são ignoradas mesmo com menção ao bot
- [x] Campo de cooldown configurável
- [x] Mensagem de confirmação no grupo personalizável com variáveis `{{nome}}` e `{{grupo}}`

---

## 13. Requisitos Não-Funcionais

| Requisito | Especificação |
|---|---|
| **Performance** | Verificação de `mentionedJids` deve ser O(n) onde n é o número de JIDs mencionados (tipicamente < 10) |
| **Idempotência** | `messageId` como chave de deduplicação — idêntico ao mecanismo existente |
| **Observabilidade** | Logs estruturados: `{ conversationId, groupChatName, participant, mentionedJids: "redacted", result }` |
| **Retrocompatibilidade** | Conversas privadas existentes não são afetadas; `isGroup = false` segue o fluxo atual sem alterações |
| **Segurança de dados** | `mentionedJids` nunca é registrado nos logs (contém números de telefone) |

---

## 14. Arquivos a Criar / Modificar

### Backend
| Ação | Arquivo |
|---|---|
| `MODIFY` | `backend/prisma/schema.prisma` — novos modelos `Label`, `ConversationLabel`; campos em `Conversation`, `ZApiConfig`, `Contact` |
| `NEW` | `backend/prisma/migrations/20260817_group_mentions_and_labels/migration.sql` |
| `MODIFY` | `backend/src/modules/zapi/zapi.schemas.ts` — adicionar `participant`, `mentionedJids` |
| `MODIFY` | `backend/src/modules/zapi/zapi.service.ts` — lógica de filtro de menção em grupo |
| `MODIFY` | `backend/src/modules/zapi/zapi.repository.ts` — query de cooldown, criação de conversa de grupo |
| `NEW` | `backend/src/modules/labels/labels.routes.ts` |
| `NEW` | `backend/src/modules/labels/labels.controller.ts` |
| `NEW` | `backend/src/modules/labels/labels.service.ts` |
| `NEW` | `backend/src/modules/labels/labels.repository.ts` |
| `NEW` | `backend/src/modules/labels/labels.schemas.ts` |
| `MODIFY` | `backend/src/app.ts` — registrar módulo `labels` |
| `NEW` | Seed de etiquetas de sistema (`GROUP`, `URGENT`, `WAITING`, `RESOLVED`, `REVIEW`) |

### Frontend
| Ação | Arquivo |
|---|---|
| `NEW` | `frontend/src/components/ui/LabelBadge.tsx` — badge visual de etiqueta |
| `MODIFY` | `frontend/src/pages/queue/components/ConversationRow.tsx` — exibir etiquetas |
| `MODIFY` | `frontend/src/pages/queue/index.tsx` — filtro multi-select de etiquetas |
| `MODIFY` | `frontend/src/pages/conversation/index.tsx` — gerenciador de etiquetas inline |
| `NEW` | `frontend/src/pages/admin/labels/index.tsx` — CRUD de etiquetas |
| `MODIFY` | `frontend/src/pages/admin/zapi/index.tsx` — seção "Configurações de Grupos" |
| `MODIFY` | `frontend/src/types/index.ts` — tipos `Label`, `ConversationLabel` |

---

## 15. Plano de Rollout

1. **Fase 1 — Backend (Fundação)**: Schema, migração, módulo `labels`, seed de etiquetas de sistema.
2. **Fase 2 — Backend (Grupos)**: Lógica de menção em grupo no `zapi.service.ts`, cooldown, metadados de grupo, etiqueta `GROUP` automática.
3. **Fase 3 — Frontend (Etiquetas)**: Badges na fila, gerenciador no detalhe, filtros, admin CRUD.
4. **Fase 4 — Frontend (Admin Grupos)**: Configurações em `/admin/zapi`, toggles, mensagem customizável.
5. **Fase 5 — QA e Auditoria**: Testes de todos os cenários de aceite, regressão de mensagens privadas.

---

## 16. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| JID da instância muda ou não está disponível | Baixa | Alto | Cache em `ZApiConfig.instancePhone`, verificação no startup e a cada teste de conexão |
| Formato de `mentionedJids` muda entre versões da Z-API | Média | Médio | Normalização de JID em helper isolado; testes com payload real |
| Usuário de grupo sem conversa privada anterior gera estado inconsistente | Baixa | Médio | `findOrCreate` de contato e conversa antes de qualquer operação |
| Spam de menções mesmo com cooldown (ex: bot em 100 grupos) | Média | Médio | Cooldown por `(remetente, grupo)` + rate limit por grupo + toggle de desabilitar grupos |
| Usuário marca `@todos` + `@suporte` na mesma mensagem | Alta | Médio | Verificar presença de JID de broadcast; se presente, ignora mesmo que o bot também esteja nos `mentionedJids` |
