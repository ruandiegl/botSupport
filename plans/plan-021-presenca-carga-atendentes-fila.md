# Plano 021 — Presença e carga dos atendentes na fila

**Status:** Concluído  
**Data:** 19/08/2026  
**Escopo:** duas melhorias operacionais na fila de atendimento:

1. substituir o cartão “Plantão de suporte” por uma visão de presença da equipe, com indicador verde para online e vermelho para offline;
2. exibir, acima do “Pulso da operação”, os atendentes e os chamados que estão sob atendimento naquele momento.

Este plano foi elaborado a partir de `docs/README.md`, `docs/PRD.md`, `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, `docs/paleta.md`, `docs/PRD_SOCKETIO.md` e `docs/PERFORMANCE_READ_MODEL.md`, seguindo a matriz de responsabilidades de `agents/README.md`.

## 1. Diagnóstico do estado atual

- `Agent.isOnline` já existe no banco e é atualizado pelo Socket.IO ao conectar/desconectar, com debounce de cinco segundos.
- A fila já consulta `/agents`, mas o cartão atual apenas concatena os nomes dos agentes online. Não existe uma resposta agregada com os chamados assumidos por agente.
- `Conversation.assignedAgentId`, `status`, `lastActivityAt`, `unreadCount`, contato e departamento já estão disponíveis e possuem índice para consulta por atendente/status/atividade.
- O “Pulso da operação” mostra apenas totais por status. Ele não identifica quem está atendendo cada conversa.
- Eventos `agent:status` e `conversation:updated` já são distribuídos pelo Socket.IO e podem invalidar a nova consulta sem criar polling por atendente.
- A API `/agents` é administrativa e não deve ser ampliada com histórico, mensagens ou mídia de conversas. A carga deve ser um contrato operacional separado e leve.

## 2. Decisões de produto

### 2.1 Presença

- A fonte de verdade inicial será `Agent.isOnline`, controlada pelo handshake e desconexão do Socket.IO.
- `true` será apresentado com bolinha verde e texto “Online”; `false`, com bolinha vermelha e texto “Offline”. O estado offline significa ausência de conexão ativa, não necessariamente folga ou indisponibilidade de escala.
- Apenas agentes ativos (`isActive = true`) entram na lista. Online aparece primeiro; offline permanece visível para que supervisão e administração tenham uma visão completa da equipe.
- O nome do cartão será **Atendentes online**, mesmo contendo a equipe offline, com o resumo “X online · Y offline”. O cartão antigo de plantão será removido para não duplicar informação.

### 2.2 Carga de atendimento

- Um chamado é considerado “em atendimento” quando `status = IN_PROGRESS` e `assignedAgentId` está preenchido.
- Chamados `OPEN` sem responsável, `BOT` (quando existir em dados legados) e `CLOSED` não aparecem como assumidos.
- Cada atendente terá contador e lista compacta de seus chamados ativos, ordenados por `lastActivityAt` descendente, depois `startedAt` ascendente.
- A linha do chamado exibirá somente dados operacionais mínimos: nome do contato, departamento, status, horário da última atividade e quantidade de não lidas. Não incluir mensagens, mídia, URL temporária, token ou telefone completo.
- O nome do contato e o chamado serão clicáveis e abrirão `/conversation/:id`, respeitando o escopo já aplicado ao detalhe da conversa.
- Quando não houver chamados, mostrar “Nenhum chamado assumido”. Na fila, o resumo exibe no máximo quatro atendentes ativos e informa a quantidade total, com ação “Ver todos” para `/admin/agents`. A página de Atendentes oferece a grade completa, expansão dos chamados e contagem na tabela administrativa.

### 2.3 Permissões e escopo

- O painel de equipe completa ficará disponível para `ADMIN` e `SUPERVISOR` com `queue:view_all`.
- Administrador verá todos os departamentos. Supervisor verá somente agentes e chamados do próprio departamento, salvo uma permissão de escopo mais amplo já existente.
- Agentes comuns não receberão a carga de outros atendentes. O frontend pode ocultar o cartão, mas a proteção obrigatória será no endpoint e no service.
- Nenhum `agentId` enviado pelo cliente poderá ampliar o escopo; departamento e função serão resolvidos pelo JWT.

## 3. Contrato de API proposto

### `GET /agents/workload`

Rota autenticada, com `queue:view_all`, destinada à fila. Query opcional:

- `departmentId`: somente quando permitido pelo escopo do usuário;
- `includeOffline`: booleano, padrão `true`;
- `limit`: máximo de agentes retornados, com limite seguro definido pelo schema (por exemplo, 100).

Resposta:

```json
{
  "items": [
    {
      "id": "agent-uuid",
      "name": "Administrador Sistema",
      "role": "ADMIN",
      "departmentId": "department-uuid",
      "departmentName": "Suporte Geral",
      "isOnline": true,
      "isActive": true,
      "activeConversationCount": 2,
      "conversations": [
        {
          "id": "conversation-uuid",
          "contactName": "João Marcos",
          "departmentName": "Suporte Geral",
          "status": "IN_PROGRESS",
          "unreadCount": 1,
          "lastActivityAt": "2026-08-19T15:10:00.000Z",
          "startedAt": "2026-08-19T14:45:00.000Z"
        }
      ]
    }
  ],
  "totals": {
    "agents": 4,
    "online": 3,
    "offline": 1,
    "activeConversations": 5
  },
  "generatedAt": "2026-08-19T15:10:01.000Z"
}
```

O contrato deverá ser documentado em `docs/API.md`. Erros esperados: `400` para query inválida, `401` sem sessão, `403` sem `queue:view_all`/escopo, `500` para falha inesperada. A resposta não deve retornar a lista integral de mensagens.

## 4. Arquitetura e implementação

### Fase 0 — Contrato e critérios

**Responsável principal:** Product Manager (`agents/product-manager.agent.md`)  
**Revisão:** Tech Lead (`agents/tech-lead-architect.agent.md`)

- Registrar as histórias de usuário e os critérios deste plano em `docs/PRD.md`.
- Confirmar com operação se supervisor pode ver todos os departamentos ou somente o departamento associado ao perfil.
- Confirmar que “assumido” significa exclusivamente `IN_PROGRESS + assignedAgentId`, preservando a distinção de fila aberta.
- Definir limite visual e comportamento de expansão no desktop/mobile.

### Fase 1 — Repository, service e endpoint

**Responsável:** Backend Developer (`agents/backend-developer.agent.md`)

- Criar schemas Zod em `backend/src/modules/agents/agents.schemas.ts` para query e resposta interna.
- Adicionar `findWorkload(scope)` em `agents.repository.ts`, usando Prisma com seleção explícita:
  - agentes ativos, ordenados por `isOnline DESC, name ASC`;
  - relação `conversations` filtrada por `status = IN_PROGRESS`, `assignedAgentId` não nulo e escopo de departamento;
  - seleção somente dos campos operacionais;
  - sem N+1: uma consulta relacional ou transação com agregação controlada.
- Adicionar regra de escopo no `agents.service.ts`; não confiar em `departmentId` enviado no query.
- Criar controller/rota `GET /agents/workload` ou módulo operacional equivalente sem misturar a rota administrativa de CRUD.
- Emitir JSON estável com `items`, `totals` e `generatedAt`.
- Atualizar `docs/API.md` com o contrato, permissões, campos omitidos e erros.
- Avaliar índice adicional apenas se o plano de execução demonstrar necessidade. O índice existente `(assignedAgentId, status, lastActivityAt)` deve ser reutilizado; qualquer migration nova será aditiva e reversível.

### Fase 2 — Presença Socket.IO e invalidação

**Responsáveis:** Backend Developer + Tech Lead

- Manter `agent:status` como evento mínimo `{ agentId, isOnline }`, sem dados pessoais além do nome já necessário à UI.
- Garantir que conexão, reconexão e desconexão com debounce atualizem `isOnline` de forma idempotente.
- Nos eventos `conversation:updated`, `conversation:assumed`, `conversation:closed` e `conversation:transferred`, incluir contexto mínimo de `assignedAgentId` quando já disponível, sem expor conteúdo.
- No frontend, invalidar `['agent-workload']` em mudanças de presença, atribuição, transferência e encerramento. Usar debounce curto para agrupar eventos simultâneos.
- Após reconexão do socket, executar uma única reconciliação REST; não criar um polling independente por atendente.
- Se a operação exigir distinção entre “offline” e “última atividade”, propor em separado um campo aditivo `lastSeenAt`; não alterar o banco nesta entrega sem evidência de necessidade.

### Fase 3 — UI da fila

**Responsável:** Frontend Developer (`agents/frontend-developer.agent.md`)

- Criar `frontend/src/hooks/use-agent-workload.ts` isolando React Query e o contrato REST para reutilização entre fila e administração.
- Criar `AgentWorkloadCard` e `AgentWorkloadRow` em `frontend/src/pages/queue/components/`.
- Substituir o cartão “Plantão de suporte” por “Atendentes online”, posicionado **acima** do “Pulso da operação” no `right-stack`.
- Limitar o resumo da fila a quatro atendentes e adicionar rodapé com total e navegação “Ver todos”.
- Reutilizar o cartão em modo de grade na página `/admin/agents`, exibindo todos os atendentes permitidos pelo escopo e a contagem de chamados ativos na tabela.
- Cada linha deverá usar componentes shadcn existentes (`Card`, `Badge`, `Avatar`/composição equivalente, `Collapsible`, `ScrollArea`, `Skeleton`) e Lucide:
  - bolinha verde/vermelha com texto acessível `Online`/`Offline`;
  - nome, função e departamento;
  - badge `N chamados`;
  - expansão para chamados assumidos;
  - links/botões de navegação para a conversa.
- Não usar telefone completo, IDs técnicos ou mensagens integrais no cartão.
- Exibir estados de loading, erro com retry, lista vazia e falta de permissão.
- Atualizar tipagem em `frontend/src/types/index.ts` para `AgentWorkload` e `AssignedConversationSummary`.
- Aplicar os tokens de `docs/paleta.md`: superfície branca opaca, borda `#D8E1EA`, texto primário `#0D1B2E`, online `#2C9D7B`, offline vermelho sem confundir com o status de fila.
- Garantir responsividade: em telas estreitas o cartão ocupa toda a largura antes do pulso; rolagem interna evita aumentar indefinidamente a página.

### Fase 4 — Segurança e performance

**Responsável:** Security Engineer (`agents/security-engineer.agent.md`)  
**Apoio:** Tech Lead

- Revisar autorização por função/departamento no novo endpoint e nos links de detalhe.
- Validar Zod para todos os query params, limites de itens e UUIDs.
- Confirmar que a resposta não contém `email`, telefone completo, conteúdo de mensagem, mídia, URLs Z-API ou tokens quando não forem necessários.
- Conferir que um supervisor não consegue consultar outro departamento alterando `departmentId` na URL.
- Medir quantidade de queries, tempo p95 e tamanho da resposta com 100 agentes e 500 chamados ativos.
- Reutilizar o índice de conversas por responsável/status/atividade; criar migration somente com plano de execução comprovando ganho.
- Evitar refetch em cascata: evento socket deve invalidar a query uma vez e o React Query deve deduplicar chamadas.

### Fase 5 — QA e homologação

**Responsável:** QA Testing Engineer (`agents/qa-testing-engineer.agent.md`)

#### Contrato/API

- Admin recebe todos os agentes ativos e a carga correta.
- Supervisor recebe somente seu escopo; agente sem permissão recebe `403`.
- `includeOffline=false` remove offline sem remover a contagem total incorretamente.
- Chamados `OPEN`, `BOT` e `CLOSED` não aparecem como assumidos.
- Conversa com `assignedAgentId` nulo não é vinculada a nenhum agente.
- Query inválida, limite negativo, limite acima do máximo e departamento fora do escopo retornam JSON `400/403` padronizado.
- Nenhum campo proibido ou histórico integral é retornado.

#### Presença e Socket.IO

- Login/conexão marca verde; desconexão marca vermelho após debounce.
- Reconexão rápida não produz falso offline.
- Dois dispositivos do mesmo atendente mantêm online até o último socket sair.
- Evento de assumir, delegar, transferir e encerrar atualiza a carga sem refresh manual.
- Reconexão do navegador refaz somente uma leitura de workload e não duplica linhas.

#### Frontend/E2E

- Cartão de atendentes aparece acima do pulso na fila.
- Cada atendente expande e recolhe seus chamados.
- Clique no chamado abre a conversa correta.
- Contador do atendente bate com a lista exibida.
- Verde/vermelho tem texto/aria-label além da cor.
- Loading, erro, retry e nenhum chamado são compreensíveis.
- Layout não cria overflow horizontal em 1440px, 1100px e 760px.
- `npm run build` frontend e backend passam; testes existentes permanecem verdes.

### Fase 6 — Operação e rollout

**Responsável:** DevOps/Infra (`agents/devops-infra-engineer.agent.md`)

- Publicar backend e frontend juntos para manter contrato compatível.
- Se houver migration de índice, executar backup lógico, migration aditiva, verificar `prisma migrate status` e manter rollback documentado.
- Monitorar p95 do endpoint, erros `403/5xx`, conexões Socket.IO, mudanças de presença e divergência entre `activeConversationCount` e contagem da fila.
- Em caso de falha, ocultar o cartão por feature flag ou fallback gracioso para a lista simples de `/agents`; não interromper a fila nem o pulso.

## 5. Arquivos previstos

### Backend

- `backend/src/modules/agents/agents.schemas.ts` — query/DTO do workload;
- `backend/src/modules/agents/agents.repository.ts` — consulta relacional escopada;
- `backend/src/modules/agents/agents.service.ts` — regra de presença/carga;
- `backend/src/modules/agents/agents.controller.ts` e `agents.routes.ts` — endpoint;
- `backend/src/shared/events.ts`/`socket.ts` — somente se os eventos atuais não carregarem contexto suficiente;
- `backend/prisma/schema.prisma` e migration — apenas se o índice adicional for comprovadamente necessário;
- `docs/API.md` e `docs/PRD.md` — contrato e histórias.

### Frontend

- `frontend/src/types/index.ts` — tipos do workload;
- `frontend/src/hooks/use-agent-workload.ts` — React Query compartilhado;
- `frontend/src/pages/queue/components/AgentWorkloadCard.tsx`;
- `frontend/src/pages/queue/components/AgentWorkloadRow.tsx`;
- `frontend/src/pages/queue/index.tsx` — composição do right-stack e invalidação;
- `frontend/src/app/Shell.tsx` ou hook de socket existente — invalidação de presença/carga;
- `frontend/src/pages/queue/styles.css` — somente layout local necessário.

## 6. Critérios de aceite finais

- [ ] O cartão no topo do painel direito se chama “Atendentes online”.
- [ ] Cada atendente ativo aparece com bolinha verde quando online e vermelha quando offline.
- [ ] O cartão aparece acima do “Pulso da operação”.
- [ ] Admin e supervisor conseguem identificar os chamados `IN_PROGRESS` de cada atendente dentro do escopo.
- [ ] Cada chamado exibido é navegável para sua conversa e não expõe conteúdo sensível.
- [ ] A atribuição, transferência, encerramento e presença são refletidos via Socket.IO/revalidação sem refresh manual.
- [ ] A fila continua funcionando quando o endpoint de workload estiver indisponível, mostrando retry/fallback sem quebrar a tela.
- [ ] O contrato possui autorização server-side, validação Zod, consultas sem N+1 e testes de regressão.
- [ ] Builds, testes e documentação da API passam antes do rollout.

## 7. Sequência recomendada de agentes

1. **Product Manager** — fechar regra de escopo e critérios de aceite.
2. **Tech Lead & Architect** — validar contrato, query, eventos e necessidade real de migration.
3. **Backend Developer** — endpoint, service, repository, escopo e eventos.
4. **Frontend Developer** — cartão, expansão, links, tokens shadcn e estados assíncronos.
5. **Security Engineer** — revisão de autorização, minimização de dados e payload.
6. **QA Testing Engineer** — contratos, Socket.IO, E2E, regressão e performance.
7. **DevOps & Infra** — build, migration eventual, feature flag e observabilidade.

## 8. Resultado esperado

Ao abrir a fila, a supervisão terá uma leitura imediata da equipe: quem está conectado, quem está offline e quais chamados cada atendente está conduzindo. O pulso continuará apresentando os totais gerais, enquanto a nova lista fornecerá contexto acionável e navegação direta para cada atendimento, sem carregar históricos ou dados sensíveis desnecessários.

## 9. Execução e validação

- Endpoint `GET /agents/workload` implementado com validação Zod, autorização `queue:view_all`, escopo obrigatório de supervisor e consulta relacional sem carregar histórico de mensagens.
- Cartão `Atendentes online` implementado acima do pulso, com estados online/offline, expansão por atendente, contagem de chamados e navegação direta para cada conversa.
- O cartão da fila foi limitado a quatro atendentes e recebeu acesso “Ver todos”; `/admin/agents` agora concentra a grade completa de presença/carga e a contagem de chamados ativos na tabela.
- Invalidação do workload integrada aos eventos de presença e atualização de conversas via Socket.IO, com fallback de carregamento/erro e retry no cartão.
- Nenhuma migration foi necessária: foram reutilizados `Agent.isOnline`, `Conversation.assignedAgentId`, `status`, `lastActivityAt` e os índices existentes.
- Contratos documentados em `docs/API.md`, `docs/PRD.md` e `docs/PRD_SOCKETIO.md`.
- Testes backend: **68 aprovados, 0 falhas**; build backend aprovado.
- Build frontend aprovado com TypeScript e Vite (1.935 módulos transformados; apenas aviso de chunk grande).
- `git diff --check` sem erros de conteúdo; os avisos restantes são apenas de conversão de fim de linha do Git no Windows.
