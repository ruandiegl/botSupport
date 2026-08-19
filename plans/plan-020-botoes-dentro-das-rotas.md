# Plano 020 — Botões e submenus configuráveis dentro das rotas do fluxo

> **Status:** Concluído  
> **Data:** 2026-08-19  
> **Execução:** submenu configurável implementado no editor e no motor, com IDs estáveis, transporte adaptativo Z-API, correlação de prompt, testes e documentação atualizada  
> **Escopo:** produto, editor de fluxo, motor de execução, integração Z-API, API, RBAC, testes e rollout  
> **Pré-requisitos:** `plan-006` concluído; revisão v2 do fluxo publicada; motor `flow-execution` ativo

## 1. Objetivo

Permitir que uma rota escolhida no menu inicial apresente uma segunda decisão configurável. Exemplo:

```text
Saudação
  └─ Escolha uma equipe
       └─ Suporte
            └─ O que você precisa?
                 ├─ Suporte técnico
                 ├─ Acesso e senha
                 ├─ Rede e Internet
                 └─ Outro assunto
                      └─ triagem opcional → encaminhamento para a fila
```

O administrador deverá criar, editar, excluir, reordenar e visualizar esses botões dentro de cada rota, sem depender somente da saudação. A seleção deverá permanecer vinculada ao ramo correto, mesmo após reordenação ou publicação de uma nova revisão.

O recurso não deve alterar o comportamento de conversas já iniciadas: cada conversa continuará presa à revisão publicada na qual começou.

## 2. Referências consultadas

### Documentação do projeto

- `docs/README.md`
- `docs/PRD.md`
- `docs/PRD_ZAPI.md`
- `docs/API.md`
- `docs/ARCHITECTURE.md`
- `docs/GUIDELINES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/paleta.md`
- `plans/plan-003-crud-fluxo-bot-mapa-interativo.md`
- `plans/plan-006-fluxo-completo-triagem-editavel.md`
- `agents/README.md` e os perfis especializados listados abaixo

### Documentação Z-API consultada via Context7

- [`send-button-list`](https://developer.z-api.io/message/send-button-list): envio de `buttonList.buttons[]`, com `label`, `id` opcional e `delayMessage` limitado a 1–15 segundos.
- [`send-option-list`](https://developer.z-api.io/message/send-option-list): envio de lista com `title`, `buttonLabel` e `options[]` contendo `id`, `title` e `description`.
- [`on-message-received-examples`](https://developer.z-api.io/webhooks/on-message-received-examples): respostas recebidas em `buttonsResponseMessage.buttonId` e `listResponseMessage.selectedRowId`, além de `referenceMessageId`.
- [`file-expiration`](https://developer.z-api.io/tips/file-expiration): referência de retenção da própria Z-API, sem relação com a identidade dos botões.
- [Documentação de instabilidade de botões](https://github.com/z-api/z-api-docs/blob/main/i18n/en/docusaurus-plugin-content-docs/current/tips/button-status.md): confirma a necessidade de fallback textual e observabilidade.

Constatações relevantes da consulta:

1. A resposta deve ser correlacionada por identificador estável, nunca pelo índice visual do array.
2. A lista interativa (`send-option-list`) é documentada como limitada a conversas individuais e não deve ser enviada em grupos.
3. A Z-API aceita um atraso curto de entrega (`delayMessage` de 1–15 segundos); isso não substitui o cooldown anti-spam de 15 minutos já existente no motor.
4. A documentação consultada não fornece um limite único e confiável para quantidade de botões, tamanho de rótulos ou descrição em todas as versões da instância. Esses limites deverão ser confirmados em homologação e centralizados em configuração, sem inventar valores no código.

## 3. Agentes selecionados conforme `agents/README.md`

| Ordem | Agente | Responsabilidade no plano |
|---|---|---|
| 1 | `product-manager.agent.md` | Fechar a jornada de submenu, textos, comportamento sem escolha, profundidade permitida e critérios de aceite. |
| 2 | `tech-lead-architect.agent.md` | Definir a modelagem do grafo, invariantes, compatibilidade de revisão, concorrência e contrato entre motor e transporte. |
| 3 | `backend-developer.agent.md` | Implementar validação Zod, persistência/revisão, resolução de seleção, payloads Z-API, fallback e idempotência. |
| 4 | `frontend-developer.agent.md` | Evoluir o editor visual, DnD de opções e ramos aninhados, preview e composição com shadcn/Base UI. |
| 5 | `security-engineer.agent.md` | Revisar RBAC, limites de payload, replay, exposição de dados e segurança do webhook. |
| 6 | `qa-testing-engineer.agent.md` | Cobrir contrato, motor, Z-API, publicação, regressão, grupos e E2E WhatsApp. |
| 7 | `devops-infra-engineer.agent.md` | Preparar migração aditiva, feature flag, canário, métricas e rollback no Railway. |

Sequência recomendada: Product Manager → Tech Lead → Backend e Frontend → Security → QA → DevOps/rollout. A execução permanece coordenada pelo agente principal, respeitando a política do projeto de não criar tarefas paralelas fora do fluxo autorizado.

## 4. Diagnóstico do estado atual

### 4.1 Editor

- `frontend/src/pages/admin/flow/lib/flow-model.ts` usa `config.parentRouteId` para colocar etapas dentro de uma rota.
- `getBranchNodes()` só retorna os filhos diretos da rota e `rebuildTransitions()` encadeia esse conjunto de forma linear.
- O mapa possui uma decisão principal e etapas lineares pós-rota. Embora aceite o tipo `DECISION` em uma etapa de ramo, não cria transições de opções para esse nó nem oferece um editor de opções contextual.
- `DecisionStepEditor` edita apenas nome e mensagem; não há CRUD de transições/botões dentro da decisão.
- O preview exibe opções somente para a decisão principal.

### 4.2 Motor e transporte

- `FlowTransition` já possui `optionKey`, `label`, `sortOrder`, origem e destino, o que permite modelar uma decisão secundária sem usar posição do array.
- `flow-execution.service.ts` resolve `buttonId`, `selectedRowId`, número e texto, mas a ação de decisão ainda precisa expor o tipo de transporte e o contexto do ramo.
- Após selecionar uma rota, o fluxo deve continuar em `BOT`; somente `HANDOFF` muda para a fila.
- `zapi.service.ts` envia atualmente `send-button-list` e já possui fallback textual, mas o payload e os logs não distinguem decisão inicial de submenu.
- Conversas têm `flowRevisionId`, `currentFlowNodeId` e `flowContext`; esses campos devem continuar sendo a fonte do estado. Não usar o índice da opção ou o nome do departamento como identidade.

### 4.3 Risco funcional atual

Se a opção “Suporte” for reordenada ou uma nova opção for publicada, uma resposta antiga baseada em `1`, `2` ou no índice pode encaminhar o cliente para o ramo errado. A feature só estará pronta quando `optionKey` estável e `referenceMessageId` forem usados para evitar esse risco.

## 5. Decisões de produto propostas

1. **MVP:** cada rota poderá possuir uma decisão secundária (“submenu da rota”) com opções próprias. A estrutura deve ser extensível para decisões adicionais, mas a primeira publicação limitará a profundidade a dois níveis de escolha para reduzir loops e confusão de UX.
2. Cada botão terá rótulo visível, `optionKey` imutável, ordem, destino e ação de saída. O `optionKey` nunca será regenerado ao reordenar.
3. O destino de uma opção poderá ser mensagem, triagem, outra decisão secundária ou `HANDOFF`; uma opção não poderá ficar sem caminho alcançável até `HANDOFF` ou `END`.
4. Se a rota não possuir submenu, o fluxo atual de mensagem/triagem/handoff continuará funcionando sem mudança de configuração.
5. Ao selecionar a rota inicial, o bot enviará imediatamente o submenu válido. Cooldown anti-spam só vale para entrada inválida enquanto aguarda uma decisão; uma seleção válida não será atrasada.
6. A lista de opções será enviada somente em conversa privada. Para um fluxo iniciado por menção em grupo, a menção continua sendo confirmada no privado conforme `docs/PRD_ZAPI.md`; nunca enviar `send-option-list` para JID de grupo.
7. Se o endpoint interativo falhar, estiver indisponível para a instância ou exceder o limite homologado, o sistema enviará uma mensagem textual numerada, mantendo os mesmos `optionKey`s no lado do servidor.
8. Publicação de uma revisão nova não altera conversas em andamento. A conversa conserva o `flowRevisionId`, o `currentFlowNodeId` e o `referenceMessageId` do submenu que recebeu.
9. Resposta inválida, antiga ou pertencente a outro nó repete somente o submenu atual, com cooldown, sem encaminhar automaticamente.
10. Ações de edição/publicação seguem o Design System: cards opacos, `#2D89C8` para ação primária, `AlertDialog` de warning para publicar e danger para excluir, sem expor UUIDs.

## 6. Modelo de fluxo e dados

### 6.1 Modelo lógico

Reutilizar o grafo versionado existente:

```text
ENTRY → MESSAGE → DECISION inicial
                    ├─ ROUTE Suporte
                    │    └─ DECISION submenu-suporte
                    │         ├─ opção técnica → MESSAGE/TRIAGE → HANDOFF
                    │         └─ outra opção → TRIAGE → HANDOFF
                    └─ ROUTE Rede
                         └─ TRIAGE → HANDOFF
```

Uma decisão secundária será um `FlowNode` do tipo `DECISION` com `config.parentRouteId` igual à rota pai. Suas escolhas serão `FlowTransition` com `fromNodeId` apontando para esse nó e `optionKey`/`label` próprios. O destino não deve ser inferido pelo nome do botão.

### 6.2 Alterações de schema e compatibilidade

1. Verificar se o schema Prisma atual já comporta as transições adicionais. A preferência é **não criar tabelas novas**: usar `FlowNode`/`FlowTransition` existentes e aumentar `schemaVersion` apenas quando o contrato exigir.
2. Se for necessário distinguir decisão inicial e submenu, adicionar configuração tipada (`decisionScope`, `parentRouteId`, `referenceMode`) em `config Json`, com validação Zod; evitar campo obrigatório que quebre revisões antigas.
3. Manter o adaptador v1 (`options[].procedureMessage`) lendo a decisão principal e gerar revisão v2 compatível sem botões secundários.
4. Não apagar nem reescrever revisões publicadas. Toda edição ocorre em `DRAFT`; a publicação é transacional e usa `revision`/`updatedAt` para retornar `409` em conflito.
5. Persistir no `flowContext` somente dados operacionais mínimos, por exemplo `selectedOptionKey`, `parentRouteId`, `currentDecisionNodeId` e `lastPromptMessageId`. Não persistir tokens nem conteúdo desnecessário de PII.
6. Registrar eventos técnicos (`DECISION_PROMPTED`, `DECISION_SELECTED`, `INVALID_DECISION`, `FALLBACK_SENT`) com `flowRevisionId`, `flowNodeId`, `optionKey` e `externalEventId`, sem texto completo do cliente.

## 7. Contrato de API e validação

### 7.1 Payload do rascunho

Manter `PUT /flow/draft/:id` como operação atômica de documento completo:

```json
{
  "revision": 8,
  "nodes": [
    {
      "id": "uuid",
      "stableKey": "support-submenu",
      "type": "DECISION",
      "name": "Detalhamento de Suporte",
      "content": "Qual assunto descreve melhor sua necessidade?",
      "sortOrder": 0,
      "config": { "parentRouteId": "route-support", "decisionScope": "ROUTE" },
      "departmentId": null
    }
  ],
  "transitions": [
    {
      "id": "uuid",
      "fromNodeId": "support-submenu",
      "toNodeId": "support-triage",
      "optionKey": "support-password",
      "label": "Acesso e senha",
      "sortOrder": 0
    }
  ]
}
```

O contrato real continuará usando UUIDs no transporte administrativo, mas a UI não os exibirá.

### 7.2 Regras de validação de publicação

Adicionar ao validador do fluxo:

- exatamente uma entrada e uma decisão inicial alcançável;
- toda `DECISION` com ao menos uma transição com `optionKey`;
- `optionKey` único dentro da revisão, estável e limitado a caracteres seguros para payload;
- `label` obrigatório, não vazio e dentro do limite homologado;
- nenhuma transição apontando para nó inexistente;
- decisão secundária precisa estar vinculada a uma rota alcançável;
- profundidade máxima do MVP respeitada; decisões não podem formar ciclos;
- todas as opções alcançam `HANDOFF` ou `END`;
- `HANDOFF` aponta para departamento existente/ativo;
- não permitir decisão sem destino, ramo órfão ou duas terminais na mesma sequência;
- limite total de nós, transições, opções por decisão, tamanho de mensagem, título e descrição;
- configuração de transporte válida (`BUTTON_LIST`, `OPTION_LIST` ou `TEXT_FALLBACK`), sem permitir ao cliente fornecer URL/credencial Z-API;
- revisão otimista obrigatória; conflito retorna `409` sem descartar o rascunho local.

### 7.3 RBAC

Reutilizar `flow:view`, `flow:edit` e `flow:publish`. O backend deve validar a permissão em cada endpoint; ocultar o botão no frontend não é controle de acesso. Perfis somente leitura podem abrir o preview, mas não criar, excluir, reordenar ou publicar botões.

## 8. Motor de execução e integração Z-API

### 8.1 Normalização da entrada

No webhook:

1. Validar o envelope e aplicar idempotência por `messageId`/`externalEventId`.
2. Extrair, nesta ordem, `buttonsResponseMessage.buttonId`, `listResponseMessage.selectedRowId`, texto da resposta e fallback numérico.
3. Guardar `referenceMessageId` quando fornecido, relacionando a resposta ao prompt de decisão enviado.
4. Consultar a revisão fixa da conversa e o `currentFlowNodeId`; rejeitar uma opção válida para outro nó.
5. Manter tratamento existente de `fromMe`, exclusões de contatos, grupos, auto-reply desligado, cooldown e mensagens em `QUEUED`/`IN_PROGRESS`.

### 8.2 Execução após a rota

1. A seleção “Suporte” resolve o `optionKey` da decisão principal e avança para a primeira etapa do ramo.
2. Se a primeira etapa for uma decisão secundária, persistir o novo `currentFlowNodeId`, enviar o submenu e retornar `waiting_decision`.
3. Se a opção secundária levar a mensagem/triagem, executar a sequência na ordem e aguardar quando necessário.
4. Só executar `HANDOFF` quando o caminho terminal for alcançado; nessa transição mudar `BOT → QUEUED` uma única vez.
5. Em falha de entrega, reverter o estado persistido para o nó anterior, permitindo retry sem duplicar avanço.
6. Em resposta inválida ou stale, reenviar o prompt atual com fallback textual sujeito ao cooldown, sem trocar de departamento.

### 8.3 Adaptador de transporte

Criar um modelo interno único:

```ts
type InteractivePrompt = {
  promptId: string;
  conversationId: string;
  nodeId: string;
  message: string;
  options: Array<{ optionKey: string; label: string; description?: string }>;
  preferredTransport: "BUTTON_LIST" | "OPTION_LIST" | "TEXT_FALLBACK";
};
```

O adaptador deverá:

- escolher `send-button-list` para poucos botões e `send-option-list` quando a instância e o contexto privado suportarem lista;
- nunca usar o índice como identidade; o índice pode existir apenas no texto de fallback;
- incluir `id: optionKey` nos botões e linhas;
- manter mensagens e labels sanitizados e limitados;
- configurar `delayMessage` somente dentro do limite documentado de 1–15 segundos, sem bloquear escolhas válidas;
- detectar erro/instabilidade da Z-API, registrar métrica e enviar fallback textual uma única vez;
- não tentar lista interativa em grupos; o fluxo de grupo deve concluir a menção e continuar no privado;
- não expor instance ID, token, client token ou URL interna no frontend/logs.

## 9. Editor frontend

### 9.1 Mapa

Evoluir os componentes existentes:

- `FlowMap.tsx`: exibir cada rota como lane expansível com o card “Decisão da rota” e suas opções abaixo;
- `FlowNodeCard.tsx`: badge “Decisão da rota”, contador de opções e estado de validação;
- `FlowBuilder.tsx`: permitir adicionar submenu somente no ramo de uma `ROUTE` e manter a decisão inicial estrutural;
- `flow-model.ts`: substituir a suposição de uma sequência linear por containers de filhos diretos, preservando transições e IDs ao reordenar;
- `WhatsAppFlowPreview.tsx`: simular saudação → rota → submenu → triagem/handoff no ramo selecionado.

### 9.2 Inspector de decisão

Evoluir `components/editors/DecisionStepEditor.tsx` para:

- editar pergunta/instrução do submenu;
- listar opções em cards compactos com label, descrição opcional e destino;
- adicionar, duplicar, remover e reordenar opções por DnD acessível;
- criar automaticamente `optionKey` estável no primeiro cadastro e nunca alterá-lo ao mudar o texto;
- selecionar o próximo nó do ramo usando `Select`/`Combobox` shadcn, sem IDs expostos;
- mostrar aviso quando a opção não possui caminho até terminal;
- oferecer “Adicionar etapa após esta opção” para mensagem, triagem, decisão ou encaminhamento;
- preservar foco e conteúdo ao usar Backspace, teclado, toque e mover cards;
- utilizar `Dialog`, `AlertDialog`, `Field`, `Input`, `Textarea`, `Select`, `Badge`, `Separator`, `ScrollArea`, `Sheet` e `Tooltip` existentes, com superfícies opacas e tokens oficiais.

### 9.3 Regras de UX

- A ação deve ser explícita: “Adicionar submenu à rota”.
- A UI deve mostrar visualmente a hierarquia: `Rota Suporte → Submenu de Suporte → etapas`.
- Ordenar botões altera somente `sortOrder`, não o `optionKey`.
- Exclusão de botão/ramo usa confirmação danger; publicação usa confirmação warning.
- Preview não envia mensagens reais.
- Mudanças não salvas permanecem em rascunho e não afetam conversas atuais.
- Em mobile, o inspector abre em `Sheet`; o mapa não pode gerar overflow horizontal.
- Leitor de tela recebe anúncio da posição após reordenação; alvos de toque têm no mínimo 44 px.

## 10. Testes e critérios de qualidade

### 10.1 Contrato e serviço

- payload de submenu válido salva e recarrega sem perder opções;
- rejeita opção sem label, chave duplicada, transição órfã, decisão vazia, ciclo, profundidade excedida e departamento inexistente;
- `optionKey` continua igual após reorder, duplicação e publicação;
- revisão v1/v2 sem submenu continua executando como antes;
- duas publicações concorrentes retornam `409` sem sobrescrever o rascunho do outro administrador;
- RBAC bloqueia edição/publicação para perfis sem permissão.

### 10.2 Motor

- entrada → decisão inicial → Suporte → submenu → opção técnica → triagem → `HANDOFF`;
- rota sem submenu segue diretamente a sequência existente;
- submenu com mensagem, triagem e segunda decisão respeita ordem e espera;
- seleção por `buttonId`, `selectedRowId`, texto exato e número compatível;
- resposta stale/repetida não encaminha para outro ramo;
- `referenceMessageId` de outro prompt é rejeitado ou tratado como fallback inválido;
- retry de webhook é idempotente e não envia submenu duplicado;
- falha Z-API reverte estado e aplica fallback textual no máximo uma vez;
- escolha válida não sofre cooldown; texto inválido sofre cooldown configurado;
- `HANDOFF` ocorre uma vez e emite atualização de fila.

### 10.3 Z-API e grupos

- validar payload real de `send-button-list` e `send-option-list` em uma instância de homologação;
- descobrir e registrar limites de quantidade, labels e descrições da instância usada;
- confirmar que `send-option-list` não é enviado para JID de grupo;
- mencionar o bot no grupo, confirmar a migração para privado e executar o submenu no privado;
- menção a outro contato, mensagem sem menção e mensagem `fromMe` não iniciam o submenu;
- endpoint inativo ou erro 4xx/5xx produz fallback textual e métrica.

### 10.4 Frontend/E2E

- abrir `/admin/flow`, adicionar submenu somente na rota correta e publicar;
- recarregar e confirmar persistência das opções e da ordem;
- testar DnD mouse, toque, teclado, Escape, mover acima/abaixo e foco dos inputs;
- preview mostra a decisão correta para cada rota;
- validações bloqueiam publicação e focam o primeiro erro;
- fluxo completo em navegador com mensagem de botão e resposta textual;
- regressão de triagem, delegação, fila, encerramento, menções em grupos, exclusões do bot e atalhos;
- build frontend/backend e testes existentes sem falhas.

## 11. Observabilidade, segurança e desempenho

Métricas mínimas:

- `flow_decision_prompt_total{nodeType,transport}`;
- `flow_decision_selected_total{source=button|list|text|index}`;
- `flow_decision_invalid_total{reason}`;
- `flow_submenu_fallback_total{status}`;
- `flow_handoff_total{department}`;
- latência do webhook, Z-API e persistência do estado.

Logs devem conter somente IDs técnicos, revisão, nó, `optionKey` truncado/hash quando necessário e resultado. Nunca registrar tokens, telefone completo, conteúdo de triagem ou resposta sensível.

Limitar payloads por Zod, quantidade de nós/transições e tamanho de labels; aplicar rate limit ao webhook e idempotência por mensagem. Validar autorização da conversa no servidor e não confiar em `nodeId`, `optionKey` ou `departmentId` enviados pelo navegador.

## 12. Rollout e rollback

1. Fechar textos e profundidade do submenu com Product Manager.
2. Criar testes de caracterização do fluxo atual e fixture de payloads Z-API.
3. Implementar adaptador de leitura compatível com revisões sem submenu antes de liberar o editor.
4. Adicionar feature flag `FLOW_ROUTE_SUBMENUS_ENABLED=false` por instância/ambiente.
5. Publicar a mudança de backend e validar o rascunho sem ativar o motor para produção.
6. Homologar `send-button-list`, `send-option-list`, limites e fallback textual em conversa individual.
7. Ativar canário para uma instância de testes; observar seleções inválidas, fallback, duplicidade, latência e encaminhamento.
8. Expandir gradualmente; manter a flag para rollback imediato ao comportamento linear anterior.
9. Se houver alteração Prisma, aplicar migração aditiva com backup, `prisma migrate deploy`, geração do cliente e runbook de rollback. Não remover campos legados na primeira entrega.
10. Atualizar `docs/PRD.md`, `docs/PRD_ZAPI.md`, `docs/API.md`, `docs/ARCHITECTURE.md`, `docs/QA_FLUXO_V2.md` e registrar limites reais da instância homologada.

## 13. Critérios de aceite

- O administrador cria uma decisão secundária dentro de uma rota sem editar a saudação principal.
- Cada botão secundário possui label, ordem, destino e identidade estável; reordenar não muda o destino de respostas já enviadas.
- Uma conversa que escolhe Suporte recebe o submenu correto e não recebe a triagem/handoff antes da escolha secundária, quando essa etapa estiver configurada.
- O motor aceita resposta por botão, lista e texto compatível, rejeitando respostas de outro nó/revisão.
- Fluxos legados sem submenu permanecem funcionais.
- O fluxo só vai para `QUEUED` ao executar `HANDOFF`.
- `send-option-list` nunca é chamado para grupos; mensagens de grupo seguem o fluxo de menção e continuam no privado.
- Falhas ou limites da Z-API resultam em fallback textual sem duplicidade nem avanço incorreto.
- O editor possui preview, validação, confirmação de publicação/exclusão, DnD acessível e layout responsivo baseado nos componentes shadcn do projeto.
- Testes de contrato, motor, Z-API, frontend e E2E passam; nenhum segredo aparece em payload, log ou interface.

## 14. Resultado da execução

- O editor permite adicionar “Lista de botões” dentro de uma rota, editar rótulo/descrição, excluir e reordenar por arraste, teclado ou setas.
- Cada opção recebe `optionKey` estável e as transições são reconstruídas sem usar o índice como identidade.
- O motor mantém `teamName` da rota e registra o detalhamento em `selectedIssueKey`, `selectedIssueLabel` e `decisionSelections`.
- Respostas com `referenceMessageId` de outro prompt não avançam o fluxo.
- O transporte usa `send-button-list` ou `send-option-list` conforme `ZAPI_INTERACTIVE_MODE`, com fallback textual.
- Não houve migração destrutiva ou mudança de tabela: o recurso reutiliza `FlowNode.config` e `FlowTransition` do fluxo v2.
- Suíte backend: 65 testes aprovados, sem falhas ou pendências.
- TypeScript frontend e backend aprovados; homologação visual e teste real na instância Z-API permanecem como validação operacional antes do rollout amplo.
