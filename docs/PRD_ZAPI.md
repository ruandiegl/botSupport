# PRD — Documento de Requisitos de Produto: Integração Z-API (WhatsApp)

## 1. Visão Geral
Este documento especifica a integração oficial do **GTF-Bot** com a plataforma **Z-API** para envio e recebimento em tempo real de mensagens de texto, botões interativos, automação de fluxo de bot, notificações de atribuição de chamados e sincronização de webhooks.

---

## 2. Objetivos
1. **Conexão Nativa pela Interface**: Permitir a configuração de `ID da Instância` e `Token da Instância` diretamente pelo painel administrativo do GTF-Bot, sem necessidade de alterar código ou reiniciar o servidor.
2. **Recepção de Webhooks**: Processar eventos de mensagens recebidas (`on-message-received`) e manter o histórico de conversas atualizado instantaneamente na web.
3. **Automação do Bot com Botões Interativos**: Disparar saudações e menus de opção (texto ou lista de botões WhatsApp) para roteamento automático de contatos para seus respectivos departamentos.
4. **Humanização na Atribuição de Chamados**:
   - Quando um atendente clica em **Assumir**, enviar notificação ao cliente informando o nome do atendente responsável.
   - Incluir a assinatura visual do atendente logado em todas as mensagens enviadas.

---

## 3. Credenciais da Instância

Credenciais são segredos operacionais e nunca devem aparecer em documentação, commits, respostas da API ou logs. Use variáveis de ambiente ou o armazenamento administrativo protegido. Exemplos devem conter somente placeholders como `ZAPI_INSTANCE_ID`, `ZAPI_INSTANCE_TOKEN` e `ZAPI_CLIENT_TOKEN`. Qualquer credencial anteriormente exposta deve ser revogada e rotacionada antes do rollout.

---

## 4. Requisitos Funcionais

### 4.1. Gestão de Credenciais Z-API (Frontend & Backend)
- **Tela dedicada (`/admin/zapi`)**:
  - Campos: ID da Instância, Token da Instância, Client Token (opcional para validação), Toggle de Ativação do Bot.
  - Indicador de status em tempo real (Conectado / Desconectado).
  - Botão **Testar Conexão**: dispara chamada para o endpoint `/status` da Z-API.
  - Botão **Configurar Webhook na Z-API**: registra a URL do webhook do GTF-Bot na API da Z-API.

### 4.2. Processamento de Webhooks (`POST /api/webhooks/z-api`)
- Normalização de payload recebido da Z-API.
- Identificação do número de telefone e nome do contato.
- Ignorar mensagens de grupos ou mensagens enviadas pelo próprio número (`fromMe: true`).
- Execução do fluxo de decisão do bot:
  - Se status da conversa = `BOT`:
    - Delegar o evento ao motor do fluxo vinculado à revisão da conversa.
    - Resolver a escolha por `optionKey` estável; número ou texto são apenas fallback compatível.
    - Permitir decisões secundárias dentro da rota, mantendo equipe e assunto selecionado em chaves separadas do `flowContext`.
    - Executar mensagens e triagens configuradas na rota, persistindo respostas em `flowContext`.
    - Manter a conversa em `BOT` enquanto aguarda decisão ou triagem.
    - Encaminhar para `QUEUED` apenas quando o motor executar `HANDOFF`.
  - Se status = `QUEUED` ou `IN_PROGRESS`:
    - Adicionar mensagem à thread sem intervenção automatizada do bot.

### 4.3. Notificação ao Assumir Chamado
- Quando o atendente clica em **Assumir**:
  - Atualiza conversa para `IN_PROGRESS` com a ID e Nome do atendente responsável (ex: Marina Costa).
  - Dispara mensagem automática pelo WhatsApp via Z-API:
    > *"O atendente **Marina Costa** assumiu o seu atendimento. Como posso te ajudar hoje?"*

### 4.4. Assinatura de Mensagens
- Toda resposta enviada pelo atendente através do painel é formatada com a assinatura do atendente e enviada via Z-API:
  > `*Marina Costa - Suporte T.I.*\n`  
  > `[Conteúdo da mensagem]\n\n`  
  > `— Marina Costa`

---

## 5. Especificação Técnica de Endpoints Z-API Utilizados

| Função | Endpoint Z-API | Método |
|---|---|---|
| Enviar Texto | `/send-text` | `POST` |
| Enviar Botões / Opções | `/send-option-list` | `POST` |
| Verificar Status | `/status` | `GET` |
| Configurar Webhook | `/update-webhook-received` | `PUT` |

> O endpoint de botões efetivamente configurado no cliente Z-API deve ser a fonte de verdade. O adaptador de transporte pode usar `send-option-list` ou `send-button-list` conforme o contrato suportado pela instância, mas o motor recebe e devolve um modelo interno único. Essa escolha não pode ficar espalhada na regra de negócio.

`ZAPI_INTERACTIVE_MODE` aceita `auto`, `button` ou `option`. O modo automático usa botões para até três opções e lista para menus maiores. `send-option-list` é usado somente em conversas individuais; fluxos iniciados por menção em grupo continuam no privado. Toda opção envia `id=optionKey`; falhas ou respostas 200 sem `zaapId`/`messageId` usam fallback textual numerado. Para decisões com categorias, a integração usa o contrato público `optionList.options` e inclui a categoria na descrição de cada item. O campo experimental `optionList.sections` não é enviado, pois algumas instâncias respondem 200 e exibem somente o texto do prompt.

## 7. Contrato do motor e garantias do webhook

1. O webhook valida token, forma e limites do payload antes de persistir ou executar o fluxo.
2. Eventos de grupo, `fromMe` e eventos sem identidade válida são ignorados segundo a política vigente.
3. O identificador externo do evento/mensagem é usado como chave de idempotência.
4. A integração Z-API normaliza entrada e executa as ações retornadas pelo motor; ela não contém textos de triagem ou decisões de departamento hardcoded.
5. Falhas transitórias usam retentativa limitada com backoff. A conversa não avança sem registro recuperável do envio.
6. Logs incluem IDs técnicos, tipo de evento, revisão, nó e resultado, mas nunca token, telefone completo, texto de triagem ou respostas do cliente.
7. `autoReply=false`, `QUEUED` e `IN_PROGRESS` impedem que mensagens recebidas reiniciem o bot.
8. `buttonsResponseMessage.buttonId` e `listResponseMessage.selectedRowId` são correlacionados ao nó atual. Quando presente, `referenceMessageId` deve corresponder ao último prompt enviado para impedir que uma escolha antiga avance outro submenu.

## 8. Triagem pós-rota

Ao selecionar Suporte, a revisão inicial deve poder enviar a mensagem configurada e aguardar a resposta antes do handoff. O conteúdo vem exclusivamente do nó `TRIAGE` publicado. Respostas são persistidas sob a chave configurada e ficam vinculadas à revisão da conversa; não devem ser reproduzidas em logs operacionais.

### 8.1 Cooldown anti-spam

Saudação e lista de departamentos respeitam `BOT_REPLY_COOLDOWN_MINUTES` (padrão: 15) quando o fluxo está aguardando uma decisão e recebe uma opção inválida repetida. O backend consulta a última mensagem `BOT` persistida sem atrasar entradas válidas: respostas de triagem avançam normalmente, e uma escolha de rota por botão, lista, índice ou texto exato do rótulo é processada imediatamente. Conversas em `QUEUED` ou `AWAITING_DETAILS` não reiniciam a saudação. O cooldown é server-side e não depende de polling ou estado do navegador.

### 8.2 Exclusões de respostas automáticas

Antes de qualquer entrega automática, o serviço consulta a lista ativa de `BotExclusion` pelo telefone canônico do remetente. A barreira cobre saudação, menus, botões, fallback textual, triagem, confirmação de menção em grupo e mensagens do worker de inatividade. O webhook ainda persiste o evento e a mensagem recebida para que o atendimento humano possa ser localizado e assumido.

O método de envio manual do painel permanece separado e não consulta essa lista. Em grupos, a chave é o participante individual (`participantPhone`/`participant`), nunca o JID do grupo. Ativar ou desativar uma regra não envia mensagens retroativas nem apaga histórico.

### 8.3 Submenus dentro das rotas

Uma rota pode conter um nó `DECISION` secundário antes da triagem ou do encaminhamento. As opções ficam na revisão publicada, usam IDs estáveis e registram `selectedIssueKey`/`selectedIssueLabel` sem substituir `teamName`. Uma seleção válida avança imediatamente; uma resposta inválida repete apenas o submenu atual sob o cooldown. Revisões sem submenu continuam compatíveis.

### 8.4 Categorias e itens

O submenu pode operar como lista simples ou em duas etapas. No modo hierárquico, a primeira lista contém categorias (por exemplo, `InfoAudio` e `InfoRadio`) e a segunda contém apenas os itens da categoria escolhida (por exemplo, `Player` e `Logger`). Categorias e itens usam IDs estáveis; descrições vazias são omitidas do payload. O backend resolve respostas por ID, índice ou rótulo normalizado e mantém `referenceMessageId` para impedir avanço por uma resposta antiga.

### 8.5 Resumo de contato conhecido

Em conversa privada nova, contatos cadastrados podem receber um resumo configurável com nome, emissora e cidade/UF antes da saudação normal. As escolhas “confirmar” e “atualizar” são tratadas como opções do fluxo e a atualização é coletada em etapas. O recurso não usa a agenda da Z-API como fonte de emissora/localidade, não expõe notas internas e não é enviado em grupos. `CONTACT_SUMMARY_ENABLED=false` desliga o comportamento sem remover os dados cadastrados.

---

## 9. Modelo de Dados (`schema.prisma`)

```prisma
model ZApiConfig {
  id          String   @id @default(uuid())
  instanceId  String   @map("instance_id")
  token       String
  clientToken String?  @map("client_token")
  webhookUrl  String?  @map("webhook_url")
  isActive    Boolean  @default(true) @map("is_active")
  autoReply   Boolean  @default(true) @map("auto_reply")
  updatedAt   DateTime @default(now()) @updatedAt @map("updated_at") @db.Timestamptz

  @@map("gtf_zapi_config")
}
```

## 10. Mídia recebida e retenção

O callback `ReceivedCallback` aceita no máximo um objeto `image`, `audio`, `video` ou `document`. O backend valida o contrato, usa `messageId` como identidade externa e persiste `Message` e `ConversationMedia` atomicamente. URLs devem ser HTTPS e são cifradas com AES-256-GCM antes de chegar ao PostgreSQL.

A aplicação utiliza o storage temporário da Z-API, documentado com retenção de 30 dias em [Prazo de expiração dos arquivos](https://developer.z-api.io/tips/file-expiration). Nenhum binário é copiado para infraestrutura própria. A exibição é feita pelo proxy do backend com RBAC, ticket HMAC curto, allowlist de hosts, bloqueio de IP privado, limite de bytes, timeout, Range e `Cache-Control: private, no-store`.

`downloadError` e `viewOnce` geram mídia `UNAVAILABLE` sem URL utilizável. O tempo `momment` aceita Unix em segundos ou milissegundos; `expiresAt` é limitado a 30 dias a partir da origem. O job de expiração marca `EXPIRED` e apaga os ciphertexts.

## 10.1 Identidade do remetente

O webhook persiste `senderNameSnapshot` e `senderContactId` na mensagem recebida. Para grupos, o snapshot usa o participante (`participantPhone`/`participantLid` conforme o parser), nunca o nome do grupo como remetente. A assinatura de mensagens humanas enviadas pelo painel é resolvida pelo agente autenticado e seu departamento; nenhum `agentId` informado pelo navegador pode alterar a autoria.

## 11. Contato compartilhado

O exemplo oficial de `ReceivedCallback` da Z-API pode conter um objeto `contact` com `displayName`, `vCard` e `phones[]`. O webhook aceita também `vcard` como compatibilidade para versões que alterem apenas a capitalização do campo. O parser coleta `FN`, `N`, `TEL`, `EMAIL`, `ORG` e `NOTE`, remove duplicatas e normaliza os telefones para dígitos.

O callback é confirmado rapidamente e a persistência usa `messageId` como `externalMessageId`. O conteúdo textual salvo é um resumo (`Contato compartilhado: <nome>`), enquanto os campos úteis ficam em `ContactShare`. O vCard bruto não é retornado ao frontend nem incluído em eventos Socket.IO. Se não houver nome nem telefone utilizável, o payload segue o comportamento legado sem criar cartão.

No chat, o atendente autorizado vê o cartão e pode adicionar/editar o contato, abrir suas conversas ou criar uma conversa manual. O servidor verifica RBAC e escopo de departamento em todas as operações; a interface nunca escolhe o `agentId` nem usa o JID do grupo como telefone do contato.

## 12. Atendimento no próprio grupo e envio avulso

O plano 028 adiciona `groupsEnabled`, `groupConversationMode=PRIVATE_LEGACY|IN_GROUP` e `groupResponseMode`. No modo `IN_GROUP`, a menção válida à própria instância cria/reutiliza o chamado identificado pelo grupo, registra o participante autor e mantém confirmação, triagem e atendimento no grupo. O modo privado continua disponível para rollout e rollback.

Mensagens de grupo são persistidas em `GroupMessage` antes do filtro de menção; broadcasts, `fromMe` e menções a terceiros não acionam automação. O catálogo, histórico e envio avulso usam `/api/zapi/groups` e `/api/zapi/groups/:groupId/messages`. O envio exige `groups:send_message`, usa `clientMessageId` e audita `GroupOutboundMessage` sem criar chamado.
