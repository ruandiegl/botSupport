# Runbook — mídia temporária da Z-API

## Pré-implantação

1. Confirme no painel/API Z-API o webhook público HTTPS `/api/webhooks/z-api`.
2. Em homologação, envie uma imagem, um áudio PTT, um vídeo e um PDF. Registre apenas os hostnames observados, nunca as URLs completas.
3. Valide GET, redirects, MIME, `Content-Length`, thumbnail e requisições `Range` pelo backend.
4. Configure a allowlist e secrets no ambiente. Faça backup do banco e execute `npx prisma migrate deploy`.
5. Inicie com `MEDIA_ZAPI_INGESTION_ENABLED=true` e `MEDIA_ZAPI_DISPLAY_ENABLED=false`; confirme que o PostgreSQL contém ciphertext e nenhum URL em texto claro.
6. Ative display para um departamento e acompanhe latência, bytes, `403`, `410`, `422`, `429` e erros upstream.

### Envio de mídia (saída)

1. Mantenha `OUTBOUND_MEDIA_ENABLED=false` durante migration e smoke tests.
2. Defina limites por tipo, timeout e concorrência (`OUTBOUND_MEDIA_MAX_*`, `OUTBOUND_MEDIA_REQUEST_TIMEOUT_MS` e `OUTBOUND_MEDIA_MAX_CONCURRENT_PER_AGENT`). Documentos e ZIPs usam 16 MiB por padrão (`OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES`); aumentar esse valor exige confirmação do limite de documentos da Z‑API e revisão do pico de memória da conversão Base64. O vídeo usa 64 MiB por padrão; pode ser elevado até 100 MB, limite indicado pela Z‑API, se a infraestrutura comportar o pico de memória.
3. Ative a flag apenas para homologação. O backend envia Data URL/Base64 diretamente à Z‑API e não cria arquivo temporário, URL pública ou objeto R2.
4. Confirme que os logs exibem somente tipo, tamanho, duração e status; nunca Base64, legenda completa ou payload.
5. Após o envio, somente metadados ficam em `gtf_outgoing_media`. Não há rota de download para mídia enviada após recarregar a conversa.

## Operação

- Para mídias recebidas por webhook, a Z-API documenta expiração em até 30 dias. Para mídias enviadas, a documentação pública não garante um prazo de retenção; a aplicação não promete re-download.
- O worker local apenas marca `EXPIRED` e apaga URLs cifradas. O endpoint também bloqueia por `expiresAt`.
- `404/410` antecipado da origem muda a mídia para `UNAVAILABLE` sem afetar o chamado.
- Ticket e URL upstream são credenciais: não devem aparecer em logs, rastreamentos ou tickets de suporte.
- Para rotação de chave, mantenha a chave anterior disponível enquanto existirem registros com a versão antiga; recriptografe em lote e só então remova a anterior. A implementação atual fecha o acesso quando a versão configurada diverge, portanto a rotação deve ocorrer em janela controlada.
- A documentação pública da Z-API garante expiração de 30 dias para mídias recebidas por webhook, mas não garante a mesma retenção para arquivos enviados. Não trate o envio como armazenamento de 30 dias; se essa garantia for obrigatória, confirme-a formalmente com o provedor.

## Rollback

1. Defina `MEDIA_ZAPI_DISPLAY_ENABLED=false` para interromper novos acessos.
2. Se necessário, defina `MEDIA_ZAPI_INGESTION_ENABLED=false`; o atendimento textual permanece funcional.
3. Mantenha `MEDIA_EXPIRATION_JOB_ENABLED=true` por privacidade.
4. Não reverta destrutivamente a migration; ela é aditiva e campos de mídia são opcionais.
5. Restaure display somente após corrigir o problema e repetir a homologação.

### Rollback do envio

1. Defina `OUTBOUND_MEDIA_ENABLED=false`; o envio de texto continua disponível.
2. Não remova `gtf_outgoing_media` durante incidente: ela contém somente metadados e mantém o histórico consistente.
3. Investigue memória, timeout, rate limit e respostas da Z‑API antes de reativar a flag.
