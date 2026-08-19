# Plano 018 — Exclusão de contatos das respostas automatizadas do bot

> **Status:** Concluído  
> **Data:** 2026-08-19  
> **Escopo:** administração, RBAC, contatos, webhook Z-API, execução do fluxo, envios automatizados e auditoria  
> **Estratégia:** migração aditiva, bloqueio server-side e preservação das mensagens para atendimento humano

## 1. Objetivo

Permitir que administradores mantenham uma lista de números que não devem receber respostas automáticas do GTF-Bot. A finalidade principal é impedir loops entre bots ou integrações automáticas que continuam respondendo umas às outras.

O bloqueio deve ser aplicado no backend, antes de qualquer saudação, botão, triagem, confirmação de grupo ou lembrete automático. A plataforma continuará registrando as mensagens recebidas para auditoria e eventual atendimento manual, mas nunca deverá iniciar ou avançar uma resposta automatizada para um contato bloqueado.

O recurso não deve excluir `Contact`, `Conversation` ou `Message` existentes. “Excluir” na interface significa desativar/remover a regra de bloqueio, preservando o histórico e a rastreabilidade.

## 2. Referências consultadas

### Documentação do projeto

- [`docs/README.md`](../docs/README.md)
- [`docs/PRD.md`](../docs/PRD.md)
- [`docs/PRD_ZAPI.md`](../docs/PRD_ZAPI.md)
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`docs/API.md`](../docs/API.md)
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md)
- [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md)
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md)
- [`docs/PRD_AUTO_CLOSE_AND_UNIFIED_STATUS.md`](../docs/PRD_AUTO_CLOSE_AND_UNIFIED_STATUS.md)
- [`docs/RAILWAY_DEPLOY.md`](../docs/RAILWAY_DEPLOY.md)
- [`plans/plan-011-fila-priorizada-notificacoes-filtro-data.md`](./plan-011-fila-priorizada-notificacoes-filtro-data.md)
- [`plans/plan-015-grupos-mencoes-etiquetas.md`](./plan-015-grupos-mencoes-etiquetas.md)
- [`plans/plan-017-delay-anti-spam-midia-zoom.md`](./plan-017-delay-anti-spam-midia-zoom.md)

### Agentes selecionados pela matriz de `agents/README.md`

Os papéis abaixo devem orientar a execução, sem delegação automática de tarefas:

| Ordem | Agente | Aplicação neste plano |
|---|---|---|
| 1 | [`product-manager.agent.md`](../agents/product-manager.agent.md) | Fechar a semântica de “bloquear bot”, jornada do administrador e critérios de aceite. |
| 2 | [`tech-lead-architect.agent.md`](../agents/tech-lead-architect.agent.md) | Definir modelo Prisma aditivo, contrato, invariantes e ponto único de decisão. |
| 3 | [`backend-developer.agent.md`](../agents/backend-developer.agent.md) | Criar módulo REST, validação Zod, repositório, serviço e integração com Z-API/worker. |
| 4 | [`frontend-developer.agent.md`](../agents/frontend-developer.agent.md) | Criar página administrativa responsiva, hooks React Query e componentes shadcn. |
| 5 | [`security-engineer.agent.md`](../agents/security-engineer.agent.md) | Revisar RBAC, normalização, spoofing de identidade, logs e exposição de dados. |
| 6 | [`qa-testing-engineer.agent.md`](../agents/qa-testing-engineer.agent.md) | Validar CRUD, webhook, grupos, idempotência, corridas e regressões. |
| 7 | [`devops-infra-engineer.agent.md`](../agents/devops-infra-engineer.agent.md) | Aplicar migration aditiva, atualizar build/seed e validar Railway/rollback. |

## 3. Problema e diagnóstico do fluxo atual

Atualmente o webhook Z-API normaliza o remetente, cria/atualiza contato e conversa, persiste a mensagem e pode executar o fluxo automatizado. Os principais pontos de saída automática estão em `zapi.service.ts`:

- confirmação de menção em grupo, enviada em privado e opcionalmente no grupo;
- ações `SEND_TEXT` do executor de fluxo;
- ações `SEND_OPTIONS` e fallback textual da lista de botões;
- mensagem de rota/triagem do fluxo legado;
- saudação e menu inicial;
- lembretes e mensagens do worker de inatividade.

Somente bloquear a criação de conversa ou alterar o frontend não é suficiente: o mesmo contato pode chegar por fluxo v2, fluxo legado, grupo ou worker. A decisão precisa existir no servidor e ser reaplicada imediatamente antes de cada envio automatizado.

## 4. Decisões de produto

1. **Escopo padrão:** somente usuários ADMINISTRATOR/ADMIN com RBAC poderão gerenciar a lista. Supervisores poderão receber a permissão futuramente sem nova migration.
2. **Ação bloqueada:** o bot não envia texto, botões, confirmação, triagem, saudação, mensagem de inatividade ou fallback para um número ativo na lista.
3. **Atendimento humano:** respostas enviadas manualmente por um atendente continuam permitidas. O bloqueio é de automação, não de comunicação humana.
4. **Persistência:** mensagens recebidas continuam sendo registradas, mas não avançam o fluxo e não produzem uma resposta automática. A conversa pode ser localizada e assumida manualmente.
5. **Conversas existentes:** ativar uma regra não apaga nem encerra conversas abertas. A próxima mensagem automática é suprimida imediatamente; não haverá resposta retroativa.
6. **Desbloqueio:** reativar/remover a regra não dispara resposta por conta própria. O fluxo só volta a ser avaliado na próxima mensagem recebida, respeitando o estado atual da conversa.
7. **Grupos:** em callback de grupo, o número considerado é o participante (`participantPhone`/`participant` normalizado), não o JID do grupo. Uma regra para um participante bloqueia respostas automáticas destinadas a ele; mensagens de outros participantes seguem a política normal.
8. **Identidade:** nenhuma correspondência será feita por nome, texto da mensagem ou menção. O matching será por identidade numérica normalizada; LID sem telefone resolvido não será tratado como número coincidente.
9. **Formato:** aceitar números digitados com `+`, espaços, parênteses e hífen; armazenar apenas dígitos canônicos. Aplicar somente a variante brasileira de nono dígito já utilizada pelo parser, sem remover DDI/DDD de forma ampla.
10. **Auditoria:** excluir/desativar uma regra não exclui `Contact`, `Conversation` ou `Message`. A regra mantém quem criou, quem alterou, motivo e datas.

## 5. Modelo de dados e migration

### 5.1 Novo modelo `BotExclusion`

Adicionar uma tabela aditiva `gtf_bot_exclusions`:

| Campo | Regra |
|---|---|
| `id` | UUID primário. |
| `phone` | Número canônico sem máscara, único; nunca armazenar o valor bruto digitado. |
| `label` | Nome amigável opcional para o administrador, máximo 120 caracteres. |
| `reason` | Motivo opcional, texto puro, máximo 500 caracteres. |
| `isActive` | Booleano padrão `true`; somente regras ativas bloqueiam o bot. |
| `createdByAgentId` | Agente que criou a regra; relação `Agent` com `Restrict`/`SetNull` conforme decisão final de retenção. |
| `updatedByAgentId` | Último agente que alterou/desativou a regra. |
| `createdAt` / `updatedAt` | Timestamps UTC. |
| `disabledAt` / `disabledByAgentId` | Metadados de desativação, quando aplicável. |

Índices e invariantes:

- `UNIQUE(phone)` para impedir regras duplicadas;
- índice em `(isActive, phone)` para o caminho quente do webhook;
- valores de telefone nunca aparecem em logs de erro ou eventos Socket.IO;
- migration somente aditiva, sem alterar contatos ou conversas existentes;
- se for necessário suporte futuro a LID/JID, criar uma extensão explícita de identidade, sem reutilizar `phone` para strings opacas.

### 5.2 RBAC

Adicionar o recurso `bot_exclusions` ao catálogo de `rbac.service.ts`:

- `view`: listar regras;
- `create`: adicionar número;
- `update`: editar rótulo, motivo ou ativação;
- `delete`: remover/desativar regra.

O perfil ADMIN recebe todas as ações por padrão. SUPERVISOR/AGENT não recebem acesso por padrão. A tela `/admin/bot-exclusions` deve entrar no catálogo de telas e ser visível somente quando `screen:view` estiver habilitada; a API continua protegida mesmo que alguém tente acessar a rota diretamente.

## 6. Contrato de API

Criar o módulo backend `modules/bot-exclusions/` no padrão Route → Controller → Service → Repository → Zod Schema.

### `GET /api/bot-exclusions`

Lista regras paginadas. Query sugerida:

```text
?q=bot&page=1&limit=20&activeOnly=true
```

Resposta:

```json
{
  "items": [
    {
      "id": "uuid",
      "phone": "+5524999999999",
      "label": "Bot de testes",
      "reason": "Evitar conversa automática entre integrações",
      "isActive": true,
      "createdBy": { "id": "uuid", "name": "Administrador" },
      "createdAt": "2026-08-19T12:00:00.000Z",
      "updatedAt": "2026-08-19T12:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1,
  "totalPages": 1
}
```

Não retornar token Z-API, conteúdo de mensagens, histórico ou credenciais.

### `POST /api/bot-exclusions`

Body validado por Zod:

```json
{
  "phone": "+55 (24) 99999-9999",
  "label": "Bot de integração",
  "reason": "Contato automático que entra em loop"
}
```

O serviço normaliza o telefone antes de consultar/criar. Duplicata ativa ou inativa retorna `409` com erro de domínio claro; o endpoint nunca cria dois registros para a mesma identidade.

### `PATCH /api/bot-exclusions/:id`

Permite editar `phone`, `label`, `reason` e `isActive`, com revalidação da unicidade e registro do ator autenticado. Trocar o telefone deve ser tratado como alteração de identidade e retornar `409` em colisão.

### `DELETE /api/bot-exclusions/:id`

Desativa a regra (`isActive=false`, `disabledAt`, `disabledByAgentId`) e mantém o registro para auditoria. O frontend poderá exibir a ação como “Remover bloqueio”. Não executar `prisma.contact.delete` nem apagar conversas.

### Serviço interno de decisão

Expor uma função de baixo acoplamento, por exemplo `botExclusionsService.isBlocked(phone): Promise<boolean>`, que:

- normaliza a identidade com a mesma função usada pelo parser Z-API;
- compara a variante canônica e a variante brasileira de nono dígito;
- consulta somente `isActive=true`;
- não faz fallback por nome, grupo, conteúdo ou contato parecido;
- registra apenas `exclusionId` e um hash curto do telefone em logs de observabilidade.

## 7. Integração com o webhook e os envios automáticos

### 7.1 Ponto de entrada

Depois de `parseIncomingMessage` obter o telefone canônico e antes de criar nova conversa ou executar ações de fluxo:

1. verificar `isBlocked(incoming.phone)`;
2. continuar persistindo a mensagem/conversa conforme a política definida, sem iniciar/avançar automação;
3. retornar um resultado explícito `bot_excluded`/`message_logged_bot_excluded`;
4. não enviar confirmação de grupo nem criar mensagens `BOT`;
5. manter resposta HTTP `200` ao webhook e idempotência por `messageId`.

Para conversas já existentes, não alterar status nem responsável; a mensagem recebida continua disponível para o atendimento humano.

### 7.2 Guarda de entrega

Criar uma política de entrega automatizada antes de cada chamada externa:

- `sendBotText(phone, text)`;
- `sendBotButtonList(phone, message, options)`;
- `sendBotTextToTarget(target, text)` para confirmações de grupo;
- envio automático do worker de inatividade.

Esses métodos devem consultar a lista ativa novamente imediatamente antes do request à Z-API, evitando que uma regra ativada durante o processamento ainda permita uma saudação ou resposta de fluxo. O `sendText` usado por atendentes humanos permanece separado e não deve ser bloqueado.

O executor v2 e o fallback legado devem usar somente os wrappers de bot. Se a entrega for suprimida, o executor não deve avançar o nó como se a mensagem tivesse sido enviada e deve registrar resultado recuperável (`BOT_EXCLUDED`).

### 7.3 Eventos e notificações

- Não emitir `notification:new` de resposta de bot para contato excluído.
- Mensagens recebidas e atualizações de conversa podem continuar sendo emitidas para a fila, sem incluir telefone completo em payloads novos.
- Não emitir evento Socket.IO contendo a lista de bloqueios ou telefones.
- Duplicatas do webhook devem continuar retornando `duplicate_event`, sem repetir auditoria ou efeitos.

## 8. Página administrativa

Criar a rota protegida `frontend/src/pages/admin/bot-exclusions/`:

```text
index.tsx
hooks/use-bot-exclusions.ts
components/BotExclusionForm.tsx
components/BotExclusionTable.tsx
```

### UX proposta

- Título: **Contatos ignorados pelo bot**.
- Descrição: “Gerencie números que não devem receber respostas automáticas.”
- Botão primário: **Adicionar número**.
- Tabela/card responsivo com número mascarado de forma legível, rótulo, motivo, status, última atualização e ações.
- Busca por número/rótulo, filtro `Ativos`/`Todos` e estado vazio orientado.
- Formulário com número, identificação opcional e motivo.
- Edição permite reativar/desativar sem apagar histórico.
- A ação de remover usa `ConfirmationDialog` shadcn em variante `danger`, com o número mascarado e a consequência explícita.
- Loading, erro, retry e conflito `409` devem permanecer visíveis sem perder o formulário.
- Utilizar componentes shadcn existentes (`Card`, `Input`, `Button`, `Badge`, `Dialog`, `AlertDialog`, `ConfirmationDialog`, `Table`/`ScrollArea`, `Pagination`) e a paleta opaca oficial `#2D89C8`.
- Nunca exibir tokens, URLs da Z-API ou conteúdo de mensagens.

Adicionar a entrada **Contatos ignorados pelo bot** à navegação de Administração apenas para quem possui a permissão de tela. O backend continua sendo a autoridade caso o menu seja manipulado no navegador.

## 9. Observabilidade e operação

Adicionar logs estruturados sem PII:

- `bot_exclusion_created`, `bot_exclusion_updated`, `bot_exclusion_disabled` com `exclusionId` e `actorId`;
- `bot_reply_suppressed` com `exclusionId`, `conversationId` opcional, tipo de ação e hash do telefone;
- contadores `bot_replies_suppressed_total` e `bot_exclusion_matches_total`;
- métrica de duplicatas e erros de normalização.

Não registrar telefone completo, texto da mensagem, token, URL de webhook ou credenciais Z-API. O runbook deve explicar como verificar se a regra está bloqueando sem reproduzir PII nos logs.

## 10. Testes e critérios de aceite

### API e RBAC

- `401` para não autenticado e `403` para AGENT/SUPERVISOR sem permissão;
- ADMIN consegue listar, criar, editar, ativar/desativar e remover;
- payload rejeita telefone vazio, letras, número curto/longo, label/reason acima do limite, paginação inválida e campos desconhecidos;
- máscara/formatação não altera a identidade canônica;
- duplicata exata e variante brasileira retornam `409`;
- não é possível alterar/excluir regra de outro recurso por ID adulterado;
- respostas não expõem senha, token, URL Z-API ou histórico do contato.

### Webhook e runtime

- número bloqueado em conversa privada persiste a entrada, não envia saudação, botão, triagem ou fallback;
- número bloqueado como participante de grupo não recebe confirmação privada nem no grupo;
- uma menção válida ao bot feita por contato bloqueado continua sem resposta;
- contato não bloqueado continua seguindo fluxo v2 e legado sem regressão;
- bloquear depois da entrada, antes da entrega, impede o request automatizado;
- desbloquear não envia mensagem retroativa e permite nova entrada normal;
- worker de inatividade não envia aviso/encerramento automático para contato bloqueado;
- envio humano pelo painel continua funcionando para contato bloqueado;
- callbacks duplicados não duplicam mensagem, conversa, log de bloqueio ou notificação;
- LID/nomes parecidos sem telefone canônico não causam bloqueio indevido.

### Frontend

- usuário autorizado consegue abrir a página, adicionar, editar, desativar e remover com confirmação;
- número é normalizado e exibido de forma consistente após reload;
- estados loading/empty/error/409 funcionam sem quebrar o restante do painel;
- controle de permissão remove a página/menu e bloqueia ações incompatíveis;
- responsividade sem overflow, foco restaurado nos diálogos e navegação por teclado;
- card/tabela não exibe credenciais nem conteúdo sensível.

### Regressão e segurança

- fluxo de saudação, decisão, triagem, menções de grupo, mídia, notificações, auto-close e resposta humana permanece funcional;
- Prisma usa somente o repository; entrada usa Zod estrito;
- guard de automação não intercepta envio humano autenticado;
- nenhum endpoint aceita `actorId`/`createdByAgentId` fornecido pelo cliente;
- `npm test`, `npm run build` em backend/frontend e `git diff --check` passam.

## 11. Rollout seguro

### Fase 0 — Contrato e decisão

1. Confirmar com produto que mensagens bloqueadas continuam visíveis para humanos e que somente automação será suprimida.
2. Fechar se SUPERVISOR poderá receber a permissão manualmente; padrão inicial permanece ADMIN.
3. Definir limites de telefone, label, motivo e paginação.

### Fase 1 — Banco e RBAC

1. Criar migration Prisma aditiva para `BotExclusion` e relações com `Agent`.
2. Atualizar `rbac.service.ts` e seed/backfill de permissões sem alterar contatos.
3. Rodar `prisma migrate deploy` em homologação; nunca usar `migrate reset`.

### Fase 2 — API e guarda de automação

1. Implementar módulo REST e normalizador compartilhado.
2. Integrar o guard no webhook e em todos os caminhos de envio automatizado.
3. Adicionar logs/métricas e testar grupos, fluxo v2/legado e worker.

### Fase 3 — Interface

1. Criar página, hooks React Query e navegação protegida.
2. Homologar CRUD, confirmação danger e permissões em ADMIN/SUPERVISOR/AGENT.

### Fase 4 — Canary e monitoramento

1. Cadastrar um número de bot de teste em homologação.
2. Confirmar que o webhook responde `200`, persiste entrada e não faz request de envio à Z-API.
3. Testar desativação e retorno controlado do fluxo.
4. Publicar no Railway após backend/frontend build e migrations passarem.

## 12. Rollback

- Desativar todas as regras pela API/admin ou desligar a feature flag de integração do guard.
- Reverter o deploy para a revisão anterior sem remover a tabela ou dados de bloqueio.
- Manter a migration aplicada; rollback destrutivo não é necessário nem recomendado.
- Se o guard causar erro 500, o fallback seguro deve ser **não enviar mensagem automática** até a correção, evitando loops.
- Conferir métricas de `bot_reply_suppressed`, erros de webhook e envios Z-API antes de reativar.

## 13. Entregáveis

- [x] `plans/plan-018-exclusao-contatos-respostas-bot.md` executado.
- [x] Atualização de `docs/PRD.md`, `docs/PRD_ZAPI.md`, `docs/API.md` e `docs/README.md`.
- [x] Runbook `docs/RUNBOOK_EXCLUSOES_BOT.md`.
- [x] Migration Prisma aditiva e client gerado.
- [x] Módulo REST `bot-exclusions` com schemas Zod e RBAC.
- [x] Guarda server-side em fluxo v2, legado, grupo e worker.
- [x] Página administrativa responsiva com componentes shadcn.
- [x] Testes de contrato e regressão automatizados.
- [x] Builds backend/frontend e `prisma migrate deploy` validados localmente.

## 14. Registro de execução

- Migration `20260819120000_add_bot_exclusions` aplicada sem reset ou remoção de dados.
- Backend: build aprovado e 62 testes passando.
- Frontend: TypeScript e build Vite aprovados (o build exigiu execução fora do sandbox por bloqueio de acesso do esbuild ao arquivo de configuração).
- A tela `/admin/bot-exclusions` usa Card, Input, Button, Badge e ConfirmationDialog shadcn; o menu e o RBAC foram atualizados.
- O guard mantém mensagens recebidas e envio manual, suprimindo somente automações para regras ativas.
