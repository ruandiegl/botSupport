# Plano 006 — Editor Completo do Fluxo com Triagem Pós-Rota

> **Status:** Planejado
> **Data:** 2026-08-11
> **Relacionamento:** `docs/PRD.md`, `docs/PRD_ZAPI.md`, `docs/ARCHITECTURE.md`, `docs/GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, `docs/paleta.md`, `docs/API.md` e `plans/plan-003-crud-fluxo-bot-mapa-interativo.md`
> **Escopo:** produto, banco de dados, API, motor do bot, integração Z-API, editor visual, RBAC, testes, migração e documentação

## Objetivo

Evoluir o fluxo atual do bot para um construtor completo e versionado, no qual o administrador possa criar, selecionar, editar, duplicar, remover e reordenar todas as etapas permitidas da jornada — entrada, mensagens, decisão, rotas, triagem e encaminhamento — com a mesma interação de drag-and-drop já usada nas rotas.

Depois que o cliente escolher uma rota, o bot deverá executar a sequência configurada para aquele ramo, manter a conversa no status `BOT` durante a triagem e encaminhá-la para `QUEUED` somente quando chegar à etapa terminal de encaminhamento.

O ramo de Suporte deverá nascer com esta triagem editável:

```text
Você selecionou a equipe Suporte.
Por favor, informe-nos os dados abaixo para que possamos entrar em contato com você em breve:

Seu nome
Sua emissora
Sua cidade/UF
Sua necessidade de suporte
```

Esse conteúdo é apenas o valor inicial: poderá ser alterado, removido, duplicado e reposicionado como qualquer outra etapa válida.

## Diagnóstico do estado atual

1. `FlowDefinition` persiste apenas `name`, `greeting`, `menuMessage` e `options Json`.
2. O editor identifica rotas por índice (`option-0`, `option-1`), o que não fornece identidade estável após reordenação.
3. O rascunho existe somente no estado React; `PUT /flow` sobrescreve diretamente o fluxo consumido pelo bot.
4. `procedureMessage` aparece no contrato e no editor, mas não é usado pelo runtime.
5. `zapi.service.ts` contém uma mensagem de triagem fixa e altera a conversa para `QUEUED` imediatamente após a escolha da rota.
6. Não existe um motor que interprete nós, aguarde respostas e avance a conversa entre etapas.
7. Os botões enviados à Z-API usam IDs posicionais `1..N`; publicar uma reordenação pode interpretar incorretamente um botão antigo.
8. `Conversation.currentStep` é uma string livre e insuficiente para guardar versão, nó atual, ramo e respostas.
9. Não há versão publicada, rollback, proteção contra edição concorrente ou garantia de que conversas abertas permaneçam no fluxo em que começaram.
10. O `plan-003` considerava suficiente o JSON de opções e dispensava migração; essa premissa deixa de ser válida neste escopo.

## Decisões funcionais adotadas

1. O editor será um **grafo dirigido com restrições**, não um canvas arbitrário com ciclos.
2. Haverá exatamente uma entrada por fluxo e ao menos uma decisão com uma rota válida.
3. Cada rota possuirá uma sequência própria e ordenada de etapas pós-rota.
4. Tipos mínimos da primeira entrega:
   - `ENTRY`: ponto inicial único;
   - `MESSAGE`: envia texto sem aguardar resposta;
   - `DECISION`: exibe opções e aguarda escolha;
   - `ROUTE`: inicia um ramo e associa a equipe/departamento;
   - `TRIAGE`: envia um prompt editável, aguarda uma resposta e a registra no contexto;
   - `HANDOFF`: termina o ramo e coloca a conversa na fila;
   - `END`: encerra a automação sem encaminhamento, quando aplicável.
5. Um nó `TRIAGE` registra uma resposta livre. Para coleta em várias mensagens, o administrador cria vários nós de triagem e define uma chave de resposta para cada um.
6. Um único nó também poderá conter a lista completa do exemplo; nesse caso, a resposta inteira ficará vinculada à chave configurada, como `supportDetails`.
7. A conversa permanece em `BOT` enquanto aguarda uma escolha ou resposta de triagem.
8. A mudança para `QUEUED` ocorre somente no nó `HANDOFF`.
9. Entrada é única e não pode ser excluída. Rotas podem ser reordenadas entre si; etapas pós-rota são reordenadas dentro do próprio ramo.
10. Alterar a ordem não altera IDs estáveis nem o significado de botões já enviados.
11. Rascunho e publicado são estados distintos. Editar nunca muda conversas em execução.
12. A publicação exige confirmação `warning`; exclusões de nós/rotas usam confirmação `danger` conforme o padrão compartilhado.
13. A primeira entrega não tentará interpretar automaticamente nome, emissora ou cidade dentro de uma única resposta livre. A estrutura permitirá evoluir para validações por campo sem nova ruptura arquitetural.

## Jornada-alvo

```text
ENTRY
  ↓
MESSAGE — saudação
  ↓
DECISION — escolher equipe
  ├─ ROUTE — Suporte
  │    ↓
  │  MESSAGE — confirmação da equipe (opcional)
  │    ↓
  │  TRIAGE — dados de contato/necessidade
  │    ↓ aguarda resposta
  │  HANDOFF — fila Suporte
  ├─ ROUTE — Rede e Internet
  │    ↓
  │  sequência própria editável
  │    ↓
  │  HANDOFF — fila Rede
  └─ ROUTE — Áudio e Vídeo
       ↓
     sequência própria editável
       ↓
     HANDOFF — fila Áudio/Vídeo
```

## Agentes selecionados e ordem de atuação

### 1. Product Manager — `agents/product-manager.agent.md`

- validar a jornada, a semântica de cada nó e o momento do encaminhamento;
- manter histórias e critérios em `docs/PRD.md`;
- validar textos padrão, reinício, cancelamento, resposta inválida e abandono.

### 2. Tech Lead & Architect — `agents/tech-lead-architect.agent.md`

- fechar o modelo versionado, invariantes do grafo e estratégia de compatibilidade;
- aprovar contrato REST, transações de publicação e vínculo da conversa à versão;
- garantir as divisões `route → controller → service → repository` e páginas autocontidas.

### 3. Backend Developer — `agents/backend-developer.agent.md`

- implementar schema Prisma, migração, contratos Zod e APIs;
- criar o motor de execução separado do transporte Z-API;
- implementar IDs estáveis, idempotência e transições de estado.

### 4. Frontend Developer — `agents/frontend-developer.agent.md`

- componentizar o editor, inspectors e preview;
- implementar drag-and-drop acessível para mouse, toque e teclado;
- compor a interface sobre shadcn/ui, React Query e os tokens oficiais.

### 5. Security Engineer — `agents/security-engineer.agent.md`

- revisar permissões de editar/publicar, limites de payload, replay de webhook e sanitização;
- impedir exposição de tokens ou PII em logs e mensagens de erro.

### 6. QA & Testing Engineer — `agents/qa-testing-engineer.agent.md`

- executar testes unitários, integração, API, frontend, E2E WhatsApp e regressão;
- validar concorrência, reordenação, publicação e continuidade de conversas antigas.

### 7. DevOps & Infra — `agents/devops-infra-engineer.agent.md`

- preparar backup, migração, canário, observabilidade e rollback;
- validar `prisma migrate deploy`, geração do cliente e inicialização em produção.

**Sequência:** Product Manager → Tech Lead → Backend e Frontend em paralelo → Security → QA → DevOps/rollout.

## Arquitetura de dados proposta

### Definição e versões

- `FlowDefinition`: identidade permanente e nome do fluxo.
- `FlowRevision`: snapshot editável/publicável com `version`, `status` (`DRAFT`, `PUBLISHED`, `ARCHIVED`), `schemaVersion`, `revision`, `publishedAt`, `publishedById`, `createdAt` e `updatedAt`.
- `FlowNode`: `id`, `stableKey`, `flowRevisionId`, `type`, `name`, `content`, `sortOrder`, `config Json` e `departmentId?`.
- `FlowTransition`: `id`, `flowRevisionId`, `fromNodeId`, `toNodeId`, `optionKey?`, `label?` e `sortOrder`.

### Estado da conversa

Adicionar em `Conversation`:

- `flowRevisionId?`: versão fixa usada desde o início;
- `currentFlowNodeId?`: nó no qual a conversa está aguardando ou que executará em seguida;
- `flowContext Json?`: respostas e variáveis, como `teamName`, `supportDetails` e chaves de triagem;
- manter `currentStep` temporariamente durante a compatibilidade.

Adicionar `FlowExecutionEvent` ou estrutura equivalente para auditoria de entrada, transição, saída, erro e conclusão. Os logs devem usar IDs técnicos, sem conteúdo sensível.

### Invariantes

- somente uma revisão publicada ativa por definição;
- exatamente um `ENTRY`;
- IDs e `optionKey` únicos e imutáveis;
- todos os nós publicados alcançáveis;
- nenhuma transição pendente ou ciclo infinito;
- toda `DECISION` possui ao menos uma saída;
- toda rota termina em `HANDOFF` ou `END`;
- `HANDOFF` referencia departamento ativo/existente;
- todo `TRIAGE` possui prompt, chave de resposta e próxima transição;
- publicação e troca da versão ativa acontecem em uma transação;
- conversas em andamento nunca trocam de revisão automaticamente.

## Contrato de API proposto

Preservar o módulo `/flow` e introduzir contratos explícitos:

- `GET /flow/published`: retorna a revisão ativa;
- `GET /flow/draft`: retorna o rascunho atual ou clona o publicado conforme regra do serviço;
- `POST /flow/draft`: cria um rascunho a partir do publicado;
- `PUT /flow/draft/:id`: salva o documento completo de nós/transições atomicamente;
- `POST /flow/draft/:id/validate`: valida sem publicar;
- `POST /flow/draft/:id/publish`: valida e publica em transação;
- `POST /flow/draft/:id/preview`: opcional, simula um ramo sem enviar WhatsApp;
- `GET /flow/revisions`: lista versões para auditoria/rollback;
- `POST /flow/revisions/:id/restore`: cria novo rascunho a partir de versão anterior, sem reescrever histórico.

Salvar o documento completo é preferível a vários endpoints por nó, pois torna inserção/reordenação atômica. O payload deve conter `revision` ou `updatedAt`; conflito entre dois administradores retorna `409 Conflict` sem perder o rascunho local.

Manter `GET /flow` e `PUT /flow` apenas durante a janela de compatibilidade, com adaptador v1/v2 e aviso de depreciação documentado.

### RBAC

- manter `flow:view` para leitura;
- manter `flow:edit` para criar e salvar rascunho;
- adicionar `flow:publish` para publicar ou restaurar versões;
- atualizar a matriz do RBAC e os defaults sem conceder permissões indevidas a perfis existentes.

## Motor de execução

Criar `backend/src/modules/flow-execution/` separado do módulo de transporte Z-API.

Responsabilidades do webhook:

1. validar e normalizar o evento;
2. aplicar idempotência pelo identificador externo da mensagem/evento;
3. persistir a mensagem recebida;
4. localizar ou criar a execução ligada à revisão publicada;
5. delegar evento e estado ao motor;
6. enviar pela Z-API as ações retornadas pelo motor.

Responsabilidades do motor:

1. carregar revisão, nó atual, contexto e mensagem recebida;
2. resolver escolha por `optionKey` estável, mantendo número/texto somente como fallback;
3. percorrer nós automáticos (`ENTRY`, `MESSAGE`, `ROUTE`) até um nó de espera ou terminal;
4. em `DECISION`, enviar botões e aguardar seleção;
5. em `TRIAGE`, enviar o prompt, aguardar a próxima resposta, gravá-la em `flowContext` e avançar;
6. em `HANDOFF`, definir departamento, alterar `BOT → QUEUED` e emitir `conversation_updated` uma única vez;
7. em falha externa, manter estado recuperável para retry, evitando avanço silencioso.

O texto de triagem hardcoded deve ser removido de `zapi.service.ts`. Toda mensagem operacional virá da revisão publicada.

## Editor visual proposto

### Layout

- cabeçalho com nome, estado `Publicado/Rascunho`, descartar, visualizar e publicar;
- desktop: mapa/linhas do fluxo à esquerda e inspector contextual à direita;
- mobile: mapa principal e inspector em `Sheet`;
- preview WhatsApp do fluxo inteiro ou do ramo selecionado.

### Cards e interação

- cards brancos opacos, borda e tokens de `docs/paleta.md`;
- tipo exibido com `Badge`, preview em duas linhas e validação visível;
- seleção pelo UUID do nó, nunca pelo índice;
- handle de arraste dedicado para preservar edição e Backspace em inputs;
- placeholder ocupa o espaço previsto e desloca os demais cards como kanban;
- `DragOverlay`, auto-scroll e cancelamento por Escape;
- suporte a `PointerSensor`, `KeyboardSensor` e toque com `@dnd-kit/core`/`sortable`;
- ações “Mover para cima/baixo” como alternativa acessível;
- anúncio da nova posição em live region.

### Inspectors

- `EntryStepEditor`;
- `MessageStepEditor`;
- `DecisionStepEditor`;
- `RouteStepEditor`;
- `TriageStepEditor`;
- `HandoffStepEditor`;
- `EndStepEditor`.

Cada formulário usará composição shadcn/Base UI (`Field`, `FieldGroup`, `Input`, `Textarea`, `Select`, `Button`, `Card`, `Badge`, `Separator`, `AlertDialog`, `Sheet`, `ScrollArea`, `DropdownMenu`, `Tooltip` e `Empty`). Componentes ausentes só serão adicionados após `info`, documentação, `--dry-run` e revisão de diff, sem sobrescrever customizações existentes.

### Regras de UX

- erro de validação marca o card e leva foco ao primeiro campo inválido;
- excluir uma etapa referenciada exige confirmação e reconexão válida do ramo;
- publicação inválida é bloqueada no cliente e novamente no servidor;
- falha de API mantém rascunho e seleção;
- sair da página com alterações não publicadas solicita confirmação;
- reload recupera o rascunho persistido;
- nenhum UUID é exibido ao usuário;
- preview preserva quebras de linha, variáveis e fallback textual de botões.

## Componentização frontend prevista

- `[MODIFY] frontend/src/types/index.ts`: tipos discriminados v2;
- `[MODIFY] frontend/src/pages/admin/flow/index.tsx`: somente orquestração e layout;
- `[NEW] frontend/src/pages/admin/flow/components/FlowBuilder.tsx`;
- `[NEW] frontend/src/pages/admin/flow/components/FlowMap.tsx`;
- `[NEW] frontend/src/pages/admin/flow/components/SortableFlowNode.tsx`;
- `[NEW] frontend/src/pages/admin/flow/components/FlowNodeCard.tsx`;
- `[NEW] frontend/src/pages/admin/flow/components/FlowInspector.tsx`;
- `[NEW] frontend/src/pages/admin/flow/components/editors/*StepEditor.tsx`;
- `[NEW] frontend/src/pages/admin/flow/components/WhatsAppFlowPreview.tsx`;
- `[NEW] frontend/src/pages/admin/flow/lib/flow-model.ts`: factories, adaptador v1→v2, reorder e validação pura;
- `[MODIFY] frontend/src/pages/admin/flow/hooks/use-flow.ts`;
- `[MODIFY] frontend/package.json`: dependências `@dnd-kit/*`;
- `[MODIFY] frontend/src/styles.css`: somente tokens/layout excepcional e estados do overlay.

## Fases de execução

### Fase 0 — Contrato funcional

1. Registrar histórias de usuário e jornada em `docs/PRD.md`.
2. Confirmar tipos, restrições, resposta inválida, timeout, reinício e cancelamento.
3. Validar limites reais da Z-API para botões, labels e mensagens.
4. Corrigir a divergência entre `PRD_ZAPI.md` e o endpoint realmente usado (`send-button-list`/`send-option-list`).
5. Congelar contratos v2, critérios de aceite e feature flag.

### Fase 1 — Schema v2, versões e compatibilidade

1. Criar modelos/índices e campos opcionais por migração aditiva.
2. Atualizar `seed.ts` com o fluxo padrão e a triagem solicitada.
3. Criar adaptador do formato legado para nós/transições v2.
4. Converter saudação, menu, opções, `procedureMessage` e departamentos existentes.
5. Implementar leitura v2 com fallback v1.
6. Fixar novas conversas à revisão publicada.

### Fase 2 — API de rascunho/publicação

1. Implementar schemas Zod discriminados e validação estrutural.
2. Implementar repositórios e transações de salvar/publicar/restaurar.
3. Adicionar controle otimista e resposta `409`.
4. Separar `flow:edit` e `flow:publish` no RBAC.
5. Atualizar `docs/API.md`.

### Fase 3 — Motor do fluxo e Z-API

1. Criar módulo `flow-execution`.
2. Caracterizar o comportamento legado em testes antes da troca.
3. Remover decisões de negócio hardcoded do transporte Z-API.
4. Implementar os tipos de nó e persistência de contexto.
5. Substituir IDs posicionais por `optionKey` estável.
6. Implementar idempotência, retry e logs operacionais seguros.
7. Garantir `BOT → QUEUED` somente em `HANDOFF`.

### Fase 4 — Fundação do editor

1. Criar tipos discriminados e funções puras do modelo.
2. Separar `publishedFlow` e `draftFlow`.
3. Construir mapa, cards, seleção estável e inspectors.
4. Integrar erros por nó e preview de ramo.
5. Persistir rascunho sem publicar.

### Fase 5 — Drag-and-drop acessível

1. Introduzir `dnd-kit` após avaliação da dependência.
2. Reordenar rotas e etapas dentro de containers válidos.
3. Implementar placeholder, overlay, auto-scroll e preview.
4. Adicionar teclado, toque, anúncios e ações alternativas.
5. Testar que inputs não perdem foco e Backspace não inicia drag.

### Fase 6 — Publicação, conflitos e histórico

1. Validar localmente e pelo endpoint `/validate`.
2. Exibir resumo no `ConfirmationDialog` de publicação.
3. Tratar sucesso, erro, `409`, descarte e restauração.
4. Garantir que publicar/reordenar não afete conversas antigas.

### Fase 7 — QA, segurança, documentação e rollout

1. Executar a matriz de testes deste plano.
2. Revisar RBAC, payloads, PII, replay e logs.
3. Atualizar `PRD.md`, `PRD_ZAPI.md`, `ARCHITECTURE.md`, `API.md`, `DESIGN_SYSTEM.md` e `GUIDELINES.md` quando aplicável.
4. Criar runbook de migração e rollback.
5. Ativar em homologação, depois canário e produção monitorada.

## Arquivos backend previstos

- `backend/prisma/schema.prisma`;
- nova migração em `backend/prisma/migrations/`;
- `backend/prisma/seed.ts`;
- `backend/src/modules/flow/flow.schemas.ts`;
- `backend/src/modules/flow/flow.repository.ts`;
- `backend/src/modules/flow/flow.service.ts`;
- `backend/src/modules/flow/flow.controller.ts`;
- `backend/src/modules/flow/flow.routes.ts`;
- novo `backend/src/modules/flow-execution/`;
- `backend/src/modules/zapi/zapi.service.ts`;
- `backend/src/modules/zapi/zapi.repository.ts`;
- `backend/src/modules/conversations/` para expor estado/contexto quando necessário;
- `backend/src/modules/rbac/rbac.service.ts` e persistência relacionada;
- testes de fluxo, API, executor e Z-API.

## Matriz mínima de testes

### Validação e API

- fluxo válido v2 e adaptador do payload legado;
- IDs/chaves duplicadas, nós desconhecidos e ordem inválida;
- zero rotas, rota sem departamento, triagem sem próxima transição;
- nó desconectado, ciclo, terminal ausente e departamento inexistente;
- limites de texto/botões;
- `401`, `403`, `400`, `404` e `409`;
- salvar rascunho não altera publicado;
- publicação atômica e restauração sem apagar histórico.

### Motor

- entrada → mensagem → decisão;
- botão por ID estável e fallback por número/texto;
- rota → triagem → resposta → handoff;
- várias triagens executadas na ordem;
- uma triagem diferente em cada rota;
- conversa só entra em `QUEUED` no handoff;
- resposta inválida, mídia, timeout, cancelamento e reinício;
- departamento removido/inativo;
- callback duplicado não duplica mensagem nem avanço;
- falha Z-API mantém execução recuperável;
- conversa antiga termina na revisão antiga.

### Frontend

- selecionar, criar, editar, duplicar e excluir cada tipo permitido;
- reorder por mouse, toque, teclado e ações mover;
- placeholder e deslocamento estilo kanban;
- IDs, seleção e foco preservados após reorder;
- Backspace funciona dentro de inputs;
- erros por card/campo e foco no primeiro erro;
- preview e quebras de linha fiéis;
- publicar, recarregar e recuperar rascunho;
- conflito `409`, falha de rede e cancelamento;
- responsividade sem overflow e acessibilidade dos modais.

### E2E e regressão

- novo contato → entrada → decisão → Suporte → triagem padrão → resposta → fila correta;
- rotas Rede e Áudio/Vídeo com sequências independentes;
- menu antigo continua válido após nova publicação/reordenação;
- `autoReply` desligado e mensagens em `QUEUED/IN_PROGRESS` não reativam o bot;
- assumir, transferir, encerrar, fila, não lidas, chat, atalhos e CRUD de departamentos continuam funcionais;
- builds frontend/backend e testes existentes passam.

## Migração e rollout

1. Fazer backup do PostgreSQL.
2. Aplicar apenas migração aditiva; não remover colunas legadas.
3. Publicar backend dual-read antes do novo frontend.
4. Converter e validar o fluxo atual em revisão v2.
5. Homologar editor e executor com uma instância Z-API controlada.
6. Ativar por feature flag/canário.
7. Monitorar falhas de envio, duplicidade, tempo em `BOT`, abandono, handoffs e erros por nó.
8. Expandir após estabilidade.
9. Rollback: desativar o executor v2 e reativar a revisão publicada anterior; não reverter destrutivamente as tabelas enquanto houver conversas vinculadas.

## Riscos e mitigação

| Prioridade | Risco | Mitigação |
|---|---|---|
| P0 | Reorder encaminhar botão antigo para departamento errado | `optionKey` estável e conversa presa à revisão |
| P0 | Conversa perder estado durante publicação/deploy | revisão imutável + estado persistido por conversa |
| P0 | Webhook repetido avançar duas vezes | idempotência por evento e transação |
| P1 | Rascunho sobrescrever produção | draft/publicado separados e confirmação |
| P1 | Grafo inválido ser publicado | validador servidor + transação |
| P1 | Estado avançar e envio Z-API falhar | retry/outbox ou estado de envio recuperável |
| P1 | Departamento referenciado ser excluído | validação de vínculo e regra de exclusão |
| P1 | Dois administradores sobrescreverem mudanças | revisão otimista e `409` |
| P2 | Drag inacessível ou ruim no touch | dnd-kit, teclado, handles e ações alternativas |
| P2 | Payload exceder limites WhatsApp | limites Zod e preview/fallback |

## Critérios de aceite

1. O administrador consegue editar entrada, mensagens, decisão, rotas, triagens e handoffs pelo inspector contextual.
2. É possível criar, duplicar, remover e reordenar etapas permitidas com preview de inserção estilo kanban.
3. A ordem publicada permanece após recarregar a página.
4. Cada rota possui sequência pós-rota independente e editável.
5. A rota Suporte nasce com a mensagem solicitada neste plano.
6. A triagem real enviada pela Z-API vem do fluxo publicado; não existe texto de negócio hardcoded.
7. A conversa permanece em `BOT` até concluir as etapas de espera e só entra em `QUEUED` no `HANDOFF`.
8. As respostas de triagem ficam persistidas em `flowContext` e disponíveis ao atendimento/auditoria conforme regra definida.
9. Reordenar ou publicar não muda o significado de botões enviados nem afeta conversas em andamento.
10. Rascunho não altera produção e conflitos não causam perda silenciosa.
11. Fluxos inválidos não podem ser publicados e os erros indicam nó/campo.
12. Drag funciona com mouse, toque e teclado; inputs mantêm foco e Backspace normal.
13. A interface usa shadcn/ui, cards opacos e a paleta clara com `#2D89C8` como primária.
14. Permissões de visualizar, editar e publicar são aplicadas no frontend e backend.
15. Migração preserva o fluxo existente e possui rollback documentado.
16. Builds, testes automatizados, smoke test e E2E do WhatsApp passam.

## Definição de pronto

A tarefa estará concluída quando o editor e o runtime usarem o mesmo contrato versionado; a triagem pós-rota for totalmente configurável; a execução avançar com estado persistido até o handoff; reordenação for estável e acessível; conversas antigas permanecerem protegidas; RBAC, migração, testes, documentação, observabilidade e rollback estiverem entregues e validados.
