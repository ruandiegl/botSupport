# Plano 016 — Identidade do remetente, colaboração e delegação de chamados

> **Status:** Pronto para execução  
> **Data:** 2026-08-18  
> **Repositório:** `C:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`  
> **Escopo:** conversas, mensagens, webhook Z-API, delegação, RBAC, notificações, Socket.IO e UI do atendimento  
> **Estratégia:** migração aditiva, compatibilidade com mensagens antigas e rollout por feature flag

## 1. PRD — resumo executivo

### 1.1 Problema

O sistema ainda usa o responsável atual da conversa como fallback para identificar quem enviou uma mensagem. Isso faz com que uma mensagem possa aparecer com o nome do atendente que assumiu o chamado, mesmo quando foi enviada por outro atendente ou recebida de outra pessoa.

Além disso, a tela de atendimento possui **Assumir**, mas não oferece uma operação explícita de **Delegar**. Administradores e supervisores precisam conseguir encaminhar a responsabilidade para outro atendente, com rastreabilidade e notificação para o novo responsável.

### 1.2 Objetivo

Permitir atendimento colaborativo e auditável:

1. Toda mensagem exibe o perfil real de quem a enviou.
2. Mensagens humanas enviadas pelo painel usam o usuário autenticado como fonte de verdade.
3. Mensagens recebidas da Z-API preservam o nome do contato/remetente no momento do recebimento.
4. Mais de um atendente pode atuar no mesmo chamado sem reescrever a identidade de mensagens anteriores.
5. Usuários autorizados delegam chamados para atendentes ativos.
6. O atendente que recebe a delegação é notificado em tempo real e pelo feed persistente.
7. A fila/departamento do chamado continua separado do departamento do atendente que respondeu.

### 1.3 Decisão de escopo recomendada

Nesta entrega, “outras pessoas dentro do chamado” significa **outros atendentes colaborando no mesmo chamado**. As mensagens de participantes de grupos do WhatsApp também passam a ter remetente próprio por mensagem, mas preservam a regra do Plano 015: cada menção continua vinculada ao chamado do participante.

Unificar vários participantes externos de um grupo em uma única conversa exigiria alterar roteamento, unread, escopo de acesso e modelo de participantes. Essa extensão deve ser decidida separadamente após homologação deste plano.

## 2. Referências consultadas

### Documentação do projeto

- [`docs/README.md`](../docs/README.md)
- [`docs/PRD.md`](../docs/PRD.md)
- [`docs/PRD_ZAPI.md`](../docs/PRD_ZAPI.md)
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md)
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`docs/API.md`](../docs/API.md)
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md)
- [`docs/DESIGN_SYSTEM.md`](../docs/DESIGN_SYSTEM.md)
- [`plans/plan-010-departamento-real-do-atendente-mensagens.md`](./plan-010-departamento-real-do-atendente-mensagens.md)
- [`plans/plan-011-fila-priorizada-notificacoes-filtro-data.md`](./plan-011-fila-priorizada-notificacoes-filtro-data.md)
- [`plans/plan-015-grupos-mencoes-etiquetas.md`](./plan-015-grupos-mencoes-etiquetas.md)

### Agentes recomendados e responsabilidade

| Ordem | Agente | Papel na execução |
|---|---|---|
| 1 | [`product-manager.agent.md`](../agents/product-manager.agent.md) | Fechar a semântica de colaboração, delegação, mensagens e aceite operacional. |
| 2 | [`tech-lead-architect.agent.md`](../agents/tech-lead-architect.agent.md) | Definir migration aditiva, contrato, concorrência e separação entre fila e perfil. |
| 3 | [`backend-developer.agent.md`](../agents/backend-developer.agent.md) | Implementar identidade, APIs, service/repository, Zod e integração Z-API. |
| 4 | [`frontend-developer.agent.md`](../agents/frontend-developer.agent.md) | Implementar renderização por remetente, seletor de delegação e estados React Query. |
| 5 | [`security-engineer.agent.md`](../agents/security-engineer.agent.md) | Auditar RBAC, escopo de departamento, spoofing de agentId e dados pessoais. |
| 6 | [`qa-testing-engineer.agent.md`](../agents/qa-testing-engineer.agent.md) | Testar colaboração, concorrência, notificações, grupos, regressões e E2E. |
| 7 | [`devops-infra-engineer.agent.md`](../agents/devops-infra-engineer.agent.md) | Executar migration, seed, flags, build, canary e rollback. |

## 3. Diagnóstico do estado atual

### 3.1 Mensagens

- `Message` possui `senderAgentId`, mas não possui snapshot de nome do remetente externo.
- A formatação de mensagens usa `senderAgent.name` quando disponível, porém cai para `conversation.assignedAgent.name`; após uma delegação essa associação deixa de representar mensagens antigas.
- `sendMessage` ainda tenta usar o responsável da conversa e, em último caso, `findFirstAgent()`, em vez de usar obrigatoriamente o usuário autenticado.
- A UI mostra o nome do remetente apenas em parte das mensagens recebidas e não apresenta de forma consistente o departamento real do agente que respondeu.
- O departamento da conversa (`Conversation.departmentId`) representa fila/contexto de roteamento e não deve ser usado como departamento do remetente humano.

### 3.2 Webhook Z-API

- O parser já extrai `senderName`, `participantPhone` e `participantLid` para mensagens privadas/grupo.
- O nome extraído não é persistido como snapshot próprio da mensagem; alterações posteriores no contato podem mudar a forma como o histórico é exibido.
- A mensagem de grupo é vinculada ao participante conforme o Plano 015, portanto não se deve trocar essa regra silenciosamente nesta entrega.

### 3.3 Assumir, delegar e notificações

- `POST /conversations/:id/assume` já aceita `agentId`, mas agentes comuns só podem informar a própria identidade e a interface não oferece seleção de outro atendente.
- Não há endpoint semântico de delegação, registro de ator/origem/destino ou motivo.
- O módulo de notificações já possui persistência, Socket.IO, deduplicação e tipos de atribuição; é necessário adicionar o evento explícito de delegação e direcioná-lo ao novo responsável.
- O RBAC precisa diferenciar assumir a própria conversa de delegar para terceiros.

## 4. Personas e histórias de usuário

### H01 — Identidade do atendente

Como atendente, quero que cada mensagem enviada pelo painel use meu nome e meu departamento cadastrado, para que o cliente saiba quem respondeu.

### H02 — Colaboração

Como segundo atendente autorizado, quero responder um chamado já assumido por outra pessoa, para contribuir sem que o histórico atribua minha mensagem ao responsável anterior.

### H03 — Identidade do cliente/remetente

Como atendente, quero ver o nome do remetente da mensagem recebida, especialmente em mensagens originadas de grupo, para saber quem enviou cada informação.

### H04 — Delegação

Como administrador ou supervisor autorizado, quero delegar um chamado para outro atendente ativo, para distribuir a carga e garantir continuidade do atendimento.

### H05 — Notificação

Como atendente que recebeu uma delegação, quero receber um alerta com link direto para o chamado, para agir sem precisar procurar manualmente na fila.

### H06 — Auditoria

Como administrador, quero consultar quem delegou, para quem, quando e com qual motivo, para auditar decisões operacionais.

## 5. Requisitos funcionais

### RF01 — Fonte de verdade do remetente humano

Ao enviar pelo painel, o backend deve resolver o remetente exclusivamente do usuário autenticado (`req.user.id`). O cliente não poderá escolher outro `agentId` no body para mascarar a autoria.

O envio deve falhar com `403` quando o usuário não puder acessar o chamado ou não possuir permissão de resposta. Não usar `findFirstAgent()` como identidade silenciosa.

### RF02 — Assinatura por perfil

O cabeçalho enviado ao WhatsApp deve usar:

```text
*{agent.name} - {agent.department.name}:*

{conteúdo}
```

Fallback permitido para agente sem departamento: `Suporte T.I.`. O departamento da conversa só será fallback operacional quando o perfil não possuir departamento.

### RF03 — Snapshot por mensagem

Cada mensagem deve manter a identidade válida no momento do recebimento/envio:

- agente: `senderAgentId`, nome e departamento resolvidos por relação;
- contato: `senderContactId` quando existir e `senderNameSnapshot`;
- bot: identidade fixa `GTF-Bot`;
- grupo: nome do participante recebido, sem substituir pelo nome do grupo.

Mensagens antigas devem continuar legíveis mesmo se o contato ou atendente mudar de nome/departamento.

### RF04 — Renderização do histórico

O detalhe da conversa deve exibir, em cada mensagem:

- nome do remetente;
- departamento do atendente quando `senderType=AGENT`;
- horário;
- indicação `GTF-Bot` para mensagens automatizadas;
- nome do contato/participante para mensagens recebidas.

O nome do responsável atual pode continuar no painel lateral, mas nunca deve substituir o remetente histórico.

### RF05 — Colaboração no mesmo chamado

Atendentes autorizados no escopo do chamado podem enviar mensagens mesmo quando `assignedAgentId` pertence a outro atendente. A regra de acesso deve distinguir:

- **visualizar/responder**: permissão e escopo de departamento;
- **assumir para si**: altera responsável para o usuário autenticado;
- **delegar**: altera responsável para terceiro e exige ação específica.

Cada mensagem mantém o `senderAgentId` real e não altera mensagens anteriores.

### RF06 — Lista de atendentes elegíveis

O backend deve retornar apenas atendentes ativos que possam receber o chamado. Administrador pode delegar entre departamentos; supervisor fica restrito ao escopo definido pelo RBAC (recomendação: próprio departamento); agente comum não delega por padrão.

Atendente inativo, inexistente, sem acesso ao departamento ou igual ao responsável atual deve ser rejeitado com erro de domínio.

### RF07 — Delegação explícita

Criar ação `Delegar chamado` na área de assumir/ações da conversa.

Payload recomendado:

```json
{
  "agentId": "uuid-do-destinatario",
  "reason": "Cobertura de áudio e vídeo necessária"
}
```

`reason` é opcional, limitado a 500 caracteres e tratado como texto puro.

Ao delegar:

1. validar acesso do ator e elegibilidade do destinatário;
2. verificar versão/estado atual para evitar duas delegações concorrentes;
3. salvar responsável novo e timestamp operacional;
4. registrar auditoria de origem, destino, ator e motivo;
5. emitir evento de conversa;
6. criar notificação persistente para o destinatário;
7. invalidar fila, detalhe e contadores;
8. não enviar mensagem automática ao cliente, salvo configuração futura explícita.

### RF08 — Notificação de delegação

Adicionar tipo `CONVERSATION_DELEGATED` ao módulo de notificações.

O item deve conter somente dados necessários:

- `notificationId`;
- `conversationId`;
- nome do contato ou identificador já permitido pela fila;
- nome do ator;
- título “Chamado delegado para você”;
- motivo, quando presente;
- data/hora;
- `readAt`/`dismissedAt`.

A chave de deduplicação deve impedir duplicidade em retry ou reconexão. O destinatário deve receber pelo REST e Socket.IO.

### RF09 — Eventos em tempo real

Emitir:

- `conversation:delegated` para a conversa e a fila, com IDs e nomes seguros;
- `notification:new` para `agent:{targetAgentId}`;
- `conversation:updated` para atualizar a posição na fila.

Após reconexão, o frontend deve reconciliar pelo endpoint REST e não duplicar notificações.

### RF10 — Compatibilidade

- Mensagens privadas atuais continuam funcionando.
- Webhooks de grupo mantêm a semântica do Plano 015.
- O endpoint legado de envio continua aceito durante a janela de migração, mas ignora `agentId` enviado pelo cliente e usa o JWT.
- Conversas antigas sem snapshot usam fallback controlado (`senderAgent`, `senderContact`, depois texto genérico), sem usar o responsável atual como fonte primária.

## 6. Requisitos de API

### 6.1 Detalhe de mensagens

Atualizar `GET /conversations/:id` e `GET /conversations/:id/messages` para cada mensagem retornar:

```json
{
  "id": "uuid",
  "direction": "IN",
  "senderType": "CONTACT",
  "senderName": "João Marcos",
  "senderDepartmentName": null,
  "senderContactId": "uuid",
  "content": "Olá",
  "createdAt": "2026-08-18T12:00:00.000Z"
}
```

`senderContactId` é opcional e pode ser omitido para perfis externos; nunca retornar telefone completo de outro participante apenas para identificação visual.

### 6.2 Atendentes elegíveis

```text
GET /conversations/:id/assignees
```

Resposta:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Marina Costa",
      "departmentId": "uuid",
      "departmentName": "Suporte T.I.",
      "isOnline": true
    }
  ]
}
```

O endpoint aplica escopo no servidor e não aceita `departmentId` arbitrário para ampliar resultados.

### 6.3 Delegação

```text
POST /conversations/:id/delegate
```

Retorna `200` com a conversa atualizada e o registro resumido da atribuição.

Erros:

| Status | Condição |
|---|---|
| `400` | UUID ou motivo inválido |
| `401` | autenticação ausente |
| `403` | usuário sem `conversations:delegate` ou fora do escopo |
| `404` | conversa ou destinatário inexistente |
| `409` | chamado fechado, destinatário inativo ou alteração concorrente |
| `422` | transição operacional incompatível |

### 6.4 Notificações

Reutilizar `GET /notifications`, `GET /notifications/unread-count`, `POST /notifications/:id/read`, `POST /notifications/read-all` e `POST /notifications/:id/dismiss`. O novo tipo deve ser incluído no contrato e no filtro sem criar uma segunda central de notificações.

## 7. Modelo de dados e migration

### 7.1 Alteração aditiva em `Message`

Recomendação:

```prisma
senderContactId     String?   @map("sender_contact_id")
senderNameSnapshot  String?   @map("sender_name_snapshot")
senderDepartmentSnapshot String? @map("sender_department_snapshot")
senderContact       Contact?  @relation(fields: [senderContactId], references: [id], onDelete: SetNull)
```

Manter `senderAgentId` e `senderType` para compatibilidade. Criar índice `(conversationId, createdAt)` já existente e índice opcional em `senderContactId`.

Backfill seguro:

- mensagens `AGENT`: preencher snapshot com o agente relacionado quando possível;
- mensagens `CONTACT`: preencher snapshot com `Contact.name` quando possível;
- mensagens `BOT`: manter snapshot nulo e formatter usa `GTF-Bot`;
- não reescrever conteúdo ou timestamps.

### 7.2 Auditoria de delegação

Criar modelo aditivo:

```prisma
model ConversationAssignment {
  id             String       @id @default(uuid())
  conversationId String       @map("conversation_id")
  fromAgentId    String?      @map("from_agent_id")
  toAgentId      String       @map("to_agent_id")
  actorAgentId   String       @map("actor_agent_id")
  action         String       // ASSUME, DELEGATE, RELEASE
  reason         String?
  createdAt      DateTime     @default(now()) @map("created_at") @db.Timestamptz
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  fromAgent      Agent?       @relation("AssignmentFrom", fields: [fromAgentId], references: [id], onDelete: SetNull)
  toAgent        Agent        @relation("AssignmentTo", fields: [toAgentId], references: [id], onDelete: Restrict)
  actorAgent     Agent        @relation("AssignmentActor", fields: [actorAgentId], references: [id], onDelete: Restrict)

  @@index([conversationId, createdAt])
  @@index([toAgentId, createdAt])
  @@map("gtf_conversation_assignments")
}
```

O Tech Lead deve validar nomes de relações Prisma e comportamento de `onDelete` antes da migration. A migration deve ser aditiva, reversível operacionalmente e não remover dados existentes.

### 7.3 RBAC

Adicionar a ação `delegate` ao recurso `conversations`:

- `ADMIN`: `view`, `assume`, `update`, `delegate`, `close`;
- `SUPERVISOR`: `view`, `assume`, `update`, `delegate` dentro do escopo permitido;
- `AGENT`: `view`, `assume`, `update` para o próprio/departamento, sem `delegate` por padrão.

Os defaults devem ser idempotentes e a matriz da tela deve refletir a nova ação sem concedê-la silenciosamente a perfis existentes que não a possuem.

## 8. Arquitetura de implementação

### Backend

Respeitar Route → Controller → Service → Repository → Schema:

- `backend/prisma/schema.prisma` e migration: snapshots e auditoria;
- `backend/src/modules/conversations/conversations.schemas.ts`: delegação e parâmetros;
- `backend/src/modules/conversations/conversations.routes.ts`: assignees/delegate;
- `backend/src/modules/conversations/conversations.controller.ts`: parsing Zod e status HTTP;
- `backend/src/modules/conversations/conversations.service.ts`: identidade efetiva, autorização, concorrência e assinatura;
- `backend/src/modules/conversations/conversations.repository.ts`: includes, writes transacionais e histórico de atribuição;
- `backend/src/modules/zapi/zapi.schemas.ts`: remetente do callback;
- `backend/src/modules/zapi/zapi.repository.ts`: persistência do contato/snapshot;
- `backend/src/modules/zapi/zapi.service.ts`: propagação de `senderContactId`/nome e eventos;
- `backend/src/modules/notifications/notifications.service.ts`: `CONVERSATION_DELEGATED` e dedupe;
- `backend/src/modules/rbac/`: defaults e permissões;
- `docs/API.md`, `docs/PRD.md`, `docs/PRD_ZAPI.md`, `docs/PRD_SOCKETIO.md`: contratos e eventos.

Todas as mutações devem usar transação ou condição otimista para evitar que dois administradores sobrescrevam a delegação sem perceber.

### Frontend

- `frontend/src/types/index.ts`: remetente, assignees, assignment e notification type;
- `frontend/src/pages/conversation/hooks/use-conversation.ts`: hooks para assignees/delegate e invalidação;
- `frontend/src/pages/conversation/components/DelegationDialog.tsx`: Select/Command shadcn, busca e motivo;
- `frontend/src/pages/conversation/components/MessageSenderLabel.tsx`: identidade visual por mensagem;
- `frontend/src/pages/conversation/index.tsx`: ações Assumir/Delegar e estados de confirmação;
- `frontend/src/pages/conversation/components/DetailPanel.tsx`: responsável atual versus histórico de colaboradores;
- `frontend/src/components/NotificationBell.tsx` ou módulo equivalente: novo tipo, navegação e leitura;
- `frontend/src/pages/queue/`: ação rápida de delegar sem abrir duas telas, se o layout comportar.

Usar componentes shadcn existentes (`Dialog`, `AlertDialog`/`ConfirmationDialog`, `Select`, `Command`, `Badge`, `Button`, `Skeleton`) e superfícies opacas da paleta `#2D89C8`. A delegação utiliza confirmação `warning`; encerramento continua `danger`.

## 9. Fases de execução

### F0 — Fechamento funcional e baseline

- Confirmar que colaboração significa múltiplos atendentes no mesmo chamado.
- Confirmar se supervisor delega apenas no departamento ou em qualquer departamento.
- Confirmar se a delegação mantém o departamento da fila quando o destino pertence a outro departamento.
- Congelar payload Z-API real de mensagem privada e grupo sem dados pessoais nos fixtures.
- Registrar baseline de mensagens antigas, permissões e notificações.

**Saída:** decisões aprovadas, contrato v2 documentado e fixtures anonimizadas.

### F1 — Migration aditiva e identidade

- Adicionar snapshots e relação opcional de contato na mensagem.
- Adicionar auditoria de atribuições.
- Gerar Prisma Client, executar backfill idempotente e verificar índices.
- Implementar formatter compatível que nunca use responsável atual como primeira fonte.

**Saída:** mensagens antigas e novas exibem remetente estável sem ativar delegação.

### F2 — Backend de colaboração e delegação

- Usar `req.user` no envio de mensagem.
- Persistir `senderAgentId`/snapshots em toda mensagem humana.
- Criar assignees/delegate com Zod, RBAC, escopo, transação e `409` concorrente.
- Criar registro de auditoria.
- Emitir eventos Socket.IO e notificações idempotentes.

**Saída:** API pronta e testável por contrato, com feature flag desligada por padrão.

### F3 — Frontend do atendimento

- Mostrar remetente e departamento em cada bolha.
- Diferenciar responsável atual de colaboradores no painel lateral.
- Adicionar diálogo de delegação na área de assumir e, quando possível, ação rápida na fila.
- Mostrar agentes elegíveis, estado online/offline, motivo e confirmação.
- Atualizar cache ao assumir/delegar e manter navegação após notificação.

**Saída:** fluxo visual completo sem IDs técnicos ou telefone integral.

### F4 — Segurança, notificações e tempo real

- Revisar escopo por departamento e autorização de cada mutação.
- Validar dedupe de `CONVERSATION_DELEGATED` em retry/reconexão.
- Garantir que Socket.IO não aceite `agentId` arbitrário nem exponha dados sensíveis.
- Adicionar métricas de delegação e falhas.

### F5 — QA, rollout e documentação

- Executar matriz unitária/API/integração/E2E e builds.
- Ativar primeiro em homologação e em um perfil ADMIN controlado.
- Liberar para SUPERVISOR conforme decisão de escopo.
- Monitorar delegações, respostas por remetente, `403/409`, notificações lidas e falhas de webhook.
- Rollback: desativar flags e manter migration; não apagar auditoria nem snapshots.

## 10. Critérios de aceite

### Identidade

- [ ] Uma mensagem enviada por atendente A exibe A, mesmo que B seja o responsável atual.
- [ ] Uma mensagem enviada por atendente B no mesmo chamado exibe B e seu departamento.
- [ ] Mensagens antigas não mudam de remetente após delegação, troca de nome ou troca de departamento.
- [ ] Mensagem recebida de participante de grupo exibe o participante, não o responsável do chamado nem o nome do grupo como remetente.
- [ ] Mensagem do bot exibe `GTF-Bot`.
- [ ] O cliente recebe assinatura baseada no perfil autenticado; `agentId` arbitrário no body não altera autoria.

### Delegação

- [ ] ADMIN consegue listar agentes ativos elegíveis e delegar um chamado.
- [ ] SUPERVISOR respeita seu escopo configurado.
- [ ] AGENT sem `delegate` recebe `403` e não vê ação executável.
- [ ] Destinatário inativo, inexistente, igual ao atual ou chamado fechado gera erro claro.
- [ ] Duas delegações concorrentes não sobrescrevem silenciosamente o resultado; uma recebe `409`.
- [ ] Auditoria registra ator, origem, destino, motivo e timestamp.
- [ ] O destinatário recebe notificação persistente e Socket.IO, com link para o chamado.
- [ ] Marcar como lida/dispensar é idempotente e não duplica após reconexão.

### Regressão e segurança

- [ ] Fluxo privado, grupos/menções, mídia, atalhos, fila, assumir, transferir e encerrar continuam funcionando.
- [ ] Conversas permanecem no departamento de fila salvo transferência formal.
- [ ] Nenhum telefone completo, token, JID ou conteúdo sensível aparece em logs/eventos de delegação.
- [ ] APIs retornam `400/401/403/404/409` padronizados.
- [ ] `npm test`, `npm run build` do backend e `npm run build` do frontend passam.

## 11. Matriz de testes

| Área | Cenário | Resultado esperado |
|---|---|---|
| Parser | Mensagem privada com nome/pushName | contato e snapshot corretos |
| Parser | Grupo com `participantPhone` e nome diferente do grupo | remetente é participante |
| Parser | Callback duplicado | nenhuma mensagem/notificação duplicada |
| Mensagem | Dois agentes respondem | cada bolha usa seu próprio agente/departamento |
| Mensagem | Agente sem departamento | fallback documentado, sem erro |
| Mensagem | Body tenta enviar `agentId` de terceiro | ignorado ou `400`; autoria segue JWT |
| Delegação | ADMIN para agente ativo | responsável muda, auditoria e notificação criadas |
| Delegação | SUPERVISOR fora do escopo | `403` |
| Delegação | destinatário inativo | `409` |
| Concorrência | dois delegadores simultâneos | uma operação vence; outra recebe `409` |
| Notificação | retry/reconnect | uma notificação pela mesma delegação |
| Socket | usuário sem acesso tenta join | conexão/ação rejeitada |
| Migração | mensagens antigas | carregam com fallback sem falhar |
| Regressão | fluxo 015, mídia e fila | comportamento preservado |
| UI | teclado/mobile/erro API | foco, loading, erro e retry acessíveis |

## 12. Segurança e privacidade

- O JWT é a única fonte de identidade do atendente em mutações.
- IDs enviados pelo frontend são apenas alvos de consulta; o service revalida existência, status ativo, RBAC e departamento.
- Não confiar em nome/departamento enviado pelo cliente ou webhook; resolver pelo banco e salvar snapshot controlado.
- Sanitizar `reason`, nomes e mensagens como texto; React não renderiza HTML.
- Não registrar telefones completos, JIDs, tokens, conteúdo da mensagem ou motivo completo em logs de infraestrutura.
- Aplicar rate limit em assignees/delegate e dedupe por operação.
- Revisar CORS/Socket.IO sem alterar o bypass servidor-servidor do webhook Z-API.

## 13. Observabilidade e rollout

Métricas:

- `conversation_assignment_total{action,result}`;
- `conversation_assignment_conflict_total`;
- `message_sender_resolution_total{senderType,fallback}`;
- `delegation_notification_total{delivered,failed,deduplicated}`;
- latência de delegação e atualização do Socket.IO.

Feature flags recomendadas:

- `COLLABORATIVE_SENDERS_ENABLED=false`;
- `CONVERSATION_DELEGATION_ENABLED=false`.

Rollout:

1. Migration/backfill em homologação.
2. Leitura compatível dos snapshots sem ativar envio colaborativo.
3. Ativar identidade por mensagem para ADMIN/homologação.
4. Ativar delegação para ADMIN.
5. Liberar SUPERVISOR após revisão do escopo.
6. Monitorar por 24–48h e ampliar.

Rollback é feito desativando flags e preservando colunas/auditoria; não executar `reset`, remoção destrutiva ou alteração manual de mensagens históricas.

## 14. Atualizações documentais obrigatórias durante a execução

- `docs/PRD.md`: histórias de colaboração, delegação e identidade.
- `docs/API.md`: assignees, delegate, remetente por mensagem e erros `403/409`.
- `docs/PRD_ZAPI.md`: snapshot do remetente externo e assinatura baseada no perfil autenticado.
- `docs/PRD_SOCKETIO.md`: `conversation:delegated`, payload seguro e notificação direcionada.
- `docs/ARCHITECTURE.md`: modelo de snapshots/auditoria e transação de atribuição.
- `docs/GUIDELINES.md`: regra de não usar responsável atual como identidade de mensagem.
- `docs/README.md`: link para este plano/PRD quando a implementação for concluída.
- Criar runbook de rollout/rollback se a migration ou flags forem ativadas em produção.

## 15. Execução desta entrega

**Status atual:** Implementação concluída em código; aguardando migration/homologação com PostgreSQL disponível.

Concluído:

- snapshots de remetente e auditoria de atribuições no Prisma/migration aditiva;
- envio humano resolvido pelo JWT, colaboração por departamento e identidade por mensagem;
- webhook Z-API persistindo nome/contato do remetente, inclusive participante de grupo;
- endpoints de atendentes elegíveis e delegação com RBAC, transação otimista, auditoria e `409`;
- notificação `CONVERSATION_DELEGATED`, Socket.IO e atualização do sino;
- diálogo de delegação com componentes shadcn e histórico de responsáveis no atendimento;
- documentação de produto, API, Z-API, Socket.IO e guidelines atualizada;
- testes de contrato do Plano 016 adicionados; TypeScript/backend/frontend compilam.

Pendente para homologação:

- executar `npx prisma migrate deploy` com o PostgreSQL local/Railway disponível;
- executar testes de integração que dependem do banco;
- validar manualmente delegação, colaboração e mensagens de grupo com duas contas reais;
- ativar as permissões e o recurso gradualmente conforme o runbook.
