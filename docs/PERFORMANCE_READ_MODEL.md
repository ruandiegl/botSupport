# Leituras leves e sincronização incremental

Este adendo documenta a primeira etapa de otimização da fila e do chat. Ele complementa `API.md`, `ARCHITECTURE.md` e `PRD_SOCKETIO.md` sem remover os contratos legados.

## Fila

`GET /api/conversations` com paginação retorna `ConversationSummary`: contato, departamento, responsável, status, prévia da última mensagem, contagem de não lidas e timestamps. O resumo não inclui o histórico integral, URLs de mídia ou binários. O limite padrão da fila continua sendo cinco itens.

Os contadores operacionais representam o escopo do usuário e são independentes da página e dos filtros textuais. O backend aplica filtros e RBAC; o cliente não deve reconstruir a lista completa para paginar.

## Histórico

`GET /api/conversations/:id` carrega os metadados e as mensagens mais recentes, limitadas a 50. Quando há mensagens anteriores, `messagesPagination.previousCursor` permite chamar:

```text
GET /api/conversations/:id/messages?limit=50&before=<cursor>
```

O cursor é opaco e validado no servidor. A resposta mantém as mensagens em ordem cronológica para o componente do chat e nunca contém tokens ou URLs temporárias da Z-API.

## Socket.IO e React Query

- `message:new` é aplicado ao cache por `messageId`, evitando duplicidade.
- `conversation:updated` atualiza fila, status e contadores.
- Um evento de mensagem não deve disparar uma segunda leitura integral do detalhe.
- Refetch completo ocorre apenas após reconexão, payload incompleto ou erro de normalização.
- A API REST continua sendo a fonte de verdade e o fallback quando o socket estiver indisponível.

## Índice aditivo

A migration `20260814170000_add_message_timeline_index` cria somente o índice `(conversation_id, created_at DESC)` para a leitura paginada. Não modifica ou remove linhas, mensagens, mídia ou status.

## Observabilidade e aceite

Medir p50/p95/p99, quantidade de queries, tamanho de resposta e eventos por requisição. O aceite inicial busca p95 de até 250 ms para a fila, até 300 ms para a abertura do detalhe e até 500 ms entre evento recebido e mensagem visível em uma conexão saudável.
