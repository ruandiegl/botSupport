# Runbook — mídia temporária da Z-API

## Pré-implantação

1. Confirme no painel/API Z-API o webhook público HTTPS `/api/webhooks/z-api`.
2. Em homologação, envie uma imagem, um áudio PTT, um vídeo e um PDF. Registre apenas os hostnames observados, nunca as URLs completas.
3. Valide GET, redirects, MIME, `Content-Length`, thumbnail e requisições `Range` pelo backend.
4. Configure a allowlist e secrets no ambiente. Faça backup do banco e execute `npx prisma migrate deploy`.
5. Inicie com `MEDIA_ZAPI_INGESTION_ENABLED=true` e `MEDIA_ZAPI_DISPLAY_ENABLED=false`; confirme que o PostgreSQL contém ciphertext e nenhum URL em texto claro.
6. Ative display para um departamento e acompanhe latência, bytes, `403`, `410`, `422`, `429` e erros upstream.

## Operação

- A Z-API é a responsável pelo binário e o elimina em até 30 dias.
- O worker local apenas marca `EXPIRED` e apaga URLs cifradas. O endpoint também bloqueia por `expiresAt`.
- `404/410` antecipado da origem muda a mídia para `UNAVAILABLE` sem afetar o chamado.
- Ticket e URL upstream são credenciais: não devem aparecer em logs, rastreamentos ou tickets de suporte.
- Para rotação de chave, mantenha a chave anterior disponível enquanto existirem registros com a versão antiga; recriptografe em lote e só então remova a anterior. A implementação atual fecha o acesso quando a versão configurada diverge, portanto a rotação deve ocorrer em janela controlada.

## Rollback

1. Defina `MEDIA_ZAPI_DISPLAY_ENABLED=false` para interromper novos acessos.
2. Se necessário, defina `MEDIA_ZAPI_INGESTION_ENABLED=false`; o atendimento textual permanece funcional.
3. Mantenha `MEDIA_EXPIRATION_JOB_ENABLED=true` por privacidade.
4. Não reverta destrutivamente a migration; ela é aditiva e campos de mídia são opcionais.
5. Restaure display somente após corrigir o problema e repetir a homologação.

