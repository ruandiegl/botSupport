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
`counts` representa o pulso operacional do escopo do usuário autenticado e não muda com os filtros da lista (busca, período, departamento ou status).
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
Encerra a conversa (status `CLOSED`) e registra a data/hora de encerramento.

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

Tipos emitidos: `NEW_QUEUE_CONVERSATION`, `NEW_MESSAGE` e `UNRESOLVED_REMINDER`.

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
