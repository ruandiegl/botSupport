# Plano 025 — Horários de funcionamento e resposta automática fora do expediente

**Status:** Implementado  
**Prioridade:** Alta (redução de mensagens sem atendimento e de encerramentos indevidos)  
**Escopo:** configuração administrativa, avaliação server-side no webhook Z-API e mensagem configurável para fora do expediente/indisponibilidade  
**Data:** 2026-08-24  

## 1. Objetivo

Permitir que o GTF-Bot informe de forma clara quando o contato escreve fora do horário de funcionamento ou quando, embora dentro do horário configurado, não exista atendente elegível online. A resposta deve ser configurável, respeitar o fuso horário da operação e suportar vários intervalos por dia, exceções de calendário e regras por departamento.

O recurso deve substituir o comportamento atual em que o contato pode receber o encerramento padrão quando não há equipe disponível. A mensagem de expediente será uma resposta informativa e não encerrará o chamado por si só. O atendimento humano, o auto-close já existente e as mensagens manuais continuam sendo políticas independentes.

## 2. Base documental e restrições

Este plano considera:

- `docs/README.md`: stack, índice da documentação e runbooks existentes;
- `docs/PRD.md`: jornada de fila, fluxo do bot, status, autoria e RBAC;
- `docs/ARCHITECTURE.md`: separação Route → Controller → Service → Repository, motor de fluxo versionado e transporte Z-API;
- `docs/API.md`: envelopes, erros, permissões e configuração da Z-API;
- `docs/PRD_ZAPI.md`: webhook `ReceivedCallback`, `autoReply`, envio de texto, idempotência e grupos;
- `docs/PRD_SOCKETIO.md`: presença, eventos operacionais, fallback REST e autorização de rooms;
- `docs/PRD_AUTO_CLOSE_AND_UNIFIED_STATUS.md`: status e worker de inatividade;
- `docs/PERFORMANCE_READ_MODEL.md`: leituras resumidas, atualização por eventos e limites de latência;
- `docs/GUIDELINES.md`: Zod na borda, Prisma apenas no Repository, logs sem PII e limites de payload;
- `docs/DESIGN_SYSTEM.md` e `docs/paleta.md`: componentes shadcn, confirmação de configurações, tema claro/escuro e estados visuais;
- `docs/RUNBOOK_GRUPOS_ETIQUETAS.md`, `docs/RUNBOOK_EXCLUSOES_BOT.md`, `docs/RUNBOOK_IDENTIDADE_DELEGACAO.md` e `docs/RUNBOOK_MIDIA_ZAPI.md`: operação, escopo, rollback e privacidade.

Restrições:

1. A decisão de responder deve ocorrer no backend, nunca depender do relógio ou do estado do navegador.
2. O webhook deve continuar respondendo rapidamente; a avaliação de expediente não pode bloquear a confirmação HTTP aguardando uma operação longa.
3. Mensagens recebidas e conversas continuam persistidas mesmo quando nenhuma resposta automática é enviada.
4. Não expor tokens da Z-API, configuração sensível ou dados pessoais em logs, DTOs desnecessários ou Socket.IO.
5. Não criar um novo status de conversa. Usar os estados atuais (`BOT`/`OPEN`, `QUEUED`, `IN_PROGRESS`, `CLOSED`, conforme a revisão ativa).
6. Não alterar o fluxo versionado de forma implícita. A resposta de expediente é um guard do transporte antes da saudação/menu, não um novo nó hardcoded do fluxo.
7. A política não deve bloquear mensagens manuais dos atendentes.

## 3. Decisões funcionais

### 3.1 Escopo da política

Haverá uma política global e, opcionalmente, políticas específicas por departamento:

- **Global:** usada quando a conversa ainda não possui departamento ou quando não existe uma política específica.
- **Departamento:** aplicada depois que o fluxo conhece o departamento da rota. Se uma política departamental estiver desativada/incompleta, usa-se a global.
- A política nunca será escolhida pelo cliente. O servidor resolve o escopo a partir da conversa e do fluxo publicado.

### 3.2 Fuso horário

- Toda política terá um timezone IANA, por exemplo `America/Sao_Paulo`.
- Datas recebidas do banco continuam em UTC; somente a avaliação de dia, intervalo e próxima abertura usa o timezone da política.
- O painel exibirá o fuso junto do horário e mostrará a próxima janela convertida para o fuso local do navegador apenas como ajuda visual.
- Horário de verão/DST, meia-noite e intervalos que atravessam o dia devem ser tratados por uma biblioteca de timezone aprovada pelo Tech Lead, com testes de transição.

### 3.3 Agenda semanal

Cada dia pode ter zero, um ou vários intervalos, por exemplo:

```json
{
  "timezone": "America/Sao_Paulo",
  "weekly": {
    "MONDAY": [{ "start": "08:00", "end": "12:00" }, { "start": "13:00", "end": "18:00" }],
    "TUESDAY": [{ "start": "08:00", "end": "18:00" }],
    "SUNDAY": []
  }
}
```

Regras:

- `start` é inclusivo e `end` é exclusivo;
- `end` deve ser posterior a `start` no mesmo dia no MVP; intervalos noturnos devem ser representados em dois dias;
- intervalos do mesmo dia não podem se sobrepor;
- pelo menos um intervalo deve existir para ativar a política;
- a UI oferece presets úteis, mas sempre permite editar livremente os dias e horários.

### 3.4 Exceções de calendário

O administrador poderá cadastrar uma data como:

- **Fechado:** substitui todos os intervalos do dia;
- **Horário especial:** substitui os intervalos apenas naquela data;
- motivo opcional, exibido somente no painel e na prévia.

Recorrência de feriados fica fora do MVP; a estrutura deve aceitar futura expansão sem mudar o contrato público.

### 3.5 Disponibilidade de atendentes

A política terá um modo de disponibilidade:

- `SCHEDULE_ONLY`: considera apenas os intervalos;
- `SCHEDULE_AND_ONLINE` (padrão recomendado): dentro do expediente, exige ao menos um atendente ativo e online elegível;
- `ONLINE_ONLY`: ignora a agenda e responde quando não houver atendente online. Deve ser usado somente por operação que explicitamente escolher essa opção.

Um atendente elegível é ativo, online e autorizado a visualizar/assumir a fila do escopo. Para uma conversa já roteada, o escopo é o departamento; antes da rota, usa-se a disponibilidade global dos agentes elegíveis para a fila. Não considerar um agente offline, inativo ou fora do escopo.

### 3.6 Mensagens e variáveis

Serão configuradas duas mensagens, ambas editáveis:

1. **Fora do horário:** enviada quando a política estiver fechada.
2. **Sem atendente online:** enviada quando a política estiver aberta, mas não houver atendente elegível.

Se a segunda estiver vazia, o sistema reutiliza a primeira somente quando isso estiver explicitamente habilitado; o padrão é não enviar texto vazio.

Variáveis permitidas, renderizadas como texto:

- `{{nome}}`: nome disponível do contato;
- `{{departamento}}`: departamento resolvido, quando houver;
- `{{proximaAbertura}}`: próxima data/horário de abertura no timezone da política;
- `{{horarioHoje}}`: intervalos restantes do dia, quando aplicável.

Variável desconhecida, HTML, script ou conteúdo acima do limite deve ser rejeitado pelo schema. A prévia usa valores fictícios e nunca envia mensagem.

### 3.7 Frequência e anti-spam

- A resposta de expediente será enviada no máximo uma vez por conversa, política, motivo e janela de disponibilidade.
- A chave lógica será equivalente a `conversationId:policyId:reason:windowKey`; o `windowKey` deve mudar ao iniciar uma nova janela semanal, exceção ou período de indisponibilidade.
- O administrador poderá escolher `ONCE_PER_WINDOW` ou um cooldown mínimo (padrão: 60 minutos, limite seguro entre 5 e 1440 minutos).
- Uma nova mensagem do cliente não deve gerar cópias da mesma resposta dentro do cooldown.
- Uma mudança de fechado para aberto/online encerra a janela anterior; a mensagem seguinte pode entrar no fluxo normal.
- Retransmissões do mesmo `messageId` da Z-API são idempotentes e não geram nova resposta.

### 3.8 Precedência no webhook

Ordem obrigatória para mensagem recebida:

1. validar assinatura/shape e deduplicar `messageId`;
2. persistir a mensagem e atualizar a atividade da conversa;
3. aplicar exclusão de bot por telefone do participante;
4. ignorar mensagens `fromMe`, mensagens manuais ou estados que não aceitam automação (`IN_PROGRESS`, `QUEUED` e equivalentes da revisão);
5. resolver política e disponibilidade;
6. se fechado/sem atendente, reservar e enviar a mensagem de expediente, sem saudação/menu/triagem/encaminhamento;
7. se disponível, seguir o motor de fluxo atual sem alteração;
8. emitir `message:new`/`conversation:updated` somente com payload mínimo.

O guard não deve responder publicamente em grupo. Menções válidas em grupo continuam abrindo/atualizando o atendimento privado do participante e a mensagem de expediente, se necessária, é enviada para o privado.

A mensagem de expediente não fecha a conversa. O worker de auto-close continua sendo uma política separada; sua mensagem de encerramento só é enviada se as regras do auto-close forem satisfeitas.

## 4. Histórias de usuário e critérios de aceite

### US-01 — Configurar expediente

Como administrador, quero definir timezone, dias, múltiplos intervalos e exceções, para que o bot represente o expediente real da operação.

Aceite:

- [ ] intervalos inválidos, sobrepostos, vazios ou fora de `00:00–24:00` retornam erro por campo;
- [ ] o preview mostra aberto/fechado e a próxima abertura para uma data escolhida;
- [ ] salvar usa confirmação `warning`, suporta conflito de revisão `409` e não perde alterações locais;
- [ ] a política global funciona sem departamentos cadastrados.

### US-02 — Personalizar mensagens

Como administrador, quero editar a mensagem fora do horário e a mensagem sem atendente, para orientar o cliente sem enviar o encerramento genérico.

Aceite:

- [ ] cada mensagem tem contador, limite e prévia com variáveis renderizadas;
- [ ] mensagem vazia não é enviada;
- [ ] a configuração é preservada entre reloads e não expõe tokens;
- [ ] o padrão pode ser restaurado com confirmação sem apagar a agenda.

### US-03 — Responder somente quando necessário

Como solicitante, quero receber uma explicação clara fora do expediente sem receber várias cópias ou o menu completo, para saber quando aguardar.

Aceite:

- [ ] primeira mensagem fora da janela envia somente a mensagem configurada;
- [ ] mensagens seguintes no mesmo período respeitam deduplicação/cooldown;
- [ ] uma mensagem durante o expediente retoma o fluxo normal;
- [ ] nenhum auto-reply é emitido para número excluído, conversa em atendimento humano ou mensagem enviada pelo painel.

### US-04 — Sem atendente online

Como supervisor, quero que o cliente seja informado quando a agenda está aberta, mas não há atendente online, para reduzir expectativas incorretas.

Aceite:

- [ ] a avaliação considera presença persistida e escopo do departamento;
- [ ] um atendente online elegível libera o fluxo normal sem mensagem de indisponibilidade;
- [ ] alternâncias online/offline não criam spam dentro do cooldown;
- [ ] o card administrativo mostra a política efetiva e a próxima abertura.

### US-05 — Segurança e auditoria

Como administrador, quero que somente perfis autorizados alterem a política e que alterações sejam auditáveis.

Aceite:

- [ ] somente `business_hours:configure` altera configuração;
- [ ] leitura respeita `business_hours:view` e escopo da tela;
- [ ] logs registram política, motivo, decisão e duração, nunca conteúdo integral, telefone, token ou URL;
- [ ] o histórico de mensagens continua disponível aos atendentes autorizados.

## 5. Arquitetura proposta

### 5.1 Modelo de dados aditivo

O Tech Lead deve decidir entre uma política normalizada e um documento versionado. A recomendação para evitar JSON opaco e permitir índices/escopo é:

```text
BusinessHoursPolicy
- id, zApiConfigId, departmentId nullable
- enabled, mode, timezone
- outsideMessage, noAgentMessage nullable
- messageCooldownMinutes, noticeFrequency
- revision, createdAt, updatedAt, updatedByAgentId

BusinessHoursInterval
- id, policyId, weekday, startMinute, endMinute, sortOrder

BusinessHoursException
- id, policyId, localDate, kind (CLOSED | SPECIAL_HOURS)
- intervalsJson opcional, reason, createdAt, updatedAt

BusinessHoursNotice
- id, conversationId, policyId, reason
- windowKey, status (PENDING | SENT | FAILED)
- messageId nullable, sentAt, lastError redigido, createdAt
- unique(conversationId, policyId, reason, windowKey)
```

Regras de schema:

- `zApiConfigId + departmentId` único; somente uma política global por instância;
- `departmentId` referencia departamento com `SetNull` ou impede exclusão enquanto houver política, conforme decisão do Tech Lead;
- `weekday` e minutos são inteiros pequenos com checks no PostgreSQL;
- índices para política ativa, data de exceção, conversa e janela;
- migration aditiva e reversível em termos de código: não remover nem reescrever conversas/mensagens existentes;
- `BusinessHoursNotice` funciona como reserva idempotente antes do envio e possui recuperação de reservas `PENDING` antigas.

Se a equipe escolher JSON versionado para reduzir a migration, o documento deve manter IDs estáveis, `revision`, validação Zod estrita e um índice/registro separado para notices. Não usar `ZApiConfig` como um JSON livre sem limite.

### 5.2 Módulo backend

Criar `backend/src/modules/business-hours/` seguindo a arquitetura existente:

- `business-hours.routes.ts`: autenticação e RBAC;
- `business-hours.controller.ts`: parse Zod, status HTTP e envelope de erros;
- `business-hours.service.ts`: resolver política efetiva, calcular janela, disponibilidade, preview e salvar com revisão;
- `business-hours.repository.ts`: Prisma e transações;
- `business-hours.schemas.ts`: payloads, enums, mensagens e timezone;
- `business-hours.clock.ts`: relógio injetável e cálculo timezone/DST;
- `business-hours.guard.ts`: decisão única consumida pelo `zapi.service.ts`;
- `business-hours.worker.ts`: reprocessar reservas pendentes e opcionalmente invalidar notices expirados.

O `zapi.service.ts` deve apenas chamar o guard e o transporte `sendText`; não duplicar regra de calendário em vários pontos.

### 5.3 Contrato REST sugerido

Rotas protegidas:

```text
GET  /api/business-hours                 # políticas efetivas/resumo
GET  /api/business-hours/:id             # política completa, intervalos e exceções
POST /api/business-hours                 # criar política global/departamento
PUT  /api/business-hours/:id             # salvar com { revision, ... }
DELETE /api/business-hours/:id            # desativação lógica, não remoção destrutiva
POST /api/business-hours/:id/preview      # avaliar em uma data/hora informada
GET  /api/business-hours/status           # status efetivo para o painel
```

O payload de escrita deve aceitar apenas `departmentId`, `enabled`, `mode`, `timezone`, `weeklyIntervals`, `exceptions`, mensagens e frequência. `agentId`, `zApiConfigId` e `windowKey` são sempre determinados pelo servidor.

Resposta de decisão interna (não pública para o webhook):

```ts
type BusinessHoursDecision = {
  shouldReply: boolean;
  reason: "OUTSIDE_HOURS" | "NO_AGENT_ONLINE" | "OPEN" | "DISABLED" | "SKIPPED";
  policyId: string | null;
  windowKey: string | null;
  messageTemplate: string | null;
  nextOpeningAt: string | null;
};
```

Erros padronizados: `400` schema/intervalo, `401` sem sessão, `403` RBAC/escopo, `404` política inexistente, `409` revisão concorrente, `422` timezone/agenda inválida, `429` se a edição for limitada.

### 5.4 RBAC e navegação

Adicionar recurso `business_hours` com ações `view` e `configure` e tela `/admin/business-hours` (ou seção claramente delimitada em `/admin/zapi`, decisão a registrar antes da implementação). Recomendação: tela própria para não misturar credenciais Z-API com política operacional.

- ADMIN: `view` + `configure` por padrão;
- SUPERVISOR: `view` e `configure` somente se a política do produto autorizar, limitado aos próprios departamentos;
- AGENT: sem edição; no máximo nenhuma leitura administrativa;
- a sidebar deve exibir a tela apenas quando `screen:/admin/business-hours` estiver liberada.

### 5.5 Frontend

Usar componentes shadcn/Base UI existentes:

- página `frontend/src/pages/admin/business-hours/index.tsx`;
- hooks React Query em `hooks/use-business-hours.ts`;
- editor de timezone com `Select`;
- grade semanal com `Switch`/`Checkbox`, `TimePicker` cascata, botão adicionar intervalo e `Dialog` de exceção;
- editor de mensagem com `Textarea`, contador e chips de variáveis;
- preview opaco em `Card` com estados “Aberto”, “Fechado” e “Sem atendente online”;
- `AlertDialog` de confirmação warning para salvar/restaurar e danger para desativar;
- estados loading, erro/retry, conflito 409 e dirty state;
- suporte ao tema claro/escuro atual, teclado, foco e targets de pelo menos 44px;
- nada de HTML renderizado a partir da mensagem; variáveis entram como texto seguro.

O campo de horário é implementado pelo componente `frontend/src/components/ui/time-picker.tsx`, inspirado no Material Time Picker: abre em cascata abaixo do campo, permite digitar horas/minutos exatos, alternar hora/minuto e arrastar o ponteiro circular com mouse ou toque. A haste vetorial acompanha a posição selecionada em tempo real, o controle oferece alternativa por teclado e a confirmação continua em `Cancelar`/`OK`. A seleção é renderizada com tokens semânticos para preservar contraste nos temas claro e escuro, enquanto o valor confirmado permanece no formato 24h (`HH:mm`) usado pela API.

No painel da Z-API, se houver link/resumo, exibir somente “Horários de funcionamento” e um atalho para a tela dedicada, sem duplicar estado.

## 6. Integração com fluxo, auto-close, grupos e exclusões

- **Fluxo v2:** o guard ocorre antes de `ENTRY`/saudação quando a mensagem inicia ou reinicia o bot; não criar nó artificial de horário.
- **Triagem e decisões válidas:** seleção válida durante expediente nunca deve ser atrasada ou bloqueada pela nova regra.
- **Auto-close:** permanece independente; não reutilizar `warningSentAt` para dedupe de expediente e não enviar “encerramento padrão” apenas porque está fora do horário.
- **Exclusões de bot:** têm precedência; registrar `bot_excluded` e não enviar expediente.
- **Grupos:** somente menção válida ativa o atendimento; a resposta de horário sai no privado do participante, nunca no grupo.
- **Mídia/contato compartilhado:** persistir normalmente; o guard decide apenas resposta automática, não descarte de payload.
- **Atendimento humano:** `IN_PROGRESS` e mensagens manuais não recebem resposta automática de expediente.
- **Socket.IO:** emitir evento operacional mínimo se a decisão criar/alterar fila ou notificação; não transmitir a mensagem completa para rooms que não precisam dela.

## 7. Testes e QA

### Unitários

- segunda-feira 08:00 abre e 18:00 fecha;
- múltiplos intervalos, pausa de almoço, domingo fechado e exceção especial;
- timezone São Paulo, UTC e mudança de DST;
- próxima abertura atravessando dia/semana;
- policy departamental sobrepõe global e fallback global funciona;
- `SCHEDULE_ONLY`, `SCHEDULE_AND_ONLINE` e `ONLINE_ONLY`;
- nenhum agente ativo/elegível, agente online de departamento errado e agente desconectando;
- mensagem vazia, variável desconhecida, HTML, limite e Unicode;
- cooldown, `ONCE_PER_WINDOW`, nova janela e reserva `PENDING` recuperável.

### Contrato/API

- Zod rejeita timezone inválido, intervalos sobrepostos, `start >= end`, weekday desconhecido, UUID inválido, revisão antiga e payload desconhecido;
- `401/403/404/409/422` padronizados;
- supervisor não altera política de outro departamento;
- GET não retorna token Z-API ou dados de notices desnecessários;
- preview não persiste nem envia mensagem.

### Integração Z-API

- mensagem fora do expediente persiste a entrada e envia somente o template;
- não há saudação, menu, triagem ou fechamento automático extra no mesmo callback;
- retries do mesmo `messageId` não duplicam resposta;
- falha de envio marca `FAILED`, permite retry e mantém a conversa recuperável;
- resposta normal volta após abertura;
- mensagens de grupo só respondem no privado após menção válida;
- exclusão de bot e `autoReply=false` continuam vencendo a política.

### Frontend/E2E

- criar política global com dois intervalos e salvar/recarregar;
- editar exceção e conferir preview;
- política por departamento e fallback;
- alternar tema e validar contraste;
- testar conflito 409 sem perder rascunho;
- validar que agentes sem permissão não veem a tela;
- simular horários com relógio fixo e conferir uma única resposta;
- confirmar que mensagem manual e conversa `IN_PROGRESS` permanecem sem bloqueio.

### Regressão e performance

- rodar suíte atual de fluxo, grupos, menções, auto-close, exclusões, mídia, contatos, delegação, fila e notificações;
- medir p50/p95 do guard sem chamada externa adicional desnecessária;
- garantir que `GET /conversations` e o webhook não carreguem toda a agenda a cada mensagem; usar cache curto por `policyId/revision` e invalidar após alteração;
- testar concorrência com dois callbacks simultâneos e múltiplas instâncias do worker.

## 8. Segurança, observabilidade e privacidade

- validar e normalizar tudo com Zod; usar Prisma parametrizado;
- restringir timezone a lista IANA conhecida e mensagens a tamanho seguro;
- não aceitar `policyId`, `departmentId` ou destinatário para ampliar escopo sem autorização;
- aplicar rate limit nas rotas administrativas e limite de exceções/intervalos;
- logs estruturados: `policyId`, `conversationId`, `reason`, `windowKey` hash/anonimizado, resultado e duração;
- não registrar texto completo do template, telefone, token, JID ou nome de contato;
- métricas: `business_hours_decision_total`, `business_hours_reply_total`, `business_hours_deduplicated_total`, falhas Z-API, p50/p95 do cálculo e quantidade de políticas ativas;
- Socket.IO/REST devem respeitar as rooms e permissões existentes.

## 9. Rollout e rollback

### Fases

1. Fechar decisões de escopo, política sem atendente, mensagens e localização da tela.
2. Criar schema/migration aditiva, seed desativado e adaptador sem ativar guard.
3. Publicar API de leitura/escrita e tela com feature flag `BUSINESS_HOURS_ENABLED=false`.
4. Homologar cálculo com relógio fixo, timezone, exceções e RBAC.
5. Ativar para uma instância/departamento de teste; monitorar duplicidades, latência e falhas de envio.
6. Ativar globalmente após confirmar que o fluxo normal e o auto-close não regrediram.

### Rollback

- desativar a feature flag ou `enabled=false` na política;
- manter tabelas, exceções e auditoria para reativação;
- o webhook volta a seguir o fluxo anterior sem apagar mensagens/conversas;
- não executar `prisma migrate reset`, `db push` destrutivo ou `DROP TABLE`;
- se houver erro de template, desligar apenas a política afetada e preservar as demais.

## 10. Agentes recomendados (consultados localmente, sem delegação nesta etapa)

| Ordem | Agente | Aplicação no plano |
|---|---|---|
| 1 | [Product Manager](../agents/product-manager.agent.md) | fechar política global/departamento, jornada, mensagens, variáveis e critérios de aceite; atualizar PRD |
| 2 | [Tech Lead & Architect](../agents/tech-lead-architect.agent.md) | escolher modelo normalizado/versionado, timezone, idempotência, cache e integração com os módulos atuais |
| 3 | [Backend Developer](../agents/backend-developer.agent.md) | módulo `business-hours`, migration, guard, Zod, repository e integração Z-API |
| 4 | [Frontend Developer](../agents/frontend-developer.agent.md) | tela configurável com shadcn, preview, hooks React Query, RBAC e tema existente |
| 5 | [Security Engineer](../agents/security-engineer.agent.md) | escopo por departamento, sanitização, templates, logs e rate limit |
| 6 | [QA Testing Engineer](../agents/qa-testing-engineer.agent.md) | matriz de timezone/DST, concorrência, Z-API, RBAC, E2E e regressão |
| 7 | [DevOps/Infra](../agents/devops-infra-engineer.agent.md) | migration deploy, variáveis/feature flag, worker único, observabilidade e rollback |

Sequência recomendada: Product Manager → Tech Lead → Backend + Frontend → Security → QA → DevOps/rollout. Esta lista registra os papéis apropriados para uma futura execução; nenhuma tarefa foi delegada automaticamente.

## 11. Arquivos previstos

### Backend

- `backend/prisma/schema.prisma` e migration aditiva;
- `backend/src/modules/business-hours/*`;
- `backend/src/modules/zapi/zapi.service.ts` e rotas de registro no `app.ts`;
- `backend/src/modules/rbac/rbac.service.ts`;
- testes em `backend/test/business-hours*.test.js` e regressões de `zapi.service.test.js`.

### Frontend

- `frontend/src/pages/admin/business-hours/index.tsx`;
- `frontend/src/components/ui/time-picker.tsx`;
- `frontend/src/pages/admin/business-hours/hooks/use-business-hours.ts`;
- componentes locais de agenda, exceção e preview;
- `frontend/src/app/Shell.tsx` para navegação condicionada ao RBAC;
- `frontend/src/types/index.ts` e estilos sem cores hardcoded.

### Documentação

- adicionar seção de histórias e regra de precedência em `docs/PRD.md`;
- adicionar contrato REST e exemplos em `docs/API.md`;
- registrar o guard em `docs/ARCHITECTURE.md` e `docs/PRD_ZAPI.md`;
- atualizar `docs/DESIGN_SYSTEM.md` para o editor/estados;
- criar `docs/RUNBOOK_HORARIO_FUNCIONAMENTO.md` com migration, flag, homologação e rollback;
- adicionar a referência deste plano ao índice de `docs/README.md`.

## 12. Definition of Done

- [ ] decisões de produto registradas e aprovadas;
- [x] migration aditiva aplicada sem alterar dados existentes;
- [x] API, RBAC e UI funcionais com revisão concorrente;
- [x] guard integrado ao webhook e ao motor sem mensagem duplicada;
- [x] horário, timezone, exceções e presença testados;
- [x] mensagens fora do expediente e sem atendente configuráveis e auditáveis;
- [ ] auto-close, grupos, exclusões, mídia, fluxo e mensagens manuais regressados;
- [x] backend `npm run build` e frontend `npm run build` aprovados; os testes de integração que exigem banco foram bloqueados por configuração de ambiente no comando de teste;
- [x] runbook, métricas e rollback documentados;
- [ ] homologação de uma instância concluída antes da ativação global.
