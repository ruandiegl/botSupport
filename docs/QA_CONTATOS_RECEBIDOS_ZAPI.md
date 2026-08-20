# QA — Contatos recebidos via Z-API

## Objetivo

Garantir que um contato compartilhado no WhatsApp seja exibido como cartão útil no chamado, sem expor o vCard bruto e sem alterar o comportamento de texto, mídia ou callbacks duplicados.

## Matriz de aceite

- `ReceivedCallback` com `contact.displayName`, `contact.vCard` e `contact.phones` passa no schema.
- `TEL` do vCard e telefones estruturados são combinados, normalizados para dígitos e deduplicados.
- `messageId` continua sendo a chave idempotente; uma retransmissão não cria segunda mensagem/cartão.
- Nome, telefones, e-mail, organização e nota aparecem no cartão; vCard bruto, tokens e URLs internas não aparecem em DTO, socket ou logs.
- Callback sem contato continua usando o parser legado; callbacks com texto, botão, lista ou mídia não sofrem regressão.
- `downloadError`, mídia e contato no mesmo callback respeitam o limite de um objeto de mídia e seguem o ramo correspondente.
- Agente só consulta cartões e conversas do próprio departamento ou atribuídos a ele; administrador e supervisor mantêm o escopo atual.
- Adicionar contato rejeita telefones duplicados, permite telefone principal e vincula `ContactShare` uma única vez.
- Editar contato atualiza telefones em transação e não altera o histórico da mensagem.
- “Ver conversas” lista status, departamento, responsável e não lidas; “Nova conversa” valida telefone e departamento e evita duplicidade aberta.
- Campos têm limites de tamanho, são renderizados como texto e permanecem acessíveis por teclado.

## Comandos

No backend:

```text
npm run build
npm test
```

Antes de testar contra banco, executar `npm run db:generate` e `npx prisma migrate deploy` com `DATABASE_URL` de homologação. Nesta execução, a migration foi aplicada no PostgreSQL local e `npx prisma migrate status` confirmou o schema atualizado.

## Homologação manual Z-API

1. Enviar um contato de um telefone de teste para a instância.
2. Confirmar no chamado o cartão com nome e telefone, sem texto “Mensagem recebida”.
3. Adicionar o contato, recarregar e editar nome/telefone.
4. Abrir conversas relacionadas e criar uma nova conversa.
5. Reenviar o mesmo callback `messageId` e confirmar idempotência.
6. Repetir com vCard sem `phones`, múltiplos telefones, e-mail, organização e caracteres acentuados.
7. Testar com agente de outro departamento e confirmar `403/404` sem vazamento de dados.
