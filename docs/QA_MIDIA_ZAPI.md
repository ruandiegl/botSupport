# QA — mídia recebida via Z-API

## Gates automatizados

- Schema aceita image/audio/video/document, `downloadError` sem URL e rejeita HTTP ou múltiplas mídias.
- Parser preserva caption/metadados e usa `messageId` como identidade externa.
- AES-GCM não revela URL; ciphertext/ticket adulterado falha fechado.
- Migration é aditiva e cria unicidade para `externalMessageId` e `whatsappMessageId`.
- DTO público não contém URL/ciphertext; headers bloqueiam cache/sniffing.
- Backend tests, frontend build e `prisma migrate status` devem passar sem TODO.

## Homologação manual obrigatória

- Receber e abrir os quatro formatos com dois usuários autorizados.
- Confirmar que outro departamento recebe `403` e que nenhum request do navegador usa domínio Z-API.
- Validar áudio/vídeo com play, pause, seek e Range; imagem lazy/zoom; documento com download explícito.
- Testar `downloadError`, `viewOnce`, origem `404/410`, timeout, MIME falso, arquivo excedente e ticket adulterado/expirado.
- Alterar retenção em homologação, executar worker e confirmar `410`, status `EXPIRED` e ciphertext nulo.
- Reenviar o mesmo callback, inclusive simultaneamente, e confirmar um único registro/unread/notificação.
- Verificar fila, marcação de leitura, notificações, assumir, transferir, encerrar, atalhos e fluxo do bot.
- Colar uma captura de tela com `Ctrl/Cmd+V` em uma conversa privada e em um grupo: o editor deve abrir antes do envio, sem inserir texto no campo e sem requisição automática.
- Arrastar uma imagem para o compositor nos dois chats: validar destaque visual, drop único, prévia/edição, legenda, progresso, cancelamento e sucesso pelo endpoint existente.
- Arrastar PDF, vídeo, áudio, arquivo vazio ou múltiplos arquivos: confirmar erro orientativo, ausência de navegação da página e nenhuma requisição iniciada; colar texto sem imagem deve continuar nativo.
- Confirmar revogação dos `ObjectURL`s ao cancelar, substituir, enviar ou desmontar o compositor, sem persistência do Blob em localStorage, IndexedDB, cache ou logs.

O rollout não deve avançar sem fixtures reais da instância, allowlist confirmada e evidência de que nenhum URL original aparece no frontend, banco em texto claro ou logs.
