# Deploy Railway

## Serviços

O projeto usa três serviços no mesmo ambiente Railway:

- `Postgres`: banco gerenciado pelo Railway.
- `botSupport` (API): Root Directory `/backend`, Dockerfile `Dockerfile`, healthcheck `/health`.
- `frontend`: Root Directory `/frontend`, Dockerfile `Dockerfile`, domínio público HTTPS.

O Railway recomenda manter API e front-end como serviços separados em monorepos. A API recebe `DATABASE_URL=${{Postgres.DATABASE_URL}}` por referência de variável; a conexão usa a rede privada do projeto.

## Variáveis da API

```text
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
CORS_ORIGIN=https://<dominio-publico-do-frontend>
JWT_SECRET=<segredo-forte>
LOG_LEVEL=info
ZAPI_INSTANCE_ID=<segredo>
ZAPI_TOKEN=<segredo>
ZAPI_CLIENT_TOKEN=<segredo>
ZAPI_WEBHOOK_URL=https://<dominio-publico-da-api>/api/webhooks/z-api
```

Não copie `.env` para o repositório e não coloque `DATABASE_URL`, JWT ou tokens no front-end.

## Variáveis do front-end

```text
VITE_API_URL=https://<dominio-publico-da-api>
```

Após o primeiro deploy da API, gere o domínio público dela; depois configure `VITE_API_URL`, faça o deploy do front-end e atualize `CORS_ORIGIN` com o domínio final do front-end.

## Ordem segura

1. Criar/adicionar o serviço PostgreSQL.
2. Configurar `DATABASE_URL` na API.
3. Fazer deploy da API e validar `/health` e `/api/healthz`.
4. Gerar o domínio público da API.
5. Configurar `VITE_API_URL` no front-end e fazer deploy.
6. Atualizar `CORS_ORIGIN` com o domínio do front-end e redeploy da API.
7. Testar login, Socket.IO, migrations e webhook da Z-API.
