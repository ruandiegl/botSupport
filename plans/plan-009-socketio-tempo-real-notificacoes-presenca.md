# Plan 009: Implementação de Socket.IO para Comunicação em Tempo Real, Notificações e Presença

> **Status:** Aguardando Aprovação do Usuário  
> **Data:** 2026-08-12  
> **Repositório:** `c:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`  
> **PRD de Referência:** [`docs/PRD_SOCKETIO.md`](file:///c:/Users/ESTUDIO-TREINAMENTO/Desktop/botSupport/docs/PRD_SOCKETIO.md)  

---

## 1. Objetivo

Substituir o modelo atual de **polling HTTP de 10 segundos** (React Query `refetchInterval`) e a transmissão via **SSE** (`GET /api/conversations/events`) por uma arquitetura em tempo real baseada em **Socket.IO** (com comunicação bidirecional via WebSocket e fallback HTTP).

A nova arquitetura cobrirá:
1. **Mensagens e Conversas em Tempo Real**: Atualização instantânea da thread de chat e lista de chamados na fila sem latência.
2. **Presença Real de Atendentes**: Status Online/Offline vinculado à conexão ativa do socket (com heartbeat de 30s).
3. **Indicador de Digitação (Typing Indicator)**: Exibição de "Atendente digitando..." na janela do chat.
4. **Sistema de Notificações Push**: Alertas visuais e sonoros para novos chamados na fila, novas mensagens e transferências.
5. **Reconexão Automática**: Backoff exponencial com ressincronização automática de estado.

---

## 2. Embasamento na Documentação e Código Atual

### Documentação Técnica
- **`docs/PRD_SOCKETIO.md`**: PRD detalhado cobrindo diagnósticos, catálogo de eventos, segurança e fluxo de migração.
- **`docs/ARCHITECTURE.md`**: Manutenção do padrão backend modular por domínio (`src/modules/`) e frontend autocontido (`src/pages/`).
- **`docs/GUIDELINES.md`**: Validação estrita via schemas Zod, logs com Pino e segurança de dados/tokens.

### Estado Atual no Código
1. **Backend Event System (`backend/src/shared/events.ts`)**:
   - `conversationEvents` (instância de `EventEmitter`) já é emitido em 5 pontos de `conversations.service.ts` e 4 pontos de `zapi.service.ts`.
   - `conversations.controller.ts` expõe um endpoint SSE unidirecional (`streamEvents`).
2. **Frontend Polling (`frontend/src/lib/query-client.ts`)**:
   - Polling global `refetchInterval: 1000 * 10` configurado no React Query.

---

## 3. Seleção de Agentes e Responsabilidades

Com base nas definições contidas no diretório `agents/`:

| Agente | Arquivo de Definição | Responsabilidade no Plano |
|---|---|---|
| **Tech Lead / Architect** | `agents/tech-lead-architect.agent.md` | Desenho da arquitetura de namespaces, rooms, contratos de eventos e bridge do `EventEmitter`. |
| **Backend Developer** | `agents/backend-developer.agent.md` | Setup do servidor Socket.IO, middleware JWT, handlers do gateway e serviço de emissão. |
| **Frontend Developer** | `agents/frontend-developer.agent.md` | Criação do `SocketProvider`, hook `useSocketEvent`, `TypingIndicator`, `NotificationToast` e remoção do polling. |
| **Security Engineer** | `agents/security-engineer.agent.md` | Autenticação no handshake com JWT, autorização granular de rooms e prevenção de vazamento de dados. |
| **QA / Testing Engineer** | `agents/qa-testing-engineer.agent.md` | Validação de reconexão, cenários offline/online, testes de build e auditoria de fallback. |
| **DevOps / Infra Engineer** | `agents/devops-infra-engineer.agent.md` | Garantia de compatibilidade com Ngrok/WebSockets e preparação para escalabilidade horizontal (Redis Adapter). |

---

## 4. Arquitetura e Catálogo de Eventos

### 4.1 Estrutura de Namespaces e Rooms

```
┌─────────────────────────────────────────────────────────────┐
│                      Socket.IO Server                       │
├──────────────────────────────┬──────────────────────────────┤
│ Namespace `/` (Default)      │ Namespace `/notifications`   │
├──────────────────────────────┼──────────────────────────────┤
│ • Room: `conversation:{id}`  │ • Room: `agent:{agentId}`    │
│ • Room: `queue`              │                              │
│ • Room: `agents`             │                              │
└──────────────────────────────┴──────────────────────────────┘
```

### 4.2 Catálogo de Eventos

#### Servidor → Cliente (Emitidos pelo Backend)
- `conversation:updated` (Room: `queue`): Atualização de status/fila/contadores.
- `message:new` (Room: `conversation:{id}`): Nova mensagem na conversa.
- `message:read` (Room: `conversation:{id}`): Atualização de leitura de mensagens.
- `conversation:assumed` (Room: `conversation:{id}` + `queue`): Atendimento assumido por atendente.
- `conversation:closed` (Room: `conversation:{id}` + `queue`): Atendimento encerrado.
- `conversation:transferred` (Room: `conversation:{id}` + `queue`): Conversa transferida de departamento.
- `typing:update` (Room: `conversation:{id}`): Alteração no status de digitação.
- `agent:status` (Room: `agents`): Atualização de presença (Online/Offline).
- `notification:new` (Namespace: `/notifications`, Room: `agent:{id}`): Notificação push.

#### Cliente → Servidor (Emitidos pelo Frontend)
- `conversation:join` (`{ conversationId }`): Entrar na room da conversa.
- `conversation:leave` (`{ conversationId }`): Sair da room da conversa.
- `typing:start` (`{ conversationId }`): Início de digitação no composer.
- `typing:stop` (`{ conversationId }`): Término de digitação.
- `presence:heartbeat` (`{}`): Pulsar heartbeat a cada 30 segundos.

---

## 5. Plano de Execução em Fases

### Fase 1 — Infraestrutura Socket.IO no Backend
- Instalar dependência `socket.io` em `backend/package.json`.
- Criar `backend/src/shared/socket.ts` para inicialização do servidor Socket.IO encapsulado no servidor HTTP Express.
- Atualizar `backend/src/server.ts` para conectar o Socket.IO ao servidor HTTP.
- Criar middleware de verificação JWT (`socket.middleware.ts`) para o handshake do Socket.IO.
- Criar módulo `backend/src/modules/socket/` com `socket.gateway.ts` e `socket.service.ts`.

### Fase 2 — Bridge de Eventos e Presença no Backend
- Conectar o `EventEmitter` existente (`shared/events.ts`) ao serviço do Socket.IO para disparar eventos automaticamente para as rooms apropriadas.
- Enriquecer retornos em `conversations.service.ts` e `zapi.service.ts` para emitir payloads granulares.
- Implementar gerenciamento de presença baseado nas conexões/desconexões do socket, atualizando `isOnline` e emitindo `agent:status`.

### Fase 3 — Cliente Socket.IO no Frontend
- Instalar dependência `socket.io-client` em `frontend/package.json`.
- Criar `frontend/src/lib/socket-context.tsx` (`SocketProvider` e hook `useSocket`).
- Criar hook reutilizável `frontend/src/lib/use-socket-events.ts`.
- Modificar `frontend/src/lib/query-client.ts` para desativar o polling global (`refetchInterval`).

### Fase 4 — Integração nas Telas e UI/UX
- Atualizar `frontend/src/pages/conversation/index.tsx` para escutar eventos `message:new` e invalidar a query da conversa via React Query.
- Atualizar a lista de conversas para receber `conversation:updated` em tempo real.
- Criar componente `TypingIndicator.tsx` e integrar no chat.
- Criar componente `NotificationToast.tsx` para emissão de alertas sonoros e visuais.
- Atualizar lista de atendentes em `/admin/agents` e detalhamento para refletir o status `agent:status` em tempo real.

### Fase 5 — Deprecação, Testes e Limpeza
- Deprecar o endpoint SSE (`streamEvents` em `conversations.controller.ts`).
- Testar reconexão automática em quedas de rede e validar fallback seguro.
- Executar `npm run build` no backend e frontend para validar a tipagem e compilação sem erros.

---

## 6. Critérios de Aceite

- [ ] Novas mensagens recebidas via WhatsApp (Z-API) aparecem no chat instantaneamente sem refresh.
- [ ] A lista de conversas atualiza badges e status em tempo real.
- [ ] O status Online/Offline dos atendentes reflete fielmente a conexão ativa do socket.
- [ ] O indicador "digitando..." funciona de forma fluida no chat.
- [ ] Notificações visuais e sonoras funcionam ao receber novas conversas na fila ou mensagens.
- [ ] O polling HTTP a cada 10s é removido sem prejuízo à sincronização de dados.
- [ ] Token JWT é exigido no handshake e conexões inválidas são rejeitadas.
- [ ] Compilação com `npm run build` concluída com sucesso em ambos os módulos.

---

## 7. Arquivos Impactados

### Backend
- [MODIFY] `backend/package.json`
- [MODIFY] `backend/src/server.ts`
- [MODIFY] `backend/src/shared/events.ts`
- [NEW] `backend/src/shared/socket.ts`
- [NEW] `backend/src/modules/socket/socket.middleware.ts`
- [NEW] `backend/src/modules/socket/socket.gateway.ts`
- [NEW] `backend/src/modules/socket/socket.service.ts`
- [MODIFY] `backend/src/modules/conversations/conversations.service.ts`
- [MODIFY] `backend/src/modules/conversations/conversations.controller.ts`
- [MODIFY] `backend/src/modules/zapi/zapi.service.ts`

### Frontend
- [MODIFY] `frontend/package.json`
- [NEW] `frontend/src/lib/socket-context.tsx`
- [NEW] `frontend/src/lib/use-socket-events.ts`
- [MODIFY] `frontend/src/lib/query-client.ts`
- [MODIFY] `frontend/src/pages/conversation/index.tsx`
- [NEW] `frontend/src/pages/conversation/components/TypingIndicator.tsx`
- [NEW] `frontend/src/components/NotificationToast.tsx`
