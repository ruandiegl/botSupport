# Runbook — Horários de funcionamento

## Configuração

1. Aplique a migration 20260824100000_add_business_hours com npx prisma migrate deploy no ambiente que possui DATABASE_URL.
2. Confirme que a conexão Z-API está cadastrada.
3. Abra /admin/business-hours, crie a política Global, escolha o timezone IANA e cadastre os intervalos.
4. Use {{nome}}, {{departamento}} e {{proximaAbertura}} somente nas mensagens; as URLs e credenciais não entram nos textos.
5. Crie exceções para feriados e valide com o preview ou um webhook de teste.

## Operação

O guard roda antes da saudação/menu e grava BusinessHoursNotice. Uma mesma conversa recebe no máximo um aviso para cada janela, sem alterar o status nem bloquear respostas manuais. SCHEDULE_ONLY ignora presença, SCHEDULE_AND_ONLINE exige agenda e atendente online, e ONLINE_ONLY exige apenas presença.

## Diagnóstico e rollback

- Se a API responder 409, recarregue a política: outra pessoa salvou uma revisão mais nova.
- Se mensagens não forem enviadas, consulte logs por business_hours_delivery_failed e confira a configuração da Z-API.
- Para rollback funcional, desative a política na tela. Não apague tabelas em produção.
- O banco local deste workspace não está disponível durante o desenvolvimento; a migration foi criada e deve ser aplicada no deploy/ambiente com PostgreSQL.
