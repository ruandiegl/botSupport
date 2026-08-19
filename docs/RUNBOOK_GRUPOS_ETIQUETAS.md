# Runbook — grupos, menções e etiquetas

## Pré-requisitos

1. Fazer backup do PostgreSQL.
2. Confirmar `prisma migrate status` sem migrations falhas.
3. Manter `groupsEnabled=false` no primeiro deploy.
4. Confirmar que o webhook Z-API aponta para `/api/webhooks/z-api` em HTTPS. Os aliases `/api/webhooks/zapi/message` e `/api/webhooks/z-api/message` também são aceitos para instalações antigas.
5. Atualizar o status da instância no painel para o backend detectar o telefone; durante o callback, `connectedPhone` também é aceito como fallback. A UI deve mostrar apenas os quatro últimos dígitos.

Em Railway, a ativação controlada pode ser feita com `ZAPI_GROUPS_ENABLED=true`; remover a variável desativa o override sem alterar dados existentes. Para atualizar automaticamente o endereço registrado na Z-API, usar `ZAPI_REGISTER_WEBHOOK_ON_STARTUP=true` junto de `ZAPI_WEBHOOK_URL`.

## Homologação

1. Usar um grupo exclusivo de teste e dois participantes.
2. Enviar mensagem sem menção: deve retornar `ignored_no_mention` e não criar conversa.
3. Mencionar outro contato: deve retornar `ignored_not_mentioned` quando a Z-API enviar a lista explícita de menções.
4. Ativar grupos, mencionar a instância e confirmar:
   - contato criado pelo participante, nunca pelo JID do grupo;
   - conversa `OPEN` criada ou reutilizada;
   - etiqueta `GROUP` presente;
   - confirmação recebida por DM;
   - nenhuma confirmação pública enquanto `groupConfirmInGroup=false`.
5. Repetir dentro do cooldown: deve retornar `cooldown`.
6. Mencionar outro participante sem marcar a instância: deve retornar `ignored_not_mentioned` ou `ignored_no_mention`, sem mensagem do bot e sem novo chamado.

Se o provedor entregar apenas o nome visível da menção, o backend consulta o nome da instância em `GET /me` e mantém cache por 15 minutos. `ZAPI_GROUP_MENTION_ALIASES` declara os nomes aceitos separados por vírgula e vem configurado para `Suporte Técnico,Suporte Técnico GTF`; atualize essa variável após uma troca do nome do perfil. Nenhuma marcação genérica a outro participante é aceita.
6. Reenviar o mesmo `messageId`: deve retornar `duplicate_event`.
7. Só depois da validação do destino da Z-API, testar a confirmação pública opt-in.

## Monitoramento

- acompanhar taxas de `ignored_*`, `cooldown`, `duplicate_event` e falhas de envio;
- não registrar `participantPhone`, `participant`, listas de menções, tokens nem JID do grupo;
- acompanhar latência do webhook e conflitos de unicidade;
- verificar se mensagens privadas, mídia, notificações e fluxo continuam operacionais.

## Rollback

1. Definir `groupsEnabled=false` no painel Z-API.
2. Se necessário, remover temporariamente a permissão da tela `/admin/labels`.
3. Reverter apenas o deploy da aplicação; manter tabelas e relações para auditoria.
4. Não executar `prisma migrate reset`, seed ou exclusão manual de etiquetas/conversas.
5. Reprocessar callbacks somente por `messageId`, respeitando a idempotência.
