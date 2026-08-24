# Plano 026 — Categorias de atendimento, itens por aplicativo e resumo de contato conhecido

> **Status:** Concluído
> **Data:** 2026-08-24
> **Escopo:** modelagem do fluxo, editor visual, motor de execução, integração Z-API, contatos, RBAC, testes e rollout
> **Execução:** concluída em 2026-08-24; migração aditiva aplicada no ambiente local, contratos, editor, executor, preview e testes entregues
> **Pré-requisitos:** `plan-006` (fluxo completo), `plan-020` (botões dentro das rotas), `plan-022` (contatos e conversas) e `plan-025` (horário de funcionamento) disponíveis no ambiente alvo

## 1. Objetivo

Evoluir o fluxo do GTFBot para suportar uma jornada hierárquica de atendimento, na qual as categorias aparecem como cabeçalhos de um mesmo menu e os itens/problemas ficam listados logo abaixo de cada categoria. O cliente escolhe o item diretamente, sem uma etapa intermediária de seleção de categoria. O exemplo de referência é:

```text
Saudação
  └─ Escolha da equipe
       └─ Suporte
            └─ Menu agrupado (acordeão na configuração/prévia)
                 ├─ InfoAudio
                 │    ├─ Player — Player do AR
                 │    ├─ Central de Aplicativos — Terminal
                 │    ├─ Logger — Censura
                 │    └─ Integrações — vMix, NDI, ProgAuto...
                 └─ InfoRadio
                      ├─ Manager — Opec, financeiro, NFCom
                      └─ InfoRadio 3.8 — Opec, financeiro, NFCom
```

Também será criada uma passagem rápida para contatos já cadastrados. Quando uma conversa nova receber uma saudação como “Bom dia”, o bot poderá apresentar um resumo dos dados conhecidos e solicitar confirmação antes de continuar:

```text
Olá, {nome}. Seja bem-vindo(a) ...
Encontramos o seu cadastro:
Nome: {nome}
Emissora: {emissora}
Cidade/UF: {cidade}/{uf}
Seus dados estão certos?

[Sim, estão certos] [Atualizar meus dados]
```

O resumo não deve abrir chamado, enviar mensagem adicional ou alterar dados sem confirmação explícita. Contatos sem cadastro completo continuarão na saudação/triagem atual.

## 2. Problema e resultado esperado

Hoje o fluxo possui decisões e submenus, mas a configuração é limitada para cenários com vários níveis de escolha. Isso força a equipe a concentrar muitos problemas em uma única lista, aumenta o texto livre e dificulta a identificação do aplicativo ou produto relacionado.

Ao final da tarefa:

- administradores poderão criar categorias e itens aninhados dentro de uma rota;
- cada opção terá identificador estável, rótulo, descrição opcional e destino configurável;
- categorias e itens serão exibidos no mesmo menu, com o nome da categoria como cabeçalho e sem uma segunda tela de seleção;
- o fluxo poderá encaminhar o item escolhido para mensagem, procedimento, triagem ou atendimento;
- contatos locais cadastrados poderão confirmar ou atualizar o perfil antes da triagem;
- a experiência funcionará em modo claro/escuro, desktop e mobile, usando os componentes já adotados no projeto;
- respostas interativas terão fallback textual, idempotência e proteção contra respostas antigas.

## 3. Fora de escopo nesta versão

- classificação livre por IA ou interpretação semântica de qualquer texto do cliente;
- sincronização completa da agenda de contatos da Z-API com o cadastro local;
- menus com múltiplas seções em uma única mensagem sem comprovação de suporte na versão da instância;
- listas interativas em grupos do WhatsApp;
- alteração retroativa do caminho de conversas já iniciadas em outra revisão publicada;
- exclusão ou migração destrutiva dos campos atuais de `Contact`;
- envio automático de uma resposta apenas por abrir a tela de “nova conversa”.

## 4. Referências consultadas

### Documentação do projeto

- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/PRD.md`
- `docs/PRD_ZAPI.md`
- `docs/API.md`
- `docs/GUIDELINES.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/paleta.md`
- `docs/PRD_ATALHOS_PROCEDIMENTOS.md`
- `docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md`
- `plans/plan-003-crud-fluxo-bot-mapa-interativo.md`
- `plans/plan-006-fluxo-completo-triagem-editavel.md`
- `plans/plan-020-botoes-dentro-das-rotas.md`
- `plans/plan-022-contatos-recebidos-crud-conversas-zapi.md`
- `plans/plan-025-horario-funcionamento-mensagem-padrao.md`

### Z-API consultada via Context7

- [`send-button-list`](https://developer.z-api.io/message/send-button-list)
- [`send-option-list`](https://developer.z-api.io/message/send-option-list)
- [`on-message-received-examples`](https://developer.z-api.io/webhooks/on-message-received-examples)
- [`file-expiration`](https://developer.z-api.io/tips/file-expiration)
- [Button status e instabilidade](https://github.com/z-api/z-api-docs/blob/main/i18n/en/docusaurus-plugin-content-docs/current/tips/button-status.md)
- [`GET /contacts`](https://developer.z-api.io/contacts/get-contacts)

#### Decisões derivadas da consulta

1. `send-option-list` documenta uma lista plana com `title`, `buttonLabel` e `options[]` (`id`, `title`, `description?`). Não foi encontrada, na documentação oficial consultada, uma estrutura confiável de múltiplas seções/categorias em uma única lista.
2. O fluxo passa a enviar uma única lista de itens, sem obrigar o cliente a escolher a categoria em uma mensagem anterior. Cada item leva o nome da categoria no contexto da descrição e a interface administrativa/prévia exibe as categorias como acordeões, mantendo a hierarquia sem depender de uma estrutura de seções não documentada.
3. `send-button-list` é adequado para listas curtas; `send-option-list` é o transporte preferencial para itens com descrição.
4. Respostas devem ser correlacionadas pelos IDs estáveis `buttonsResponseMessage.buttonId` ou `listResponseMessage.selectedRowId`, juntamente com `referenceMessageId`; nunca pelo índice visual.
5. Listas interativas não devem ser enviadas para grupos. Em grupos, manter o comportamento já previsto para menção válida e, se necessário, responder no privado.
6. A API de contatos pode expor `phone`, `name`, `short`, `notify` e `vname`, mas não fornece emissora, cidade/UF ou outros campos de cadastro da operação. Esses dados permanecem na base local.
7. Os limites de quantidade e tamanho de rótulos precisam ser homologados por instância e centralizados em configuração; não serão inferidos de forma rígida apenas pelo front-end.

## 5. Agentes selecionados em `agents/README.md`

| Ordem | Agente | Responsabilidade |
|---|---|---|
| 1 | `product-manager.agent.md` | Fechar a jornada categoria → item, textos, confirmação do perfil, regras de fallback e critérios de aceite. |
| 2 | `tech-lead-architect.agent.md` | Definir a extensão do grafo, invariantes, profundidade máxima, compatibilidade de revisões e contratos entre editor, motor e Z-API. |
| 3 | `backend-developer.agent.md` | Implementar schemas Zod, migração aditiva de contatos, execução de decisões, templates, idempotência e transporte interativo. |
| 4 | `frontend-developer.agent.md` | Evoluir editor, preview, formulário de contato e estados de confirmação usando React, React Query e shadcn. |
| 5 | `security-engineer.agent.md` | Revisar RBAC, exposição de PII, autorização de dados, replay de respostas e limites de payload. |
| 6 | `qa-testing-engineer.agent.md` | Cobrir contrato, grafo, respostas Z-API, fallback, regressões, acessibilidade e E2E. |
| 7 | `devops-infra-engineer.agent.md` | Preparar migração, feature flags, canário, métricas, configuração por ambiente e rollback. |

Sequência recomendada: Product Manager → Tech Lead → Backend/Frontend → Security → QA → DevOps. A execução deve permanecer coordenada pelo agente principal, sem criar tarefas paralelas fora da política do projeto.

## 6. Diagnóstico do estado atual

### 6.1 Fluxo e editor

- `FlowNodeType` possui `ENTRY`, `MESSAGE`, `DECISION`, `ROUTE`, `TRIAGE`, `HANDOFF` e `END`.
- `FlowNodeConfig` já contém `decisionOptions`, `parentRouteId`, `decisionScope` e `buttonMessage`.
- `FlowTransition` já guarda `optionKey`, `label` e `sortOrder`, o que permite preservar IDs durante a reordenação.
- `plan-020` implementou um submenu de rota, porém `flow-model.ts` ainda restringe a um único submenu por rota e `rebuildTransitions()` trata o ramo de forma linear.
- O motor já resolve `buttonId`/`selectedRowId`, usa `referenceMessageId`, persiste `decisionSelections` e rejeita respostas fora do prompt atual.

### 6.2 Contatos

- `Contact` possui `name`, `phone`, `isRegistered`, `email`, `organization` e `notes`.
- O formulário de contato já usa `Dialog`, `FieldGroup`, `Field`, `Input`, `Textarea` e máscara de telefone.
- Não existem campos estruturados para emissora, cidade e UF; `organization` não deve ser usado para armazenar múltiplos valores sem semântica.

### 6.3 Transporte

- `zapi.service` já oferece `send-button-list`, `send-option-list`, fallback textual e seleção por `ZAPI_INTERACTIVE_MODE`.
- A política de cooldown anti-spam e o tratamento de grupos devem continuar válidos para todos os novos prompts.

## 7. Decisões de produto e arquitetura

### 7.1 Hierarquia do menu

Usar o grafo existente, mantendo categorias como agrupamento de uma decisão de rota e não criando uma tabela paralela de categorias. Cada item continua tendo uma chave estável; a transição da categoria representa o destino do ramo, enquanto a seleção do item é registrada no contexto:

```text
ROUTE
  └─ DECISION (menu agrupado)
       ├─ InfoAudio
       │    ├─ Player
       │    └─ Logger
       └─ InfoRadio
            └─ Manager
```

Extensões de configuração propostas, preservando campos legados:

```ts
type FlowDecisionConfig = {
  decisionOptions: FlowDecisionOption[];
  decisionScope: "ROOT" | "ROUTE" | "CATEGORY" | "ITEM" | "CONTACT_CONFIRMATION";
  parentRouteId?: string;
  parentDecisionId?: string;
  decisionLevel?: "ROOT" | "CATEGORY" | "ITEM";
  categoryKey?: string;
};
```

`parentRouteId` continua aceito para o submenu já publicado. A relação de cada item com a categoria fica em `decisionGroups`; a transição da categoria preserva o ramo existente e a seleção do item é gravada no contexto antes do avanço.

Limites iniciais recomendados, configuráveis no backend:

- até 2 níveis visuais no menu (categoria → item), sem solicitar uma escolha intermediária ao cliente;
- até 20 opções por decisão, sujeito à homologação da instância;
- rótulo de opção até 80 caracteres e descrição até 120, mantendo os limites Zod atuais;
- total máximo de 200 nós e 400 transições por rascunho, preservando o contrato existente;
- chaves estáveis geradas uma vez e nunca derivadas do texto exibido.

### 7.2 Estado da seleção

Adicionar ao `flowContext`, sem registrar o texto integral da conversa:

- `selectedCategoryKey` / `selectedCategoryLabel`;
- `selectedItemKey` / `selectedItemLabel`;
- `decisionSelections` por `nodeId` (mantendo o formato atual);
- `lastPromptMessageId` e `lastPromptNodeId` para rejeitar respostas antigas;
- `contactSummaryPresentedAt` e `contactSummaryAcceptedAt` quando aplicável.

O contexto deve ser atualizado de forma transacional junto com o avanço do nó. Webhooks duplicados com o mesmo `messageId` ou `externalEventId` não podem gerar uma segunda mensagem nem avançar o grafo duas vezes.

### 7.3 Resumo de contato conhecido

Para evitar uma migração arriscada de `FlowNodeType`, usar inicialmente um `DECISION` com `decisionScope: "CONTACT_CONFIRMATION"` e configuração explícita:

```ts
type ContactConfirmationConfig = {
  enabled: boolean;
  template: string;
  fields: Array<"name" | "station" | "city" | "state" | "email">;
  confirmOptionKey: string;
  updateOptionKey: string;
  nextNodeId: string;
  updateNodeId: string;
};
```

O motor executará duas ações consecutivas controladas pelo mesmo prompt:

1. renderizar o resumo usando apenas campos locais permitidos;
2. enviar opções “Sim, estão certos” e “Atualizar meus dados”.

Regra de ativação:

- conversa nova, sem agente assumido e sem mensagem de saída manual;
- contato local encontrado pelo telefone principal ou telefone alternativo;
- `isRegistered=true` e campos obrigatórios disponíveis;
- não estar em horário fora de expediente configurado, em exclusão de bot, em grupo ou em fluxo já avançado.

Se o contato não estiver completo, o motor pula o resumo e usa a saudação/triagem normal. Repetir “bom dia” não deve apresentar o resumo indefinidamente: respeitar o estado atual e um cooldown por conversa.

Campos aditivos recomendados no modelo `Contact`:

- `station` (emissora), opcional;
- `city`, opcional;
- `state`, opcional, validado como UF de duas letras;
- `profileConfirmedAt`, opcional, para auditoria da última confirmação.

`organization` continuará sendo lido para compatibilidade e poderá preencher `station` durante uma migração somente quando o campo novo estiver vazio. Nenhuma informação existente será apagada.

### 7.4 Atualização do cadastro

- “Sim, estão certos” marca o resumo como confirmado e continua para a categoria/rota configurada.
- “Atualizar meus dados” inicia uma coleta guiada dos campos habilitados pelo fluxo.
- O valor só é persistido depois de validação e confirmação final; campos não informados não sobrescrevem dados anteriores.
- O atendente poderá editar o contato pela tela existente; a confirmação no WhatsApp não concede ao cliente acesso a dados de outros contatos.

## 8. Backend e contratos

### 8.1 Persistência e schemas

- Criar migração Prisma aditiva para `station`, `city`, `state` e `profileConfirmedAt` em `gtf_contacts`.
- Atualizar `CreateContactBodySchema`, `UpdateContactBodySchema`, tipos de resposta e repositório.
- Estender `FlowNodeConfigSchema` com `parentDecisionId`, `decisionLevel` e `contactConfirmation` sem remover campos legados.
- Validar que `parentDecisionId` existe no mesmo rascunho, é decisão, não cria ciclo e pertence ao ramo esperado.
- Validar chaves únicas por decisão, destino existente, profundidade máxima e opções não vazias.
- Rejeitar configuração de resumo que exponha token, telefone de terceiros, notas internas ou conteúdo de mensagem.

### 8.2 Reconstrução e publicação do grafo

- Refatorar `rebuildTransitions()` para construir uma árvore/DFS de decisões, com uma transição por `optionKey` para seu destino real.
- Manter as transições lineares existentes quando não houver `parentDecisionId`.
- Atualizar `validateFlow()` para detectar ciclos, ramos órfãos, categorias sem itens e opções sem saída configurada.
- Preservar a imutabilidade das revisões publicadas e o vínculo da conversa à revisão inicial.
- Exibir erro de publicação com o caminho completo, por exemplo: `Suporte > InfoAudio > Player`.

### 8.3 Execução

- Generalizar `findDecisionChoice()` para localizar a decisão atual por `nodeId`, `referenceMessageId` e `optionKey`.
- Persistir a categoria e o item escolhidos; enviar os itens de todas as categorias em uma única etapa, preservando o nome da categoria na descrição/contexto de cada opção.
- Após o item, seguir a transição configurada para mensagem, triagem, handoff ou encerramento.
- Permitir fallback textual numerado com os mesmos IDs internos e limitar o fallback a uma mensagem por prompt.
- Criar um caminho específico de `CONTACT_CONFIRMATION` no executor, reaproveitando as funções de seleção e anti-replay.
- Não disparar resumo, categoria ou item se a mensagem for duplicada, o contato estiver bloqueado, for grupo sem menção válida ou já houver atendente humano em atendimento.

### 8.4 API e RBAC

- Manter endpoints de rascunho/publicação existentes, ampliando seus contratos.
- Reutilizar a permissão de edição/publicação do fluxo; não criar uma permissão que permita publicar sem revisar o fluxo.
- Reutilizar o CRUD de contatos para os novos campos; se a confirmação precisar de auditoria própria, adicionar `POST /contacts/:id/confirm-profile` protegido pela sessão, sem aceitar `agentId` do cliente.
- Garantir que apenas campos de perfil autorizados sejam retornados ao front-end; notas internas não entram no resumo enviado ao WhatsApp.

## 9. Front-end

### 9.1 Editor de fluxo

Usar os componentes shadcn já presentes no projeto, sem controles HTML crus quando houver equivalente:

- `Accordion` baseado em shadcn/Base UI para cada categoria e seus itens;
- `Dialog` para ações destrutivas e edição quando o formulário exigir mais espaço;
- `FieldGroup`, `Field`, `FieldLabel`, `FieldDescription`, `FieldError` para formulário;
- `Input` para nome, `Textarea` para descrição e mensagem;
- `Select` ou `Combobox` para destino, tipo de ação e categoria pai;
- `Button`, `Badge`, `DropdownMenu` para ações e estado;
- `AlertDialog` para excluir categoria/item ou publicar rascunho com pendências;
- `ScrollArea` para árvores longas e `Sheet`/layout responsivo em telas menores.

Interações:

- botão “Adicionar categoria” no ramo da rota;
- botão “Adicionar item” dentro do card da categoria;
- arrastar para reordenar dentro do mesmo nível, preservando `optionKey`;
- mover entre categorias somente mediante confirmação e validação do destino;
- indicador de profundidade e breadcrumb do ramo atual;
- preview à direita mostrando todas as categorias expandidas/recolhidas e os itens logo abaixo;
- edição sempre em modal; a lateral permanece como prévia, seguindo o padrão visual já solicitado.

### 9.2 Preview da conversa

Criar estados de preview separados:

1. resumo de contato conhecido;
2. menu agrupado em acordeão, com categorias e itens na mesma etapa;
3. mensagem/triagem/handoff final.

O preview deve mostrar o fallback textual, a versão de botão/lista escolhida e a indicação de que listas não são enviadas em grupos. Nunca enviar mensagens reais a partir do preview.

### 9.3 Cadastro de contato

Adicionar ao `ContactFormDialog` e ao perfil:

- Emissora;
- Cidade;
- UF;
- estado de cadastro (`Completo`, `Incompleto`, `Confirmado`);
- data da última confirmação, quando houver.

Usar tokens semânticos do design system, superfícies opacas, foco visível, suporte dark/light e mensagens de erro associadas aos campos. O resumo enviado ao cliente deve ser uma função pura de template, nunca renderizar componentes do front-end.

## 10. Segurança, privacidade e observabilidade

- Não registrar texto integral, e-mail, emissora ou cidade em logs de produção; usar IDs, contadores e hashes quando necessário.
- Sanitizar templates para impedir injeção de conteúdo no texto enviado.
- Não aceitar `optionKey`, `parentDecisionId` ou destino arbitrário fora do rascunho autorizado.
- Aplicar rate limit e idempotência às respostas do webhook.
- Métricas mínimas: `category_prompt_sent`, `item_prompt_sent`, `contact_summary_presented`, `contact_summary_confirmed`, `contact_summary_updated`, `invalid_choice`, `stale_choice`, `interactive_fallback`, `zapi_interactive_error`.
- Logs estruturados devem conter `conversationId`, `flowRevisionId`, `nodeId`, tipo da ação e resultado, nunca conteúdo sensível.
- Alertar quando uma instância exceder o limite de falhas de lista/botões ou quando houver aumento de escolhas inválidas.

## 11. Testes

### Backend e contrato

- schemas aceitam configurações válidas e rejeitam profundidade/ciclos/opções duplicadas;
- migração é aditiva e funciona com contatos antigos;
- cada `optionKey` mantém o destino após reordenação;
- publicação não altera revisões ativas;
- `buttonId`, `selectedRowId` e `referenceMessageId` levam ao ramo correto;
- mensagens duplicadas e respostas antigas são ignoradas;
- fallback textual mantém o mesmo ramo;
- resumo não expõe notas internas e não substitui campos com vazio;
- grupo, contato bloqueado, horário fora de expediente e conversa assumida seguem as regras atuais.

### Front-end e acessibilidade

- criar/editar/excluir categoria e item em modal;
- reordenação funciona por mouse e teclado, com anúncio de posição;
- preview atualiza sem recarregar e não envia mensagem real;
- formulário de contato valida UF, campos obrigatórios e estado incompleto;
- dark/light, viewport mobile, foco, contraste e navegação por teclado;
- estados de carregamento, erro, vazio e publicação pendente são claros.

### E2E/homologação Z-API

1. Publicar uma rota com `InfoAudio` e pelo menos quatro itens.
2. Enviar “Bom dia” de um contato completo e confirmar o resumo.
3. Escolher `InfoAudio` e depois `Player`; validar mensagem e handoff configurados.
4. Escolher “Atualizar meus dados”, concluir a coleta e confirmar persistência.
5. Repetir o webhook e verificar que não há duplicidade.
6. Testar versão de botão, versão de lista e fallback textual.
7. Testar grupo sem menção, menção válida e conversa já assumida.

## 12. Feature flags e rollout

Adicionar flags independentes:

- `FLOW_HIERARCHICAL_MENUS_ENABLED=false`;
- `CONTACT_SUMMARY_ENABLED=false`;
- `CONTACT_PROFILE_EXTENDED_FIELDS_ENABLED=false`;
- `ZAPI_INTERACTIVE_MODE=auto` (mantendo override por ambiente).

Sequência:

1. aplicar migração aditiva e deployar código compatível com flag desligada;
2. habilitar campos de contato para administradores internos;
3. habilitar categorias para um fluxo de teste e uma instância de homologação;
4. validar métricas e logs por pelo menos um ciclo de atendimento;
5. habilitar resumo somente para contatos completos;
6. ampliar gradualmente por fluxo/departamento;
7. manter rollback simples: desligar flags e preservar dados/revisões.

## 13. Critérios de aceite

- [ ] Um administrador consegue criar uma categoria dentro de uma rota e inserir, editar, excluir e reordenar itens.
- [ ] Cada item mantém sua chave e seu destino depois de reordenar ou publicar uma nova revisão.
- [ ] O cliente recebe uma única lista de itens; a categoria fica visível no contexto da opção e não existe uma etapa intermediária obrigatória de escolha de categoria.
- [ ] A seleção de item chega ao ramo correto mesmo com fallback textual ou resposta interativa.
- [ ] O editor bloqueia ciclos, opções duplicadas, ramos órfãos e excesso de profundidade com mensagem acionável.
- [ ] Um contato completo recebe um resumo configurável após a primeira mensagem e pode confirmar ou atualizar seus dados.
- [ ] Contato incompleto, grupo, conversa assumida, bloqueio de bot e horário fora de expediente não recebem o resumo indevidamente.
- [ ] A atualização de dados exige validação e confirmação, sem apagar valores existentes por campos vazios.
- [ ] Nenhuma informação interna ou segredo é exposta no WhatsApp, front-end ou logs.
- [ ] O comportamento antigo continua funcionando quando as flags estão desligadas.
- [ ] Testes automatizados e homologação Z-API cobrem os caminhos principais e o fallback.

## 14. Sequência de execução

1. **Produto:** confirmar árvore de categorias, textos padrão, campos obrigatórios do perfil e profundidade máxima.
2. **Arquitetura:** fechar contrato de `parentDecisionId`, escopos, transições e contexto.
3. **Dados:** implementar migração aditiva e schemas de contato.
4. **Motor:** implementar validação do grafo, traversal aninhado, resumo e idempotência.
5. **Transporte:** homologar listas/botões, fallback e comportamento de grupos na instância Z-API.
6. **Editor:** implementar árvore, modais, reordenação e preview com shadcn.
7. **Perfil:** incluir campos de emissora/cidade/UF e confirmação de cadastro.
8. **Segurança:** revisar RBAC, PII, templates e replay.
9. **QA:** executar testes de contrato, integração, E2E e acessibilidade.
10. **Rollout:** ativar flags por canário, observar métricas e documentar rollback.

## 15. Questões para fechar antes da implementação

- A categoria sempre será obrigatória depois da equipe ou poderá existir diretamente na saudação?
- O limite de três níveis (equipe → categoria → item) atende o negócio ou haverá necessidade de um quarto nível?
- Quais campos são obrigatórios para considerar o contato “completo”: emissora, cidade/UF, e-mail ou somente nome/telefone?
- O resumo deve ser configurável por fluxo, departamento ou globalmente?
- Após confirmar o cadastro, o cliente deve ir direto para categorias ou receber uma mensagem intermediária?
- Quais rótulos de fallback e qual mensagem devem ser usados quando a instância não aceitar listas?
- A equipe deseja armazenar histórico de cada confirmação do cliente ou apenas `profileConfirmedAt`?

## 16. Definition of Done

Esta tarefa estará concluída quando as decisões acima estiverem aprovadas, a migração aditiva estiver aplicada, o editor e o motor suportarem categorias/itens com IDs estáveis, o resumo de contato estiver protegido por confirmação, a integração Z-API estiver homologada com fallback, os testes passarem e o rollout com flags permitir desligar a funcionalidade sem perda de dados ou alteração das conversas existentes.
