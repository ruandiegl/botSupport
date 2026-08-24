# Plano 024 — Busca global como filtro incremental da lista

**Status:** Concluído (MVP inline na lista)  
**Data:** 21/08/2026  
**Escopo:** transformar a busca global em um filtro da própria lista de conversas, pesquisar enquanto o usuário digita e ampliar a correspondência para prefixos/parciais de nome, e-mail, telefone, grupo e mensagens textuais.  
**Princípio:** evolução aditiva, sem alterar o histórico das conversas, sem carregar o histórico integral no navegador e sem remover o contrato legado de `GET /conversations`.

**Extensão aplicada em 21/08/2026:** ao iniciar uma busca, os filtros operacionais de status, período, etiquetas e departamento deixam de restringir o termo; a lista retorna todas as conversas permitidas, agrupando os cards em “Conversas” e “Mensagens”. Resultados cujo match é uma mensagem recebem destaque textual seguro no próprio card, com até três ocorrências recentes por conversa.

## 1. Objetivo

Permitir que o atendente encontre uma conversa de forma direta, semelhante à busca do WhatsApp:

- o campo permanece na fila, junto dos filtros existentes;
- cada caractere digitado atualiza os resultados após um debounce curto, sem abrir um modal bloqueante;
- `ruandieg` encontra, por exemplo, `ruandiegl33@gmail.com`, além de nomes e mensagens que contenham esse trecho;
- os resultados aparecem na mesma lista/painel onde as conversas já são exibidas, usando os mesmos cards, paginação e estados;
- a busca apenas altera o filtro `q`; não abre modal, popover, painel paralelo ou nova rota;
- clicar ou confirmar pelo teclado abre a conversa correspondente somente depois que o usuário escolher um card;
- a consulta continua limitada pelo JWT, RBAC, departamento e filtros selecionados.

### Decisão adicional desta revisão

Os resultados **não terão uma área própria**. A busca será somente mais um filtro da lista de conversas que já existe na fila. Portanto, não deve ser criado modal, popover, dropdown, card de resultados ou painel lateral para apresentar as correspondências. O usuário digita, a lista atual é atualizada e os cards permanecem no mesmo lugar e no mesmo padrão visual.

## 2. Referências consultadas

### Documentação do projeto

- [`docs/README.md`](../docs/README.md) — stack, mapa documental e convenções do projeto;
- [`docs/PRD.md`](../docs/PRD.md) — busca por nome/telefone/mensagem e busca global estilo WhatsApp;
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — separação Route → Controller → Service → Repository, read models e React Query;
- [`docs/API.md`](../docs/API.md) — contrato atual de `GET /conversations` e `GET /conversations/search`;
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md) — Zod na borda, queries no repository, segurança, erros e isolamento de hooks;
- [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md) — componentes shadcn/Base UI, foco, responsividade, busca existente e tokens de tema;
- [`docs/PERFORMANCE_READ_MODEL.md`](../docs/PERFORMANCE_READ_MODEL.md) — limites de busca, métricas p50/p95/p99 e evolução futura por índice/read model;
- [`plans/plan-023-busca-global-conversas-whatsapp.md`](plan-023-busca-global-conversas-whatsapp.md) — baseline já entregue e pontos a substituir.

### Agentes de referência, aplicados sequencialmente pelo agente principal

Não serão criados nem delegados subagentes. Os seguintes perfis serão usados como revisões de responsabilidade durante a execução:

1. [`product-manager.agent.md`](../agents/product-manager.agent.md) — jornada, escopo, histórias e critérios de aceite;
2. [`tech-lead-architect.agent.md`](../agents/tech-lead-architect.agent.md) — contrato, compatibilidade, autorização, ranking e desempenho;
3. [`backend-developer.agent.md`](../agents/backend-developer.agent.md) — schema Zod, consulta parametrizada, snippets e paginação;
4. [`frontend-developer.agent.md`](../agents/frontend-developer.agent.md) — filtro na lista existente, React Query, teclado, responsividade e composição shadcn;
5. [`security-engineer.agent.md`](../agents/security-engineer.agent.md) — escopo por usuário/departamento, XSS, SQL injection, rate limit e minimização de dados;
6. [`qa-testing-engineer.agent.md`](../agents/qa-testing-engineer.agent.md) — testes de contrato, correspondência parcial, interação e regressão.

## 3. Diagnóstico do estado atual

### Backend (baseline antes da execução)

- `GET /conversations/search` já existe e usa Zod, filtros server-side, paginação e escopo autenticado;
- a busca atual cobre `contact.name`, telefone e `gtf_messages.content`;
- a consulta usa `%q%` e ranking básico, mas não inclui `contact.email` nem outros campos de identidade;
- o DTO `match.source` limita-se a `contact`, `phone` e `message`;
- o resultado calcula o match depois da consulta, o que pode exibir o último texto da conversa em vez do campo que realmente casou;
- o endpoint retorna apenas uma ocorrência por conversa e snippets seguros, o que deve ser preservado;
- a busca textual ampla ainda precisa de medição antes de receber índice especializado.

### Frontend (baseline antes da execução)

- `GlobalConversationSearch.tsx` usa `Popover`, `PopoverContent`, `ToggleGroup` e `ScrollArea`;
- o popover abre sobre a fila e pode apresentar problemas de foco, sobreposição, clipping e estados difíceis de recuperar;
- a fila já possui uma lista/painel de conversas que deve ser a única superfície de resultados da busca;
- `use-conversation-search.ts` já possui debounce de aproximadamente 280 ms, React Query e `placeholderData`, mas não cancela explicitamente requisições obsoletas nem alimenta diretamente o mesmo modelo de item da lista;
- a fila continua responsável pelos filtros de status, departamento, data e etiquetas, portanto a busca não deve limpar nem duplicar esses controles;
- o destaque atual é renderizado como texto segmentado e deve permanecer sem `dangerouslySetInnerHTML`.

### Causa funcional a corrigir

O problema principal não é apenas a consulta: é a combinação de uma superfície modal com um contrato de correspondência incompleto. A entrega deve remover a superfície paralela e fazer o campo controlar o mesmo `q` da lista existente, tornando a identidade pesquisável por substring/prefixo e mantendo a busca de mensagens.

## 4. Decisões de produto

### 4.1 Busca como filtro da lista existente

Substituir o `Popover` por um campo de busca controlado que alimente a consulta da lista de conversas:

```text
[ 🔎 Buscar mensagens, contatos, e-mail ou telefone ... ] [ status ] [ departamento ]

┌──────────────────────────────────────────────────────────────┐
│ 💬 Conversas (filtradas por “ruandieg”) · 1 registro          │
├──────────────────────────────────────────────────────────────┤
│ R  Ruan Diego · ruandiegl33@gmail.com                        │
│    ...mensagem correspondente... · Em aberto                 │
└──────────────────────────────────────────────────────────────┘
```

Regras:

- não criar lista de resultados, painel ou card adicional para a busca; renderizar os resultados no componente de lista já usado pela fila;
- reutilizar o mesmo `ConversationRow`, cabeçalho, contador, paginação, loading, erro e empty state da lista atual;
- atualizar o título/contador da lista para indicar que há filtro textual ativo, sem trocar a estrutura visual;
- ao limpar a query, restaurar a consulta anterior da fila e seus resultados sem navegação;
- em telas estreitas, manter a mesma largura da lista existente e não causar overflow horizontal;
- o campo continua compatível com `/` e `Ctrl/Cmd+K`, sem roubar foco de inputs, textareas ou contenteditable;
- `Escape` limpa a query e devolve foco ao input; não navega para outra rota;
- `Enter`, setas e clique continuam selecionando um card da lista, não um item em uma superfície paralela.

### 4.2 Busca incremental

- normalizar espaços e comparar sem diferenciação de maiúsculas/minúsculas;
- iniciar a pesquisa a partir de 1 caractere, com estado inicial local para query vazia;
- debounce recomendado entre 180 e 250 ms para acompanhar cada letra sem gerar uma requisição por tecla;
- manter o último resultado durante a nova consulta (`placeholderData`) e mostrar indicador sutil de atualização;
- ignorar respostas obsoletas e evitar que uma busca lenta sobrescreva o resultado da query mais recente;
- não pesquisar mídia binária, OCR, tokens, URLs temporárias ou vCards.

### 4.3 Correspondência parcial e fontes

O servidor deve procurar o termo normalizado em:

1. telefone principal e telefones alternativos, comparando também somente dígitos;
2. nome do contato;
3. e-mail do contato;
4. nome do grupo (`groupChatName`), quando existir;
5. conteúdo textual das mensagens.

Para `ruandieg`, a correspondência deve funcionar em `ruandiegl33@gmail.com` por substring. O resultado deve informar a melhor fonte encontrada:

```ts
type SearchMatchSource = "name" | "email" | "phone" | "group" | "message";
```

Não diferenciar prefixo e substring na UI; a ordenação deve privilegiar a correspondência mais forte.

### 4.4 Ranking determinístico

Ordenar por:

1. telefone completo exato;
2. e-mail completo exato;
3. nome exato;
4. prefixo de nome/e-mail/grupo;
5. substring em nome/e-mail/grupo/telefone;
6. frase exata em mensagem;
7. substring em mensagem;
8. `lastActivityAt DESC`;
9. `conversationId ASC` como desempate.

Cada conversa aparece uma única vez. O backend escolhe a melhor ocorrência e devolve snippet limitado (até 160 caracteres) e o identificador da mensagem somente quando o match for de mensagem.

## 5. Requisitos funcionais e não funcionais

### RF-01 — Consulta incremental

Cada alteração do input atualiza uma query debounced. Query vazia não chama API; query com espaços é tratada como vazia.

### RF-02 — Correspondência parcial

O termo pode ser uma parte do nome, e-mail, telefone ou mensagem. A comparação é case-insensitive; telefones devem tolerar máscara, DDI, espaços e pontuação.

### RF-03 — Filtros preservados

Status, departamento, período, etiquetas e escopo (`Todas`, `Não lidas`, `Minhas`, `Grupos`) continuam sendo enviados ao endpoint. A busca não altera filtros da fila automaticamente.

### RF-04 — Lista única e resultado acionável

Os resultados devem usar exatamente os cards existentes da lista, acrescentando apenas os dados de match necessários: nome/grupo, telefone ou e-mail disponível, trecho correspondente, fonte do match, status, departamento, horário e não lidas. Clique, Enter ou `data-testid` do card navegam para `/conversation/:id`.

### RF-05 — Estados da lista

Reutilizar na mesma lista os estados de inicial, digitando, carregando, sucesso, vazio, erro e retry. O erro não apaga a query e não abre outro componente.

### RF-06 — Acessibilidade

Usar `role="search"`, `aria-controls`, `aria-expanded`, `aria-live` para contagem, roving/active descendant para setas, foco visível e targets de pelo menos 44 px. Não prender Tab no painel.

### RF-07 — Segurança e escopo

O servidor deriva agente/departamento do JWT. Parâmetros do navegador não podem ampliar o escopo. Snippets são texto puro, sem HTML, sem mídia e sem segredos.

### RNF-01 — Desempenho

Não carregar histórico completo nem filtrar todo o banco no navegador. Medir p50/p95/p99, linhas examinadas, consultas sem resultado e taxa de erro. O alvo inicial é p95 ≤ 500 ms para a busca em base homologatória.

### RNF-02 — Compatibilidade

Manter `GET /conversations?q=...` e o formato legado usado por clientes antigos. A mudança de UI não exige migração de dados no MVP.

## 6. Contrato de API compatível com a lista

### Endpoint primário da fila

`GET /api/conversations`

O frontend da fila deve usar o mesmo endpoint/mesmo envelope de listagem que já alimenta os cards. O parâmetro `q` passa a filtrar globalmente a lista dentro do escopo autorizado; não haverá uma segunda fonte de resultados para a tela.

### Query

```text
q=string                                  opcional; quando presente, 1–120 caracteres
scope=all|unread|mine|groups              default all
status=ALL|OPEN|IN_PROGRESS|CLOSED|BOT    default ALL
departmentId=ALL|UUID                     default ALL
dateField=lastActivityAt|createdAt        default lastActivityAt
from=ISO-8601                             inclusivo
to=ISO-8601                               exclusivo
sort=relevance|recent|oldest              default relevance
page=inteiro                              default 1
limit=inteiro                             default 20, máximo 50
labelIds=UUID,UUID                        opcional
```

Não adicionar `assignedAgentId` controlável pelo cliente para `scope=mine`; o service deve resolver o agente autenticado. O endpoint existente `/conversations/search` pode permanecer durante a compatibilidade, mas a fila não deve abrir ou renderizar sua resposta separadamente: se for mantido, seu resultado será adaptado pelo service para o mesmo `ConversationSummary` da lista.

### Resposta

Manter o envelope paginado existente e adicionar somente campos opcionais de match ao item da lista, sem quebrar consumidores antigos:

```json
{
  "items": [
    {
      "id": "uuid",
      "contact": {
        "id": "uuid|null",
        "displayName": "Ruan Diego",
        "phone": "5524999999999",
        "email": "ruandiegl33@gmail.com"
      },
      "status": "OPEN",
      "department": null,
      "isGroup": false,
      "unreadCount": 0,
      "lastActivityAt": "2026-08-21T12:00:00.000Z",
      "searchMatch": {
        "source": "email",
        "messageId": null,
        "snippet": "ruandiegl33@gmail.com",
        "createdAt": "2026-08-21T12:00:00.000Z",
        "senderDisplayName": null
      }
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1, "hasNext": false },
  "counts": { "all": 1, "open": 1, "inProgress": 0, "closed": 0, "mine": 0, "unread": 0 },
  "appliedFilters": { "q": "ruandieg", "status": "ALL" }
}
```

`email` e `searchMatch` são opcionais/nulos quando a consulta não estiver ativa. O backend não deve retornar telefone completo para escopos que já o ocultam em outras projeções; aplicar a mesma política de minimização vigente.

### Validação e erros

- `400`: query vazia, query acima de 120 caracteres, enum/UUID inválido, datas inválidas, intervalo invertido, paginação fora do limite;
- `401`: sessão ausente/expirada;
- `403`: escopo de departamento não autorizado;
- `429`: excesso de buscas por usuário/IP;
- `500`: resposta genérica sem SQL, tokens, payload Z-API ou conteúdo sensível.

## 7. Plano técnico por fase

### F0 — Contrato e caracterização

- confirmar com produto que a busca parcial vale para nome, e-mail, telefone, grupos e mensagem;
- registrar que a busca deixa de ter superfície própria e passa a controlar o filtro da lista de conversas;
- capturar testes de caracterização do endpoint atual e da UI existente;
- definir o limiar de 1 caractere, debounce e limite de resultados;
- verificar se `Contact` possui e-mail e se existem telefones alternativos no schema atual; se não houver, não criar dado fictício.

### F1 — Backend: correspondência e ranking

Arquivos previstos:

- `backend/src/modules/conversations/conversations.schemas.ts`;
- `backend/src/modules/conversations/conversations.repository.ts`;
- `backend/src/modules/conversations/conversations.service.ts`;
- `backend/src/modules/conversations/conversations.controller.ts` somente se o DTO/validação mudar;
- `backend/src/modules/conversations/conversations.routes.ts` somente se houver rate limit ou middleware adicional.

Implementação:

1. expandir a seleção para e-mail, grupo e telefones alternativos existentes;
2. construir condições SQL parametrizadas com `Prisma.sql`, nunca concatenando query do usuário;
3. normalizar dígitos do telefone e comparar substring sem máscara;
4. calcular a fonte e a categoria de ranking no repository/service, preservando uma linha por conversa;
5. selecionar o melhor snippet correspondente, limitado e sem HTML;
6. manter filtros e escopo server-side antes de aplicar `LIMIT/OFFSET`;
7. adicionar rate limit/observabilidade compatíveis com as rotas autenticadas;
8. só propor `pg_trgm`/índice dedicado depois de medir p95 e linhas examinadas; se necessário, migration aditiva e reversível.

### F2 — Frontend: integrar a busca à lista existente

Arquivos previstos:

- substituir ou refatorar `frontend/src/pages/queue/components/GlobalConversationSearch.tsx`;
- não criar `InlineConversationSearchResults.tsx` nem qualquer lista paralela;
- ajustar `frontend/src/pages/queue/index.tsx` para passar `q` ao hook/lista de conversas existente;
- refatorar `frontend/src/pages/queue/hooks/use-conversation-search.ts` ou absorver sua lógica no `use-queue.ts`, retornando o mesmo tipo consumido pela lista;
- ajustar estilos locais da fila; não criar CSS paralelo aos tokens do design system.

Implementação:

1. remover `PopoverTrigger`/`PopoverContent` do fluxo principal;
2. manter somente o `Input` de busca no toolbar, usando `Button` para limpar e primitives shadcn/Base UI já presentes;
3. conectar a query ao mesmo hook da lista e renderizar os resultados no `ConversationList`/`ConversationRow` existente;
4. reutilizar cabeçalho, contador, paginação, skeleton, empty state, erro e retry da lista, sem criar painel adicional;
5. manter navegação por mouse, Enter, setas e Escape nos próprios cards da lista;
6. abrir a conversa ao selecionar um card, preservando filtros e paginação ao voltar;
7. suportar claro/escuro, largura estreita e viewport com teclado virtual sem clipping;
8. destacar o termo em texto segmentado, escapando regex e sem `dangerouslySetInnerHTML`.

### F3 — React Query e concorrência de digitação

- reduzir debounce para 180–250 ms e documentar o valor;
- incluir todos os filtros na chave da query;
- usar `placeholderData` sem exibir resultado de query diferente como se fosse atual;
- adicionar `AbortSignal` ao `apiFetch` e ao `fetch` quando disponível, ou usar um requestId para descartar respostas tardias;
- impedir refetch em loop durante `message:new`/`conversation:updated`; invalidar apenas quando a lista estiver montada e houver query não vazia, com coalescência curta;
- resetar a página para 1 quando a query/filtro realmente mudar e preservar o mesmo estado de loading da lista;
- manter `staleTime` curto e `gcTime` coerente com a fila.

### F4 — Testes, segurança e desempenho

Backend:

- Zod: vazio, espaços, acentos, e-mail parcial, telefone com máscara, `limit`, datas, enum, UUID, labels e campos desconhecidos;
- repository/service: match em nome, e-mail, grupo, telefone e mensagem; ranking; snippet; duplicidade; escopo AGENT/SUPERVISOR/ADMIN;
- segurança: query com aspas, `%`, `_`, SQL-like, HTML e tentativa de ampliar departamento;
- performance: 100, 1.000 e 10.000 conversas, p50/p95/p99, linhas examinadas e paginação;
- contrato de compatibilidade para `GET /conversations?q`.

Frontend/E2E:

- digitar `r`, `ru`, `ruandieg` e observar atualização sem modal;
- encontrar `ruandiegl33@gmail.com` por substring e mostrar fonte `E-mail`;
- pesquisar trecho de mensagem e nome de grupo;
- loading, vazio, erro, retry, limpeza e resposta obsoleta;
- setas/Enter/Escape, foco, leitores de tela e viewport mobile;
- clicar em um card abre a conversa correta e não altera filtros;
- socket atualiza a lista filtrada sem duplicar resultados;
- temas claro/escuro, sem portal/modal e sem sobreposição.

### F5 — Documentação e rollout

- atualizar `docs/API.md` com fontes `name|email|phone|group|message`, comportamento parcial e campos opcionais;
- atualizar `docs/PRD.md` com a jornada incremental e o exemplo de e-mail parcial;
- atualizar `docs/ARCHITECTURE.md` e `docs/PERFORMANCE_READ_MODEL.md` sobre filtro na lista, cancelamento e métricas;
- ajustar `docs/DESIGN_SYSTEM.md` para registrar que a busca usa o Input e a lista existente, sem Popover/Modal;
- manter rollout aditivo: endpoint/contrato compatível, filtro na lista atrás de flag opcional se a equipe desejar canário;
- acompanhar erros 4xx/5xx, p95, consultas sem resultado, cancelamentos e uso por fonte de match;
- rollback visual = reativar o componente anterior sem alterar dados; rollback de índice = migration reversível.

## 8. Critérios de aceite

- [x] Ao digitar, a busca atualiza a própria lista de conversas automaticamente após debounce e não abre modal/popover/lista paralela.
- [x] `ruandieg` encontra `ruandiegl33@gmail.com` por correspondência parcial e indica `E-mail` quando o e-mail está disponível no resumo.
- [x] Nome, telefone normalizado, grupo e mensagem textual retornam resultados sem exigir palavra completa.
- [x] Query vazia não envia `q`; limpeza restaura a lista original e preserva os demais filtros da fila.
- [x] Cada conversa aparece uma única vez, com match e snippet seguros quando há correspondência em mensagem.
- [x] O servidor mantém RBAC, escopo de departamento e filtros; a busca é aplicada antes de `LIMIT/OFFSET`.
- [x] Loading, vazio, erro e retry aparecem no mesmo painel/lista da fila e preservam a query digitada.
- [x] Escape limpa o campo; o card existente continua sendo o único alvo para abrir a conversa.
- [x] A busca não apresenta URLs de mídia, tokens, vCard, histórico integral ou HTML interpretável.
- [x] A fila mantém o layout atual em desktop/mobile, sem superfície sobreposta ou overflow criado pela busca.
- [x] Backend e frontend compilam; testes de contrato e regressão passam.
- [x] Cancelamento por `AbortSignal`, debounce de 220 ms e cache curto reduzem requisições obsoletas.

## 9. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Uma requisição por tecla sobrecarregar a API | debounce, abort/cancelamento, limite, rate limit e cache curto |
| Resultado antigo substituir query nova | `AbortSignal`/requestId e query key completa |
| Busca parcial retornar PII indevida | escopo no repository, DTO mínimo e sanitização |
| `%`/`_` alterarem a intenção da busca | parâmetros SQL e escape/normalização definidos no repository |
| ILIKE degradar em base grande | medir p95/linhas; migration aditiva com trigram somente se necessário |
| Busca alterar a altura/estrutura da fila | reutilizar a lista existente, paginação e estados; não criar painel adicional |
| E-mail inexistente no modelo atual | verificar schema; tratar como campo opcional e não inventar dados |
| Eventos de socket causarem refetch contínuo | invalidar somente com painel/query ativos e coalescer eventos |

## 10. Definition of Done

1. Contrato e critérios aprovados no plano.
2. Backend busca todas as fontes acordadas com escopo e snippet seguro.
3. Frontend não depende de modal/popover para mostrar resultados.
4. Digitação incremental e correspondência parcial estão ligadas à lista de conversas.
5. Backend: build e 79 testes passaram; contrato específico da busca: 2 testes passaram.
6. Frontend: `tsc --noEmit` e build Vite de produção passaram (1957 módulos).
7. Documentação de produto, API, arquitetura, design system e performance atualizada.
