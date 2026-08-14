# Plano 011 — Fila priorizada, notificações operacionais e filtro por data

> **Status:** Concluído
> **Data:** 2026-08-14
> **Execução:** concluída com migração, APIs paginadas, worker de lembretes, fila priorizada, filtros de período, sino persistente e validação integrada.
> **Repositório:** `C:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`
> **Escopo:** fila de atendimento, meus atendimentos, notificações, API de conversas, persistência e testes

## 1. Objetivo

Corrigir a experiência inicial da fila de atendimento para que o atendente veja primeiro as conversas que exigem ação, em vez de uma lista misturada com todos os atendimentos. A entrega também adicionará um sino de notificações para novos chamados, mensagens e conversas abertas há tempo excessivo, além de filtros de período nas telas de fila e “Meus atendimentos”.

O comportamento esperado é:

1. `/` abrir com o foco operacional **Na fila**, priorizando `QUEUED` e conversas não encerradas.
2. O atendente poder alternar explicitamente para **Todos**, **Na fila**, **Meus atendimentos**, **No bot** e **Encerradas** sem perder os filtros atuais.
3. Conversas `QUEUED` aparecerem antes de `IN_PROGRESS`, `BOT` e `CLOSED`, com ordenação por urgência e última atividade.
4. O sino mostrar notificações não lidas e alertas persistentes até serem lidos ou dispensados, sem criar notificações repetidas a cada polling/reconexão.
5. Conversas abertas sem encerramento gerarem um lembrete após um tempo configurável, sem alterar o status automaticamente.
6. O filtro de data permitir período predefinido e intervalo personalizado, usando uma única convenção de timezone documentada.

## 2. Embasamento e diagnóstico

Fontes consultadas:

- [`docs/PRD.md`](../docs/PRD.md): estados `BOT`, `QUEUED`, `IN_PROGRESS`, `CLOSED`, contadores, assumir e encerrar.
- [`docs/API.md`](../docs/API.md): contrato atual `GET /conversations` com filtros de status/departamento.
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md): separação Route → Controller → Service → Repository → Schema e React Query no frontend.
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md) e [`plans/plan-009-socketio-tempo-real-notificacoes-presenca.md`](./plan-009-socketio-tempo-real-notificacoes-presenca.md): EventEmitter/SSE existentes, eventos de fila e futura camada Socket.IO.
- [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md), [`docs/GUIDELINES.md`](../docs/GUIDELINES.md) e [`docs/paleta.md`](../docs/paleta.md): componentes shadcn, superfícies opacas, paleta operacional clara e acessibilidade.
- [`plans/plan-001-integracao-whatsapp-filas-rbac.md`](./plan-001-integracao-whatsapp-filas-rbac.md) e [`plans/plan-008-mensagens-editaveis-assumir-encerrar-shortcuts.md`](./plan-008-mensagens-editaveis-assumir-encerrar-shortcuts.md): jornada operacional, ações de assumir/encerrar e mensagens padrão.

O ponto de partida foi uma fila que iniciava em `ALL`, com filtros e paginação no cliente, sem contrato persistente de notificações ou filtro temporal no backend. A implementação agora usa `QUEUED` na fila e `IN_PROGRESS` em Meus atendimentos, mantendo a API REST como fonte de verdade; SSE/Socket.IO apenas aceleram a atualização e nunca são a única forma de recuperar notificações.

## 3. Decisões funcionais

### 3.1 Fila inicial e ordenação

- A entrada da rota `/` usará `status=QUEUED` por padrão, com um controle visível “Ver todos os atendimentos”. O estado poderá ser persistido na URL para que voltar/recarregar mantenha o contexto.
- A lista “Todos” usará a seguinte ordem determinística: `QUEUED` primeiro; depois `IN_PROGRESS`; depois `BOT`; por fim `CLOSED`. Dentro de `QUEUED`, ordenar por `unreadCount DESC`, `queuedAt ASC` (mais antiga primeiro), `lastActivityAt DESC` e ID. Nos demais grupos, usar `unreadCount DESC`, `lastActivityAt DESC` e ID.
- “Meus atendimentos” continuará restrito ao atendente logado, mas receberá a mesma ordenação e filtro de período.
- A ordenação não substitui filtros de status/departamento; ela somente evita que conversas que exigem ação fiquem abaixo de encerradas.
- Paginação deve ser introduzida no mesmo contrato (`page`, `limit`, `total`, `totalPages`), com limite inicial de **5 conversas por página** e máximo controlado pelo backend (até 50).

### 3.2 Sino e lembretes

- O sino ficará no header global, com badge de não lidas e painel/popover shadcn contendo notificações ordenadas da mais recente para a mais antiga.
- Tipos mínimos: `NEW_QUEUE_CONVERSATION`, `NEW_MESSAGE`, `ASSIGNED_CONVERSATION`, `UNRESOLVED_REMINDER`.
- Clicar em uma notificação marca-a como lida e navega para a conversa; “Marcar todas como lidas” apenas altera notificações, não mensagens da conversa.
- O lembrete de espera será criado somente para conversa `QUEUED` não encerrada, após `unresolvedReminderMinutes` (valor inicial recomendado: 30 minutos desde `queuedAt`), com no máximo um lembrete por conversa e janela de repetição configurável (recomendação: 30 minutos).
- `QUEUED` sem atendente gera alerta para os atendentes autorizados do departamento; `IN_PROGRESS` usa `lastActivityAt` para lembrete de continuidade somente ao responsável, com fallback para supervisores/admin quando não houver responsável ativo. `BOT` não gera alerta humano até chegar a `QUEUED`; `CLOSED` nunca alerta.
- Duplicidade será evitada por chave única lógica `(conversationId, type, occurrenceKey)` e por idempotência no consumidor de eventos.
- Notificações permanecem após reload e reconexão. O canal em tempo real apenas invalida/atualiza cache; o endpoint REST faz a recuperação inicial.
- Som/browser notification será opt-in, respeitando `Notification.permission`, preferência silenciosa e regras do navegador. O alerta visual funciona mesmo sem permissão de som.

### 3.3 Filtro de data

- Filtros predefinidos: `Hoje`, `Últimas 24h`, `Últimos 7 dias`, `Últimos 30 dias`, `Personalizado`.
- O intervalo será aplicado por `lastActivityAt` por padrão, pois é o campo que representa a necessidade de ação; a UI oferecerá “Data de criação” como alternativa quando o usuário precisar auditar volume.
- Contrato usa `from` inclusivo e `to` exclusivo em ISO-8601 UTC. A UI converte o início/fim do dia no timezone do navegador e mostra o período aplicado.
- Intervalo inválido, futuro não permitido para “até” e período acima do limite operacional (recomendação: 366 dias) retornam erro de validação por campo.
- O filtro de data combina com busca, status, departamento e “somente meus”; limpar filtros restaura somente o preset padrão, sem apagar a sessão do usuário.

## 4. Contrato de API proposto

### `GET /conversations`

Adicionar query params validados por Zod:

```text
status=QUEUED|IN_PROGRESS|BOT|CLOSED|ALL
departmentId=<uuid>
assignedAgentId=<uuid>|me
q=<texto>
dateField=lastActivityAt|createdAt
from=<ISO-8601 UTC inclusivo>
to=<ISO-8601 UTC exclusivo>
sort=operational|recent|oldest
page=<inteiro >= 1>
limit=<inteiro entre 5 e 100>
```

Resposta v2:

```json
{
  "items": [],
  "page": 1,
  "limit": 20,
  "total": 0,
  "totalPages": 0,
  "appliedFilters": {
    "status": "QUEUED",
    "dateField": "lastActivityAt",
    "from": null,
    "to": null
  }
}
```

Durante a compatibilidade, o backend poderá aceitar o formato legado de array quando nenhum parâmetro de paginação for enviado; novos clientes devem usar a resposta paginada explicitamente.

### Notificações

- `GET /notifications?unreadOnly=false&page=1&limit=30`
- `GET /notifications/unread-count`
- `POST /notifications/:id/read`
- `POST /notifications/read-all`
- `POST /notifications/:id/dismiss` (somente para alertas dispensáveis; não apaga auditoria)
- `PATCH /notification-preferences` para habilitar/desabilitar som, browser notification e lembretes, com limites de intervalo.

Cada item deve conter `id`, `type`, `title`, `body`, `conversationId`, `departmentId`, `createdAt`, `readAt`, `dismissedAt` e `dedupeKey`. Não incluir conteúdo sensível desnecessário nem tokens.

### Eventos em tempo real

Reutilizar `conversationEvents`/SSE enquanto Socket.IO do plano 009 não estiver ativo. Quando disponível, emitir `notification:new`, `notification:read`, `conversation:priority_changed` e `conversation:updated`. O payload deve conter apenas IDs, tipo, contadores e rótulos seguros; o cliente refaz a consulta para detalhes.

## 5. Modelo de dados e regras de persistência

O Tech Lead deverá escolher migração aditiva, sem remover campos existentes:

- `Conversation.queuedAt` indexado, preenchido sempre que a conversa entra em `QUEUED`, e `lastActivityAt` indexado, atualizado em entrada/saída, assumir, transferência e encerramento; se a base já possuir `updatedAt` confiável, criar backfill e documentar a equivalência.
- `Notification` com `agentId`/escopo de departamento, `type`, `conversationId` opcional, `dedupeKey`, `createdAt`, `readAt`, `dismissedAt`, `payload` limitado e índices `(agentId, readAt, createdAt)` e `(conversationId, type, dedupeKey)`.
- `NotificationPreference` por agente, com flags e `unresolvedReminderMinutes` limitado.
- Índices de conversa para `(status, departmentId, lastActivityAt)`, `(assignedAgentId, status, lastActivityAt)` e campos de data usados pelo filtro.
- Job periódico no backend (ou worker separado quando houver múltiplas instâncias) seleciona `queuedAt` para espera e `lastActivityAt` para continuidade, gravando lembretes idempotentes. Em escala horizontal, usar lock/advisory lock ou fila distribuída; não executar um job independente por instância sem coordenação.

## 6. Componentes frontend

### Fila e “Meus atendimentos”

- `useConversations(filters)` em custom hook React Query, com query key completa e cancelamento de requisição anterior.
- `QueueToolbar`: status, departamento, busca, período e ação “limpar filtros”.
- `QueueTabs`/`QueueFocus`: “Na fila”, “Todos”, “Meus”, “Encerradas”.
- `ConversationList` com estado de carregamento, erro, vazio e paginação.
- `ConversationRow` destacando não lidas, idade do chamado e prioridade operacional sem usar cor como único indicador.
- `DateRangeFilter` baseado em componentes shadcn `Select`, `Popover`, `Calendar`, `Button` e `Badge`; dropdown abre para baixo e não sobrepõe a lista.

### Notificações

- `NotificationBell` no `Shell`, com `aria-label`, badge e foco de teclado.
- `NotificationPopover` opaco, com estados vazio/carregando/erro, agrupamento opcional por hoje/anterior e ações de leitura.
- `UnresolvedConversationBanner` dentro da conversa e na fila, com CTA “Continuar atendimento” ou “Encerrar chamado”; nunca executar ação automaticamente.
- Preferências em popover/modal acessível; aplicar `ConfirmationDialog` somente quando uma mudança tiver impacto operacional.

Usar os componentes shadcn existentes e tokens do design system; superfícies brancas opacas, primary `#2D89C8`, warning âmbar e danger somente para encerramento/remoção. Não criar controles HTML crus quando houver componente shadcn equivalente.

## 7. Segurança, desempenho e observabilidade

- Todas as queries e mutations passam por autenticação, RBAC e Zod; escopo de departamento é aplicado no servidor, nunca apenas no frontend.
- `assignedAgentId=me` é resolvido pelo token autenticado, sem aceitar ID arbitrário para ampliar visibilidade.
- Limitar `q`, quantidade de dias, `limit`, frequência de “marcar tudo” e criação de preferências.
- Consultas usam índices e paginação; evitar carregar todas as mensagens para calcular `unreadCount` quando uma agregação Prisma for suficiente.
- Logs Pino registram `notificationId`, `conversationId`, tipo, resultado e duração, sem telefone completo ou conteúdo de mensagem.
- Métricas: tempo até primeiro atendimento, conversas `QUEUED` antigas, lembretes criados/suprimidos, notificações lidas, duplicidades, latência de atualização e falhas do job.
- Fallback quando SSE/Socket.IO desconectar: refetch controlado e ressincronização do contador; não duplicar toast ao reconectar.

## 8. Fases de execução

### Fase 0 — Contrato e decisões

- Confirmar com produto: status inicial `QUEUED`, campos `queuedAt`/`lastActivityAt`, limiar de 30 minutos e política de som/browser.
- Atualizar `docs/PRD.md`, `docs/API.md` e, se necessário, `docs/PRD_SOCKETIO.md` com histórias e contrato.

### Fase 1 — Banco e backend de conversas

- Migration aditiva para `queuedAt`, `lastActivityAt`, `Notification` e `NotificationPreference`.
- Backfill seguro e índices.
- Atualizar schemas, repository, service, controller e routes; manter o padrão modular.
- Implementar ordenação operacional, filtros temporais e paginação.

### Fase 2 — Serviço de notificações e lembretes

- Criar módulo `backend/src/modules/notifications/`.
- Implementar criação idempotente a partir de eventos de conversa.
- Implementar job/worker de lembretes com lock, retry e métricas.
- Integrar SSE agora e bridge Socket.IO quando o plano 009 for executado.

### Fase 3 — Fila e filtros frontend

- Alterar estado inicial da fila para `QUEUED`.
- Compor toolbar e filtros de período nos componentes shadcn.
- Adicionar paginação, contadores coerentes e ordenação visual.
- Aplicar o mesmo hook/toolbar em `/my-conversations`.

### Fase 4 — Sino e alertas de conversa aberta

- Integrar `NotificationBell` no shell.
- Implementar leitura, dispensar, marcar todas e navegação para conversa.
- Exibir banner contextual para chamado antigo e ações de continuidade/encerramento.
- Testar permissões de browser notification sem bloquear o uso da aplicação.

### Fase 5 — QA, segurança e rollout

- Executar testes unitários, integração PostgreSQL, API, concorrência do job, E2E e smoke visual.
- Fazer rollout com feature flags para `defaultQueueFocus`, `notifications` e `unresolvedReminders`.
- Monitorar duplicidades, latência, backlog `QUEUED` e taxa de leitura; rollback desativa flags sem remover dados.

## 9. Critérios de aceite

### Fila e data

- [x] Ao abrir `/`, o atendente vê `QUEUED` primeiro e não precisa rolar por encerradas para encontrar a fila.
- [x] “Ver todos” mostra todos os estados, mas mantém `QUEUED` no topo com ordenação determinística.
- [x] Status, departamento, busca, “somente meus” e período podem ser combinados e persistem ao recarregar.
- [x] Datas são convertidas corretamente para UTC, com início inclusivo/fim exclusivo e validação de intervalo.
- [x] Paginação não duplica nem perde conversas ao trocar filtros ou atualizar a lista.

### Notificações e lembretes

- [x] Novo chamado `QUEUED` gera uma notificação para o escopo correto uma única vez.
- [x] Nova mensagem não lida gera alerta sem duplicação durante polling, SSE ou reconexão.
- [x] Conversa aberta além do limiar gera lembrete persistente, no máximo uma vez por janela configurada.
- [x] O sino exibe contador, leitura individual, leitura em lote e navegação para a conversa.
- [x] Lembrete não fecha, assume ou altera conversa automaticamente; o atendente decide continuar ou encerrar.
- [x] Usuário sem permissão não recebe notificações de departamentos/conversas fora do escopo.

### Qualidade e segurança

- [x] API rejeita UUID, data, limite, intervalo e filtro desconhecidos com erro 400 padronizado.
- [x] Concorrência de dois workers não cria lembrete duplicado.
- [x] Falha de SSE/Socket.IO recupera estado via REST sem repetir alertas.
- [x] Conteúdo de mensagens não é renderizado como HTML nem gravado em logs de notificação.
- [x] Backend e frontend compilam; testes de regressão de assumir, transferir, ler e encerrar permanecem verdes.

## 10. Agentes locais recomendados e ordem

1. [`product-manager.agent.md`](../agents/product-manager.agent.md): fechar regra de foco inicial, limiar de lembrete, escopo e critérios de aceite.
2. [`tech-lead-architect.agent.md`](../agents/tech-lead-architect.agent.md): contrato, migration, índices, idempotência e integração com Socket.IO/SSE.
3. [`backend-developer.agent.md`](../agents/backend-developer.agent.md): módulo de conversas/notificações, job e APIs REST com Zod/Prisma.
4. [`frontend-developer.agent.md`](../agents/frontend-developer.agent.md): fila, filtros, sino, banner e integração React Query/shadcn.
5. [`security-engineer.agent.md`](../agents/security-engineer.agent.md): escopo RBAC, exposição de dados, abuso de notificações e permissões do navegador.
6. [`qa-testing-engineer.agent.md`](../agents/qa-testing-engineer.agent.md): testes de contrato, concorrência, E2E, timezone, reconexão e regressão da jornada.
7. [`devops-infra-engineer.agent.md`](../agents/devops-infra-engineer.agent.md): migrações, scheduler/worker, flags, health checks e rollout/rollback.

## 11. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Alterar o filtro inicial esconder chamados em andamento | Alto | Controle “Ver todos”, estado na URL e smoke com todos os status |
| Lembretes duplicados em múltiplas instâncias | Alto | `dedupeKey`, índice único e lock distribuído |
| Datas divergentes por timezone | Alto | ISO UTC, `from` inclusivo/`to` exclusivo e testes em `America/Sao_Paulo`/UTC |
| Socket e polling gerarem o mesmo alerta | Médio | REST como fonte de verdade e deduplicação por `dedupeKey` |
| Notificação expor conversa fora do departamento | Alto | Resolver escopo no backend e testar RBAC por agente |
| Volume crescente degradar a fila | Médio | Índices, agregações, paginação e limite de período |
| Lembrete virar ruído operacional | Médio | Preferências, janela de repetição, marcar como lido/dispensar e métricas |

## 12. Rollback

O rollout deve ser controlado por flags. Em caso de regressão, desativar notificações/lembretes e retornar o foco inicial para `ALL` sem remover registros. A migration é aditiva e pode permanecer instalada; a remoção de tabelas/campos só deve ocorrer após janela de estabilidade e plano específico.
