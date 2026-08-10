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

## 3. Credenciais Padrão da Instância
- **ID da Instância**: `3F76E8DC789C31AF53FC1677F7E30103`
- **Token da Instância**: `19558090B4D4E3CDBCF6D8A0`
- **Endpoint Base Z-API**: `https://api.z-api.io/instances/3F76E8DC789C31AF53FC1677F7E30103/token/19558090B4D4E3CDBCF6D8A0`

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
    - Processar escolha de departamento (ex: `1`, `2`, `3` ou botão selecionado).
    - Encaminhar conversa para a fila do departamento com status `QUEUED`.
    - Enviar mensagem de confirmação do procedimento via Z-API.
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

---

## 6. Modelo de Dados (`schema.prisma`)

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
