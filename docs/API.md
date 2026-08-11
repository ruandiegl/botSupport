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
  - `departmentId` (opcional): UUID do departamento

### `GET /conversations/:id`
Retorna detalhes completos de uma conversa específica por ID.

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

## 3. Departamentos (`/departments`)

### `GET /departments`
Lista todos os departamentos cadastrados, incluindo contagem de atendimentos abertos e procedimentos.

### `POST /departments`
Cria um novo departamento.

### `PATCH /departments/:id`
Atualiza dados do departamento e substitui procedimentos.

### `DELETE /departments/:id`
Remove um departamento.

---

## 4. Atendentes (`/agents`)

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

## 5. RBAC (`/rbac`)

### `GET /rbac/roles`
Lista as funções disponíveis. Requer autenticação.

### `GET /rbac/permissions/:role`
Retorna permissões persistidas por recurso e tela. Requer autenticação.

### `PUT /rbac/permissions/:role`
Atualiza permissões por recurso/tela. Requer `rbac:manage`.

---

## 6. Fluxo do Bot (`/flow`)

### `GET /flow`
Obtém o fluxo ativo do bot WhatsApp.

### `PUT /flow`
Cria ou atualiza a mensagem de saudação, menu principal e opções de roteamento do bot.

---

## 7. Atalhos e procedimentos (`/shortcuts`)

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
