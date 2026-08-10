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
Lista todos os atendentes e o status de presença (Online/Offline).

---

## 5. Fluxo do Bot (`/flow`)

### `GET /flow`
Obtém o fluxo ativo do bot WhatsApp.

### `PUT /flow`
Cria ou atualiza a mensagem de saudação, menu principal e opções de roteamento do bot.
