# Documentação da API REST (GTF-Bot)

Base URL: `http://localhost:3001/api`

---

## 1. Healthcheck

### `GET /healthz`
Verifica se o backend está ativo.
- **Resposta (200 OK)**:
```json
{
  "status": "ok",
  "timestamp": "2026-08-10T12:00:00.000Z",
  "service": "gtfbot-backend"
}
```

---

## 2. Conversas (`/conversations`)

### `GET /conversations`
Retorna a lista de conversas com informações de contato, departamento, atendente responsável e histórico recente.
- **Query Params**:
  - `status` (opcional): `ALL`, `QUEUED`, `IN_PROGRESS`, `BOT`, `CLOSED`
  - `departmentId` (opcional): UUID do departamento (`AGENT` sÃ³ pode consultar o prÃ³prio departamento)
  - `assignedAgentId` (opcional): `me` ou UUID; para `AGENT`, o servidor restringe ao atendente autenticado
  - `openOnly` (opcional): `true` retorna somente conversas ainda nÃ£o encerradas
  - `unreadOnly` (opcional): `true` retorna somente conversas com mensagens recebidas nÃ£o lidas
  - `q` (opcional): busca por nome, telefone ou mensagem (mÃ¡ximo 120 caracteres)
  - `dateField` (opcional): `lastActivityAt` (padrÃ£o) ou `createdAt`
  - `from`/`to` (opcional): ISO-8601 com offset; `from` inclusivo e `to` exclusivo
  - `sort` (opcional): `operational` (padrÃ£o), `recent` ou `oldest`
  - `page` (opcional): inteiro a partir de 1
  - `limit` (opcional): entre 5 e 100; a fila usa 5 por pÃ¡gina

Quando `page` ou `limit` Ã© enviado, a resposta Ã© paginada:
```json
{
  "items": [],
  "page": 1,
  "limit": 5,
  "total": 0,
  "totalPages": 0,
  "counts": {
    "all": 0,
    "open": 0,
    "queued": 0,
    "inProgress": 0,
    "bot": 0,
    "closed": 0,
    "mine": 0,
    "unread": 0
  },
  "appliedFilters": { "status": "QUEUED", "dateField": "lastActivityAt", "from": null, "to": null }
}
```
`counts` representa o pulso operacional do escopo do usuário autenticado. Os indicadores de status permanecem globais; `counts.all` acompanha o intervalo de data enviado (`from`, `to`, `dateField`), permitindo que o card de todas as conversas reflita o período selecionado.
Sem parÃ¢metros de paginaÃ§Ã£o, o formato legado (array) Ã© mantido temporariamente para clientes antigos.

### `GET /conversations/:id`
Retorna metadados e uma janela inicial de atÃ© 50 mensagens. Quando houver mensagens anteriores, `messagesPagination.previousCursor` informa o cursor opaco para carregÃ¡-las sem baixar o histÃ³rico inteiro.

### `GET /conversations/:id/messages?limit=50&before=<cursor>`
Carrega mensagens anteriores de forma paginada. `limit` aceita de 1 a 100 e `before` Ã© validado no servidor. A resposta usa `{ items, pagination: { limit, hasPrevious, previousCursor } }`; o cursor nÃ£o expÃµe tokens, URLs temporÃ¡rias ou conteÃºdo sensÃ­vel.

### `POST /conversations/:id/assume`
Altera o status da conversa para `IN_PROGRESS` e vincula o atendente informado.
- **Body**:
```json
{
  "agentId": "agent-marina"
}
```

### `POST /conversations/:id/close`
Encerra a conversa (status `CLOSED`) e registra a data/hora de encerramento. O body opcional aceita `{ "reason": "NORMAL" | "INACTIVITY" | "SILENT" }`; `SILENT` encerra apenas no sistema, sem enviar mensagem ao cliente.

### `POST /conversations/:id`
Envia uma nova mensagem para a conversa como atendente.
- **Body**:
```json
{
  "content": "Olá! Como posso ajudar?"
}
```

---

## 3. Notificações (`/notifications`)

As notificações são persistidas por atendente e deduplicadas no servidor. Todas as rotas exigem autenticação e `queue:view_own`.

### `GET /notifications?unreadOnly=false&page=1&limit=30`
Lista notificações do atendente autenticado.

### `GET /notifications/unread-count`
Retorna `{ "count": 0 }` sem expor notificações de outros agentes.

### `POST /notifications/:id/read`, `POST /notifications/read-all`
Marca uma notificação específica ou todas as notificações do atendente como lidas.

### `POST /notifications/:id/dismiss`
Dispensa um alerta sem apagar o registro de auditoria.

### `GET /notification-preferences`, `PATCH /notification-preferences`
Lê ou altera som, notificações do navegador e limiares de lembrete. Os intervalos são limitados entre 5 e 1440 minutos.

Tipos emitidos: `NEW_QUEUE_CONVERSATION`, `NEW_MESSAGE`, `ASSIGNED_CONVERSATION`, `CONVERSATION_DELEGATED`, `DELEGATION_RESPONSE` e `UNRESOLVED_REMINDER`. Notificações de delegação carregam no payload apenas o `conversationId`, `delegationAssignmentId`, decisão e nome do atendente; nunca tokens ou dados sensíveis.

## 4. Departamentos (`/departments`)

### `GET /departments`
Lista todos os departamentos cadastrados, incluindo contagem de atendimentos abertos e procedimentos.

### `POST /departments`
Cria um novo departamento.

### `PATCH /departments/:id`
Atualiza dados do departamento e substitui procedimentos.

### `DELETE /departments/:id`
Remove um departamento.

---

## 5. Atendentes (`/agents`)

### `GET /agents`
Lista todos os atendentes e os status de presença e ativação. Requer permissão `agents:view`.

### `GET /agents/workload`
Retorna a presença da equipe e os chamados em atendimento agrupados por atendente. Requer `queue:view_all`.

Query opcional: `departmentId` (UUID, somente para escopos autorizados), `includeOffline` (`true`/`false`, padrão `true`) e `limit` (1–100, padrão 100). Administradores podem consultar todos os departamentos; supervisores ficam limitados ao departamento do próprio perfil. O endpoint não aceita um `agentId` para ampliar o escopo.

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Administrador Sistema",
      "role": "ADMIN",
      "departmentId": "uuid",
      "departmentName": "Suporte Geral",
      "isOnline": true,
      "isActive": true,
      "activeConversationCount": 1,
      "conversations": [
        {
          "id": "uuid",
          "contactName": "João Marcos",
          "departmentName": "Suporte Geral",
          "status": "IN_PROGRESS",
          "unreadCount": 0,
          "startedAt": "2026-08-19T14:45:00.000Z",
          "lastActivityAt": "2026-08-19T15:10:00.000Z"
        }
      ]
    }
  ],
  "totals": { "agents": 1, "online": 1, "offline": 0, "activeConversations": 1 },
  "generatedAt": "2026-08-19T15:10:01.000Z"
}
```

Somente agentes ativos são listados. Os chamados são filtrados por `status=IN_PROGRESS` e responsável preenchido, ordenados por atividade recente. A resposta não inclui mensagens, mídias, telefones completos, URLs temporárias ou credenciais.

### `POST /agents`
Cria atendente. Requer `ADMIN`. Body: `name`, `email`, `password` (mínimo 8), `role` e `departmentId` opcional.

### `PATCH /agents/:id`
Atualiza dados, departamento, função ou `isActive`. Requer `ADMIN`.

### `POST /agents/:id/reset-password`
Redefine a senha com body `{ "password": "..." }`. Requer `ADMIN`.

### `DELETE /agents/:id`
Exclui atendente, exceto o próprio usuário ou o último administrador ativo. Requer `ADMIN`.

## 6. RBAC (`/rbac`)

### `GET /rbac/roles`
Lista as funções disponíveis. Requer autenticação.

### `GET /rbac/permissions/:role`
Retorna permissões persistidas por recurso e tela. Requer autenticação.

### `PUT /rbac/permissions/:role`
Atualiza permissões por recurso/tela. Requer `rbac:manage`.

---

## 7. Fluxo do Bot (`/flow`)

Todas as rotas v2 exigem autenticação. Leitura requer `flow:view`, edição de rascunho requer `flow:edit` e publicação/restauração requer `flow:publish`.

### `GET /flow/published`

Retorna a revisão publicada ativa, incluindo nós e transições ordenados. Responde `404` quando não existe revisão publicada.

### `GET /flow/draft`

Retorna o rascunho atual. A implementação pode criar um rascunho a partir do publicado quando nenhum existir, desde que a resposta identifique a nova revisão.

### `POST /flow/draft`

Cria um rascunho a partir da revisão publicada. Para partir de uma revisão histórica, use o endpoint de restauração.

### `PUT /flow/draft/:id`

Salva atomicamente o documento completo. O campo `revision` implementa controle otimista.

```json
{
  "revision": 4,
  "nodes": [
    {
      "id": "uuid",
      "stableKey": "support-triage",
      "type": "TRIAGE",
      "name": "Dados para contato",
      "content": "Por favor, informe seu nome, emissora, cidade/UF e necessidade.",
      "sortOrder": 2,
      "config": { "responseKey": "supportDetails" },
      "departmentId": null
    }
  ],
  "transitions": [
    {
      "id": "uuid",
      "fromNodeId": "uuid",
      "toNodeId": "uuid",
      "optionKey": null,
      "label": null,
      "sortOrder": 0
    }
  ]
}
```

Retorna `409 Conflict` quando `revision` estiver desatualizado, sem sobrescrever o rascunho do outro editor.

Uma decisão secundária dentro de uma rota utiliza o mesmo tipo `DECISION`, com configuração validada:

```json
{
  "id": "uuid",
  "stableKey": "support-submenu",
  "type": "DECISION",
  "name": "Detalhar necessidade",
  "content": "Qual opção descreve melhor sua necessidade?",
  "sortOrder": 0,
  "config": {
    "parentRouteId": "uuid-da-rota",
    "decisionScope": "ROUTE",
    "decisionOptions": [
      { "optionKey": "support-password", "label": "Acesso e senha" },
      { "optionKey": "support-network", "label": "Rede e Internet", "description": "Conectividade e acesso" }
    ]
  },
  "departmentId": null
}
```

Cada item também deve existir como `FlowTransition` saindo da decisão, com o mesmo `optionKey` e `label`. O backend rejeita divergência, duplicidade, submenu sem terminal e mais de um submenu por rota.

### `POST /flow/draft/:id/validate`

Valida estrutura, grafo, limites e referências sem publicar. Um documento carregado retorna `200` com `{ "valid": true, "issues": [] }` ou `{ "valid": false, "issues": [...] }`. Cada issue possui `code`, `message` e, quando aplicável, `nodeId` ou `transitionId`. UUID/payload malformado retorna `400`.

### `POST /flow/draft/:id/publish`

Valida e publica em uma transação. Arquiva a revisão anteriormente publicada sem alterar conversas vinculadas a ela. Requer `flow:publish`.

### Planejado: `POST /flow/draft/:id/preview`

Ainda não exposto pela API. Quando implementado, simulará um ramo e retornará as ações que seriam executadas, sem enviar mensagens ao WhatsApp e sem alterar conversas.

### `GET /flow/revisions`

Lista o histórico de revisões com versão, estado, autor e datas.

### `POST /flow/revisions/:id/restore`

Cria um novo rascunho a partir da revisão histórica. Nunca modifica nem republica diretamente o snapshot antigo.

### Compatibilidade legada

- `GET /flow`: leitura v1 temporária;
- `PUT /flow`: escrita v1 temporária, restrita à janela de compatibilidade.

Clientes novos devem usar exclusivamente os endpoints v2. A remoção do legado segue `RUNBOOK_MIGRACAO_FLUXO_V2.md`.

### Erros do fluxo

| Status | Condição |
|---|---|
| `400` | UUID, payload, grafo, limite ou referência inválida |
| `401` | autenticação ausente/inválida |
| `403` | permissão ausente |
| `404` | fluxo, revisão, nó ou departamento não encontrado |
| `409` | revisão otimista desatualizada ou publicação concorrente |
| `422` | documento sintaticamente válido, mas impossível de publicar |

---

## 8. Atalhos e procedimentos (`/shortcuts`)

Todas as rotas exigem autenticação. A API aplica visibilidade por escopo no servidor: global, departamento da conversa e proprietário do atalho pessoal.

### `GET /shortcuts`

Lista os atalhos que o usuário pode administrar. Requer `shortcuts:view`.

Query params opcionais: `q`, `type`, `scope`, `departmentId`, `active`, `page` e `limit` (máximo 100).

### `GET /shortcuts/available`

Lista somente atalhos ativos disponíveis no chat. Requer `shortcuts:use` e `conversationId` como query param. Aceita também `q` e `type`.

### `POST /shortcuts`

Cria um atalho. Requer `shortcuts:create`.

```json
{
  "title": "Saudação inicial",
  "message": "Olá! Como posso ajudar?",
  "type": "GREETING",
  "scope": "GLOBAL",
  "departmentId": null,
  "isActive": true,
  "sortOrder": 1
}
```

Tipos: `GREETING`, `CLOSING`, `DEPARTMENT`, `PERSONAL`, `GENERAL`. Escopos: `GLOBAL`, `DEPARTMENT`, `PERSONAL`.

### `PATCH /shortcuts/:id`

Atualiza campos do atalho. Requer `shortcuts:update` e respeita propriedade/escopo.

### `POST /shortcuts/:id/activate`

Ativa ou desativa com body `{ "isActive": true }`. Requer `shortcuts:publish`.

### `POST /shortcuts/:id/use`

Registra uso após o envio da mensagem, com body `{ "conversationId": "uuid" }`. Requer `shortcuts:use`.

### `DELETE /shortcuts/:id`

Faz arquivamento lógico e preserva a auditoria. Requer `shortcuts:delete`.

## Mídia de conversas

### Metadados em `GET /conversations/:id`

Uma mensagem pode incluir `media` com `id`, `type`, `status`, `mimeType`, caption/nome/duração/dimensões/páginas, `viewOnce`, `hasThumbnail`, `expiresAt` e `available`. A resposta nunca inclui URL da Z-API, ciphertext ou erro bruto do provedor.

### `POST /conversations/:conversationId/messages/:messageId/media-access`

Requer Bearer JWT e `conversations:view`. Body estrito:

```json
{ "purpose": "content" }
```

`purpose` aceita `content`, `thumbnail` ou `download`. A resposta contém uma URL interna com ticket opaco de curta duração. O service também valida atribuição/departamento, estado e expiração da conversa/mídia.

### Proxy interno

- `GET /media/:mediaId/content?ticket=...`
- `GET /media/:mediaId/thumbnail?ticket=...`
- `GET /media/:mediaId/download?ticket=...`

O ticket é a credencial exclusiva dessas rotas e não deve ser registrado, compartilhado ou armazenado. Respostas: `401` ticket inválido; `403` finalidade/escopo inválido; `404` inexistente; `410` expirada/removida; `416` Range inválido; `422` indisponível ou formato bloqueado; `429` streams simultâneos excedidos; `502/503/504` indisponibilidade da origem.

## Etiquetas de conversas

As rotas exigem autenticação e permissões no recurso `labels`. Etiquetas de sistema (`GROUP`, `URGENT`, `WAITING`, `RESOLVED`, `REVIEW`) não podem ser editadas ou excluídas.

- `GET /labels?q=&page=1&limit=100`: lista o catálogo e a quantidade de conversas por etiqueta (`labels:view`).
- `POST /labels`: cria etiqueta customizada com `{ name, slug, color, icon? }` (`labels:create`).
- `PATCH /labels/:id`: altera uma etiqueta customizada (`labels:update`).
- `DELETE /labels/:id`: exclui uma etiqueta customizada e suas relações, sem excluir conversas (`labels:delete`).
- `POST /conversations/:id/labels`: adiciona de forma idempotente, body `{ "labelId": "uuid" }` (`labels:update`).
- `DELETE /conversations/:id/labels/:labelId`: remove de forma idempotente (`labels:update`).

`GET /conversations` aceita `labelIds=uuid,uuid` (máximo 20) e combina o filtro com status, departamento, busca e período. Os itens da fila e o detalhe incluem `labels[]` e `groupChatName`; JIDs de participantes nunca são retornados.

## Exclusões de respostas automáticas do bot

As rotas exigem Bearer JWT e permissões no recurso `bot_exclusions`. Por padrão, somente ADMIN possui essas permissões; elas podem ser concedidas pelo RBAC sem alteração de schema.

- `GET /bot-exclusions?q=&activeOnly=false&page=1&limit=100`: lista regras de bloqueio. O telefone retornado contém somente dígitos canônicos, nunca credenciais ou dados de mensagens (`bot_exclusions:view`).
- `POST /bot-exclusions`: cria uma regra com `{ "phone": "+55 (24) 99999-9999", "label": "Bot de testes", "reason": "Evitar loop" }` (`bot_exclusions:create`). O número é normalizado antes da unicidade.
- `PATCH /bot-exclusions/:id`: altera identificação, motivo ou `{ "isActive": false }` (`bot_exclusions:update`).
- `DELETE /bot-exclusions/:id`: desativa a regra de forma lógica, preservando auditoria (`bot_exclusions:delete`).

Uma exclusão ativa é uma barreira server-side apenas para entregas automatizadas: saudação, botões, triagem, confirmação de grupo, fallback textual e mensagens de inatividade são suprimidos. O webhook continua persistindo `Contact`, `Conversation` e `Message`, e o atendente ainda pode enviar mensagens manualmente. O matching usa o número do participante em grupos, não o JID do grupo, nome ou texto da mensagem.

## Identidade e delegação de chamados

Mensagens em `GET /conversations/:id` e `GET /conversations/:id/messages` incluem `senderName`, `senderDepartmentName` (quando agente) e `senderContactId` opcional. Esses campos representam o remetente da mensagem, não o responsável atual.

### `GET /conversations/:id/assignees`

Requer `conversations:delegate`. Retorna `{ items: [{ id, name, email, role, isOnline, isActive, departmentId, departmentName }] }` somente com atendentes ativos dentro do escopo do usuário.

### `POST /conversations/:id/delegate`

Requer `conversations:delegate` e recebe `{ "agentId": "uuid", "reason": "Cobertura temporária" }`. O agente do JWT é o ator; `agentId` é apenas o destinatário. A operação é transacional, registra `ConversationAssignment`, atualiza o responsável e notifica o destino. Respostas: `200`, `400` payload inválido, `401`, `403`, `404` ou `409` para encerramento, destino inválido ou conflito concorrente.

### `POST /conversations/:id/delegation-response`

Requer `conversations:view` e só aceita uma resposta do agente destinatário da delegação ainda pendente:

```json
{ "assignmentId": "uuid", "decision": "ACCEPT" }
```

`decision` também pode ser `DECLINE`. A resposta é idempotente por `assignmentId`: uma segunda resposta retorna `409`. Ao aceitar, o agente se torna responsável, uma mensagem interna de atendimento assumido é adicionada ao histórico e o frontend pode abrir a conversa imediatamente. Ao recusar, o chamado retorna ao responsável anterior ou à fila. Em ambos os casos, o ator que delegou recebe `notification:new` e uma notificação persistida do tipo `DELEGATION_RESPONSE`.

## Menções em grupos Z-API

`PUT /zapi/config` também aceita:

```json
{
  "groupsEnabled": false,
  "groupCooldownSeconds": 60,
  "groupConfirmInGroup": false,
  "groupConfirmMessage": "Olá, {{nome}}! Recebemos sua solicitação no grupo {{grupo}}."
}
```

Somente `{{nome}}` e `{{grupo}}` são permitidas. O telefone real da instância é detectado pelo backend ao consultar o status ou pelo campo `connectedPhone` do próprio callback. `GET /zapi/config` retorna apenas indicadores de credencial e telefone mascarado; tokens e o telefone completo não são expostos.

Em Railway, `ZAPI_GROUPS_ENABLED=true` pode ser usado como ativação operacional temporária sem alterar a linha existente de `gtf_zapi_config`; a ausência da variável mantém o comportamento persistente do painel.
`ZAPI_REGISTER_WEBHOOK_ON_STARTUP=true` registra idempotentemente `ZAPI_WEBHOOK_URL` na Z-API após o servidor iniciar, útil quando o banco ainda guarda uma URL antiga.

No webhook `ReceivedCallback`, grupos usam `phone` como chat de origem e, no formato atual da Z-API, `participantPhone` (com fallback legado para `participant`) como remetente individual. A confirmação da menção aceita listas explícitas (`mentionedJids`, `mentionedJid`, `mentions` ou `mentioned`) e, quando a versão da Z-API não envia essa lista, o token `@` preservado no texto. Com o recurso desabilitado, sem menção, broadcast ou cooldown ativo, a mensagem é ignorada sem abrir conversa. Uma menção válida cria/reutiliza a conversa privada do participante, persiste a etiqueta `GROUP` e envia confirmação por DM. A confirmação pública é opt-in. O endpoint canônico é `/api/webhooks/z-api`; os aliases `/api/webhooks/zapi/message` e `/api/webhooks/z-api/message` permanecem aceitos para instalações antigas.

## Contatos compartilhados e conversas manuais

Mensagens de contato recebidas no callback `ReceivedCallback` são persistidas como `messageType: "CONTACT"` e incluem um `contactShare` normalizado. O DTO público contém apenas nome, telefones, e-mail, organização e observação; o vCard bruto nunca é devolvido ao navegador.

### `GET /contacts`

Lista a agenda compartilhada para usuários com `contacts:view`. Aceita `q` (nome, telefone, e-mail ou organização), `page` e `limit` (5–100) e retorna `{ items, total, page, limit, totalPages }`. Cada contato inclui `isRegistered`; registros criados automaticamente pela entrada do WhatsApp ficam como `false` até serem confirmados/editados na agenda.

### `GET /contacts/:id`

Retorna os dados editáveis do contato e seus telefones normalizados. Exige `contacts:view`.

### `POST /contacts` / `PATCH /contacts/:id`

Criam ou atualizam contatos com `name`, `phones[]`, `email`, `organization` e `notes`. Telefones são normalizados para dígitos e não podem ser duplicados. `POST` pode receber `contactShareId` para vincular o cartão exibido na conversa ao contato salvo; o cartão precisa pertencer a uma conversa acessível ao agente.

### `GET /contacts/:id/conversations`

Retorna conversas relacionadas ao contato, com `openOnly`, `page` e `limit`. A resposta inclui status, departamento, responsável, não lidas e última atividade, sem mensagens ou dados sensíveis desnecessários. Para agentes, somente conversas do próprio departamento ou atribuídas ao usuário são retornadas.

### `POST /conversations`

Cria uma conversa manual. `contactId` é opcional: quando omitido, o backend procura o telefone e cria automaticamente um contato mínimo (“Contato WhatsApp”), que pode ser complementado depois na agenda:

```json
{ "contactId": "uuid-opcional", "phone": "5511999999999", "departmentId": "uuid-opcional" }
```

O endpoint exige `contacts:create`, evita duplicar conversas abertas e respeita o departamento do atendente. A conversa criada inicia em `OPEN` e aparece na fila para o próximo atendimento.
