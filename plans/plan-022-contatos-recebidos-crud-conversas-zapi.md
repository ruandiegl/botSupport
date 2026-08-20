# Plano 022 — Contatos recebidos pela Z-API, CRUD e novas conversas

**Status:** Concluído (implementação e banco local; homologação Z-API pendente)  
**Data:** 20/08/2026  
**Escopo:** ingestão de cartões de contato recebidos via webhook Z-API, exibição estruturada no chat, cadastro/edição de contatos e abertura de novas conversas a partir do cartão.  
**Estratégia:** evolução aditiva, idempotente e compatível com mensagens legadas; o payload bruto da Z-API nunca chega ao navegador.

## 1. Objetivo

Quando alguém compartilhar um contato pelo WhatsApp, o atendente deve visualizar o nome e os telefones reais dentro da conversa, em vez do texto genérico “Mensagem recebida”. O cartão recebido terá ações claras para:

- adicionar o contato à agenda da plataforma;
- editar os dados antes/depois do cadastro;
- consultar conversas relacionadas;
- iniciar uma nova conversa com um telefone escolhido.

O recurso deve continuar respeitando o escopo da conversa e o RBAC, não criar duplicidades em retransmissões do webhook e não expor `vCard` bruto, URLs, tokens ou outros campos não necessários ao front-end.

## 2. Referências consultadas

### Documentação do projeto

- [`docs/README.md`](../docs/README.md)
- [`docs/PRD.md`](../docs/PRD.md)
- [`docs/PRD_ZAPI.md`](../docs/PRD_ZAPI.md)
- [`docs/API.md`](../docs/API.md)
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md)
- [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md)
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md)
- [`docs/PRD_AUTO_CLOSE_AND_UNIFIED_STATUS.md`](../docs/PRD_AUTO_CLOSE_AND_UNIFIED_STATUS.md)
- [`docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md`](../docs/PRD_GRUPOS_MENCAO_ETIQUETAS.md)
- [`docs/PRD_CONTATOS_BLOQUEADOS.md`](../docs/PRD_CONTATOS_BLOQUEADOS.md), quando disponível no ambiente
- [`docs/PERFORMANCE_READ_MODEL.md`](../docs/PERFORMANCE_READ_MODEL.md)
- Planos já executados de mídia, identidade/delegação, fila e exclusões do bot.

### Documentação oficial da Z-API via Context7

Foi consultada a biblioteca oficial `/websites/developer_z-api_io` e a documentação complementar `/z-api/z-api-docs`.

O exemplo oficial de `ReceivedCallback` para contato confirma:

```json
{
  "messageId": "...",
  "phone": "5544999999999",
  "fromMe": false,
  "momment": 1632228925000,
  "type": "ReceivedCallback",
  "contact": {
    "displayName": "Cesar Baleco",
    "vCard": "BEGIN:VCARD\\nVERSION:3.0\\nFN:Cesar Baleco\\nTEL;...\\nEND:VCARD",
    "phones": ["5544999999999"]
  }
}
```

Fontes consultadas:

- [Z-API — On Message Received, exemplo de contato](https://developer.z-api.io/webhooks/on-message-received-examples)
- [Z-API Docs — estrutura de mensagens com contato](https://github.com/z-api/z-api-docs/blob/main/i18n/en/docusaurus-plugin-content-docs/current/chats/get-message-chats.md)
- [Z-API Docs — webhook on-message-received](https://github.com/z-api/z-api-docs/blob/main/i18n/en/docusaurus-plugin-content-docs/current/webhooks/on-message-received.md)
- [Z-API Docs — envio de contato](https://github.com/z-api/z-api-docs/blob/main/i18n/en/docusaurus-plugin-content-docs/current/message/send-message-contact.md)

O campo oficial é `contact.vCard` (C maiúsculo), acompanhado de `displayName` e `phones`. O parser deve aceitar apenas aliases de compatibilidade explicitamente documentados, como `vcard`, sem exibir o conteúdo bruto.

## 3. Diagnóstico do estado atual

### Backend

- `backend/src/modules/zapi/zapi.schemas.ts` valida texto, respostas interativas e mídia, mas não possui o objeto `contact`.
- `parseIncomingMessage` em `backend/src/modules/zapi/zapi.service.ts` calcula o conteúdo a partir de `text`, `body`, `caption` e mídia; quando nenhum deles existe, usa `"Mensagem recebida"`.
- `handleIncomingWebhook` já usa `messageId` como identidade externa e `zapi.repository.addIncomingMessage` persiste a mensagem de forma idempotente. Esse caminho deve ser preservado.
- `Contact` hoje possui apenas `phone` único e `name`; não há módulo REST de contatos nem endpoint para abrir uma conversa nova a partir do painel.
- `Message` não tem um tipo/artefato estruturado de contato. Armazenar somente um texto formatado perderia os telefones alternativos e impediria ações confiáveis no front-end.
- A criação de conversa existe internamente no repositório do Z-API, mas não há contrato público autenticado `POST /conversations` para uma ação manual do atendente.

### Frontend

- `frontend/src/pages/conversation/index.tsx` renderiza `item.content` e mídia; não há um renderer específico para contato.
- O tipo `Contact` exposto ao navegador contém apenas nome, telefone e iniciais.
- Não existem hooks/páginas para CRUD de contatos. O chat deve passar a renderizar um cartão opaco, acessível e baseado nos primitives shadcn existentes.

### Causa funcional

O comportamento observado não é causado por CORS: o webhook é uma chamada servidor-servidor. A mensagem fica genérica porque o objeto `contact` não é reconhecido pelo schema/parser e, portanto, o fluxo cai no fallback `"Mensagem recebida"`.

## 4. Decisões de produto

1. **Cartão de contato recebido:** toda mensagem válida com `contact` será persistida como mensagem do tipo `CONTACT` e exibida com nome, telefones e campos públicos normalizados.
2. **Ação principal:** se nenhum contato canônico estiver vinculado, o cartão mostra `Adicionar contato`. Se já houver correspondência, mostra `Contato cadastrado` e `Editar contato`.
3. **Múltiplos telefones:** todos os números válidos do cartão são exibidos; o atendente escolhe um telefone principal ao adicionar/editar ou ao iniciar conversa. O primeiro telefone válido é apenas uma sugestão, nunca uma decisão silenciosa.
4. **Deduplicação:** um telefone canônico identifica o contato. Se algum telefone já pertencer a um contato, o sistema oferece mesclar/usar o cadastro existente e nunca cria outro contato silenciosamente.
5. **Editar:** a edição ocorre em um modal shadcn separado, com campos de nome, telefones, e-mail, organização e observações. O cartão continua sendo uma prévia, sem formulário embutido.
6. **Nova conversa:** o atendente pode abrir uma conversa manual com um telefone do cartão. Por padrão ela é criada em `OPEN`, sem disparar mensagem automática; o usuário entra no chat e decide se assume e envia a primeira mensagem.
7. **Conversa já aberta:** se houver uma conversa não encerrada para o telefone escolhido, a ação `Ver conversa ativa` navega para ela e evita uma segunda conversa ativa. Uma nova conversa só é permitida depois de encerramento ou por uma ação explícita com justificativa e permissão elevada.
8. **Alteração do cadastro:** atualizar o contato altera o cadastro canônico e não reescreve o snapshot histórico de mensagens recebidas.
9. **Privacidade:** o `vCard` bruto, URLs de foto, JIDs, tokens e campos desconhecidos ficam somente no backend (ou são descartados após normalização); o DTO público contém apenas os campos necessários ao atendimento.
10. **Envio de contato pelo bot:** não faz parte do MVP. Se no futuro for necessário compartilhar um contato para fora, o transporte usará o endpoint oficial `/send-contact`, separado da criação de conversa.

## 5. Modelo de dados e migration

### 5.1 Mensagem estruturada

Adicionar de forma aditiva à `Message`:

| Campo | Regra |
|---|---|
| `messageType` | `TEXT` por padrão; `CONTACT` para cartão recebido. Manter string validada para compatibilidade com dados existentes. |
| `contactShare` | Relação opcional 1:1 para os dados normalizados do cartão. |

Criar `ContactShare` (nome sugerido `gtf_contact_shares`):

| Campo | Regra |
|---|---|
| `id` | UUID primário. |
| `messageId` | Único, relação com `Message` e `onDelete: Cascade`. |
| `displayName` | Nome recebido, texto puro, limite definido pelo schema. |
| `phones` | Lista JSON somente de números E.164/canônicos validados, sem JID. |
| `primaryPhone` | Número canônico escolhido para a prévia; pode ser nulo antes do cadastro. |
| `email` | Opcional e normalizado, se presente no vCard. |
| `organization` | Opcional, texto puro. |
| `note` | Opcional, texto puro e limitado. |
| `canonicalContactId` | Opcional; preenchido quando o cartão é adicionado/associado. |
| `createdAt` | Timestamp UTC. |

O campo JSON não deve ser usado como entrada livre do frontend: o service grava somente o DTO sanitizado e limita quantidade de telefones, tamanho total e campos suportados.

### 5.2 Enriquecimento do contato canônico

Adicionar campos opcionais e aditivos em `Contact`:

- `email`;
- `organization`;
- `notes`;
- `updatedAt`.

Para suportar mais de um telefone sem quebrar `Conversation.contactId`, criar `ContactPhone` (`gtf_contact_phones`) com:

- `id`, `contactId`, `phone`, `label`, `isPrimary`, `createdAt`, `updatedAt`;
- unicidade global por `phone` para impedir que o mesmo número pertença a dois contatos;
- índice por `contactId` e `isPrimary`.

O campo legado `Contact.phone` permanece como telefone principal durante a migração. O backfill cria um `ContactPhone` para cada contato atual; nenhuma conversa ou mensagem é reatribuída.

### 5.3 Regras de migration

- Migration Prisma somente aditiva e reversível; não remover nem renomear `Contact.phone` na primeira entrega.
- Backfill de `ContactPhone` deve ser idempotente e abortar/registrar colisões em vez de escolher um contato aleatoriamente.
- Gerar Prisma Client antes do build e validar `prisma migrate status`.
- Não armazenar o `vCard` completo nem fazer download de foto; se for necessário auditoria, armazenar apenas hash técnico curto fora do DTO público.

## 6. Contrato de ingestão Z-API

### 6.1 Schema de entrada

Estender `ZApiReceivedWebhookSchema` com:

```ts
contact: z.object({
  displayName: z.string().trim().max(300).optional(),
  vCard: z.string().max(16_000).optional(),
  phones: z.array(z.union([z.string(), z.number()])).max(20).optional(),
}).passthrough().optional()
```

O schema deve exigir ao menos um campo útil (`displayName`, `vCard` ou `phones`) e rejeitar listas excessivas. `passthrough` só existe para tolerar mudanças da Z-API; campos extras nunca são copiados para a resposta.

### 6.2 Normalização do vCard

Criar função pura, testável, por exemplo `parseSharedContact`, que:

1. prioriza `contact.phones` do payload;
2. extrai `FN`, `N`, `TEL`, `EMAIL`, `ORG` e `NOTE` do `vCard` quando necessário;
3. remove parâmetros de formatação (`waid`, `type`, `VOICE`, etc.) sem confiar no texto para identidade;
4. normaliza telefones para dígitos canônicos usando o mesmo adaptador do webhook e as variantes brasileiras já aprovadas;
5. remove duplicatas, limita a quantidade e descarta entradas inválidas;
6. prefere `displayName`, depois `FN`, depois `N`, e usa “Contato sem nome” somente quando nada válido existir;
7. retorna um resultado discriminado: `valid`, `empty` ou `malformed`, sem lançar erro que impeça o webhook inteiro.

Quando o cartão não contiver telefone válido, persistir a mensagem `CONTACT` como indisponível para cadastro e exibir “Nenhum telefone válido encontrado”, sem tentar criar contato.

### 6.3 Pipeline do webhook

1. Validar o callback e filtrar `fromMe`, status e grupo conforme a política vigente.
2. Reservar/verificar `messageId` antes de criar mensagem ou contato, mantendo idempotência em retransmissões.
3. Normalizar o cartão de contato.
4. Resolver/criar o contato do remetente da conversa como hoje; o contato compartilhado é um artefato separado e não substitui automaticamente o remetente da conversa.
5. Criar `Message` com `messageType=CONTACT`, `content` resumido (por exemplo, `Contato compartilhado: Nome`) e `ContactShare` sanitizado na mesma transação.
6. Emitir `message:new` e `conversation:updated` com o DTO público do cartão para atualizar o chat sem polling adicional.
7. Não executar o bot apenas por existir um cartão de contato; a mensagem segue as mesmas regras de estado, exclusão e cooldown aplicadas às demais mensagens recebidas.
8. Responder `200` ao webhook mesmo se a extração do vCard falhar parcialmente; registrar métrica/log técnico sem conteúdo PII.

## 7. API REST proposta

Todas as rotas exigem JWT, Zod na borda e verificação de escopo no service. Os DTOs nunca retornam `vCard`, JID, URL temporária ou o payload bruto.

### `GET /contacts/:id`

Retorna o contato canônico, telefones, campos editáveis e indicadores de conversas ativas/históricas permitidas ao usuário.

### `GET /contacts?q=&page=1&limit=20`

Lista contatos pesquisáveis por nome/telefone, com paginação server-side. O backend aplica limite máximo, ordenação determinística e o escopo permitido pelo papel.

### `POST /contacts`

Cria contato manualmente ou associa um cartão recebido:

```json
{
  "name": "Cesar Baleco",
  "phones": [
    { "phone": "+55 (44) 9839-8733", "label": "WhatsApp", "isPrimary": true }
  ],
  "email": "cesar@example.com",
  "organization": "Z-API",
  "notes": "Contato recebido no atendimento",
  "contactShareId": "uuid-opcional"
}
```

O service normaliza tudo, revalida unicidade e retorna `409` com o contato existente quando houver colisão; não aceitar `id`, `createdAt`, `conversationId` ou `vCard` enviados pelo navegador.

### `PATCH /contacts/:id`

Atualiza nome, telefones, e-mail, organização e notas. Troca de telefone é transacional, revalida colisões e mantém o histórico de mensagens intacto. Exclusão física não faz parte deste plano.

### `GET /contacts/:id/conversations`

Lista conversas relacionadas ao contato, com filtros `openOnly`, `page` e `limit`. O retorno contém apenas resumos; mensagens e mídia continuam em `GET /conversations/:id`.

### `POST /conversations`

Cria uma conversa manual a partir de um `contactId` e telefone escolhido:

```json
{
  "contactId": "uuid",
  "phone": "554498398733",
  "departmentId": "uuid-opcional"
}
```

Regras:

- `contactId` e `phone` devem pertencer ao mesmo contato;
- se houver uma conversa não encerrada para o telefone, retornar `409` com `existingConversationId`;
- criar em `OPEN`, sem iniciar fluxo automático e sem enviar texto automaticamente;
- permitir `departmentId` somente dentro do escopo do usuário;
- emitir `conversation:updated` após commit;
- retornar o resumo da nova conversa para navegação imediata ao chat.

Se futuramente for necessário permitir uma mensagem inicial, adicionar um endpoint/ação explícita com outbox e confirmação, sem misturar criação de conversa com envio externo nesta entrega.

### Respostas e erros

- `200/201`: DTO normalizado;
- `400`: telefone, e-mail, UUID, quantidade de telefones ou payload inválido;
- `401`: sessão ausente;
- `403`: contato/conversa fora do escopo ou permissão ausente;
- `404`: contato, cartão ou conversa inexistente;
- `409`: telefone duplicado ou conversa ativa já existente;
- `422`: cartão sem telefone utilizável para a operação solicitada.

Atualizar `docs/API.md` com exemplos, permissões, limites e campos deliberadamente omitidos.

## 8. RBAC e escopo

Adicionar o recurso `contacts` ao catálogo de RBAC, sem conceder permissões por inferência:

- `view`: visualizar contatos e cartões dentro de conversas permitidas;
- `create`: adicionar contato e criar conversa manual;
- `update`: editar cadastro e vincular cartão;
- `delete`: reservado para futura exclusão lógica; o MVP não expõe exclusão física.

Defaults sugeridos:

- ADMIN: `view/create/update/delete`;
- SUPERVISOR: `view/create/update` dentro do departamento permitido;
- AGENT: `view`, `create` e `update` somente para conversas próprias/do departamento conforme `conversations:view`;
- ações nunca ampliam escopo por `contactId` enviado pelo cliente.

Revisar `rbac.service.ts`, telas catalogadas e a matriz da tela `/admin/rbac`. O acesso ao contato compartilhado deve herdar a autorização da conversa; uma busca global de contatos só pode ocorrer quando `contacts:view` estiver autorizado.

## 9. UX e componentes frontend

### 9.1 Cartão no chat

Criar `frontend/src/pages/conversation/components/SharedContactCard.tsx` e renderizar quando `messageType === "CONTACT"` e `contactShare` existir. O cartão deve ser opaco, responsivo e composto por primitives shadcn:

- `Card`, `Avatar`, `Badge`, `Button`, `Separator`;
- telefone principal destacado e demais telefones em lista compacta;
- nome, organização/e-mail quando existirem;
- estado `Contato já cadastrado`, `Contato não cadastrado`, `Sem telefone válido`;
- ações `Adicionar contato`, `Editar contato`, `Nova conversa` e `Ver conversas` conforme permissão/estado;
- loading, erro e retry nas mutações;
- nenhum `vCard`, JID ou identificador técnico exibido.

O card não deve assumir automaticamente que o contato compartilhado é o remetente da conversa. O header da conversa continua representando o solicitante real.

### 9.2 Modal de adicionar/editar

Criar `ContactFormDialog.tsx` usando `Dialog`, `Field`, `Input`, `Textarea`, `Select` e `Button` shadcn:

- máscara visual de telefone, armazenamento canônico;
- edição de múltiplos telefones com adicionar/remover;
- seleção de telefone principal;
- validação por campo, foco no primeiro erro e preservação do rascunho em erro;
- confirmação `warning` para criar/editar quando houver mudança relevante;
- não fechar durante request; feedback de sucesso e invalidação de `contacts`/`conversation`.

### 9.3 Modal de nova conversa

Criar `NewConversationDialog.tsx`:

- telefone selecionável do cartão;
- departamento opcional, sempre filtrado pelo escopo;
- aviso se já existir conversa ativa, com ação `Abrir conversa existente`;
- confirmação explícita antes de criar;
- ao sucesso, navegar para `/conversation/:id`;
- nenhum envio automático de texto ou disparo da saudação do bot.

### 9.4 Hooks e estado

Adicionar hooks React Query em `frontend/src/pages/conversation/hooks/` ou `frontend/src/hooks/` conforme o padrão existente:

- `useContacts`, `useContact`, `useCreateContact`, `useUpdateContact`;
- `useContactConversations`;
- `useCreateConversation`;
- normalização do DTO e invalidação por `contactShareId`, contato e conversa;
- tratar `409` como estado acionável, não como erro genérico.

Atualizar `frontend/src/types/index.ts` com `MessageType`, `ContactShare`, `ContactPhone`, `ContactDetail` e o novo formato de criação de conversa.

## 10. Arquitetura e arquivos previstos

### Backend

- `backend/prisma/schema.prisma` — `messageType`, `ContactShare`, campos enriquecidos de `Contact`, `ContactPhone`;
- nova migration aditiva em `backend/prisma/migrations/`;
- `backend/src/modules/zapi/zapi.schemas.ts` — schema do objeto `contact`;
- `backend/src/modules/zapi/zapi.service.ts` — normalização e pipeline `CONTACT`;
- `backend/src/modules/zapi/zapi.repository.ts` — transação idempotente para mensagem + cartão;
- novo `backend/src/modules/contacts/contacts.routes.ts`;
- novo `backend/src/modules/contacts/contacts.controller.ts`;
- novo `backend/src/modules/contacts/contacts.service.ts`;
- novo `backend/src/modules/contacts/contacts.repository.ts`;
- novo `backend/src/modules/contacts/contacts.schemas.ts`;
- `backend/src/modules/conversations/conversations.routes.ts`/controller/service/repository/schemas — `POST /conversations` e consulta de conversas do contato;
- `backend/src/modules/rbac/rbac.service.ts` — recurso e defaults `contacts`;
- `backend/src/shared/events.ts`/`socket.ts` — somente para incluir o DTO mínimo do cartão no evento já existente.

### Frontend

- `frontend/src/types/index.ts`;
- `frontend/src/pages/conversation/index.tsx` — seleção do renderer por tipo;
- `frontend/src/pages/conversation/components/SharedContactCard.tsx`;
- `frontend/src/pages/conversation/components/ContactFormDialog.tsx`;
- `frontend/src/pages/conversation/components/NewConversationDialog.tsx`;
- hooks React Query de contatos/conversas;
- componentes shadcn adicionais somente se já não existirem (`Dialog`, `Field`, `Select`, `Badge`, `Card`, `ScrollArea`).

### Documentação e operação

- atualizar `docs/PRD.md`, `docs/PRD_ZAPI.md`, `docs/API.md`, `docs/ARCHITECTURE.md` e `docs/DESIGN_SYSTEM.md`;
- criar `docs/QA_CONTATOS_RECEBIDOS_ZAPI.md`;
- criar `docs/RUNBOOK_CONTATOS_RECEBIDOS_ZAPI.md` com migration, backfill, rollback e observabilidade;
- atualizar `docs/README.md` com os novos documentos.

## 11. Fases de execução e agentes recomendados

Os agentes abaixo são a matriz de especialidade de `agents/README.md`; a execução deve permanecer no agente principal, com revisão conforme o papel indicado.

### Fase 0 — Produto, contrato e decisões

**Referências:** `product-manager.agent.md` + `tech-lead-architect.agent.md`  

- confirmar que “Conversas” significa criar uma conversa nova e abrir conversas existentes, sem anexar silenciosamente um cartão a outro solicitante;
- fechar limite de telefones, campos editáveis, permissões e política de duplicidade;
- registrar histórias e critérios no PRD;
- congelar o DTO público e o comportamento de mensagens legadas.

### Fase 1 — Schema e normalização Z-API

**Responsáveis:** `tech-lead-architect.agent.md` + `backend-developer.agent.md`  

- desenhar migration aditiva e backfill idempotente;
- implementar schema Zod, parser de `vCard` e normalizador de telefone;
- adicionar `messageType=CONTACT` e persistência transacional do `ContactShare`;
- manter `messageId` como chave de idempotência e preservar o fallback de texto/media.

### Fase 2 — APIs de contatos e novas conversas

**Responsáveis:** `backend-developer.agent.md` + revisão `security-engineer.agent.md`  

- criar módulo Route → Controller → Service → Repository → Zod;
- implementar CRUD sem exclusão física, associação de cartão e listagem de conversas;
- implementar `POST /conversations` com prevenção de conversa ativa duplicada;
- aplicar RBAC e escopo no servidor, sem confiar em IDs do browser;
- emitir eventos após commit e não incluir PII desnecessária em Socket.IO.

### Fase 3 — Interface do chat

**Responsável:** `frontend-developer.agent.md`  

- adicionar os tipos e hooks React Query;
- criar cartão e modais shadcn para adicionar/editar/nova conversa;
- renderizar estados de erro, loading, sucesso, conflito e sem telefone;
- garantir que o header da conversa continue mostrando o contato que abriu o chamado;
- manter responsividade, teclado, foco e contraste conforme `DESIGN_SYSTEM.md`.

### Fase 4 — Segurança, performance e compatibilidade

**Responsáveis:** `security-engineer.agent.md` + `tech-lead-architect.agent.md`  

- revisar parser contra injeção de conteúdo, vCard malformado e payload grande;
- confirmar que logs não possuem vCard, telefone completo, e-mail ou conteúdo bruto;
- medir consultas do cartão, contatos e conversas sem N+1;
- avaliar índices por telefone, contato e mensagem externa;
- confirmar que CORS não é usado como mecanismo de autenticação do webhook.

### Fase 5 — QA e homologação

**Responsável:** `qa-testing-engineer.agent.md`  

- executar a matriz de testes abaixo;
- validar browser em desktop/mobile e reconciliação via Socket.IO;
- testar callbacks oficiais, aliases e payloads antigos;
- validar regressão de texto, mídia, grupos, menções, triagem, exclusões do bot e mensagens manuais.

### Fase 6 — Migration e rollout

**Responsável:** `devops-infra-engineer.agent.md`  

- backup lógico, migration aditiva e geração do Prisma Client;
- deploy backend antes do frontend para que `CONTACT` já tenha DTO compatível;
- ativar a UI depois de confirmar callbacks em homologação;
- monitorar erros de parse, conflitos de telefone, latência e criação duplicada;
- rollback por feature flag/versão do frontend, sem remover tabelas ou dados.

## 12. Matriz de testes

### Parser e webhook

- `ReceivedCallback` com `contact.displayName`, `contact.vCard` e `contact.phones` produz `messageType=CONTACT`;
- `vCard` oficial com `TEL;type=CELL;waid=...` extrai o telefone correto;
- payload com `vcard` minúsculo continua aceito somente como compatibilidade explicitamente testada;
- telefones duplicados, inválidos, com espaços, `+`, parênteses e hífen são normalizados;
- `FN`/`N` sem `displayName` formam nome previsível;
- e-mail, organização e nota são extraídos somente nos campos permitidos;
- cartão vazio/malformado não derruba o webhook e gera estado “sem telefone válido”;
- vCard acima do limite, mais de 20 telefones ou linhas excessivas retornam erro controlado;
- retransmissão do mesmo `messageId` não cria mensagem, cartão, contato, unread ou evento duplicado;
- texto, mídia, botão, lista, grupo e menção continuam com o comportamento atual.

### Banco e APIs

- migration/backfill não altera conversas existentes;
- `ContactPhone` impede duplicidade por telefone mesmo sob duas requisições concorrentes;
- `POST /contacts` cria e associa cartão de forma idempotente;
- `PATCH /contacts/:id` preserva snapshots históricos e rejeita colisão `409`;
- usuários fora do escopo recebem `403` e não conseguem enumerar contatos;
- `POST /conversations` cria `OPEN`, respeita departamento e retorna `409` para conversa ativa;
- conversa criada não inicia fluxo, saudação ou envio externo automaticamente;
- DTOs não contêm vCard bruto, JID, URL, token ou campos inesperados;
- erros `400/401/403/404/409/422` retornam JSON padronizado.

### Frontend/E2E

- cartão exibe nome, todos os telefones válidos e status de cadastro;
- `Adicionar contato` abre modal, valida máscara e atualiza o cartão;
- `Editar contato` abre modal separado e não transforma o card em formulário embutido;
- `Nova conversa` permite escolher telefone e departamento, trata conversa existente e navega ao sucesso;
- `Ver conversas` lista histórico autorizado sem misturar o contato do chamado;
- loading/erro/retry não perdem os dados digitados;
- evento Socket.IO insere o cartão no chat sem refresh completo;
- tela permanece legível em 1440px, 1100px e 760px, sem overflow;
- leitores de tela identificam ações e estado do contato.

### Regressão e segurança

- mensagens de texto antigas não recebem `CONTACT` por engano;
- mídia continua usando o proxy protegido e a retenção da Z-API;
- mensagens de grupo mantêm o participante como remetente;
- exclusões do bot continuam bloqueando somente automações, não o cadastro/atendimento humano;
- XSS em nome, organização, nota e vCard é renderizado como texto;
- logs e eventos não carregam PII além do estritamente necessário;
- build frontend/backend, migrations e testes existentes passam.

## 13. Observabilidade e rollout

Adicionar métricas sem conteúdo pessoal:

- `zapi_contact_callback_total` por resultado (`stored`, `malformed`, `empty`, `duplicate`);
- `zapi_contact_parse_failure_total` por código técnico;
- `contact_upsert_conflict_total`;
- `manual_conversation_create_total` por resultado;
- latência p50/p95 do cartão e das APIs de contato;
- quantidade de mensagens `CONTACT` sem telefone utilizável.

Logs devem conter apenas `externalMessageId` truncado/hash, `messageId` interno, resultado e código de erro. Nunca registrar o vCard ou telefone completo.

Rollout recomendado:

1. adicionar migration e leitura compatível;
2. publicar parser/API atrás de flag `CONTACT_MESSAGES_ENABLED` desligada para UI, mas com persistência observável em homologação;
3. validar payload oficial e duplicidade em uma instância de teste;
4. ativar cartão e modais no frontend;
5. acompanhar conflitos/erros por 24–48 horas;
6. remover a flag somente após estabilidade; manter rollback sem apagar dados.

## 14. Critérios de aceite

- Uma mensagem de contato recebida pela Z-API deixa de aparecer como “Mensagem recebida” e exibe um cartão com nome e telefones reais.
- O cartão oferece adicionar, editar, abrir conversas relacionadas e criar uma conversa nova quando o usuário possui permissão.
- A criação/edição não duplica contatos e não altera o histórico de autoria das mensagens.
- Uma conversa nova nasce aberta, navegável e sem disparar automaticamente a saudação do bot.
- Callbacks repetidos são idempotentes por `messageId`.
- O front-end não recebe `vCard`, URLs, JIDs, tokens ou payload bruto.
- CORS não é usado como explicação/fix do webhook; o processamento funciona servidor-servidor.
- O recurso respeita RBAC, escopo de departamento e os padrões visuais shadcn do projeto.
- Texto, mídia, grupos, menções, triagem, exclusões automáticas e envio manual continuam funcionando.

## 15. Execução e validação

Implementado:

- parser/schema Z-API para `contact`, `vCard`/`vcard`, telefones estruturados e campos auxiliares;
- persistência aditiva de `messageType`, `ContactPhone` e `ContactShare`, com vínculo ao contato canônico;
- APIs autenticadas de contatos, conversas relacionadas e criação manual de conversa;
- RBAC `contacts:view/create/update/delete` e escopo de departamento para agentes;
- cartões, modais de cadastro/edição, conversas relacionadas e nova conversa usando primitives shadcn;
- eventos Socket.IO sanitizados para inserir o cartão sem expor o vCard.

Validação executada:

- migration `20260820100000_add_contact_messages_and_contact_book`: aplicada com sucesso no PostgreSQL local; `npx prisma migrate status` confirma schema atualizado;
- `backend npm run build`: aprovado;
- contrato do parser de contatos: 3/3 testes aprovados;
- `frontend npm run build`: aprovado com 1.949 módulos;
- suíte completa backend: 71/71 testes aprovados após a migration.

A migration `20260820100000_add_contact_messages_and_contact_book` foi validada localmente e está pronta para homologação/produção. Antes de cada deploy, gerar o Prisma Client e aplicar `npx prisma migrate deploy` com a `DATABASE_URL` correta.
