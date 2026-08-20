# Runbook — Contatos recebidos via Z-API

## Publicação

1. Fazer backup do PostgreSQL e confirmar a janela de mudança.
2. Configurar o webhook HTTPS canônico da instância para `/api/webhooks/z-api`.
3. Gerar o Prisma Client e aplicar a migration aditiva `20260820100000_add_contact_messages_and_contact_book`.
4. Publicar backend e frontend; a leitura do histórico antigo continua compatível porque `messageType` tem default `TEXT`.
5. Executar os testes automatizados e o roteiro de homologação de `QA_CONTATOS_RECEBIDOS_ZAPI.md`.

## Observabilidade

Monitorar callbacks com contato, falhas de validação, duplicidade por `messageId`, erros de criação/edição e respostas `403/409`. Não registrar vCard, tokens, URLs da Z-API ou dados completos de contato em logs.

## Rollback

Se a UI falhar, reverta o frontend: as mensagens continuam armazenadas e podem ser lidas como resumo. Se o backend falhar, desative a funcionalidade de cartão no deploy e mantenha o parser legado. A migration é aditiva; não remova tabelas/colunas durante rollback. Só reverta a migration após confirmar que nenhum `ContactShare` foi criado ou depois de exportar os dados necessários.

## Incidentes comuns

- **Cartão genérico:** conferir se o payload contém `contact`, `displayName`/`vCard` e pelo menos um `TEL`.
- **Contato não aparece:** conferir escopo do agente e a relação da conversa; administrador pode validar a existência pelo endpoint.
- **Telefone duplicado:** normalização remove pontuação; editar o contato existente em vez de criar outro.
- **Conversa manual rejeitada:** validar telefone pertencente ao contato, departamento permitido e ausência de conversa não encerrada.
