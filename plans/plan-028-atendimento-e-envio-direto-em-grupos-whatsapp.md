# Plano 028 — Atendimento e envio direto em grupos WhatsApp

> **Status:** Em execução — MVP implementado
> **Data:** 2026-08-25
> **Escopo:** atendimento de chamados no próprio grupo, respostas automáticas e humanas no JID do grupo, envio manual sem abertura de chamado, configuração, RBAC, auditoria, testes e rollout seguro
> **Pré-requisitos:** `plan-015` (grupos, menções e etiquetas), `plan-016` (identidade e delegação), `plan-020` (botões nas rotas), `plan-022` (contatos e conversas) e `plan-027` (envio de mídia temporária) disponíveis no ambiente alvo

## 1. Objetivo

Permitir que a operação atenda no mesmo grupo de WhatsApp em que a solicitação foi feita. Quando o número da instância for mencionado, o GTFBot deve abrir ou reutilizar um chamado identificado pelo grupo, avisar quem iniciou a solicitação e continuar a triagem e o atendimento no grupo, sem redirecionar automaticamente para uma conversa privada.

Também será possível enviar uma mensagem avulsa para um grupo pelo painel, sem criar chamado, sem iniciar o fluxo automático e sem alterar os indicadores da fila. A operação poderá escolher o grupo conhecido pela instância, escrever a mensagem, revisar o destino e acompanhar o resultado do envio.

Fluxo desejado:

```text
Mensagem no grupo com @GTFBot
        │
        ├─ menção válida à instância?
        │       ├─ não → ignorar sem resposta
        │       └─ sim
        │             ├─ criar/reabrir chamado do grupo
        │             ├─ registrar o participante que iniciou
        │             ├─ responder no grupo:
        │             │   "Chamado aberto por João no grupo Suporte TI.
        │             │    Seguiremos o atendimento por aqui."
        │             └─ executar triagem e atendimento no JID do grupo
        │
        └─ Mensagem avulsa no painel
                ├─ escolher grupo
                ├─ escrever e confirmar
                ├─ enviar para o JID do grupo
                └─ registrar auditoria, sem criar chamado
```

## 2. Contexto e diagnóstico atual

O projeto já aceita o contexto de grupo, identifica o participante e protege a menção com `mentionedJids`, aliases e cooldown. Porém o runtime atual mantém o chamado vinculado ao participante e utiliza o telefone individual como destino de todas as respostas. O comportamento vigente é:

1. uma menção válida em grupo abre/reutiliza uma conversa privada do participante;
2. a confirmação obrigatória é enviada por DM;
3. o grupo é salvo apenas como metadado (`groupChatName`/`groupParticipant`);
4. `conversationsService.sendMessage()` entrega em `conversation.contact.phone`, que é sempre um contato individual;
5. menus, triagem, mensagens de horário e encerramento também usam o alvo privado.

Essa implementação não atende operações nas quais o grupo é o registro público do atendimento. A alteração precisa separar claramente:

- **remetente da mensagem:** participante individual, usado para autoria, contato e exclusões do bot;
- **destino do atendimento:** grupo, usado para entregar mensagens automáticas e humanas;
- **identidade do chamado:** grupo, para que todos os participantes com acesso possam acompanhar o mesmo histórico;
- **envio avulso:** mensagem autenticada que não passa pelo ciclo de vida de `Conversation`.

O banco e o comportamento privado existente devem continuar compatíveis durante o rollout.

## 3. Referências consultadas

### Documentação do projeto

- `docs/README.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/PRD.md`
- `docs/PRD_ZAPI.md`
- `docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md`
- `docs/RUNBOOK_GRUPOS_ETIQUETAS.md`
- `docs/PRD_SOCKETIO.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/GUIDELINES.md`
- `docs/QA_CONTATOS_RECEBIDOS_ZAPI.md`
- `plans/plan-015-grupos-mencoes-etiquetas.md`
- `plans/plan-016-identidade-remetente-delegacao-chamados.md`
- `plans/plan-020-botoes-dentro-das-rotas.md`
- `plans/plan-022-contatos-recebidos-crud-conversas-zapi.md`
- `plans/plan-027-envio-midia-temporaria-zapi.md`

### Documentação Z-API consultada via Context7

- [Received text message webhook examples](https://developer.z-api.io/webhooks/on-message-received-examples)
- [Z-API group introduction](https://developer.z-api.io/group/introduction)
- [Send text message](https://developer.z-api.io/message/send-text)
- [Get all groups](https://developer.z-api.io/group/get-groups)
- [Group metadata](https://developer.z-api.io/group/metadata)
- [Mention participant](https://developer.z-api.io/group/mention-participant)
- [Mention all participants](https://developer.z-api.io/group/mention-all)

### Decisões derivadas da documentação

1. Em um callback de grupo, `phone` representa o ID/JID do grupo, enquanto `participantPhone`/`participantLid` identifica o remetente individual. O parser não pode substituir o primeiro pelo segundo.
2. IDs de grupo podem conter hífen e o sufixo `-group` (por exemplo, `120363019502650977-group`). Eles não podem passar pelo normalizador de telefone que remove todos os caracteres não numéricos.
3. `send-text` aceita como `phone` tanto telefone individual quanto ID de grupo. O envio deve usar o retorno `messageId`/`zaapId` para auditoria e idempotência.
4. A listagem de grupos da Z-API deve ser usada para preencher o seletor do painel. O backend será o único componente que conhece `instanceId` e token.
5. A API documentada para menção a participante é opcional para a primeira versão. A confirmação de abertura pode ser uma mensagem de texto comum com o nome do participante; não se deve inventar um campo de menção não documentado.
6. Botões e listas interativas não têm garantia de renderização no contexto de grupo no contrato atualmente adotado pelo projeto. No grupo, o transporte deve preferir texto numerado e aceitar resposta textual; a evolução para interativos fica condicionada a um teste real por instância.

## 4. Objetivos de produto

- manter o chamado e toda a conversa no grupo quando a menção for válida;
- informar no grupo quem iniciou o chamado e em qual grupo ele foi aberto;
- permitir que qualquer participante autorizado pelo modo da operação interaja com a triagem;
- fazer respostas do bot, atendentes, supervisores e administradores chegarem ao grupo correto;
- distinguir claramente conversas privadas de conversas de grupo na fila e no detalhe;
- enviar mensagens avulsas para grupos sem criar `Conversation`, sem iniciar triagem e sem incrementar a fila;
- manter autoria por mensagem, com nome do participante em mensagens recebidas e nome do atendente nas mensagens enviadas pelo painel;
- preservar o fluxo privado atual durante a migração e permitir rollback por configuração;
- não expor token, JID cru desnecessário ou credencial da Z-API no frontend, logs ou DTOs públicos;
- manter idempotência, cooldown, exclusões de bot, horário de funcionamento, mídia temporária e auto-close.

## 5. Fora de escopo da primeira versão

- sincronização completa de administradores ou permissões do grupo no WhatsApp;
- gravação de todo o catálogo de participantes como contatos cadastrados;
- edição ou exclusão de mensagens já enviadas no grupo;
- envio de listas interativas sem homologação da instância;
- transcrição automática de áudio, classificação por IA ou resumo do grupo;
- migração destrutiva de conversas privadas de grupo já existentes;
- envio avulso de mídia no primeiro incremento (pode reutilizar o transporte de mídia em uma fase posterior, após validar texto);
- resposta privada paralela automática quando o modo `IN_GROUP` estiver ativo.

## 6. Decisões de arquitetura

### 6.1 Modo de atendimento configurável

Adicionar à configuração da instância:

```ts
type GroupConversationMode = "PRIVATE_LEGACY" | "IN_GROUP";
type GroupResponseMode = "ANY_PARTICIPANT" | "ORIGIN_PARTICIPANT";
```

- `PRIVATE_LEGACY` preserva o comportamento atual: menção no grupo, chamado privado e confirmação por DM.
- `IN_GROUP` implementa o novo comportamento: chamado e respostas no grupo.
- `GroupResponseMode.ANY_PARTICIPANT` será o padrão da operação, pois a diretoria e a equipe precisam interagir no mesmo contexto. `ORIGIN_PARTICIPANT` fica disponível para grupos que exigem que apenas o solicitante responda à triagem.
- A flag geral `groupsEnabled` continua sendo a barreira mestre e permanece desligada por padrão em novos ambientes.
- Em `IN_GROUP`, `groupConfirmInGroup` deixa de ser opcional para a confirmação de abertura; a opção passa a controlar apenas uma mensagem adicional customizada, se a operação desejar.

### 6.2 Identidade do chamado de grupo

Não usar o JID do grupo como `Contact.phone`. Isso contaminaria a agenda de contatos, máscaras de telefone e exclusões destinadas a pessoas.

Adicionar à `Conversation`:

```prisma
channel       String  @default("PRIVATE") // PRIVATE | GROUP
remoteChatId  String? @map("remote_chat_id") // telefone ou JID do destino
```

Regras:

- `PRIVATE`: `remoteChatId` pode ser preenchido com o telefone canônico, mas o fallback continua sendo `contact.phone`.
- `GROUP`: `remoteChatId` é o ID/JID do grupo; nunca deve ser substituído pelo participante.
- `contactId` permanece obrigatório para compatibilidade e representa o contato de origem da primeira menção. Ele não representa o destino de entrega quando `channel=GROUP`.
- `groupChatName` guarda o último nome legível recebido da Z-API.
- `groupParticipant` mantém o participante de origem apenas como metadado compatível; a autoria de cada mensagem deve usar `Message.senderContactId` e snapshots.
- O repositório deve encontrar uma conversa aberta por `(channel=GROUP, remoteChatId)`; conversas encerradas podem coexistir como histórico.
- Criar índice parcial PostgreSQL para impedir duas conversas não encerradas para o mesmo grupo, sem impedir históricos encerrados. A migration deve ser escrita manualmente quando o Prisma não representar a condição parcial.

As conversas privadas criadas pelo comportamento antigo permanecem intactas. Elas não devem ser convertidas automaticamente porque não há JID de grupo confiável em todos os registros antigos.

### 6.3 Remetente versus destino

O parser deve produzir um modelo discriminado, sem espalhar `any`:

```ts
type IncomingTarget =
  | { kind: "PRIVATE"; chatId: string; senderPhone: string }
  | { kind: "GROUP"; chatId: string; groupName: string; senderPhone: string; senderLid?: string };
```

O serviço deve usar:

- `target.chatId` para enviar respostas e procurar a conversa de grupo;
- `target.senderPhone` para criar/localizar o contato, salvar `senderContactId`, consultar `BotExclusion` e gerar o nome do remetente;
- `payload.messageId` para claim/idempotência;
- `payload.fromMe` para ignorar ecos de mensagens produzidas pela própria instância.

Criar um helper único `resolveConversationDeliveryTarget(conversation)` para impedir que algum caminho (triagem, horário, auto-close, mídia ou encerramento) volte a usar `contact.phone` em um chamado de grupo.

### 6.4 Fluxo de menção em grupo

No modo `IN_GROUP`:

1. validar webhook, `fromMe`, newsletter/status e identidade do grupo;
2. verificar `groupsEnabled` e o modo configurado;
3. confirmar menção explícita à instância usando os helpers atuais;
4. rejeitar `@all`, broadcast e menções a outros participantes;
5. fazer claim atômico por `messageId` antes de qualquer envio externo;
6. reservar cooldown por `(groupId, participant)`;
7. criar ou reabrir a conversa do grupo;
8. persistir a mensagem recebida com o participante real;
9. aplicar etiqueta de sistema `GROUP`;
10. enviar no grupo a confirmação configurada, por exemplo:

```text
📋 Chamado aberto por {{nome}} no grupo {{grupo}}.
Seguiremos o atendimento por aqui.
```

11. continuar o fluxo publicado usando `remoteChatId` como destino;
12. emitir `message:new` e `conversation:updated` depois da persistência.

Não enviar confirmação privada no modo `IN_GROUP`, exceto se uma configuração explícita de contingência estiver ativa. Se a entrega externa falhar, manter o chamado e a mensagem recebida, registrar falha recuperável e não avançar silenciosamente o fluxo.

### 6.5 Triagem e respostas de participantes

- `ANY_PARTICIPANT`: qualquer mensagem válida no grupo pode escolher rota, submenu ou responder à triagem. O contexto registra `lastFlowActorContactId` para auditoria.
- `ORIGIN_PARTICIPANT`: escolhas de outros números entram no histórico, mas não avançam o fluxo; o bot responde uma única vez informando que aguarda o solicitante original.
- Menções a pessoas que não sejam a instância não acionam o bot nem avançam a triagem.
- Enquanto houver atendente humano assumido, mensagens permanecem no histórico e não reiniciam a saudação.
- Quando uma decisão possuir botões/lista, usar fallback textual numerado no grupo, preservando `optionKey`, `referenceMessageId` e anti-replay. Uma resposta interativa só será habilitada por uma flag após homologação.

### 6.6 Mensagem humana no grupo

`conversationsService.sendMessage()` deve resolver o alvo pela conversa:

```ts
const target = conversation.channel === "GROUP"
  ? conversation.remoteChatId
  : conversation.contact.phone;
await zApiService.sendText(target, signedContent);
```

O texto continuará usando a assinatura configurada do atendente, mas o cartão da mensagem deve deixar claro que ela foi enviada ao grupo. Em caso de falha do provedor, a mensagem não pode ficar marcada como enviada.

Mídias futuras devem usar a mesma função de destino, sem replicar lógica de telefone em cada endpoint.

## 7. Mensagem avulsa sem chamado

### 7.1 Regra de negócio

Abrir a tela, selecionar um grupo ou digitar uma mensagem não cria atendimento. O envio avulso:

- exige uma ação explícita de envio;
- não executa saudação, horário, triagem, etiquetas de chamado ou auto-close;
- não entra na fila `OPEN`, `IN_PROGRESS` ou `CLOSED`;
- registra uma auditoria mínima de sucesso/falha;
- usa idempotência por `clientMessageId` para não duplicar mensagens quando o navegador repetir a requisição.

### 7.2 Modelo de auditoria

Criar `GroupOutboundMessage` (nome a confirmar na Fase 0):

```prisma
model GroupOutboundMessage {
  id                String   @id @default(uuid())
  groupChatId       String   @map("group_chat_id")
  groupNameSnapshot String?  @map("group_name_snapshot")
  agentId           String   @map("agent_id")
  clientMessageId   String   @unique @map("client_message_id")
  providerMessageId String?  @map("provider_message_id")
  content           String
  status            String   @default("PENDING") // PENDING | SENT | FAILED
  failureCode       String?  @map("failure_code")
  createdAt         DateTime @default(now()) @map("created_at") @db.Timestamptz
  sentAt            DateTime? @map("sent_at") @db.Timestamptz

  @@index([groupChatId, createdAt])
  @@index([agentId, createdAt])
  @@map("gtf_group_outbound_messages")
}
```

O service cria o registro `PENDING`, chama `send-text`, grava `providerMessageId`/`SENT` ou `FAILED` e retorna um resultado amigável. Nunca persistir token ou URL da Z-API.

### 7.3 Endpoint e destino

```http
GET  /api/zapi/groups?page=1&pageSize=50&q=
GET  /api/zapi/groups/:groupId/messages
POST /api/zapi/groups/:groupId/messages
```

Body mínimo:

```json
{
  "message": "Mensagem de teste",
  "clientMessageId": "uuid-do-cliente"
}
```

`groupId` é o identificador interno retornado pelo catálogo (`GET /api/zapi/groups`); o backend resolve esse registro para o JID remoto. O backend deve validar o grupo contra a lista obtida da instância ou exigir uma confirmação adicional para IDs colados manualmente. O frontend nunca monta a URL da Z-API.

## 8. API, schemas e RBAC

### 8.1 Configuração Z-API

Estender `GET/PUT /api/zapi/config` com:

```ts
{
  "groupsEnabled": boolean,
  "groupConversationMode": "PRIVATE_LEGACY" | "IN_GROUP",
  "groupResponseMode": "ANY_PARTICIPANT" | "ORIGIN_PARTICIPANT",
  "groupCooldownSeconds": number,
  "groupConfirmMessage": string,
  "groupConfirmInGroup": boolean
}
```

O telefone/ID real da instância continua somente leitura e mascarado no painel. O template permite apenas `{{nome}}` e `{{grupo}}`, com limite de tamanho e validação Zod.

### 8.2 Permissões

Adicionar o recurso `groups` às permissões:

- `groups:view`: listar grupos disponíveis e abrir o modo de composição;
- `groups:send_message`: enviar mensagem avulsa sem criar chamado;
- `groups:send_media`: reservado para uma fase futura;
- `zapi:configure`: alterar modo de atendimento em grupo;
- `conversations:send_message`: enviar dentro de um chamado já aberto, inclusive `channel=GROUP`.

Defaults recomendados:

- ADMIN: todas as ações;
- SUPERVISOR: `view` e `send_message`;
- AGENT: `view` por padrão; `send_message` somente se concedido explicitamente pelo RBAC.

O serviço deve verificar escopo e permissão no servidor, mesmo que a ação não apareça no frontend. Alterar a configuração de `IN_GROUP` continua restrito a administrador/supervisor conforme a política atual de Z-API.

### 8.3 DTOs seguros

Os DTOs de grupo devem retornar somente:

```ts
{ id: string; name: string; isGroup: true; lastMessageAt?: string; unread?: number }
```

Não devolver token, `instanceId`, lista integral de participantes ou `mentionedJids` para o navegador. No detalhe do chamado, mostrar o nome do grupo e nomes/snapshots de remetentes, nunca JIDs crus.

## 9. Frontend e experiência de uso

Usar os componentes shadcn já adotados no projeto e manter o padrão visual atual, com superfícies opacas, foco acessível e suporte a tema claro/escuro.

### 9.1 Fila e detalhe

- adicionar badge `Grupo` e nome do grupo na linha da fila;
- diferenciar avatar/nome do grupo do contato de origem;
- no cabeçalho do chamado, mostrar `Grupo: <nome>` e subtítulo `Mensagens recebidas identificam cada participante`;
- em cada mensagem recebida, exibir o nome do participante e, quando houver, o contato cadastrado;
- mensagens enviadas por atendentes exibem assinatura atual e destino `Grupo`;
- manter assumir, delegar, encerrar, etiquetas, notificações e Socket.IO funcionando no mesmo `conversationId`.

### 9.2 Nova mensagem de grupo

Criar uma página `/groups` ou uma seção de “Mensagens” acessível por RBAC, além de uma entrada na ação `Nova conversa`:

- `Combobox` shadcn com busca incremental de grupos;
- estado de grupo selecionado com nome e ID mascarado;
- `Textarea` para mensagem, contador e validação de conteúdo vazio;
- confirmação visual de destino antes do envio;
- `AlertDialog` somente se o ID tiver sido colado manualmente ou o grupo não estiver no cache;
- `Progress`/estado `Enviando`, sucesso e falha amigável;
- botão cancelar limpa o rascunho e não cria chamado;
- após sucesso, mostrar `Mensagem enviada ao grupo` e manter a seleção para novo envio;
- nenhuma conversa aparece na fila como efeito colateral.

### 9.3 Configuração administrativa

Na tela `/admin/zapi`, adicionar card `Atendimento em grupos`:

- toggle mestre de grupos;
- select `Continuar no grupo`/`Atender no privado`;
- select de participantes `Qualquer participante`/`Somente solicitante`;
- cooldown;
- template da confirmação;
- preview do texto final;
- aviso de que listas/botões podem virar fallback textual no grupo;
- estado de configuração, último teste e botão de retry.

Quando o modo `IN_GROUP` estiver desativado, a UI deve explicar que o comportamento privado continua ativo, sem apagar dados existentes.

## 10. Backend e decomposição por arquivos

### Backend

- `backend/prisma/schema.prisma`: `Conversation.channel`, `remoteChatId`, `GroupOutboundMessage` e relações;
- migration aditiva com índice parcial para uma conversa aberta por grupo;
- `backend/src/modules/zapi/zapi.schemas.ts`: config, callback discriminado, lista de grupos e envio avulso;
- `backend/src/modules/zapi/zapi.service.ts`: parser grupo/remetente, modo, destino e respostas no grupo;
- `backend/src/modules/zapi/zapi.repository.ts`: configuração, grupos, target de conversa e idempotência;
- `backend/src/modules/conversations/conversations.service.ts`: target resolver, envio humano em grupo, acesso e formatação;
- `backend/src/modules/conversations/conversations.repository.ts`: buscas por `channel`/`remoteChatId`, histórico e índices;
- envio avulso de grupo implementado no módulo Z-API, mantendo Route → Controller → Service → Repository → Schema;
- `backend/src/modules/rbac/rbac.service.ts` e `backend/prisma/seed.ts`: recurso `groups` e defaults;
- `backend/src/shared/events.ts`/Socket.IO: eventos de grupo e envio avulso;
- testes em `backend/test/`: contratos, grupos, concorrência, RBAC e regressão privada.

### Frontend

- `frontend/src/types/index.ts`: `ConversationChannel`, `GroupSummary`, `GroupOutboundMessage`;
- `frontend/src/pages/groups/` com `index.tsx`, hooks e componentes;
- `frontend/src/pages/conversation/hooks/` para grupos e envio avulso;
- `frontend/src/pages/conversation/components/ConversationHeader.tsx`, `MessageBubble` e `ConversationRow` para o destino de grupo;
- `frontend/src/pages/admin/zapi/` para modo, escopo e preview;
- `frontend/src/app/`/menu/RBAC para rota `/groups`;
- componentes shadcn `Combobox`, `Dialog`, `AlertDialog`, `Textarea`, `Badge`, `Progress`, `Toast`/feedback.

### Documentação

Atualizar:

- `docs/API.md` com target de grupo, endpoints e respostas;
- `docs/ARCHITECTURE.md` com a separação remetente/destino e auditoria sem chamado;
- `docs/PRD_ZAPI.md` com modo `IN_GROUP` e fallback de interativos;
- `docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md` com o novo comportamento sem DM;
- `docs/RUNBOOK_GRUPOS_ETIQUETAS.md` com homologação e rollback;
- `docs/README.md` com referência a este plano/runbook;
- novo `docs/RUNBOOK_ATENDIMENTO_EM_GRUPOS.md`.

## 11. Segurança e privacidade

- manter a validação exata da menção à instância; não ativar por nome parecido ou qualquer `@`;
- rejeitar broadcasts e `@all`, inclusive quando vierem junto com a menção ao bot, conforme a regra vigente;
- não usar o JID do grupo como número de contato ou chave de exclusão individual;
- validar group ID com parser próprio e limite de tamanho; não remover hífens de IDs válidos;
- permitir envio avulso somente para grupos retornados pela instância/cache autorizado, salvo modo manual explicitamente habilitado;
- aplicar rate limit por agente + grupo e limite de mensagens por minuto;
- proteger contra duplo clique e replay por `clientMessageId`;
- limitar tamanho do texto e impedir conteúdo vazio/controle malicioso;
- não registrar corpo integral, token, `mentionedJids`, telefone completo ou participant JID em logs;
- redigir IDs externos em logs e usar identificadores internos/hashes quando necessário;
- preservar exclusões de bot por participante; no modo grupo, uma exclusão individual deve silenciar a resposta automática provocada por aquele participante, sem impedir o atendimento humano no grupo;
- auditar quem enviou mensagem avulsa, para qual grupo e qual retorno da Z-API.

## 12. Eventos e observabilidade

Emitir somente após persistência:

- `conversation:group_opened` com `conversationId`, nome do grupo e nome do iniciador;
- `group_message:new` com o registro seguro de mensagem avulsa;
- `conversation:updated` com canal, status e grupo;
- `message:new` para cada mensagem recebida/enviada dentro do chamado.

Métricas mínimas:

- `group_mention_processed`, `group_mention_ignored_*`, `group_mention_cooldown`, `group_duplicate_event`;
- `group_conversation_created`, `group_conversation_reused`, `group_delivery_success`, `group_delivery_failed`;
- `group_direct_message_sent`, `group_direct_message_failed`, `group_direct_message_duplicate`;
- latência do webhook e do envio Z-API;
- percentual de mensagens de grupo que caem em fallback textual.

Correlacionar por `conversationId`, `messageId` externo redigido e identificador interno do agente. Nunca logar o corpo da mensagem de cliente ou o token.

## 13. Testes e critérios de aceite

### Webhook e abertura no grupo

- grupo sem menção continua ignorado;
- menção a outro participante não ativa o bot;
- menção válida cria uma conversa `channel=GROUP` com `remoteChatId` igual ao `payload.phone`;
- `contactId` da conversa corresponde ao participante de origem, mas o destino de envio é o grupo;
- a confirmação informa o nome do participante e do grupo e aparece no grupo, sem DM em `IN_GROUP`;
- uma nova mensagem de outro participante entra na mesma conversa e preserva `senderContactId`/`senderNameSnapshot`;
- respostas automáticas de saudação, triagem, horário e encerramento são enviadas ao grupo;
- mensagens `fromMe` não reabrem nem duplicam o fluxo;
- mesma `messageId` não duplica conversa, mensagem, etiqueta ou confirmação;
- cooldown continua sendo por grupo + participante;
- `PRIVATE_LEGACY` mantém os testes e o comportamento privado anteriores;
- reabrir uma conversa fechada cria/recupera a conversa de grupo conforme a política definida, sem misturar histórico privado.

### Envio humano

- atendente autorizado envia texto para o `remoteChatId` do grupo;
- falha do provedor não marca a mensagem como enviada;
- assinatura do atendente permanece correta;
- delegação, assumir, encerramento silencioso e notificações continuam funcionando;
- mídias já suportadas não usam `contact.phone` quando o canal for grupo (a extensão de mídia em grupo fica atrás de flag até homologação).

### Mensagem avulsa

- abrir a tela não cria conversa nem mensagem de cliente;
- envio vazio, grupo inexistente ou permissão ausente retorna erro amigável;
- mensagem válida chega no grupo e cria apenas `GroupOutboundMessage` `SENT`;
- retry com o mesmo `clientMessageId` retorna o resultado anterior sem reenviar;
- erro da Z-API grava `FAILED` sem aparecer na fila de chamados;
- agente sem `groups:send_message` recebe 403 mesmo que altere o frontend;
- botão de cancelar não faz requisição nem cria auditoria.

### Frontend e regressão

- grupos aparecem com badge e cabeçalho claros;
- mensagens exibem participante correto, não o responsável atual;
- combobox abre para baixo, tem loading/empty/error e não sobrepõe outros controles;
- configuração mostra preview do texto e alerta sobre fallback de interativos;
- dark/light mode, teclado, foco e telas menores permanecem utilizáveis;
- fluxo privado, auto-close, horário, mídia, contatos, etiquetas, busca global e notificações permanecem verdes;
- `prisma validate`, testes de backend, build backend, `npx tsc --noEmit` e build frontend passam.

## 14. Fases de execução

### F0 — Fechamento do contrato

- confirmar com a operação se todo grupo pode ser atendido por qualquer participante ou se haverá grupos restritos;
- capturar fixtures reais anonimizadas de callbacks de grupo com `participantPhone`, `participantLid`, `mentionedJids`, `phone` e `chatName`;
- validar em uma instância de teste o envio de texto para um group ID real;
- decidir nome final de `GroupOutboundMessage`, retenção de auditoria e estados;
- congelar contratos Zod, RBAC e templates.

**Saída:** decisão registrada, fixtures e matriz de aceite aprovadas.

### F1 — Modelo e compatibilidade

- migration aditiva para canal/destino, auditoria avulsa e config;
- índice parcial de conversa aberta por grupo;
- backfill conservador: não inferir JID de grupos antigos;
- Prisma generate/validate e testes de migração.

**Saída:** banco compatível, sem remover ou reescrever conversas existentes.

### F2 — Runtime de grupos

- parser discriminado, target resolver e modo `IN_GROUP`;
- abertura/reuso da conversa do grupo, autoria por participante e confirmação pública;
- entrega de bot e humano no grupo;
- fallback textual de triagem e proteção de exclusão/cooldown/idempotência.

**Saída:** um grupo de homologação consegue completar menção → triagem → atendimento no próprio grupo.

### F3 — Mensagem avulsa e catálogo de grupos

- endpoint seguro de listagem/cache;
- módulo de envio avulso com auditoria e idempotência;
- tela/seção de grupos, seletor, confirmação e estados de envio;
- RBAC e eventos Socket.IO.

**Saída:** agente autorizado envia mensagem ao grupo sem gerar chamado.

### F4 — UI do chamado e configuração

- badge/canal na fila e no detalhe;
- remetentes individuais renderizados por mensagem;
- configuração de modo, política de participante e template;
- preview de fallback e estados de erro/retry.

### F5 — Segurança, QA e rollout

- executar matriz unitária, contrato, concorrência, RBAC, integração Z-API e E2E;
- validar logs/redaction e limites;
- ativar primeiro leitura de grupos, depois envio avulso em grupo de teste, depois `IN_GROUP` em um grupo-piloto;
- monitorar 24–48 horas antes de expandir;
- rollback para `PRIVATE_LEGACY` ou `groupsEnabled=false` sem apagar dados.

## 15. Possíveis ideias complementares

Estas ideias não devem bloquear o MVP, mas podem ser consideradas na Fase 0 ou abertas como histórias posteriores:

1. **Política por grupo:** permitir que cada grupo tenha departamento padrão, template próprio, horário de atendimento e modo `ANY_PARTICIPANT`/`ORIGIN_PARTICIPANT`.
2. **Menção nominal do atendente:** usar a API documentada de menção a participante para avisar o atendente responsável, somente quando houver um JID válido e consentimento operacional.
3. **Respostas citadas:** preservar o `messageId` citado para que o atendente responda a uma mensagem específica do grupo, reduzindo ambiguidades em grupos movimentados.
4. **Comando de encerramento:** permitir que um atendente autorizado use uma ação explícita para encerrar o chamado no grupo, sem que uma palavra comum acione o fluxo.
5. **Resumo de contexto para novos participantes:** mostrar no painel um resumo privado da conversa, sem enviar histórico automaticamente para o grupo.
6. **Ações de grupo com confirmação:** permitir anexar mídia, documentos ou atalhos, sempre com confirmação do destino e limites de tamanho.
7. **Fila por grupo e métricas:** medir tempo até primeira resposta, grupos com maior volume, participantes recorrentes e chamadas que exigiram transferência.
8. **Modo somente leitura:** permitir que alguns grupos recebam mensagens do bot, mas não abram chamados sem uma menção válida.
9. **Proteção contra loops entre bots:** ampliar exclusões para grupos inteiros apenas como regra administrativa excepcional, mantendo o bloqueio individual como padrão.
10. **Janela de privacidade:** mostrar no painel um aviso quando uma ação será publicada para todos no grupo, evitando envio acidental de informações internas.

## 16. Riscos e mitigações

| Risco | Impacto | Mitigação |
|---|---:|---|
| Confundir `phone` do grupo com telefone do participante | Alto | Tipos discriminados, target resolver único e testes de payload real |
| Resposta sair por DM em vez do grupo | Alto | `channel` + `remoteChatId`, teste de destino e modo `IN_GROUP` explícito |
| Mensagens de vários participantes avançarem a triagem ao mesmo tempo | Alto | `groupResponseMode`, lock otimista por conversa e registro do ator |
| Duplicidade em retry do webhook ou clique no envio | Alto | unique `externalMessageId`, claim, `clientMessageId` e estados recuperáveis |
| Expor JID, token ou histórico indevido | Alto | DTO seguro, RBAC server-side, redaction e nenhum segredo no frontend |
| Listas/botões não renderizarem no grupo | Médio | fallback textual numerado e flag de interativos após homologação |
| Grupo desconhecido receber mensagem por ID colado | Alto | validar catálogo da instância e confirmação extra para modo manual |
| Migração quebrar filtros/contatos atuais | Médio | migration aditiva, defaults, sem backfill inferido e regressão completa |
| Mensagem avulsa ser confundida com chamado | Médio | modelo de auditoria separado, sem `Conversation` e sem eventos de fila |
| Falha do Z-API após persistência | Médio | estado `PENDING/FAILED`, retry idempotente e observabilidade |

## 17. Rollout e rollback

1. Aplicar migration aditiva com `groupsEnabled=false` e modo `PRIVATE_LEGACY`.
2. Publicar listagem de grupos e RBAC sem expor a ação por padrão.
3. Testar envio avulso em um grupo interno controlado.
4. Ativar `IN_GROUP` em uma única instância/grupo-piloto, usando texto simples/fallback.
5. Confirmar menção, triagem, mensagem humana, encerramento e retorno de participante diferente.
6. Monitorar duplicidade, destino incorreto, falhas de entrega, latência e mensagens privadas inesperadas.
7. Expandir por grupo/instância após aprovação operacional.

Rollback imediato:

- mudar `groupConversationMode` para `PRIVATE_LEGACY` ou `groupsEnabled=false`;
- revogar `groups:send_message` se houver risco de envio avulso;
- manter conversas e auditorias já persistidas;
- não apagar `GroupOutboundMessage`, não executar reset do banco e não remover colunas;
- reprocessar somente eventos idempotentes após corrigir o destino.

## 18. Agentes recomendados e ordem de trabalho

Conforme `agents/README.md`, os agentes mais adequados para esta tarefa são:

1. **`product-manager.agent.md`** — fechar política de atendimento público, participantes autorizados, templates e separação entre chamado e mensagem avulsa.
2. **`tech-lead-architect.agent.md`** — definir `channel`, `remoteChatId`, índice parcial, compatibilidade e contratos de destino.
3. **`backend-developer.agent.md`** — implementar parser Z-API, runtime em grupo, envio humano, módulo de mensagens avulsas, schemas Zod e APIs.
4. **`security-engineer.agent.md`** — revisar JID/group ID, escopo, rate limit, logs, token, replay e privacidade do grupo.
5. **`frontend-developer.agent.md`** — construir seletor de grupos, composição avulsa, configuração e representação visual do canal.
6. **`qa-testing-engineer.agent.md`** — criar fixtures, testes de concorrência, destino, RBAC, fallback e regressão privada.
7. **`devops-infra-engineer.agent.md`** — migration, índices, flags, secrets, canário, métricas e rollback.

A execução deve permanecer coordenada pelo agente principal, sem delegação paralela de tarefas nesta etapa, respeitando a política do projeto.

## 19. Definition of Done

- modo `IN_GROUP` documentado e desligado por padrão até homologação;
- menção válida abre/reutiliza uma única conversa por grupo e responde no grupo;
- confirmação identifica o participante que iniciou e não envia DM indesejada;
- mensagens de todos os participantes são persistidas com autoria correta;
- bot, atendente, supervisor e administrador usam o mesmo destino de grupo;
- mensagem avulsa envia para grupo sem criar `Conversation`, sem iniciar fluxo e com auditoria idempotente;
- lista de grupos, RBAC, configuração e UI respeitam escopo e não expõem segredos;
- fallback textual cobre menus e botões não suportados no grupo;
- exclusões de bot, cooldown, horário, mídia temporária, auto-close e delegação continuam funcionando;
- fixtures e testes cobrem payloads reais anonimizados, concorrência, falha externa e rollback;
- `prisma validate`, migrations, build backend/frontend e testes de regressão aprovados;
- runbook de ativação, monitoramento e rollback entregue à operação.

## 20. Execução realizada

O incremento MVP foi aplicado de forma aditiva e sem backfill destrutivo:

- `Conversation` agora distingue `PRIVATE` e `GROUP`, preserva o JID de destino e relaciona o chamado ao catálogo interno de grupos;
- `GroupChat` e `GroupMessage` registram grupos e mensagens recebidas mesmo antes da menção, com idempotência por `messageId`, participante e indicador de menção;
- no modo `IN_GROUP`, uma menção válida abre/reutiliza um único chamado do grupo e as mensagens do bot, triagem, horário e atendentes usam o JID do grupo;
- mensagens de outros participantes continuam no histórico do grupo; a política `ORIGIN_PARTICIPANT` impede que avancem a triagem quando configurada;
- `GroupOutboundMessage` registra envios avulsos com estados `PENDING`, `SENT` e `FAILED`, idempotência por `clientMessageId` e sem criação de `Conversation`;
- endpoints protegidos foram adicionados para catálogo, histórico e envio direto (`/api/zapi/groups` e `/api/zapi/groups/:groupId/messages`);
- RBAC recebeu o recurso `groups`, com tela `/groups` para listar grupos, consultar histórico e enviar texto ao grupo;
- a tela Z-API recebeu os modos de destino e de participantes, mantendo `PRIVATE_LEGACY` como padrão para rollout seguro;
- a migration de auditoria foi mantida separada da migration já aplicada, e a nova migration de saída foi aplicada sem alterar dados existentes.

Pendências para homologação antes de ativar em produção: validar um grupo real da instância, confirmar o comportamento de menus interativos na conta utilizada e executar o canário descrito na seção 17. Até essa validação, manter `groupsEnabled=false` ou `PRIVATE_LEGACY`.
