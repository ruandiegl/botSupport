# PRD — Product Requirements Document (GTF-Bot)

## 1. Visão Geral do Produto
O **GTF-Bot** é uma plataforma centralizada de atendimento ao vivo e triagem automatizada via WhatsApp. Ele conecta contatos/solicitantes a atendentes de T.I. com suporte a roteamento por departamentos, procedimentos pré-definidos e automação de menus de opção.

---

## 2. Objetivos Principais
1. **Redução do Tempo de Espera**: Triagem instantânea pelo bot com encaminhamento para filas de departamento.
2. **Organização Operacional**: Visualização em tempo real das conversas ("Na Fila", "Em Atendimento", "No Bot", "Encerradas").
3. **Procedimentos Integrados**: Acesso rápido a rotinas técnicas por departamento para padronizar o suporte.
4. **Arquitetura Descentralizada e Escalonável**: Código limpo, modularizado e independente.

---

## 3. Requisitos Funcionais

### Fila de Atendimento e Conversas
- **Listagem ao vivo**: Exibição da lista de conversas com contadores e busca por texto/telefone/mensagem.
- **Filtros avançados**: Filtro por status (`QUEUED`, `IN_PROGRESS`, `BOT`, `CLOSED`) e por departamento.
- **Assumir Conversa**: Atendente altera o status de `QUEUED` para `IN_PROGRESS` e assume a responsabilidade.
- **Encerrar Conversa**: Finalização da conversa com carimbo de data/hora (`closedAt`).
- **Composer com Assinatura**: Respostas de atendentes são formatadas com a assinatura do perfil logado.

### Administração de Departamentos
- **CRUD de Departamentos**: Criar, visualizar, atualizar e excluir departamentos.
- **Procedimentos Associados**: Cada departamento possui uma lista ordenada de rotinas operacionais (ex: Reset de Senha, Diagnóstico VPN).

### Gestão de Atendentes
- **Monitoramento de Presença**: Visualização da equipe com indicador de status Online/Offline.
- **Vínculo com Departamento**: Atribuição de atendentes a departamentos específicos.

### Fluxo do Bot (WhatsApp Menu)
- **Editor completo e versionado**: Configuração de entrada, mensagens, decisão, rotas, triagens, encaminhamentos e encerramentos sem necessidade de redeploy.
- **Sequência por rota**: Cada rota possui uma sequência independente, editável e ordenável de etapas pós-seleção.
- **Triagem editável**: A rota Suporte nasce com a solicitação de nome, emissora, cidade/UF e necessidade, mas o texto, a chave de resposta e a posição podem ser alterados.
- **Rascunho e publicação**: Edições permanecem em rascunho até publicação explícita. Uma publicação cria uma revisão imutável e não altera conversas em andamento.
- **Continuidade operacional**: A conversa permanece em `BOT` durante decisões e triagens, e muda para `QUEUED` somente ao executar um nó `HANDOFF` válido.
- **Reordenação estável**: Rotas e etapas podem ser reordenadas por arraste ou teclado sem alterar os identificadores estáveis utilizados por botões já enviados.

### Tipos de etapa do fluxo

- `ENTRY`: entrada única e obrigatória;
- `MESSAGE`: envia texto e avança automaticamente;
- `DECISION`: apresenta opções e aguarda uma escolha;
- `ROUTE`: associa um ramo a um departamento;
- `TRIAGE`: envia um prompt, aguarda resposta e persiste o valor no contexto;
- `HANDOFF`: encaminha ao departamento e realiza `BOT -> QUEUED`;
- `END`: encerra a automação sem encaminhamento.

### Histórias e critérios de aceite do fluxo

1. Como administrador com `flow:edit`, eu quero criar, editar, duplicar, excluir e reordenar etapas em um rascunho, para que a jornada seja adaptada sem afetar o atendimento ativo.
2. Como publicador com `flow:publish`, eu quero validar e publicar uma revisão sem modificar o histórico anterior, para que a mudança seja auditável e reversível.
3. Como solicitante, eu quero responder à triagem da rota escolhida antes de entrar na fila, para que o atendente receba o contexto necessário.
4. Como atendente, eu quero receber a conversa com departamento e respostas de triagem preservados, para que o atendimento comece com menos perguntas repetidas.
5. Um fluxo inválido, desconectado, cíclico ou sem terminal não pode ser publicado.
6. Uma conversa iniciada em uma revisão termina nela, mesmo que outra revisão seja publicada.
7. Um callback repetido não pode duplicar mensagens, respostas ou transições.
8. Falha no envio externo mantém estado recuperável para retentativa e não avança silenciosamente.

---

## 4. Requisitos Não-Funcionais
- **Banco de Dados**: PostgreSQL 16 com ORM Prisma.
- **API Backend**: RESTful com suporte a JSON e validação com Zod.
- **Interface**: React 18, Vite 5, Tailwind CSS v4 com design system responsivo e moderno.

### Colaboração, identidade e delegação

- Cada mensagem preserva o remetente real no momento do envio/recebimento; o responsável atual nunca substitui a autoria histórica.
- Respostas do painel usam exclusivamente o agente autenticado no JWT e o departamento do seu perfil.
- Atendentes autorizados do departamento podem colaborar no mesmo chamado sem alterar a atribuição.
- Administradores e supervisores com `conversations:delegate` podem delegar chamados para atendentes ativos elegíveis.
- A delegação registra ator, origem, destino, motivo e horário, atualiza a fila e notifica o destinatário por REST e Socket.IO.
- O destinatário recebe um modal imediato via Socket.IO para aceitar ou recusar. Ao aceitar, a conversa é aberta automaticamente, a aceitação é registrada no histórico interno e o delegador recebe uma notificação de retorno; ao recusar, o chamado volta ao responsável anterior ou à fila.
- Mensagens de participantes de grupos exibem o participante individual por mensagem, mantendo a vinculação do Plano 015.
## Mídia recebida em chamados

- Imagens, áudios, vídeos e documentos recebidos pelo webhook Z-API aparecem dentro da conversa para atendentes autorizados.
- O produto usa a retenção temporária de até 30 dias da própria Z-API e não mantém cópia do binário em banco, disco, R2 ou S3.
- A plataforma guarda somente metadados e URLs cifradas; o navegador acessa uma rota interna com ticket curto e nunca recebe a URL original.
- `messageId` é a chave de idempotência. Retransmissões do webhook não criam outra mensagem, mídia, unread ou notificação.
- Mídias `viewOnce`, com `downloadError`, expiradas ou removidas antecipadamente recebem estados claros e não interrompem o restante do chamado.
- Acesso segue o mesmo escopo da conversa: administrador/supervisor, atendente atribuído ou atendente do departamento enquanto o chamado estiver na fila.
- Ao completar `expiresAt`, o acesso retorna `410`, as URLs cifradas são eliminadas e somente metadados mínimos permanecem no histórico.
## Contatos excluídos das respostas automáticas

Administradores podem cadastrar números que não devem receber respostas do bot, evitando loops com outros bots ou integrações. A regra é uma exclusão lógica e reversível: mensagens recebidas, contatos e chamados continuam no histórico para acompanhamento humano.

- O número é normalizado para dígitos e identificado pelo remetente real; em grupos, usa o participante, nunca o JID do grupo.
- O bloqueio ocorre no servidor antes da saudação, menu, triagem, confirmação de menção, fallback ou lembrete de inatividade.
- O atendente continua podendo assumir o chamado e enviar mensagens manuais.
- A tela `/admin/bot-exclusions` é protegida por RBAC (`bot_exclusions:view/create/update/delete`) e usa componentes shadcn.
- Desativar uma regra não dispara mensagem retroativa; a próxima mensagem volta a seguir o fluxo normal.
