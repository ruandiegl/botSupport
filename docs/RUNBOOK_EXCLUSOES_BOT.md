# Runbook — Exclusões de respostas automáticas do bot

## Objetivo

Impedir loops entre o GTF-Bot e outros bots sem apagar contatos, conversas ou mensagens. A regra é aplicada no backend e pode ser revertida pelo administrador.

## Deploy seguro

1. Fazer backup normal do PostgreSQL antes do deploy.
2. Aplicar `20260819120000_add_bot_exclusions`. A migration cria somente `gtf_bot_exclusions`, índice e relações opcionais com agentes.
3. Executar `npm run db:generate`, `npm test` e `npm run build` no backend; no frontend executar `npm run build`.
4. Confirmar `GET /api/healthz` e que `/admin/bot-exclusions` aparece somente para perfis com `screen:/admin/bot-exclusions`.
5. Cadastrar um número de homologação e enviar uma mensagem de teste. O webhook deve retornar `bot_excluded`, registrar a mensagem recebida e não enviar saudação, botão ou confirmação.
6. Remover/desativar a regra e confirmar que uma nova mensagem volta a seguir o fluxo, sem resposta retroativa.

## Observabilidade

Pesquisar logs pelo resultado `bot_excluded` e pelo ID da conversa. O telefone completo não deve ser incluído em logs de produção. Monitorar quantidade de eventos suprimidos, mensagens recebidas preservadas e erros da Z-API.

## Rollback

- Rollback funcional: desativar a regra na tela ou via `PATCH /api/bot-exclusions/:id` com `{ "isActive": false }`.
- Rollback de código: desabilitar a release e manter a tabela; versões anteriores ignoram a tabela, mas não perdem os dados.
- Não executar `DROP TABLE` durante rollback de aplicação. A remoção física só pode ocorrer em janela de manutenção aprovada e após exportação da auditoria.

## Segurança

- Rotas exigem JWT e RBAC; `agentId` não é aceito no corpo para definir o autor.
- Normalizar sempre para dígitos antes de consultar ou gravar.
- Não incluir conteúdo de mensagens, tokens Z-API ou URLs de mídia na resposta da lista.
- O bloqueio não deve ser usado para impedir mensagens manuais de atendentes.
