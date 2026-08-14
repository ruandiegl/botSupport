# Plan 013 — Encerramento Automático por Inatividade e Unificação de Status

**PRD de Referência**: `docs/PRD_AUTO_CLOSE_AND_UNIFIED_STATUS.md`  
**Agentes Envolvidos**: tech-lead-architect, backend-developer, frontend-developer  
**Data**: 2026-08-14

---

## Objetivo

1. Unificar os status `BOT` e `QUEUED` em um único status `OPEN` ("Em Aberto") — eliminando a confusão de ter dois status que representam o mesmo estado de espera.
2. Implementar um worker de background que:
   - Envia aviso automático no WhatsApp após 30 min de inatividade do cliente.
   - Encerra automaticamente o chamado após mais 15 min sem resposta.
   - Reseta o aviso se o cliente responder.

---

## Escopo de Mudanças

### Backend
- `schema.prisma`: Adicionar `warningSentAt` e `closeReason` ao modelo `Conversation`. Mudar default de `BOT` para `OPEN`.
- `conversations.repository.ts`: Atualizar queries com status `OPEN` no lugar de `BOT`/`QUEUED`. Adicionar métodos para inactivity worker.
- `conversations.service.ts`: Atualizar referências de status. Resetar `warningSentAt` ao receber mensagem.
- `conversations.schemas.ts`: Adicionar `OPEN` ao enum e remover `BOT`/`QUEUED` do schema de query.
- `inactivity.worker.ts` (NOVO): Rotina de background com verificação periódica.
- `app.ts`: Inicializar o novo worker.
- `zapi` module: Utilizar `sendText` para aviso e confirmação de encerramento.

### Migração
- Migration Prisma para renomear `BOT` e `QUEUED` para `OPEN` nos dados existentes.

### Frontend
- `queue/index.tsx`: Atualizar statusLabels, filtro padrão e MetricCards.
- `ConversationRow`: Exibir badge `OPEN` como "Em Aberto".

---

## Status: EXECUTADO
