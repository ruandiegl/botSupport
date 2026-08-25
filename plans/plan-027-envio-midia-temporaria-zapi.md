# Plano 027 — Envio temporário de imagens, vídeos e arquivos via Z‑API

**Status:** Executado — homologação da Z‑API pendente  
**Versão:** 1.0  
**Data:** 24/08/2026  
**Escopo:** backend, frontend, segurança, observabilidade, QA e rollout  
**Política de retenção:** nenhum binário enviado será persistido pela aplicação

## 1. Objetivo

Permitir que um atendente envie imagem, vídeo, áudio ou documento diretamente pelo compositor da conversa, usando os endpoints oficiais da Z‑API, mantendo apenas metadados mínimos para o histórico operacional. O binário deverá existir somente durante a requisição e o processamento do envio; após a conclusão, a aplicação libera o conteúdo e não grava arquivo em disco, banco, bucket próprio ou cache persistente.

A solução deve preservar o fluxo atual de mensagens de texto, o tratamento de mídias recebidas e o padrão visual existente (tema claro/escuro e componentes shadcn), sem alterar o modelo de retenção das mídias recebidas.

## 2. Premissas e decisão técnica principal

1. A Z‑API documenta envio de mídia por **URL** ou por **Data URL/Base64** nos endpoints de imagem, vídeo, áudio e documento.
2. Não há, na documentação pública consultada, um endpoint de upload temporário da Z‑API que devolva uma URL para uso posterior, nem uma garantia de retenção de 30 dias para arquivos enviados pela aplicação.
3. Portanto, a primeira versão usará **Base64 em memória**, enviando diretamente à Z‑API. O backend não criará URL pública nem fará upload para R2/Cloudflare.
4. A Z‑API pode manter o payload temporariamente em fila durante o processamento, mas isso é responsabilidade do provedor. A aplicação não promete ao usuário retenção ou re-download após o envio.
5. O limite de tamanho será configurável e conservador para a VPS de 1 vCPU/4 GB RAM. Arquivos acima do limite serão rejeitados antes de serem encaminhados.
6. A mídia recebida continua no fluxo existente baseado em `ConversationMedia`, URL protegida, proxy autenticado e expiração; não será misturada ao fluxo de mídia enviada.

## 3. Referências consultadas

### Documentação do projeto

- `docs/README.md` — stack, convenções e comandos do projeto.
- `docs/PRD_ZAPI.md` — integração Z‑API, mensagens, webhook e mídia recebida.
- `docs/ARCHITECTURE.md` — separação frontend/backend, serviços e eventos.
- `docs/API.md` — autenticação, permissões e convenções REST.
- `docs/RUNBOOK_MIDIA_ZAPI.md` — retenção e operação das mídias recebidas.
- `docs/QA_MIDIA_ZAPI.md` — controles de MIME, acesso e testes de mídia.
- `docs/DESIGN_SYSTEM.md`, `docs/GUIDELINES.md` e `docs/paleta.md` — UI, acessibilidade e paleta.

### Documentação Z‑API validada via Context7 e fonte oficial

- [Send image](https://developer.z-api.io/en/message/send-message-image): `/send-image`; campo `image` aceita URL ou `data:image/...;base64,...`, além de `caption`, `messageId`, `delayMessage` e `viewOnce`.
- [Send video](https://developer.z-api.io/en/message/send-message-video): `/send-video`; campo `video` aceita URL/Base64 e suporta legenda.
- [Send audio](https://developer.z-api.io/en/message/send-message-audio): `/send-audio`; campo `audio` aceita URL/Base64 e pode receber `viewOnce`/`waveform`.
- [Send document](https://developer.z-api.io/en/message/send-message-document): `/send-document/{extension}`; campo `document` aceita URL/Base64 e suporta `fileName`/`caption`.
- [File expiration](https://developer.z-api.io/en/tips/file-expiration): documenta expiração de mídias recebidas por webhook em 30 dias; não estabelece a mesma política para mídias enviadas.

As respostas de sucesso retornam identificadores do provedor (`messageId`, `zaapId` e/ou `id`), que serão usados para correlação e idempotência.

## 4. Estado atual e impacto

### Backend atual

- `backend/src/modules/conversations/conversations.schemas.ts` aceita somente `{ content }` no envio.
- `backend/src/modules/conversations/conversations.routes.ts` expõe o POST de texto da conversa.
- `backend/src/modules/conversations/conversations.controller.ts` valida e encaminha o envio.
- `backend/src/modules/conversations/conversations.service.ts` assina mensagens do agente, chama `zApiService.sendText` e persiste `Message`.
- `backend/src/modules/zapi/zApi.service.ts` já centraliza autenticação e chamadas Z‑API, mas ainda não possui métodos de mídia enviada.
- `backend/src/modules/media/*` é orientado a mídia recebida e não deve receber binários de saída.
- O modelo `ConversationMedia` pressupõe URL/ciphertext e expiração de mídia recebida; reutilizá-lo diretamente para saída criaria campos obrigatórios e semântica incorreta.

### Frontend atual

- `frontend/src/pages/conversation/index.tsx` e `hooks/use-conversation.ts` enviam apenas texto.
- `MessageMedia.tsx` renderiza mídia recebida via ticket de acesso; não deve buscar mídia de saída no backend.
- O novo controle deve conviver com atalhos, menções, envio por socket/invalidação de query e o tema claro/escuro atual.

## 5. Histórias de usuário

- Como atendente autorizado, quero selecionar uma imagem, vídeo, áudio ou documento no compositor para enviá-lo ao cliente.
- Como atendente, quero ver uma prévia local, nome, tipo e tamanho antes de confirmar o envio.
- Como atendente, quero cancelar a seleção sem que o arquivo saia do meu dispositivo.
- Como operador, quero acompanhar estados de envio (preparando, enviando, enviado, falhou) sem que o conteúdo fique exposto em logs.
- Como administrador, quero limitar tamanho, tipos, concorrência e habilitar/desabilitar a função por ambiente.
- Como responsável por privacidade, quero que a aplicação não mantenha cópia do arquivo após a tentativa de envio.

## 6. Requisitos funcionais

### 6.1 Composer

- Adicionar botão de anexo ao compositor da conversa usando shadcn `Button`, `Input`/file input estilizado, `Popover`/`Tooltip` e feedback acessível.
- Aceitar inicialmente um arquivo por envio para manter o fluxo previsível e controlar memória.
- Categorias aceitas:
  - imagens: `image/jpeg`, `image/png`, `image/webp`, opcionalmente `image/gif` conforme suporte homologado;
  - vídeos: `video/mp4`, com outros codecs somente após teste com a instância;
  - áudio: `audio/ogg`, `audio/mpeg`, `audio/mp4`, `audio/wav` conforme compatibilidade Z‑API;
  - documentos: PDF e extensões permitidas pelo contrato da Z‑API (`application/pdf`, DOC/DOCX, XLS/XLSX e PPT/PPTX somente se homologados).
- Exibir nome, tamanho, tipo e prévia local quando suportado pelo navegador. A prévia deve usar `URL.createObjectURL`, ser revogada em troca/cancelamento/desmontagem e nunca ser enviada à API de histórico.
- Permitir legenda opcional para imagem, vídeo e documento. Para áudio, manter apenas envio sem legenda na primeira versão, salvo confirmação do endpoint.
- Desabilitar o botão durante o envio, com possibilidade de cancelar antes da transmissão. Evitar duplo clique e reenvio involuntário.
- Após sucesso, mostrar mensagem de mídia enviada e limpar a seleção. Após recarregar a conversa, mostrar apenas o registro de metadados, sem tentar baixar o arquivo que não foi retido.

### 6.2 Regras de validação

- Validar extensão, MIME declarado e assinatura/magic bytes no backend; nunca confiar somente no `accept` do navegador.
- Normalizar o nome do arquivo, remover path traversal, caracteres de controle e tamanho excessivo.
- Rejeitar arquivo vazio, MIME não permitido, extensão incompatível ou tamanho acima do limite.
- O limite efetivo deve ser o menor entre o limite da aplicação e o limite homologado da Z‑API/WhatsApp.
- Não converter imagens/vídeos automaticamente na primeira versão; se a Z‑API rejeitar codec/formato, mostrar erro acionável.

### 6.3 Histórico

- Persistir somente metadados e o estado do envio; nunca Base64, buffer, URL temporária, caminho local ou conteúdo criptografado do arquivo enviado.
- Manter o texto exibido como `[Imagem enviada]`, `[Vídeo enviado]`, `[Áudio enviado]` ou `[Documento enviado]`, com nome/caption quando aplicável.
- Indicar quando a mídia não está disponível para reabertura: `Arquivo enviado e não retido por política de privacidade.`
- Não criar ticket de acesso de mídia enviada e não expor endpoint de download.

## 7. Contrato de API proposto

### 7.1 Endpoint

`POST /api/conversations/:conversationId/media`

`Content-Type: multipart/form-data`

Campos:

- `file` — obrigatório, um arquivo.
- `caption` — opcional, limitado por configuração.
- `clientMessageId` — obrigatório, UUID gerado no cliente para idempotência.
- `replyToMessageId` — opcional, se o compositor suportar resposta contextual.

Headers:

- autenticação atual da aplicação;
- `Idempotency-Key: clientMessageId`.

Resposta `201`:

```json
{
  "message": {
    "id": "uuid-local",
    "conversationId": "uuid",
    "messageType": "IMAGE",
    "content": "[Imagem enviada]",
    "fileName": "captura.png",
    "mimeType": "image/png",
    "sizeBytes": 184320,
    "status": "SENT",
    "providerMessageId": "zapi-message-id",
    "createdAt": "2026-08-24T12:00:00.000Z"
  }
}
```

Erros padronizados:

- `400` — arquivo ausente, MIME/extensão inválidos, legenda inválida ou payload inconsistente;
- `401/403` — sessão ou permissão insuficiente;
- `404` — conversa inexistente/inacessível;
- `409` — `clientMessageId` já processado;
- `413` — arquivo excede o limite;
- `422` — formato não homologado pelo provedor;
- `502` — falha/recusa da Z‑API;
- `503` — função desabilitada ou credenciais não configuradas;
- `504` — timeout do provedor.

O endpoint de texto existente permanece inalterado para evitar regressão.

### 7.2 Adapter Z‑API

Adicionar métodos no serviço/adapter, sem espalhar chamadas HTTP pela controller:

- `sendImage({ phone, dataUrl, caption, clientMessageId })` → `/send-image`;
- `sendVideo({ phone, dataUrl, caption, clientMessageId })` → `/send-video`;
- `sendAudio({ phone, dataUrl, clientMessageId })` → `/send-audio`;
- `sendDocument({ phone, extension, dataUrl, fileName, caption, clientMessageId })` → `/send-document/{extension}`.

O adapter deve:

- reutilizar timeout, autenticação e tratamento de erro existentes;
- enviar `data:<mime>;base64,<base64>` exatamente no campo esperado pelo endpoint;
- limitar payload e não registrar o corpo da requisição;
- extrair `messageId`/`zaapId`/`id` e normalizar para `providerMessageId`;
- classificar erros transitórios para retry controlado, sem repetir automaticamente uma mensagem sem idempotência.

## 8. Fluxo de processamento sem retenção

1. Navegador seleciona o arquivo e mantém somente `File`/Object URL local.
2. Backend recebe `multipart/form-data` com limite de corpo e streaming controlado.
3. Backend valida tamanho, MIME, magic bytes, extensão e permissão da conversa.
4. Backend converte o conteúdo para Data URL em memória, sem criar arquivo temporário.
5. Backend chama o endpoint específico da Z‑API.
6. Ao receber sucesso, normaliza os IDs do provedor e persiste apenas o registro textual/metadados.
7. O backend remove referências ao buffer/Data URL antes de retornar; não salva em logs, filas persistentes, banco, R2 ou cache.
8. O frontend atualiza a conversa via resposta e socket/invalidação existente.
9. Em falha, retorna erro sem manter binário; pode persistir somente um evento de falha sem conteúdo para auditoria.

### Observação de memória

Base64 aumenta o payload aproximadamente 33%. Por isso, a implementação deve aplicar limite de corpo, limite por MIME, limite de concorrência por processo e timeout. Não usar `JSON.stringify` de objetos que carreguem o arquivo em logs. O descarte de referências reduz a retenção, embora nenhuma aplicação Node possa prometer sobrescrita imediata de todas as cópias internas do runtime.

## 9. Persistência proposta

### Opção recomendada: metadados separados

Criar modelo aditivo, sem coluna binária:

```prisma
model OutgoingMedia {
  id                 String   @id @default(uuid())
  messageId          String   @unique
  conversationId     String
  type               MediaType
  mimeType           String
  fileName           String?
  caption            String?
  sizeBytes          Int
  status             OutgoingMediaStatus @default(SENT)
  providerMessageId  String?
  clientMessageId    String   @unique
  failureCode        String?
  createdAt          DateTime @default(now())

  message            Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  conversation       Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
}
```

Valores de `OutgoingMediaStatus`: `PENDING`, `SENDING`, `SENT`, `FAILED`.

O `Message` deve receber a relação opcional e `messageType` deve aceitar os tipos já usados pelo frontend/backend. Nenhum campo de URL ou Base64 deve ser adicionado.

### Alternativa não recomendada

Estender `ConversationMedia` com `direction` e campos opcionais. Essa opção deve ser evitada na v1 porque o modelo atual representa mídia recebida com `whatsappMessageId`, `sourceUrlCiphertext` e `expiresAt`, e tornar esses campos opcionais aumenta risco de regressão no worker/proxy de mídia recebida.

Migration deve ser somente aditiva, compatível com o banco existente e sem apagar dados.

## 10. Frontend e experiência

- Criar `MediaAttachmentPicker` e `OutgoingMediaComposer` em `frontend/src/pages/conversation/components/`.
- Criar hook `useSendMedia` em `frontend/src/pages/conversation/hooks/` usando React Query e `FormData`.
- Usar componentes shadcn como base: `Button`, `Input`, `Textarea`, `Popover`, `Tooltip`, `Progress`, `Alert`, `Badge` e `Dialog` apenas quando necessário.
- Usar a paleta pastel atual para estados: neutro no preparo, azul suave no envio, verde suave no sucesso e vermelho suave no erro; evitar cores saturadas do tema antigo.
- Suportar tema claro e escuro sem duplicar lógica.
- Acessibilidade: `aria-label`, foco visível, navegação por teclado, mensagem de erro associada ao input e status anunciado por `aria-live`.
- Não mostrar Data URL, token, URL Z‑API ou conteúdo de payload em qualquer tela.
- Para arquivos enviados, o card histórico deve ser não interativo após recarregar, pois não existe endpoint de re-download. Durante a sessão, a prévia local pode ser aberta enquanto o Object URL existir.

## 11. Segurança, privacidade e limites

- Criar permissão `conversations.send_media` ou, se a matriz RBAC precisar ser mínima, reutilizar `conversations.send_message` com auditoria específica; recomendação: permissão separada para permitir bloqueio granular.
- Verificar acesso do agente à conversa no backend; nunca aceitar telefone/conversa arbitrários vindos do cliente.
- Validar magic bytes com biblioteca segura e manter allowlist explícita.
- Limitar tamanho do nome, legenda, número de arquivos e concorrência por agente/IP.
- Aplicar rate limit específico para mídia e circuito de proteção para indisponibilidade da Z‑API.
- Sanitizar nome do arquivo e nunca usar o nome como caminho de escrita.
- Não fazer SSRF na v1, pois não aceitar URL fornecida pelo usuário; o único destino externo é a URL oficial da Z‑API configurada no servidor.
- Não logar Base64, conteúdo, caption completo, telefone em excesso ou dados sensíveis; registrar apenas IDs internos, tipo, tamanho, duração e status.
- Configurar `Cache-Control: no-store` para respostas intermediárias e evitar persistência acidental em proxy.

## 12. Socket e consistência

- Emitir evento de nova mensagem somente após confirmação da Z‑API e persistência dos metadados.
- Reutilizar o formato atual de eventos de conversa, adicionando `messageType`, `outgoingMedia` e `status` sem incluir bytes.
- Deduplicar pela combinação `conversationId + clientMessageId` e, quando disponível, `providerMessageId`.
- Evitar que a resposta HTTP e o evento socket criem dois cards: atualizar pela chave da mensagem e invalidar apenas a query necessária.

## 13. Configuração e operação

Adicionar ao `.env.example` e ao runbook:

```env
OUTBOUND_MEDIA_ENABLED=false
OUTBOUND_MEDIA_BODY_LIMIT_BYTES=26214400
OUTBOUND_MEDIA_MAX_IMAGE_BYTES=8388608
OUTBOUND_MEDIA_MAX_VIDEO_BYTES=16777216
OUTBOUND_MEDIA_MAX_AUDIO_BYTES=8388608
OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES=16777216
OUTBOUND_MEDIA_MAX_CONCURRENT_PER_AGENT=1
OUTBOUND_MEDIA_REQUEST_TIMEOUT_MS=30000
OUTBOUND_MEDIA_RATE_LIMIT_PER_AGENT=20
```

Os valores acima são ponto de partida e devem ser ajustados após homologação. A flag deve permanecer `false` até a migration, testes e observabilidade estarem disponíveis.

Monitorar:

- contagem de tentativas, sucesso, rejeição local, erro Z‑API e timeout;
- tamanho total por tipo, duração do envio e concorrência;
- memória heap, RSS, event loop lag e reinícios do processo;
- taxa de duplicidade/idempotência;
- nenhuma métrica deve conter Base64 ou conteúdo da mensagem.

## 14. Plano de implementação por etapas

### Fase 1 — Contrato e segurança ✅

1. Product manager documenta tipos, limites e política de histórico.
2. Tech lead fecha o modelo `OutgoingMedia`, estados e idempotência.
3. Security define allowlist MIME/magic bytes, limites e permissão RBAC.
4. Atualizar `.env.example` e documentação sem ativar a feature.

### Fase 2 — Backend ✅

1. Adicionar schema multipart e validação de arquivo.
2. Implementar métodos de mídia no adapter Z‑API.
3. Criar service transacional de envio e persistência de metadados.
4. Criar rota/controller com auth, RBAC, acesso à conversa, limite e timeout.
5. Criar migration aditiva e testes de idempotência.
6. Integrar emissão de evento socket sem conteúdo binário.

### Fase 3 — Frontend ✅

1. Implementar picker e prévia local.
2. Integrar mutation multipart com estados de progresso/erro.
3. Renderizar cards de saída sem re-download após reload.
4. Ajustar tema claro/escuro, shadcn, responsividade e acessibilidade.

### Fase 4 — QA e homologação — execução automatizada concluída; homologação Z‑API pendente

1. Testar cada tipo com arquivos pequenos, no limite e acima do limite.
2. Testar extensões falsas, magic bytes inválidos, arquivo vazio e nome malicioso.
3. Simular 4xx/5xx/timeout da Z‑API e validar que não há duplicidade.
4. Verificar banco, diretório temporário, logs e métricas para garantir ausência de binário.
5. Homologar em conversa de teste com flag habilitada apenas para administradores.

### Fase 5 — Rollout — pronto para homologação controlada

1. Deploy com migration compatível e `OUTBOUND_MEDIA_ENABLED=false`.
2. Ativar para uma conta/departamento de teste.
3. Observar memória, latência, falhas e duplicidade por pelo menos um ciclo operacional.
4. Expandir gradualmente.
5. Rollback: desligar a flag e manter texto funcionando; não remover a migration durante o incidente.

## 15. Testes de aceitação

- [x] Usuário sem `conversations.send_media` não consegue usar o envio (RBAC server-side).
- [ ] Imagem, vídeo, áudio e documento homologados chegam ao WhatsApp correto.
- [ ] Legenda é enviada apenas quando preenchida e permitida pelo tipo.
- [ ] O mesmo `clientMessageId` não gera duas mensagens na Z‑API (confirmar com a instância de homologação).
- [x] Arquivos acima do limite são rejeitados sem chamada ao provedor.
- [x] MIME/extensão falsos são rejeitados pelo backend.
- [x] Falha da Z‑API não grava Base64, URL, caminho ou arquivo no banco.
- [x] Após sucesso, somente metadados são persistidos.
- [x] Após recarregar a conversa, o sistema não tenta baixar mídia de saída.
- [x] Nenhum Base64 aparece em logs, socket ou resposta de histórico.
- [x] A mensagem de texto existente continua funcionando exatamente como antes.
- [x] Mídia recebida continua usando o fluxo de `ConversationMedia`.
- [x] Tema claro/escuro, teclado e leitores de tela foram mantidos nos componentes shadcn.

## 16. Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Base64 aumenta uso de memória | Alto | Limites por tipo, concorrência 1, timeout, métricas de heap e 413 antecipado |
| Z‑API rejeita codec/formato | Médio | Allowlist homologada, testes por instância e erro claro |
| Retry cria duplicata | Alto | `Idempotency-Key`, `clientMessageId`, persistência de resultado e retry somente seguro |
| Usuário espera reabrir o arquivo | Médio | Mensagem explícita de não retenção e card sem download após reload |
| Vazamento em logs/proxy | Alto | redaction, `no-store`, revisão de middleware e testes automatizados |
| Mudança no schema quebra mídia recebida | Alto | modelo separado e migration aditiva |
| Recurso sobrecarrega VPS | Alto | feature flag, rate limit, limite de concorrência e rollout gradual |

## 17. Perguntas para fechar antes da codificação

1. Quais limites máximos de imagem, vídeo, áudio e documento serão aceitos no ambiente de produção?
2. A primeira versão deve permitir apenas um arquivo por mensagem? Recomendação: sim.
3. O histórico deve manter metadados de falhas ou somente de sucessos? Recomendação: manter metadados mínimos de falhas para diagnóstico.
4. Áudio deve aceitar PTT/waveform? Recomendação: não na primeira entrega, a menos que a instância esteja homologada.
5. Existe requisito regulatório para apagar também metadados após um prazo? Se sim, adicionar job de limpeza somente dos metadados, sem tocar no fluxo de mídia recebida.
6. Se a exigência for obrigatoriamente “armazenar na infraestrutura da Z‑API por 30 dias”, solicitar confirmação formal à Z‑API; a documentação pública consultada só garante a expiração de mídias recebidas.

## 18. Agentes recomendados e sequência de trabalho

Os papéis abaixo são os melhores encaixes descritos em `agents/README.md` e devem ser usados como checklist de revisão. A execução será coordenada pelo agente principal, sem delegação paralela, conforme a política ativa desta tarefa.

1. **product-manager.agent.md** — validar histórias, limites, política de retenção e critérios de aceite.
2. **tech-lead-architect.agent.md** — fechar contrato, modelo aditivo, idempotência e impacto no fluxo existente.
3. **backend-developer.agent.md** — implementar multipart, adapter Z‑API, validação, service, migration e socket.
4. **frontend-developer.agent.md** — implementar picker, prévia, mutation, estados, cards e integração shadcn.
5. **security-engineer.agent.md** — revisar MIME/magic bytes, RBAC, rate limit, logs e ausência de persistência.
6. **qa-testing-engineer.agent.md** — executar testes unitários, integração, E2E, regressão e inspeção de artefatos.
7. **devops-infra-engineer.agent.md** — revisar limites de memória, variáveis, Railway/Docker, métricas e rollout.

## 19. Definition of Done

### Execução registrada em 24/08/2026

- Migration `20260824150000_add_outgoing_media_metadata` aplicada localmente com `prisma migrate deploy`.
- Backend build concluído e suíte completa executada com `DATABASE_URL` explícita: **92 testes passando**.
- Teste específico de mídia de saída: **3 testes passando**.
- Frontend TypeScript e bundle Vite validados com sucesso.
- A flag permanece desativada por padrão (`OUTBOUND_MEDIA_ENABLED=false`); habilitar no ambiente de homologação após configurar as credenciais Z‑API.
- A validação final de entrega dos quatro formatos e da idempotência contra a instância real permanece como etapa operacional, não como alteração de código.

- Contrato e migration revisados e aplicados sem alteração destrutiva no banco.
- Envio dos quatro tipos homologados funcionando pela Z‑API.
- Nenhum binário escrito em disco, banco, R2 ou cache persistente.
- RBAC, limites, idempotência, timeout, rate limit e redaction ativos.
- Histórico e socket exibem somente metadados, sem URL/Base64.
- UI clara/escura acessível e consistente com shadcn/paleta do projeto.
- Testes automatizados e homologação manual aprovados.
- Runbook, `.env.example`, métricas e rollback documentados.
- Feature flag permanece controlável e o envio de texto não sofre regressão.
