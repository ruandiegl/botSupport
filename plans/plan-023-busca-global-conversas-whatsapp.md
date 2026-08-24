# Plano 023 — Busca global de conversas no padrão WhatsApp

**Status:** Concluído (MVP)  
**Data:** 20/08/2026  
**Escopo:** busca global por contato, telefone e conteúdo de mensagens, acessível a partir da fila de atendimento, com resultados agrupados, filtros rápidos, destaque do termo, teclado, responsividade e atualização em tempo real.  
**Estratégia:** evolução aditiva e compatível com `GET /conversations`; a busca será executada no servidor, respeitando RBAC, paginação e os filtros atuais. Nenhuma mensagem completa, URL de mídia, token ou payload bruto da Z-API será enviado ao navegador.

## 1. Objetivo

Permitir que o atendente encontre rapidamente uma conversa, como no WhatsApp, digitando qualquer combinação de:

- nome do contato;
- número de telefone, com ou sem máscara, DDI e espaços;
- palavras ou frases presentes nas mensagens textuais;
- conversas de grupo, quando o registro tiver identificação de grupo.

Ao focar o campo de busca da fila, a aplicação deve abrir uma superfície de resultados sem tirar o usuário do contexto atual. Cada resultado deve mostrar o contato, o trecho de mensagem que correspondeu à busca, status, horário e dados operacionais mínimos. Ao selecionar um resultado, o atendente deve ir diretamente para a conversa correta.

## 2. Referências e diretrizes utilizadas

### Documentação do projeto

- [`docs/README.md`](../docs/README.md)
- [`docs/PRD.md`](../docs/PRD.md)
- [`docs/API.md`](../docs/API.md)
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md)
- [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md)
- [`docs/PERFORMANCE_READ_MODEL.md`](../docs/PERFORMANCE_READ_MODEL.md)
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md)
- [`docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md`](../docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md)
- Planos já executados da fila, notificações, mensagens, grupos, contatos e mídia.

### Skills aplicadas ao planejamento

- [`frontend-design/SKILL.md`](C:/Users/ESTUDIO-TREINAMENTO/.agents/skills/frontend-design/SKILL.md): interação deliberada, hierarquia visual, responsividade, foco visível, teclado, reduced motion e manutenção da identidade limpa atual.
- [`shadcn/SKILL.md`](C:/Users/ESTUDIO-TREINAMENTO/.codex/skills/shadcn/SKILL.md): composição de `Command`, `Popover`/`Dialog`/`Sheet`, `ScrollArea`, `Input`, `Badge`, `Tabs`/`ToggleGroup`, `Skeleton` e `Empty`, usando tokens semânticos e sem componentes crus.

### Papéis recomendados em `agents/`

O trabalho será conduzido pelo agente principal, sem criação ou delegação de subagentes, seguindo estes papéis como revisões sequenciais:

1. `product-manager.agent.md` — jornada, escopo, histórias e critérios de aceite;
2. `tech-lead-architect.agent.md` — contrato, autorização, índices e compatibilidade;
3. `backend-developer.agent.md` — busca no repositório, snippets e paginação;
4. `frontend-developer.agent.md` — composição shadcn, React Query e integração com a fila;
5. `security-engineer.agent.md` — escopo por usuário/departamento, sanitização e não exposição de dados;
6. `qa-testing-engineer.agent.md` — matriz de testes, regressão e validação de UX.

Essa ordem evita que uma solução visual seja implementada antes de o contrato de busca e o limite de dados estarem definidos.

## 3. Diagnóstico do estado atual

### O que já existe

- A fila tem um campo `Buscar por nome, telefone ou mensagem`.
- O hook de conversas já envia `q` para `GET /conversations`.
- O backend já consulta `contact.name`, `contact.phone` e `messages.content` com `contains`.
- A API já possui paginação, filtros de status/departamento/data, escopo `assignedAgentId=me` e contadores independentes da página.
- A fila usa React Query e recebe eventos de `message:new`/`conversation:updated`.

### Limitações atuais

- O campo pesquisa apenas dentro da consulta/lista corrente; não há uma experiência global independente do status selecionado.
- O fallback do frontend filtra apenas os itens já carregados e pode esconder correspondências que estão em outra página.
- O resultado não informa qual mensagem casou com o termo nem exibe snippet/highlight.
- Não há agrupamento de resultados, chips de escopo, atalho de teclado ou superfície dedicada para busca.
- O contrato atual de resumo não deve ser inchado com histórico completo ou mídia.
- Uma pesquisa textual ampla em `Message.content` pode degradar com o crescimento da base se depender apenas de `contains` sem medição/indexação.

## 4. Decisões de produto

### 4.1 Experiência padrão

Ao clicar ou focar no campo existente, abrir uma busca contextual. O campo continua visível ao lado dos filtros de status, sem criar uma página separada para o MVP.

```text
[ 🔎  Buscar mensagens, contatos ou telefone...                 × ]
[ Todas ] [ Não lidas ] [ Minhas ] [ Grupos ]

Resultados da busca (12)
┌─────────────────────────────────────────────────────────────┐
│ JM  João Marcos Valente                         14:31       │
│     ...preciso de suporte no sistema...       Em atendimento│
│     Suporte Geral · 2 não lidas                              │
├─────────────────────────────────────────────────────────────┤
│ CB  Programadores BR                              Ontem      │
│     ...o sistema de captura apresentou erro...   Grupo      │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Escopos rápidos

- **Todas:** todas as conversas que o usuário pode visualizar; inclui encerradas somente quando o status ou a busca explícita permitir.
- **Não lidas:** somente conversas com mensagens não lidas.
- **Minhas:** conversas atribuídas ao atendente autenticado; nunca confiar em um `agentId` enviado pelo cliente.
- **Grupos:** conversas identificadas como grupo por metadado/etiqueta de grupo existente.

O status selecionado na fila continua sendo respeitado quando foi escolhido explicitamente. Quando a busca global estiver ativa sem status explícito, o servidor pesquisará todas as conversas permitidas pelo escopo, com a opção de restringir por status no próprio resultado. Não criar “Favoritas” neste MVP, pois não há domínio de favoritos documentado.

### 4.3 O que aparece no resultado

Cada item deve exibir:

- avatar/iniciais e nome de exibição;
- telefone normalizado em formato legível, sem alterar o valor original;
- snippet da mensagem correspondente, com o termo destacado apenas visualmente;
- data/hora local da ocorrência mais relevante;
- badge de status, departamento e grupo quando disponíveis;
- contador de não lidas;
- indicação discreta de que o resultado veio de contato, telefone ou mensagem.

Não exibir no resultado: `vCard`, URL de mídia, tokens Z-API, conteúdo integral do histórico, dados de outros departamentos ou PII não necessária.

### 4.4 Comportamentos de interação

- Digitação com debounce de 250–300 ms; não chamar API para query vazia.
- `Escape` fecha o painel e devolve foco ao campo.
- `Enter` abre o primeiro resultado; setas `↑/↓` navegam; `Tab` não deve prender o usuário.
- Atalho `/` ou `Ctrl/Cmd+K` foca a busca apenas quando o foco atual não estiver em input, textarea ou contenteditable.
- Botão `×` limpa a query e os resultados sem limpar os filtros de status/departamento/data.
- Selecionar um resultado navega para `/conversation/:id`, fecha a superfície e preserva o estado de pesquisa para retorno à fila.
- Socket invalida/refaz a busca somente quando ela estiver aberta e houver mudança relevante; não criar polling contínuo.
- Se houver erro, mostrar ação `Tentar novamente` e manter o texto digitado.

## 5. Fora do escopo do MVP

- busca em áudio, vídeo, imagem, documento ou conteúdo OCR;
- pesquisa em nomes de arquivo/legendas de mídia;
- histórico de buscas, buscas salvas ou favoritos;
- alteração de status/assunção diretamente no resultado;
- indexador externo ou Elasticsearch;
- alteração do webhook da Z-API;
- envio automático de mensagens ao abrir um resultado.

Esses itens podem ser avaliados depois que a busca textual estiver medida em produção.

## 6. Requisitos funcionais

### RF-01 — Query global

Aceitar uma query textual de 1 a 120 caracteres, removendo espaços excedentes, preservando acentos para apresentação e normalizando case/telefone para comparação. Query vazia deve retornar estado inicial, não uma consulta irrestrita.

### RF-02 — Escopo e filtros

Combinar busca com `scope`, `status`, `departmentId`, `dateField`, `from`, `to`, `page` e `limit`. Datas devem seguir a convenção existente: `from` inclusivo e `to` exclusivo em ISO com offset.

### RF-03 — Relevância

Ordenar por:

1. correspondência exata de telefone;
2. correspondência exata/inicial no nome;
3. frase exata em mensagem;
4. correspondência parcial em mensagem;
5. `lastActivityAt` mais recente;
6. `conversationId` como desempate determinístico.

Se a implementação inicial usar apenas Prisma `contains`, a camada de serviço deve calcular a categoria de relevância sobre os campos já retornados, sem reimplementar filtro no navegador.

### RF-04 — Snippet seguro

Retornar apenas uma janela limitada do texto que casou (por exemplo, até 160 caracteres), com elipses e sem HTML interpretável. O frontend renderiza o texto como texto e aplica destaque por partes, nunca `dangerouslySetInnerHTML`.

### RF-05 — Paginação

Usar paginação no servidor. O resultado inicial deve ter `limit=20`, com máximo 50 para busca; nunca carregar o histórico completo nem todas as conversas para filtrar localmente.

### RF-06 — Autorização

A consulta deve aplicar no servidor o escopo do usuário autenticado, RBAC, departamento e regra de atendente. Um agente não pode ampliar a busca alterando `scope`, `assignedAgentId` ou `departmentId` no navegador.

### RF-07 — Atualização em tempo real

Enquanto o painel estiver aberto, `message:new` e `conversation:updated` podem invalidar a chave da busca se a conversa tiver potencial de entrar/sair do resultado. Reconexão do socket faz uma única reconciliação HTTP, sem duplicar itens.

### RF-08 — Compatibilidade

Manter `GET /conversations?q=...` funcionando para clientes existentes. A nova busca pode ser ativada por feature flag e usar endpoint dedicado; remover o fallback local somente depois de a API estar homologada.

## 7. Contrato de API proposto

### 7.1 Endpoint

`GET /api/conversations/search`

### 7.2 Query params

```text
q=string                         obrigatório, 1–120 caracteres
scope=all|unread|mine|groups     default all
status=ALL|OPEN|IN_PROGRESS|CLOSED   opcional
departmentId=UUID                opcional, validado e autorizado
dateField=lastActivityAt|createdAt  opcional
from=ISO-8601                    opcional, inclusivo
to=ISO-8601                      opcional, exclusivo
sort=relevance|recent|oldest     default relevance
page=inteiro                     default 1, mínimo 1
limit=inteiro                    default 20, máximo 50
```

### 7.3 Resposta

```json
{
  "items": [
    {
      "conversationId": "uuid",
      "contact": {
        "id": "uuid|null",
        "displayName": "João Marcos Valente",
        "phone": "5524999999999"
      },
      "status": "IN_PROGRESS",
      "department": { "id": "uuid", "name": "Suporte Geral" },
      "assignedAgent": { "id": "uuid", "name": "Administrador Sistema" },
      "isGroup": false,
      "unreadCount": 2,
      "lastActivityAt": "2026-08-20T14:31:00.000Z",
      "match": {
        "source": "message",
        "messageId": "uuid",
        "snippet": "...preciso de suporte no sistema...",
        "createdAt": "2026-08-20T14:31:00.000Z",
        "senderDisplayName": "João Marcos Valente"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 12,
    "totalPages": 1,
    "hasNext": false
  },
  "appliedFilters": {
    "q": "sistema",
    "scope": "all",
    "status": "ALL"
  }
}
```

O DTO deve ser montado pelo service/repository e validado por schema. Não devolver o objeto Prisma nem o payload original do webhook.

### 7.4 Erros

- `400`: query vazia, tamanho excedido, enum inválido, UUID inválido, datas inválidas, intervalo invertido, `limit` fora do limite;
- `401`: sessão ausente/expirada;
- `403`: departamento/escopo não permitido;
- `429`: excesso de consultas por usuário/IP;
- `500`: erro interno sem SQL, token ou conteúdo sensível na resposta.

## 8. Arquitetura backend

### 8.1 Organização

Preferir um submódulo de busca dentro do domínio de conversas, mantendo a arquitetura Route → Controller → Service → Repository → Schema:

- `backend/src/modules/conversations/search.schemas.ts` — Zod dos parâmetros e DTO;
- `backend/src/modules/conversations/search.repository.ts` — filtros, relevância, snippets, paginação e autorização de dados;
- `backend/src/modules/conversations/search.service.ts` — normalização, regras de escopo, montagem do DTO e métricas;
- `backend/src/modules/conversations/search.controller.ts` — autenticação, resposta e erros;
- rota registrada junto às rotas de conversas;
- testes unitários de normalização/relevância e contrato de API.

Não acessar Prisma diretamente no controller ou no componente React.

### 8.2 Consulta inicial

Na primeira entrega, é aceitável reutilizar os campos existentes (`Contact.name`, `Contact.phone`, `Message.content`) com limites rigorosos e uma consulta paginada. A consulta deve:

- aplicar RBAC e departamento antes da busca textual;
- limitar mensagens candidatas por conversa e por janela recente;
- fazer `count` e `findMany` de modo consistente;
- buscar somente colunas necessárias;
- retornar o melhor match por conversa, não uma linha por mensagem;
- ordenar de forma determinística.

### 8.3 Evolução de índice

Medir p50/p95 antes de adicionar complexidade. Se o p95 ultrapassar o alvo de 250 ms do read model ou o volume de mensagens tornar `contains` caro, criar migration aditiva para PostgreSQL:

- `pg_trgm`/GIN para `lower(content)`, nome e telefone; ou
- full-text search com `to_tsvector`/`websearch_to_tsquery` quando a busca por frase e ranking justificar.

Toda SQL deve ser parametrizada pelo repositório. A migration deve ser reversível/segura e não alterar o conteúdo existente. O plano não inclui Elasticsearch.

## 9. Arquitetura frontend

### 9.1 Componentes

Adicionar, via shadcn e sem sobrescrever customizações sem diff:

- `Command`, `CommandInput`, `CommandList`, `CommandGroup`, `CommandItem`;
- `ScrollArea`;
- `Dialog` ou `Sheet` para mobile, com título acessível;
- `Tabs`/`ToggleGroup` ou composição equivalente para os escopos;
- reutilizar `Input`, `Badge`, `Skeleton`, `Empty`, `Separator`, `Avatar` e `Button` existentes.

Sugestão de arquivos:

- `frontend/src/pages/queue/components/GlobalConversationSearch.tsx`;
- `frontend/src/pages/queue/components/ConversationSearchResult.tsx`;
- `frontend/src/pages/queue/hooks/use-conversation-search.ts`;
- `frontend/src/pages/queue/lib/search-formatters.ts`;
- `frontend/src/types/index.ts` para `ConversationSearchResult` e resposta paginada;
- `frontend/src/pages/queue/index.tsx` apenas para orquestração de query, filtros, navegação e feature flag.

### 9.2 Composição visual

- Desktop: `Popover` ancorado ao campo, largura mínima aproximada de 520 px e altura limitada; usar `Command` dentro do popover.
- Mobile: `Dialog`/`Sheet` em largura total, preservando o teclado e permitindo fechar por gesto/Escape.
- A lista deve ser opaca, com superfície do tema atual, bordas suaves e contraste consistente em light/dark.
- Usar apenas tokens semânticos; nenhuma cor hex nova no JSX.
- Resultados separados por `CommandGroup`/`Separator`, sem linhas visualmente emboladas.
- Loading com `Skeleton`; vazio com orientação; erro com `Alert` e retry.
- Highlight do termo com nós de texto separados, sem HTML inseguro.

### 9.3 Acessibilidade e fluidez

- `aria-label` claro no campo, botão limpar e escopos;
- `aria-live` anuncia quantidade de resultados;
- foco visível e targets de pelo menos 44 px;
- navegação completa por teclado e toque;
- suporte a `prefers-reduced-motion`;
- não capturar `/` ou `Ctrl/Cmd+K` enquanto o usuário digita em outro campo;
- tooltip somente quando um ícone não tiver texto visível;
- não usar autocomplete nativo do navegador que conflite com a lista shadcn.

## 10. Estado, cache e tempo real

- Criar hook React Query separado do hook de listagem da fila.
- Chave deve incluir `q`, `scope`, status, departamento, datas, ordenação, página e limite.
- Debounce deve ocorrer no hook/componente; query desabilitada para string vazia.
- `staleTime` curto (por exemplo 10–15 s) e `keepPreviousData` para não piscar ao paginar.
- Abortar/rejeitar respostas antigas quando uma query mais nova terminar depois.
- Ao abrir uma conversa, invalidar a busca e a fila apenas quando necessário.
- Ao receber socket, invalidar uma vez por janela curta e deduplicar eventos por `conversationId`.
- Não iniciar um intervalo de polling para a busca; reconexão usa uma única refetch.

## 11. Critérios de aceite

### Produto

- [x] Buscar por nome retorna conversa mesmo quando ela não está na página/status atualmente visível.
- [x] Buscar por telefone funciona com `+55 (24) 99999-9999`, `5524999999999` e fragmentos numéricos.
- [x] Buscar palavra/frase mostra o snippet correto e destaca o termo como texto seguro.
- [x] Resultados de grupo aparecem quando o escopo `Grupos` é selecionado.
- [x] `Não lidas` e `Minhas` respeitam o usuário autenticado, não um ID enviado pelo cliente.
- [x] Clique/Enter no resultado abre a conversa correta.
- [x] Status, departamento e período escolhidos continuam combináveis com a busca.
- [x] Busca vazia não faz consulta irrestrita nem altera a lista atual.

### Frontend

- [x] A superfície abre ao focar o campo da fila, fecha com Escape e limpa com `×`.
- [x] Setas, Enter, Tab e atalho `/` ou `Ctrl/Cmd+K` funcionam sem roubar foco de outros inputs.
- [x] Loading, vazio, erro, paginação e retry são claros.
- [x] Desktop, mobile, light e dark usam tokens semânticos, sem overflow introduzido pelo componente.
- [x] Somente componentes shadcn/Base UI existentes ou adicionados de forma compatível são usados.
- [x] Nenhum campo usa `dangerouslySetInnerHTML` para destacar snippets.

### Backend e segurança

- [x] Zod rejeita query, UUID, enum, intervalo, página e limite inválidos com `400` padronizado.
- [x] Usuário não consegue pesquisar conversas fora de seu RBAC/departamento.
- [x] Resposta não contém payload bruto, vCard, URL de mídia, token ou mensagem integral.
- [x] Paginação é feita no banco e não no cliente.
- [x] Relevância e empate são determinísticos.
- [ ] Requisições em excesso recebem `429` sem degradar a fila (hardening de rate limit fica para a próxima etapa operacional).
- [x] `GET /conversations?q` legado permanece funcional durante a migração.

### Performance

- [x] Não há request para query vazia.
- [x] Uma digitação rápida não deixa respostas antigas sobrescreverem a mais recente.
- [ ] p95 do endpoint permanece dentro do alvo documentado (deve ser medido após a entrada em homologação).
- [x] Contagem e paginação não carregam histórico completo.
- [x] Eventos socket não causam loop de requests.

## 12. Plano de execução por fases

### F0 — Fechamento do contrato e caracterização

1. Confirmar a definição de “global”: por padrão pesquisar todas as conversas autorizadas; filtro de status explícito continua prevalecendo.
2. Confirmar que mídia, favoritos e histórico de busca ficam fora do MVP.
3. Registrar testes de caracterização do `GET /conversations?q` e da fila atual.
4. Definir feature flag e métricas de sucesso.

**Pronto quando:** contrato, escopos e não-objetivos estiverem documentados e sem ambiguidade.

### F1 — API e busca no servidor

1. Criar schemas Zod e endpoint dedicado.
2. Implementar repository com autorização, normalização, match por contato/telefone/mensagem, snippet e paginação.
3. Montar DTO seguro no service/controller.
4. Manter o endpoint legado e adicionar testes de compatibilidade.

**Pronto quando:** os testes de contrato e RBAC passarem sem alterar dados do banco.

### F2 — Medição e indexação

1. Medir queries em volume representativo e com filtros combinados.
2. Adicionar somente indexes/migration necessários, caso a medição indique.
3. Registrar p50, p95, total de linhas examinadas e taxa de erro.

**Pronto quando:** a busca alcançar o alvo ou houver decisão registrada para a evolução de índice.

### F3 — Superfície shadcn no frontend

1. Verificar componentes disponíveis pelo CLI em modo dry-run.
2. Adicionar `Command`/`ScrollArea`/`Sheet` ou equivalentes sem substituir alterações existentes.
3. Implementar resultado, grupos, destaque, estados loading/empty/error e teclado.
4. Adaptar tokens light/dark e mobile.

**Pronto quando:** a experiência funcionar com fixture local sem API e passar revisão de acessibilidade visual.

### F4 — Integração com fila e Socket.IO

1. Criar hook React Query com debounce, cancelamento, cache e paginação.
2. Integrar com o campo ao lado de status, sem remover os filtros atuais.
3. Abrir conversa ao selecionar resultado e preservar retorno à fila.
4. Invalidar de forma deduplicada em `message:new`/`conversation:updated`.

**Pronto quando:** busca, fila, filtros, navegação e reconexão trabalharem juntos sem polling contínuo.

### F5 — QA, segurança e documentação

1. Executar matriz de testes API, repository, frontend e E2E.
2. Fazer revisão de escopo por agente/departamento e conteúdo seguro.
3. Atualizar `docs/PRD.md`, `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN_SYSTEM.md` e eventual runbook de índices.
4. Registrar limites, métricas, rollout e rollback.

**Pronto quando:** build, testes, revisão de segurança e smoke em light/dark estiverem aprovados.

### F6 — Rollout controlado

1. Ativar a feature flag para administradores/homologação.
2. Comparar latência e taxa de resultado com a busca antiga.
3. Expandir por perfil/instância após a observação.
4. Em regressão, desligar a flag e manter `GET /conversations?q` sem rollback destrutivo.

## 13. Matriz de testes

### API/Zod

- query vazia, espaços, caracteres especiais, acentos e 120/121 caracteres;
- telefone com `+`, máscara, DDI, fragmento e letras;
- status/scope/dateField inválidos;
- UUID de departamento inexistente ou fora do escopo;
- `from` igual/maior que `to`, timezone/DST, datas futuras conforme regra existente;
- page 0, negativo, limite 0, limite 51 e múltiplas páginas;
- resposta vazia e empate determinístico.

### Repository/service

- match em nome, telefone e mensagem;
- múltiplas mensagens iguais na mesma conversa retorna um único resultado com melhor match;
- relevância exata supera parcial;
- snippet limita tamanho e mantém quebras de linha seguras;
- conversa encerrada só aparece quando o status/escopo permitir;
- agente não acessa outro departamento;
- nenhuma query constrói SQL por concatenação.

### Frontend/E2E

- abrir/fechar/limpar, debounce e resultado antigo não sobrescreve novo;
- setas/Enter/Escape/Ctrl+K, toque e foco após navegação;
- filtros Todas/Não lidas/Minhas/Grupos combinados com status/data;
- clique navega para a conversa e retorno mantém a fila;
- loading/erro/retry/sem resultados;
- socket atualiza resultado sem duplicar requests;
- 390 px, 768 px e desktop; light/dark; reduced motion;
- regressão de paginação, cards clicáveis, notificações e lista da fila.

### Segurança/performance

- autenticação ausente/expirada;
- tentativa de ampliar escopo via query params;
- XSS no nome/snippet, caracteres de consulta e payload grande;
- rate limit e logs sem conteúdo pesquisado/PII desnecessária;
- p50/p95, número de queries, cache hit, erro 4xx/5xx e reconnect do socket.

## 14. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Busca de mensagens lenta com `contains` | Alto | paginação, limites, medição e migration de índice somente se necessário |
| Vazamento entre departamentos | Crítico | escopo aplicado no repository/service a partir do JWT |
| Resultado sem contexto suficiente | Médio | snippet limitado, origem do match e nome do remetente |
| Respostas antigas após digitação rápida | Médio | debounce, abort/cancelamento e query key completa |
| Popover sobreposto/sem teclado | Médio | `Command` + `Popover`/`Sheet` shadcn, focus management e smoke responsivo |
| Eventos socket em loop | Médio | invalidação deduplicada e reconciliação única após reconnect |
| Alteração brusca no visual atual | Médio | reutilizar campo/filtros, tokens atuais e feature flag |
| Índice pesado em produção | Médio | migration aditiva, medir antes e rollback apenas do índice se necessário |

## 15. Atualizações documentais

- `docs/PRD.md`: história de busca global, escopos, grupos e critérios de aceite.
- `docs/API.md`: endpoint, query params, DTO, erros e compatibilidade.
- `docs/ARCHITECTURE.md`: submódulo de busca, ranking, snippets e limites de DTO.
- `docs/DESIGN_SYSTEM.md`: padrão de Command/Popover/Sheet, estados e teclado.
- `docs/PERFORMANCE_READ_MODEL.md`: alvo de latência, paginação e métricas da busca.
- Runbook de migração/índice, se F2 introduzir migration PostgreSQL.

## 16. Checklist final de entrega

- [x] Plano funcional aprovado.
- [x] Endpoint dedicado implementado e legado preservado.
- [x] RBAC e filtros validados no servidor.
- [x] Snippets/highlight seguros e úteis.
- [x] Componentes shadcn adicionados sem sobrescrever customizações.
- [x] Busca integrada à fila, aos filtros e ao socket.
- [x] Light/dark, mobile, teclado e reduced motion revisados no componente novo por meio de tokens semânticos.
- [x] Testes de contrato, build e smoke autenticado aprovados.
- [x] Limites de paginação e contrato de observabilidade registrados na documentação.
- [x] Compatibilidade e rollback: o endpoint antigo permanece intacto; nenhuma migration foi necessária.

## 17. Execução realizada em 20/08/2026

- Backend: schema Zod, rota autenticada, busca SQL parametrizada com escopo por JWT, ranking, paginação, filtros de status/departamento/data/etiquetas e snippet limitado.
- Frontend: campo global contextual na fila, chips de escopo, resultados com destaque seguro, loading/erro/vazio/retry, teclado (`/`, `Ctrl/Cmd+K`, setas, `Enter`, `Escape`), paginação e navegação para a conversa.
- Atualização: a consulta aberta é invalidada somente nos eventos `message:new` e `conversation:updated`; não há polling contínuo novo.
- Dados: nenhuma URL de mídia, token Z-API, histórico integral ou payload bruto é enviado ao navegador.
- Validação: `backend npm test` e `frontend npm run build` aprovados; smoke autenticado em instância local confirmou resultados, snippets e metadados de paginação.
