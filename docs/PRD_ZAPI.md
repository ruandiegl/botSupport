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

## 7. Contrato do motor e garantias do webhook

1. O webhook valida token, forma e limites do payload antes de persistir ou executar o fluxo.
2. Eventos de grupo, `fromMe` e eventos sem identidade válida são ignorados segundo a política vigente.
3. O identificador externo do evento/mensagem é usado como chave de idempotência.
4. A integração Z-API normaliza entrada e executa as ações retornadas pelo motor; ela não contém textos de triagem ou decisões de departamento hardcoded.
5. Falhas transitórias usam retentativa limitada com backoff. A conversa não avança sem registro recuperável do envio.
6. Logs incluem IDs técnicos, tipo de evento, revisão, nó e resultado, mas nunca token, telefone completo, texto de triagem ou respostas do cliente.
7. `autoReply=false`, `QUEUED` e `IN_PROGRESS` impedem que mensagens recebidas reiniciem o bot.

## 8. Triagem pós-rota

Ao selecionar Suporte, a revisão inicial deve poder enviar a mensagem configurada e aguardar a resposta antes do handoff. O conteúdo vem exclusivamente do nó `TRIAGE` publicado. Respostas são persistidas sob a chave configurada e ficam vinculadas à revisão da conversa; não devem ser reproduzidas em logs operacionais.

### 8.1 Cooldown anti-spam

Saudação, lista de departamentos e prompts de triagem respeitam `BOT_REPLY_COOLDOWN_MINUTES` (padrão: 15). O backend consulta a última mensagem `BOT` persistida antes de executar novamente o fluxo. Mensagens recebidas durante a janela continuam no histórico, mas não disparam nova resposta automática; uma seleção explícita de botão/lista pode avançar uma decisão. Conversas em `QUEUED` ou `AWAITING_DETAILS` não reiniciam a saudação. O cooldown é server-side e não depende de polling ou estado do navegador.

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
