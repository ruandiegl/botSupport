# Plano 030 — Notificações na aba e alertas sonoros

**Status:** Executado — validação local concluída; homologação Z-API/browser pendente  
**Data:** 01/09/2026  
**Repositório:** `C:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`

## 1. Objetivo

Permitir que o atendente perceba um novo chamado ou uma notificação importante mesmo quando o GTF-Bot estiver aberto em outra aba:

- atualizar o título da aba com um contador temporário;
- exibir um indicador visual no favicon;
- exibir uma notificação nativa do navegador, somente quando habilitada pelo atendente;
- reproduzir um alerta sonoro, também opt-in;
- manter o sino interno, a persistência, a auditoria e o controle de não lidas já existentes.

O comportamento deve funcionar com a página aberta, inclusive quando ela estiver em segundo plano. Notificação com o navegador fechado, recebimento offline e push para dispositivo móvel ficam fora deste plano: exigiriam Service Worker, Push API, VAPID, armazenamento de inscrições e uma política de entrega adicional, recursos que não fazem parte da arquitetura atual.

## 2. Evidências usadas (sem inventar contratos)

### Documentação do projeto

- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md): frontend React/Vite, React Query, Socket.IO e separação Route → Controller → Service → Repository.
- [`docs/PRD_SOCKETIO.md`](../docs/PRD_SOCKETIO.md): evento `notification:new`, salas por agente, reconexão, fallback REST e requisitos de alerta visual, sonoro e título/favicon.
- [`docs/API.md`](../docs/API.md): endpoints existentes de notificações e preferências: `GET /notifications`, `GET /notifications/unread-count`, ações de leitura/dispensa e `GET/PATCH /notification-preferences`.
- [`docs/GUIDELINES.md`](../docs/GUIDELINES.md): TypeScript estrito, hooks para API, RBAC, payload mínimo e proibição de dados sensíveis em eventos/logs.
- [`plans/plan-009-socketio-tempo-real-notificacoes-presenca.md`](./plan-009-socketio-tempo-real-notificacoes-presenca.md) e [`plans/plan-011-fila-priorizada-notificacoes-filtro-data.md`](./plan-011-fila-priorizada-notificacoes-filtro-data.md): notificações persistentes, deduplicação, opt-in de som/browser e REST como fonte da verdade.

### Estado atual confirmado no código

- `backend/src/modules/notifications/` já persiste e deduplica notificações e emite `notification:new` direcionado à sala `agent:{id}`.
- `backend/prisma/schema.prisma` já possui `NotificationPreference`, com `soundEnabled=false` e `browserEnabled=false` por padrão. Não há necessidade de nova tabela ou migração para o escopo básico.
- `frontend/src/hooks/use-notifications.ts` já atualiza o cache do sino ao receber `notification:new`.
- `frontend/src/components/NotificationBell.tsx` já apresenta o popover global e navega para a conversa.
- `frontend/src/app/Shell.tsx` é montado uma única vez e é o ponto correto para o comportamento global da aba.
- `frontend/index.html` define título estático e aponta para `/favicon.svg`; esse caminho precisa ser corrigido/verificado antes de desenhar o badge, pois o ativo disponível é `grupogtf-logo.svg`.
- Não existe Service Worker/PWA configurado.
- A documentação conceitua um namespace `/notifications`, mas a implementação atual usa o namespace padrão e as salas `queue`, `agents`, `groups` e `agent:{id}`. Esta entrega deve reutilizar o contrato real, sem criar um segundo canal concorrente.

## 3. Decisões funcionais propostas

### 3.1 Quais eventos geram atenção

Usar somente notificações já criadas pelo backend, respeitando escopo e permissões:

- `NEW_QUEUE_CONVERSATION`;
- `NEW_MESSAGE`, somente quando a mensagem exigir ação segundo a regra atual da fila;
- `ASSIGNED_CONVERSATION`;
- `CONVERSATION_DELEGATED`;
- `DELEGATION_RESPONSE`;
- `INACTIVITY_CONTINUED` e `UNRESOLVED_REMINDER`, quando habilitados.

Notificações de conversa encerrada ou mensagens enviadas pelo próprio atendente não devem tocar som nem abrir popup. Mensagens contínuas de grupos precisam seguir a mesma política de notificação do backend, com deduplicação/throttle para não transformar cada mensagem em uma sequência de sons.

### 3.2 Quando alertar

- Aba visível e com foco: manter a atualização do sino/toast interno; não abrir `Notification` nativa nem tocar som inesperadamente.
- Aba oculta ou janela sem foco: atualizar título/favicon e, se as preferências estiverem ativas, exibir a notificação nativa e tocar o som.
- Ao retornar para a aba (`visibilitychange`): restaurar o título/favicon original. A leitura da notificação continuará seguindo a ação existente do sino/conversa; não marcar tudo como lido automaticamente.
- O contador da aba será transitório e derivado de eventos ainda não apresentados naquela sessão. Ele não altera o `unread-count` persistido no servidor.

### 3.3 Permissão do navegador

Adicionar um controle explícito “Ativar notificações do navegador”. A chamada a `Notification.requestPermission()` só ocorrerá como consequência desse clique, nunca ao carregar a página.

Estados exibidos ao usuário:

- não configurado: botão para ativar;
- permitido: ativo;
- negado: explicação curta e orientação para liberar nas configurações do navegador;
- API/contexto indisponível: aviso informativo, mantendo sino e título como alternativas.

A produção deve rodar em contexto seguro (HTTPS); `localhost` continua válido para desenvolvimento.

### 3.4 Som

Adicionar “Som de novas notificações” e “Testar som” às preferências do sino. O som deve ser curto, discreto e independente da permissão de notificações do navegador.

O áudio só será desbloqueado após uma interação do usuário e toda chamada a `HTMLAudioElement.play()` (ou Web Audio) deverá tratar rejeições `NotAllowedError`/falhas sem interromper a aplicação. O plano recomenda Web Audio ou um pequeno ativo local versionado, evitando dependência de URL externa.

### 3.5 Título e favicon

Usar a marca base atual e um formato consistente, por exemplo:

```text
(3) GTF-Bot — Operação Torre Forte
```

O favicon receberá um badge de contagem usando `Canvas`/SVG e cor de atenção verde da identidade atual. Ao zerar ou desmontar o Shell, restaurar o ativo original. A implementação deve preservar o caminho válido do logo e não depender de um favicon inexistente.

### 3.6 Várias abas

Cada aba possui sua conexão Socket.IO, portanto a mesma notificação pode chegar mais de uma vez. Coordenar o alerta com `BroadcastChannel` e um fallback curto em `localStorage`:

- deduplicar por `notification.id` (e `dedupeKey` quando disponível);
- eleger uma única aba para som/notificação nativa;
- permitir que todas as abas atualizem o estado visual local;
- expirar chaves temporárias e limpar o canal no logout.

Não enviar token, telefone, conteúdo integral da mensagem ou outro dado sensível pelo canal entre abas.

### 3.7 Adendo solicitado — arquivos ZIP

Este adendo trata do envio de arquivos e é independente do orquestrador de notificações. Ele entra no planejamento para que o mesmo compositor de mensagens aceite ZIPs de forma explícita e apresente um erro compreensível.

**Estado atual confirmado:** o recebimento já reconhece `application/zip` em `backend/src/modules/zapi/zapi.schemas.ts` e o proxy de mídia conhece a extensão `zip`, mas a validação de mídia enviada em `backend/src/modules/conversations/outgoing-media.ts` ainda não inclui `application/zip`. Por isso o arquivo da imagem é rejeitado como formato não aceito antes de chegar à Z-API.

**Decisão sobre tamanho:** compactar não elimina o limite de upload. O ZIP poderá ser enviado somente se o próprio arquivo `.zip` estiver dentro do limite configurado para documentos na aplicação e dentro do limite que a Z-API/WhatsApp confirmar para o endpoint de documento. O limite de 100 MB documentado no projeto para vídeos não deve ser reutilizado automaticamente para documentos. O padrão atual de documento é 16 MiB; qualquer aumento deve ser uma decisão operacional explícita, acompanhada de memória, timeout, Base64 e rate limit.

Na prática:

- arquivos já comprimidos, como vídeos MP4 e muitos PDFs, podem quase não diminuir ao serem zipados;
- o sistema não deve descompactar, alterar ou inspecionar o conteúdo do ZIP para tentar contornar o limite;
- o envio deve usar o endpoint de documento `send-document/zip`, com MIME `application/zip` e nome de arquivo preservado/sanitizado;
- o arquivo deve continuar existindo apenas em memória durante a requisição, seguindo a política de mídia enviada existente;
- a validação deve checar extensão/MIME, assinatura ZIP (cabeçalho `PK`), tamanho, nome e `clientMessageId`, com idempotência igual aos demais documentos;
- erro de formato deve informar que ZIP é aceito; erro de tamanho deve mostrar o tamanho do arquivo, o limite de documentos e orientar a dividir o conteúdo ou reduzir a compactação, sem prometer que “zipar” sempre resolverá.

Copy sugerida para o usuário:

> Este arquivo ZIP está maior que o limite de documentos de **{limite}**. A compactação não ultrapassa o limite do WhatsApp. Tente dividir o arquivo em partes menores ou reduzir o conteúdo e envie novamente.

O texto final deve ser alimentado pelo limite efetivamente configurado, não por um número fixo no frontend.

## 4. Desenho técnico

### 4.1 Orquestrador global

Criar um único hook/serviço, por exemplo `frontend/src/hooks/use-attention-notifications.ts`, montado no `Shell`:

1. carregar preferências via React Query;
2. observar eventos já recebidos pelo fluxo de `useNotifications`;
3. verificar visibilidade/foco;
4. deduplicar e coordenar abas;
5. atualizar contador do título/favicon;
6. disparar `Notification` nativa e som conforme as preferências;
7. registrar/limpar `visibilitychange`, `focus`, `blur`, `BroadcastChannel`, áudio e logout.

O hook não deve criar uma segunda assinatura independente de `notification:new` que duplique o `useNotifications`. A integração deve expor um callback/event bus único ou centralizar o processamento no mesmo handler que atualiza o cache do sino.

### 4.2 Preferências

Criar hook tipado para:

- `GET /notification-preferences` no carregamento autenticado;
- `PATCH /notification-preferences` para `soundEnabled` e `browserEnabled`;
- invalidação/revalidação após salvar;
- estado otimista com rollback em erro;
- reset do estado ao trocar de usuário ou sair.

Os campos e validações devem reutilizar `notifications.schemas.ts`; não duplicar regras no frontend. Se a resposta atual não expuser todos os campos documentados, corrigir o contrato de forma compatível, sem remover campos existentes.

### 4.3 Integração com a interface

Adicionar a seção de preferências ao popover do `NotificationBell` ou a um diálogo aberto por ele, contendo:

- switch de som;
- botão “Testar som”;
- switch de notificações do navegador;
- estado/permissão atual e mensagem acessível;
- feedback de sucesso/erro sem bloquear o atendimento.

O clique de uma notificação nativa deve fechar a notificação, focar a janela (`window.focus()`) e navegar para `conversationId` quando existir. Se não houver conversa associada, abrir o sino interno.

### 4.4 Reconexão e fonte de verdade

Após reconexão Socket.IO, invalidar/refazer `notifications` e `unread-count` via REST. A reconciliação deve atualizar o sino e o contador sem reemitir som para notificações antigas. Socket.IO permanece canal de baixa latência; REST continua sendo a fonte de verdade e fallback.

### 4.5 Backend

Não alterar o fluxo de negócio ou o modelo de dados nesta fase. Verificar apenas:

- que todos os tipos previstos chegam com `notification:new`;
- que a deduplicação por evento permanece idempotente;
- que destinatários continuam limitados pelo RBAC/departamento/atribuição;
- que payloads não expõem conteúdo sensível.

Só abrir alteração no backend se a verificação encontrar uma lacuna real no evento ou no endpoint de preferências. Nesse caso, seguir Route → Controller → Service → Repository, Zod e logs Pino com IDs, tipo, resultado e duração.

## 5. Fases de execução

### Fase 0 — Fechamento do contrato

- confirmar com produto os tipos de evento que exigem ação;
- definir formato do título, cor do badge, texto genérico da notificação e padrão do som;
- confirmar que os defaults permanecem desativados por privacidade e compatibilidade;
- confirmar que “navegador fechado” não faz parte da entrega.

### Fase 1 — Preferências e permissões

- tipar preferências no frontend;
- implementar hook REST e controles no `NotificationBell`;
- solicitar permissão somente no clique;
- criar “Testar som” e tratamento de API/autoplay indisponível.

### Fase 2 — Atenção global da aba

- implementar orquestrador único no `Shell`;
- adicionar `visibilitychange`, foco e limpeza;
- criar título/favicons dinâmicos e corrigir o ativo base;
- deduplicar por ID e coordenar múltiplas abas;
- tratar clique, foco e navegação da notificação nativa.

### Fase 3 — Eventos, reconexão e grupos

- conectar o handler único ao cache/evento existente;
- garantir que nenhum evento seja processado duas vezes;
- reconciliar REST após reconexão;
- validar volume de mensagens em grupos e aplicar a mesma regra de throttle/dedupe, sem esconder mensagens do histórico.
- validar o fluxo complementar de ZIP em conversas privadas e grupos, sem alterar a política de notificações.

### Fase 3.1 — Envio de ZIP (adendo)

- adicionar `application/zip` à allowlist de documentos enviados;
- incluir `zip` no mapa de extensões e validar a assinatura `PK`;
- encaminhar pelo endpoint documentado `send-document/zip`, com `fileName` e legenda compatíveis;
- alinhar os limites de multipart, documento e Base64, mantendo o padrão conservador de 16 MiB até a homologação da Z-API;
- permitir aumento por variável de ambiente somente após confirmar o limite do provedor e a capacidade da infraestrutura;
- exibir nome, tamanho, status, progresso, cancelamento e mensagens de erro amigáveis no compositor compartilhado;
- cobrir a mesma operação no compositor de grupo, que deve usar o mesmo contrato da conversa privada.

### Fase 4 — Testes e documentação

- executar testes unitários, integração e E2E da matriz abaixo;
- atualizar `docs/API.md` e `docs/PRD_SOCKETIO.md` com preferências, permissão, escopo “página aberta” e limitações;
- registrar observabilidade e procedimento de rollback.

## 6. Arquivos previstos

| Arquivo | Ação planejada |
|---|---|
| `frontend/src/hooks/use-attention-notifications.ts` | Novo orquestrador de título, favicon, Notification, som, visibilidade e múltiplas abas. |
| `frontend/src/hooks/use-notification-preferences.ts` | Novo hook tipado para GET/PATCH das preferências, se não houver equivalente reutilizável. |
| `frontend/src/types/index.ts` | Adicionar `NotificationPreference` e tipos auxiliares, sem duplicar os tipos existentes. |
| `frontend/src/app/Shell.tsx` | Montar uma única instância do orquestrador global e limpar no logout. |
| `frontend/src/hooks/use-notifications.ts` | Ajustar a integração para compartilhar o evento sem dupla assinatura ou dupla contagem. |
| `frontend/src/components/NotificationBell.tsx` | Expor preferências, status de permissão e ação de teste do som. |
| `frontend/src/components/NotificationPreferencesDialog.tsx` | Criar somente se a seção não couber no popover atual. |
| `frontend/index.html` e `frontend/public/*` | Validar título base e corrigir/referenciar favicon existente; adicionar ativo sonoro somente se essa opção for escolhida. |
| `frontend/src/pages/conversation/index.tsx`, `frontend/src/pages/groups/index.tsx` e componentes de mídia compartilhados | Aceitar ZIP, apresentar limite dinâmico e mensagens amigáveis sem duplicar a regra de validação. |
| `backend/src/modules/conversations/outgoing-media.ts` | Incluir `application/zip`, extensão, assinatura e limite de documento na validação de saída. |
| `backend/src/modules/zapi/zapi.service.ts` | Reutilizar `send-document/{extension}`; validar a homologação de `send-document/zip`, sem criar endpoint paralelo. |
| `backend/src/shared/multipart.ts` e variáveis `OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES` | Garantir que o limite do multipart acompanhe o limite de documento sem aceitar payload maior por engano. |
| `backend/src/modules/notifications/*` | Apenas verificação; alteração somente se faltar evento/contrato documentado. |
| `docs/API.md`, `docs/PRD_SOCKETIO.md` | Documentar o comportamento entregue e seus limites. |

Nenhuma migration do Prisma é prevista.

## 7. Segurança, privacidade e desempenho

- solicitar permissões somente por gesto explícito, sem bloquear o primeiro acesso;
- respeitar HTTPS/secure context e detecção de suporte;
- manter `soundEnabled` e `browserEnabled` independentes;
- usar título/corpo genéricos, sem telefone completo, token, conteúdo integral ou dados de outro departamento;
- manter o RBAC no backend; o frontend não deve decidir o destinatário;
- limitar bursts de som/notificação e usar deduplicação por ID;
- limpar listeners, canais, timers e referências de áudio em desmontagem, logout e troca de sessão;
- não depender somente de som: sino, contador da aba e atualização visual continuam funcionando;
- registrar métricas de entregas, rejeições de permissão, falhas de áudio, deduplicações e reconexões sem conteúdo sensível.

## 8. Matriz de testes e critérios de aceite

### Cenários

- aba ativa/focada: sino atualiza, sem popup nativo e sem som inesperado;
- aba em segundo plano: título e favicon mostram contagem; popup/som aparecem apenas com as preferências habilitadas;
- permissão `default`, `granted`, `denied` e API ausente;
- som bloqueado pelo navegador, clique em “Testar som” e recuperação após interação;
- duas ou mais abas: uma única reprodução sonora/popup por notificação;
- eventos de fila, atribuição, delegação, mensagem e lembrete;
- evento repetido/reconexão/polling: não duplicar contagem, som ou popup;
- clique no popup: fechar, focar janela e abrir a conversa correta;
- logout/troca de usuário: remover título, favicon, listeners e estado do usuário anterior;
- grupo com muitas mensagens: aplicar a política de throttle sem perder o histórico nem gerar tempestade de alertas;
- navegadores sem suporte à Notification/BroadcastChannel: manter o sino e o título sem erro fatal.
- ZIP válido abaixo do limite: aparece como documento e é entregue no WhatsApp;
- ZIP acima do limite: é bloqueado antes do envio, com limite real e orientação para dividir/reduzir;
- ZIP renomeado ou com MIME incorreto: assinatura e extensão são verificadas e o usuário recebe mensagem clara;
- ZIP enviado em grupo e conversa privada: usa o mesmo endpoint, estados, cancelamento, idempotência e feedback;
- falha/timeout/413 da Z-API: não marcar como enviado e apresentar erro amigável sem expor resposta bruta.

### Aceite

- [x] O atendente consegue ativar/desativar som e notificações do navegador no painel.
- [x] A permissão nunca é solicitada automaticamente ao carregar a aplicação.
- [x] Uma nova notificação acionável em aba não focada altera título e favicon em poucos segundos.
- [x] Popup e som respeitam preferências, permissão e política de visibilidade.
- [x] Retornar à aba restaura a marca original sem apagar indevidamente notificações persistidas.
- [x] Múltiplas abas não reproduzem o mesmo alerta repetidamente.
- [x] Reconexão recupera notificações via REST sem realertar o histórico antigo.
- [x] O comportamento existente do sino, leitura, dispensa, RBAC e auditoria permanece intacto.
- [x] ZIP válido é tratado como documento tanto em conversas privadas quanto em grupos.
- [x] O sistema nunca permite ultrapassar o limite apenas porque o arquivo foi compactado.
- [ ] O limite exibido e a validação usam a mesma configuração do backend — a validação e o erro do backend são dinâmicos; a validação antecipada do frontend usa os padrões documentados e deve ser homologada caso os limites sejam customizados.
- [ ] Build, lint, testes unitários/integrados e E2E passam — build e testes locais passaram; E2E com Z-API/WhatsApp e navegadores ainda pendente.

## 9. Rollout e rollback

- manter as duas preferências desativadas por padrão;
- liberar primeiro para homologação e testar em Chrome/Edge/Firefox;
- acompanhar erros de permissão, autoplay, favicon, reconexão e duplicidade;
- em caso de regressão, desativar o orquestrador de atenção e manter somente o sino/REST, sem remover notificações persistidas nem alterar o banco;
- Web Push/PWA deve ser tratado em plano separado, com revisão de segurança, consentimento e infraestrutura.

## 10. Agentes e ordem recomendada

A matriz de [`agents/README.md`](../agents/README.md) indica os seguintes agentes para esta tarefa:

1. **Product Manager** — fechar tipos de alerta, copy, defaults e política de grupos.
2. **Tech Lead / Architect** — validar integração com `Shell`, Socket.IO, REST, reconexão e múltiplas abas.
3. **Frontend Developer** — implementar hook global, preferências, título/favicon, permissões e som.
4. **Security Engineer** — revisar permissões do navegador, payload mínimo, isolamento entre abas e RBAC.
5. **QA & Testing Engineer** — executar matriz de visibilidade, autoplay, múltiplas abas, reconexão e regressão.

**DevOps/Infra** só é necessário se o escopo for ampliado posteriormente para Service Worker, PWA, HTTPS adicional ou Web Push.

Nesta preparação, os agentes de arquitetura e frontend revisaram o código existente, o agente de pesquisa consultou as recomendações de Notifications API, Page Visibility, BroadcastChannel e autoplay no Context7/MDN, e as decisões acima foram consolidadas sem criar novos contratos de backend.

## 11. Boas práticas consultadas no Context7/MDN

- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API): detectar suporte, respeitar permissão e lidar com o clique.
- [Notification.requestPermission()](https://developer.mozilla.org/en-US/docs/Web/API/Notification/requestPermission_static): solicitar somente em ação explícita do usuário.
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API): usar `document.visibilityState`/`visibilitychange` para decidir quando alertar.
- [Broadcast Channel API](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API): coordenar abas do mesmo contexto.
- [HTMLMediaElement.play()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play): tratar a Promise rejeitada quando o autoplay for bloqueado.
- [Send document — Z-API](https://developer.z-api.io/en/message/send-message-document): usar `send-document/{extension}` com documento em URL ou Data URL/Base64, sujeito aos limites confirmados na homologação.

## 12. Ideias futuras (fora do MVP)

- seleção de som, volume e modo silencioso por horário;
- preferências por departamento/tipo de evento;
- contador separado para chamados urgentes, mensagens e delegações;
- diagnóstico de permissão com link direto às configurações do navegador;
- Web Push/PWA para página fechada e dispositivos móveis;
- sincronização de “já visto” entre abas com uma política explícita de leitura;
- telemetria de tempo entre `notification:new` e interação do atendente.

## 13. Registro da execução

- Notificações globais implementadas no `Shell`, com título/favicons dinâmicos, Notification API, som via Web Audio, preferências, deduplicação entre abas e navegação ao clicar.
- ZIP implementado no fluxo privado e de grupos, com MIME/aliases, extensão, assinatura `PK`, limite por configuração, endpoint `send-document/zip` e mensagens amigáveis.
- Documentação de API, operação e QA atualizada.
- Validação local: `backend npm test` — 112 testes aprovados; `frontend npm run build` — TypeScript e Vite aprovados.
- Pendente antes da liberação: homologar entrega real de `send-document/zip` na instância Z-API/WhatsApp e validar permissões/som nos navegadores suportados em ambiente HTTPS.
