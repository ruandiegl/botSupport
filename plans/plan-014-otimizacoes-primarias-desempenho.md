# Plano 014 — Otimizações primárias de desempenho da fila e das conversas

> **Status:** Em execução — F1/F2/F3 implementados; F0/F5/F6 dependem de homologação e observabilidade  
> **Data:** 2026-08-14  
> **Repositório:** `C:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`  
> **Escopo:** fila de atendimento, detalhe da conversa, eventos Socket.IO, consultas PostgreSQL e webhook Z-API  
> **Estratégia:** ganho incremental, compatível com o banco atual e com rollback por feature flag

## 1. Objetivo

Reduzir o tempo percebido para abrir a fila, carregar uma conversa e exibir mensagens recebidas sem introduzir ainda uma arquitetura de alta complexidade. A primeira etapa deve atacar consultas e refetches redundantes, que são riscos maiores no momento do que falta de CPU ou memória.

Resultados esperados:

1. A fila renderiza somente o resumo necessário para as cinco conversas da página, sem carregar todo o histórico e todas as mídias de cada item.
2. Uma mensagem recebida atualiza a conversa aberta e a fila por cache/evento, evitando várias requisições idênticas.
3. O detalhe da conversa carrega mensagens recentes em páginas/cursor e busca mensagens antigas somente quando solicitado.
4. Os contadores operacionais continuam corretos, mas deixam de disparar consultas independentes e listas completas sem necessidade.
5. O banco recebe apenas índices comprovadamente necessários, com migração aditiva e reversível operacionalmente.
6. A integração Z-API mantém resposta rápida do webhook e não fica bloqueada por renderização, histórico ou chamadas de leitura.

## 2. O que não faz parte desta etapa

Esta entrega não deve:

- trocar o PostgreSQL por outro banco;
- introduzir Redis, Redis Adapter, múltiplas réplicas ou um read-model distribuído;
- reescrever o fluxo de atendimento, RBAC, mídia ou o motor do bot;
- remover o contrato legado de `GET /conversations` sem período de compatibilidade;
- alterar ou apagar dados históricos para obter desempenho;
- mover mensagens para um novo armazenamento antes de medir o benefício;
- adicionar polling agressivo para compensar eventos Socket.IO.

Esses itens ficam registrados como evolução robusta na seção 12.

## 3. Referências e diagnóstico atual

### 3.1 Documentação consultada

- [`docs/README.md`](../docs/README.md): índice e regras de documentação do projeto.
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md): separação Route → Controller → Service → Repository, Prisma/PostgreSQL e React Query.
- [`docs/API.md`](../docs/API.md): contratos REST, filtros, paginação e regras de autorização.
- [`docs/PRD.md`](../docs/PRD.md): estados, fila, mensagens, assumir, transferir e encerrar.
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md): rooms, eventos, reconexão e fallback HTTP.
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md) e [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md): composição frontend e comportamento visual.
- [`plans/plan-009-socketio-tempo-real-notificacoes-presenca.md`](./plan-009-socketio-tempo-real-notificacoes-presenca.md): tempo real e invalidação de cache.
- [`plans/plan-011-fila-priorizada-notificacoes-filtro-data.md`](./plan-011-fila-priorizada-notificacoes-filtro-data.md): fila paginada, filtros, notificações e ordenação operacional.
- [`plans/plan-012-ingestao-exibicao-midia-zapi-retencao-30-dias.md`](./plan-012-ingestao-exibicao-midia-zapi-retencao-30-dias.md): mídia, expiração e payloads da Z-API.
- [`plans/plan-013-auto-close-unified-status.md`](./plan-013-auto-close-unified-status.md): status e worker de inatividade; a implementação deve respeitar o contrato de status atualmente publicado.
- [`agents/README.md`](../agents/README.md) e os perfis especializados de arquitetura, backend, frontend, QA, DevOps e segurança.

### 3.2 Evidências observadas

Os dados de operação disponíveis no Railway não indicam saturação da infraestrutura: CPU e memória do backend e do PostgreSQL permanecem baixos. Nos logs recentes, as chamadas individuais de conversas têm latência moderada, mas aparecem repetidas em sequência para a mesma interação. Portanto, o primeiro investimento deve ser em quantidade e tamanho das consultas, não em aumentar a VPS.

No código atual foram identificados os seguintes pontos de alto retorno:

- `conversations.service.list` busca os IDs e depois chama `formatConversation` para cada item; esse método consulta novamente a conversa completa. Isso cria um padrão N+1.
- Cada item da fila pode carregar todas as mensagens e metadados de mídia, embora a linha precise apenas de uma prévia, horário, status e contagem de não lidas.
- `countOperational` executa vários `count` separados em cada carregamento paginado.
- O `Shell` mantém uma consulta adicional de `/conversations` para o badge da navegação, enquanto a página da fila já faz uma consulta paginada.
- Eventos `message:new` e `conversation:updated` podem causar duas invalidações para o mesmo evento, levando a refetches duplicados no chat.
- A página do chat invalida o detalhe inteiro ao receber mensagem, em vez de atualizar somente a mensagem e o resumo afetado.
- Busca textual com `contains` sobre mensagens pode resultar em varredura completa quando o volume crescer.
- A consulta de detalhe carrega histórico integral; conversas longas tornam o primeiro paint progressivamente mais caro.

## 4. Princípios de implementação

1. **Medir antes e depois:** toda otimização deve ter contagem de queries, latência p50/p95 e tamanho de resposta comparáveis.
2. **Leitura especializada:** fila e detalhe não precisam do mesmo DTO. Usar `ConversationSummary` para a fila e `ConversationDetail` para o chat.
3. **Compatibilidade:** preservar o endpoint atual durante a transição; novos campos podem ser aditivos e o frontend deve aceitar a resposta paginada e o legado.
4. **Servidor como fonte de verdade:** filtros, RBAC, unread e paginação continuam no backend; o cache do frontend apenas acelera a percepção.
5. **Eventos idempotentes:** um evento repetido ou uma reconexão não pode duplicar mensagem, contador ou toast.
6. **Banco intacto por padrão:** qualquer alteração de schema é aditiva, indexada em horário de baixo uso e validada com `EXPLAIN` antes de ser aplicada.
7. **Mídia sob demanda:** a lista não baixa nem inclui binários; o detalhe só solicita acesso quando o atendente visualiza/reproduz a mídia.

## 5. Escopo funcional e técnico da primeira entrega

### F0 — Baseline e instrumentação segura

Antes de alterar consultas, registrar em homologação e em uma janela controlada de produção:

- latência p50/p95/p99 de `GET /conversations`, `GET /conversations/:id`, mensagens e endpoints de notificações;
- quantidade de queries Prisma/SQL por requisição;
- tamanho do JSON e quantidade de mensagens retornadas;
- tempo entre `message:new` no servidor e a mensagem visível no navegador;
- quantidade de GETs disparados por um único webhook/evento;
- taxa de erro, reconexão Socket.IO e fallback HTTP;
- planos `EXPLAIN (ANALYZE, BUFFERS)` das consultas de fila, detalhe e busca.

Os logs devem conter request/event id e duração, sem conteúdo de mensagem, tokens, URLs temporárias ou PII desnecessária. A instrumentação deve ser desligável por ambiente.

### F1 — Resumo da fila sem N+1

**Backend**

- Criar uma projeção/DTO `ConversationSummary` com apenas: `id`, contato mínimo, status, departamento, responsável, `lastMessage` resumida, `unreadCount`, `queuedAt`, `lastActivityAt`, `startedAt`, `closedAt` e referência de mídia sem binário.
- Alterar `conversations.repository.findMany` para buscar a página diretamente nessa projeção, evitando buscar IDs e depois executar `findById` para cada linha.
- Calcular a prévia e não lidas em consulta agregada ou subconsulta limitada. Não incluir `messages` completo no retorno da fila.
- Consolidar `countOperational` em uma consulta agregada/condicional ou em uma consulta de resumo com cache curto. O resultado deve continuar separado da lista paginada para que a página cinco não distorça os cards.
- Manter filtros, RBAC por departamento/atendente, ordenação operacional e envelope de paginação existentes.

**Frontend**

- Usar o resumo diretamente em `use-queue` e nos cards da fila.
- Remover a consulta completa extra do `Shell` para o badge da navegação; consumir o resumo/contagem já disponível ou um endpoint de contagem leve.
- Manter estado de loading/erro/empty sem bloquear a renderização do shell.

**Critério:** o número de queries da listagem não cresce com a quantidade de linhas (`limit=5` continua limitado), e nenhuma linha da fila carrega o histórico integral.

### F2 — Paginação do histórico do chat

Adicionar uma leitura específica para mensagens, sem alterar a semântica de envio:

```text
GET /conversations/:conversationId/messages?limit=50&before=<cursor>
```

- Primeira resposta traz as mensagens mais recentes, em ordem estável para renderização.
- `before` usa cursor opaco baseado em `createdAt` + `id`, evitando duplicidade quando duas mensagens têm o mesmo horário.
- O frontend mostra ação “carregar mensagens anteriores” e preserva scroll ao inserir o lote antigo.
- O detalhe da conversa carrega metadados separados do lote de mensagens.
- Acesso à mídia permanece protegido por sessão/RBAC e lazy; não alterar a retenção de 30 dias.
- O contrato legado do detalhe fica disponível temporariamente para clientes antigos, com feature flag para o novo leitor.

### F3 — Eventos e cache sem refetch duplicado

- Definir `messageId`/`eventId` como chave de deduplicação no cliente.
- Escolher um evento canônico para atualizar a mensagem (`message:new`) e um evento canônico para atualizar a linha da fila (`conversation:updated`); o mesmo payload não deve provocar duas buscas completas.
- Ao receber `message:new`, inserir/atualizar a mensagem no cache do chat e atualizar o `ConversationSummary` relacionado quando a informação estiver no payload.
- Invalidar a query somente quando faltar payload, houver evento fora de ordem, erro de normalização ou reconexão com possível lacuna.
- Coalescer eventos da mesma conversa em uma janela curta, por exemplo 50–150 ms, antes de atualizar a lista.
- Após reconexão Socket.IO, executar uma única reconciliação HTTP por recurso, em vez de uma requisição por evento acumulado.
- No sino, usar o payload mínimo de `notification:new` para inserir o item e consultar unread-count apenas quando necessário; evitar refetch simultâneo de lista e contador para o mesmo evento.
- Preservar o comportamento recente: clicar ou fechar uma notificação remove o item da lista sem reaparecer após reload.

### F4 — Consultas e índices com baixo risco

1. Reexecutar `EXPLAIN` após F1 e somente adicionar índices que tenham ganho mensurável.
2. Avaliar índice `Message(conversation_id, created_at DESC)` para o cursor do histórico; verificar se o índice existente de leitura já cobre a consulta antes de criar outro.
3. Confirmar cobertura dos índices de `Conversation` para status, departamento, responsável, `queuedAt` e `lastActivityAt`; não criar duplicatas.
4. Limitar a busca textual padrão a nome/telefone/prévia da última mensagem. Busca em todo o histórico deve ser uma opção explícita, com limite e paginação.
5. Se a busca histórica se tornar necessária, avaliar `pg_trgm` em homologação e medir custo de escrita antes de uma migração.
6. Garantir ordenação determinística com campo de desempate `id`.

Qualquer migration deve ser aditiva, ter nome explícito, executar sem apagar dados e possuir instrução de rollback operacional (remover somente o índice criado, se necessário).

### F5 — Caminho rápido do webhook Z-API

- Confirmar que a transação que grava a mensagem termina antes da emissão de `message:new`.
- Medir separadamente persistência, emissão Socket.IO, automações do fluxo e chamadas externas da Z-API.
- Se o p95 do webhook ultrapassar o orçamento definido, mover apenas o trabalho não essencial (resposta automática, auditoria ou atualização secundária) para a fila/outbox já prevista na arquitetura, mantendo a confirmação HTTP rápida.
- Não aguardar download de mídia nem leitura do histórico para responder ao webhook.
- Registrar falhas para retry sem emitir duas mensagens para o mesmo `messageId`.

## 6. Contratos de API a preservar/adicionar

### `GET /conversations`

Preservar filtros atuais, paginação, `counts` e autorização. O item da lista passa a ser o resumo, e não o detalhe completo. Durante a transição:

- clientes legados que esperam array continuam recebendo o formato compatível por flag/versão;
- novos clientes usam `{ items, meta/pagination, counts }`;
- `limit` padrão permanece 5 na fila, com máximo validado pelo backend;
- `q`, status, departamento, responsável e período continuam sendo aplicados no banco.

### `GET /conversations/:id`

Retornar metadados da conversa e uma janela inicial limitada. O campo de paginação deve indicar se existem mensagens anteriores, sem expor cursor interno.

### `GET /conversations/:id/messages`

Contrato novo, autenticado e validado por Zod:

```json
{
  "items": [],
  "pagination": {
    "limit": 50,
    "hasPrevious": true,
    "previousCursor": "..."
  }
}
```

O cursor é opaco, expira conforme a política da API e nunca contém token da Z-API ou URL de mídia.

## 7. Decomposição por arquivos

### Backend

- `backend/src/modules/conversations/conversations.repository.ts`: projeção da fila, agregação, paginação de mensagens e filtros.
- `backend/src/modules/conversations/conversations.service.ts`: DTOs summary/detail, compatibilidade e regras de acesso.
- `backend/src/modules/conversations/conversations.controller.ts`: endpoint de mensagens e respostas paginadas.
- `backend/src/modules/conversations/conversations.schemas.ts`: Zod para limit/cursor/filtros.
- `backend/src/modules/zapi/zapi.service.ts`: ordem persistência → evento e idempotência/event timing.
- `backend/src/shared/events.ts` e adapter Socket.IO: eventos canônicos e coalescência.
- `backend/prisma/schema.prisma` e nova migration somente se F4 comprovar necessidade.
- `backend/test/`: contratos, contagem de queries, cursor, deduplicação e autorização.

### Frontend

- `frontend/src/pages/queue/hooks/use-queue.ts`: consumo do resumo e reconciliação de eventos.
- `frontend/src/pages/queue/index.tsx`: métricas independentes da página, sem refetch extra.
- `frontend/src/app/Shell.tsx`: remover lista completa duplicada e invalidar somente recursos afetados.
- `frontend/src/pages/conversation/hooks/use-conversation.ts`: detalhe + mensagens paginadas.
- `frontend/src/pages/conversation/index.tsx`: append/upsert por `messageId`, scroll e carregamento anterior.
- `frontend/src/hooks/use-notifications.ts`: reconciliação única de lista/unread-count.
- `frontend/src/lib/query-client.ts`: políticas específicas por recurso, sem polling global agressivo.
- `frontend/src/types/index.ts`: `ConversationSummary`, `MessagePage` e payloads de eventos.

### Documentação

- Atualizar `docs/API.md` com os novos DTOs e cursor.
- Atualizar `docs/ARCHITECTURE.md` com a separação summary/detail e política de cache.
- Atualizar `docs/PRD_SOCKETIO.md` com eventos canônicos, deduplicação e reconciliação.
- Adicionar métricas e rollback ao runbook operacional relacionado às migrações.

## 8. Plano de testes

### Backend/API

- Listagem retorna somente os campos do resumo e mantém RBAC por departamento.
- Quantidade de queries da lista não cresce com `limit`.
- `counts` permanece correto quando a página está vazia, filtrada ou em outro status.
- Busca, período, status e responsável combinam sem vazamento de conversas.
- Cursor retorna lotes sem repetição ou lacunas e rejeita cursor inválido.
- Mensagem duplicada por `messageId` não duplica cache nem registro.
- Evento emitido somente após persistência; falha externa não cria estado falso.
- Compatibilidade do endpoint legado continua funcionando durante a flag.

### Frontend/E2E

- Abrir fila faz no máximo uma consulta de lista e uma consulta de contadores/recursos auxiliares necessários.
- Clicar em uma conversa carrega apenas a janela inicial; “mensagens anteriores” preserva scroll.
- Uma mensagem recebida aparece sem duas requisições idênticas.
- Reconexão faz uma reconciliação e não duplica mensagens/notificações.
- Cards operacionais continuam fixos em relação ao filtro da lista.
- Mídia permanece sob demanda e mensagens expiradas continuam com o estado correto.
- Loading, retry, erro 401/403 e empty state permanecem acessíveis.

### Carga controlada

Em homologação, usar uma massa sintética que contenha pelo menos 10.000 conversas e 100 mensagens por conversa, sem dados reais. Medir com 5 atendentes concorrentes:

- fila com filtros e página 1;
- abertura de conversa longa;
- cinco mensagens recebidas em sequência;
- reconexão do socket;
- busca por nome/telefone e busca histórica, se habilitada.

## 9. Metas de aceite

As metas abaixo são para homologação com a massa descrita e devem ser comparadas ao baseline F0:

- `GET /conversations` p95 ≤ 250 ms e resposta sem histórico integral;
- abertura inicial do detalhe p95 ≤ 300 ms e no máximo 50 mensagens;
- evento recebido → mensagem visível p95 ≤ 500 ms com Socket.IO saudável;
- no máximo uma reconciliação por evento lógico e nenhuma consulta N+1 na fila;
- fila inicial com cinco itens e sem chamadas duplicadas consecutivas para a mesma chave;
- erro 5xx, duplicidade de mensagens e perda de unread não aumentam em relação ao baseline;
- nenhuma alteração destrutiva ou perda de mensagens/mídia.

Se as metas não forem atingidas, manter a feature flag desligada e registrar o plano de evolução, sem aumentar infraestrutura por tentativa.

## 10. Rollout e rollback

Flags recomendadas:

- `CONVERSATION_SUMMARY_READ` — projeção otimizada da fila;
- `MESSAGE_CURSOR_READ` — histórico paginado;
- `SOCKET_CACHE_PATCH` — atualização direta de cache;
- `CONVERSATION_SEARCH_LIMITED` — busca sem varredura do histórico completo.

Ordem:

1. instrumentar e medir baseline;
2. publicar backend compatível com as flags desligadas;
3. ativar summary read para homologação;
4. ativar paginação do histórico;
5. ativar patch de cache e observar reconexões;
6. aplicar índices somente após `EXPLAIN` e janela de baixo uso;
7. ativar gradualmente para usuários internos e então para toda a operação.

Rollback:

- desligar a flag correspondente e voltar ao leitor anterior;
- manter migrations de índice, se não houver degradação, ou removê-las somente com procedimento aprovado;
- não reverter dados, mensagens, status ou mídias;
- preservar logs de request/event id para diagnóstico.

## 11. Agentes e ordem recomendada

Os papéis seguem [`agents/README.md`](../agents/README.md). Esta seção é uma divisão de responsabilidade para execução futura; não autoriza mudanças paralelas sem revisão do responsável técnico.

1. **Tech Lead & Arquiteto** — validar DTOs summary/detail, compatibilidade, invariantes de eventos e plano de migration.
2. **Desenvolvedor Backend** — repository sem N+1, endpoint de mensagens, Zod, eventos e observabilidade.
3. **Desenvolvedor Frontend** — React Query, atualização de cache, paginação visual, scroll e estados de erro.
4. **QA & Testes** — contratos, contagem de queries, carga, reconexão e regressão de mídia/notificações.
5. **Engenheiro de Segurança** — escopo RBAC, cursor, busca, logs e ausência de tokens/PII.
6. **DevOps & Infra** — métricas Railway, janela de migration, build, flags e rollback.

Sequência: Tech Lead → Backend/Frontend → QA + Segurança → DevOps/rollout.

## 12. Evolução robusta posterior

Depois de validar os ganhos primários, considerar:

- Redis Adapter/rooms distribuídas para múltiplas réplicas;
- outbox transacional e workers dedicados para eventos e automações;
- read model/materialized view para métricas e fila em escala;
- cursor pagination em todos os recursos, incluindo notificações;
- busca PostgreSQL com `pg_trgm`/full-text e índice de prévia;
- compressão/ETag e cache HTTP para dados estáveis;
- tracing distribuído e SLOs por jornada;
- testes de carga contínuos no pipeline;
- autoscaling baseado em latência e fila de jobs, não apenas CPU.

Essas decisões só devem ser tomadas após o baseline mostrar que a otimização de consultas, payloads e eventos não é suficiente.

## 13. Definição de pronto

- [ ] Baseline F0 anexado ao registro de homologação.
- [x] Fila usa resumo e não executa N+1.
- [x] Histórico usa cursor/limite sem quebrar mídia, unread ou scroll.
- [x] Eventos são deduplicados e não provocam refetch duplo no fluxo principal.
- [x] Contratos/API e documentação de arquitetura atualizados; adendo criado em `docs/PERFORMANCE_READ_MODEL.md`.
- [ ] Testes backend/frontend/E2E e carga executados.
- [ ] RBAC, logs e segurança revisados.
- [ ] Metas de aceite comparadas ao baseline.
- [ ] Rollout por flag e procedimento de rollback testados.
