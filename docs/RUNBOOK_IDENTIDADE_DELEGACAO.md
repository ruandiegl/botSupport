# Runbook — Identidade do remetente e delegação de chamados

## Pré-requisitos

- PostgreSQL acessível e backup recente.
- `JWT_SECRET`, CORS e Socket.IO configurados para o domínio do painel.
- Dois agentes ativos de teste, preferencialmente em departamentos distintos.
- Webhook Z-API apontando para HTTPS e grupos habilitados apenas se a homologação exigir.

## Migration segura

1. Parar workers/servidor que possam escrever durante a janela curta de migration.
2. Executar `npm run db:generate` e `npx prisma migrate deploy` na pasta `backend`.
3. Verificar as colunas `sender_contact_id`, `sender_name_snapshot`, `sender_department_snapshot` e a tabela `gtf_conversation_assignments`.
4. Conferir contagens antes/depois em `gtf_messages` e não executar `reset`, `db push` ou remoção manual.
5. Reiniciar backend e validar `GET /api/healthz`.

## Homologação funcional

- Enviar mensagens pelo agente A, delegar para B e responder como B; cada bolha deve conservar o nome correto.
- Delegar por ADMIN entre departamentos e confirmar notificação no sino do destinatário.
- Confirmar que SUPERVISOR respeita o departamento e AGENT recebe `403` sem a permissão.
- Enviar mensagem de participante de grupo e confirmar o nome do participante na mensagem, sem expor JID/telefone completo.
- Repetir a mesma requisição de delegação e verificar `409`/deduplicação sem dupla auditoria ou notificação.

## Observabilidade

Monitorar `conversation_assignment_total`, conflitos `409`, falhas de resolução de remetente, `notification:new`, erros de webhook e reconexões Socket.IO. Não registrar conteúdo, telefone completo, JID, token ou motivo integral.

## Rollback

Desative as flags de colaboração/delegação e remova os controles da UI via configuração. Preserve snapshots e auditoria; não reverta destrutivamente a migration. Mensagens continuam legíveis pelos campos antigos/snapshots. Reative depois de corrigir o problema e repetir a homologação.
