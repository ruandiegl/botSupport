# Runbook — grupos, menções e etiquetas

## Pré-requisitos

1. Fazer backup do PostgreSQL.
2. Confirmar `prisma migrate status` sem migrations falhas.
3. Manter `groupsEnabled=false` no primeiro deploy.
4. Confirmar que o webhook Z-API aponta para `/api/webhooks/z-api` em HTTPS.
5. Atualizar o status da instância no painel para o backend detectar o telefone; a UI deve mostrar apenas os quatro últimos dígitos.

## Homologação

1. Usar um grupo exclusivo de teste e dois participantes.
2. Enviar mensagem sem menção: deve retornar `ignored_no_mention` e não criar conversa.
3. Mencionar outro contato: deve retornar `ignored_not_mentioned`.
4. Ativar grupos, mencionar a instância e confirmar:
   - contato criado pelo participante, nunca pelo JID do grupo;
   - conversa `OPEN` criada ou reutilizada;
   - etiqueta `GROUP` presente;
   - confirmação recebida por DM;
   - nenhuma confirmação pública enquanto `groupConfirmInGroup=false`.
5. Repetir dentro do cooldown: deve retornar `cooldown`.
6. Reenviar o mesmo `messageId`: deve retornar `duplicate_event`.
7. Só depois da validação do destino da Z-API, testar a confirmação pública opt-in.

## Monitoramento

- acompanhar taxas de `ignored_*`, `cooldown`, `duplicate_event` e falhas de envio;
- não registrar `participant`, `mentionedJids`, tokens nem JID do grupo;
- acompanhar latência do webhook e conflitos de unicidade;
- verificar se mensagens privadas, mídia, notificações e fluxo continuam operacionais.

## Rollback

1. Definir `groupsEnabled=false` no painel Z-API.
2. Se necessário, remover temporariamente a permissão da tela `/admin/labels`.
3. Reverter apenas o deploy da aplicação; manter tabelas e relações para auditoria.
4. Não executar `prisma migrate reset`, seed ou exclusão manual de etiquetas/conversas.
5. Reprocessar callbacks somente por `messageId`, respeitando a idempotência.
