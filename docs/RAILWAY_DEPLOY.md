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
ZAPI_INTERACTIVE_MODE=auto
ZAPI_GROUPED_MENU_TRANSPORT=flat
# O envio de imagem, vídeo, áudio e documento fica habilitado por padrão.
# Use false apenas para rollback ou manutenção.
OUTBOUND_MEDIA_ENABLED=true
OUTBOUND_MEDIA_BODY_LIMIT_BYTES=67633152
OUTBOUND_MEDIA_MAX_IMAGE_BYTES=8388608
OUTBOUND_MEDIA_MAX_VIDEO_BYTES=67108864
OUTBOUND_MEDIA_MAX_AUDIO_BYTES=8388608
OUTBOUND_MEDIA_MAX_DOCUMENT_BYTES=16777216
OUTBOUND_MEDIA_MAX_CONCURRENT_PER_AGENT=1
# Z-API may convert non-H.264 videos before delivering them.
OUTBOUND_MEDIA_REQUEST_TIMEOUT_MS=120000
```

`flat` usa o formato público documentado pela Z-API. Para decisões hierárquicas,
o nome da categoria continua presente na descrição de cada opção. Não configure
`sections`: algumas instâncias aceitam o campo desconhecido com HTTP 200, mas
renderizam somente o prompt sem os itens.

Não copie `.env` para o repositório e não coloque `DATABASE_URL`, JWT ou tokens no front-end.

## Variáveis do front-end

```text
VITE_API_URL=https://<dominio-publico-da-api>
```

Após o primeiro deploy da API, gere o domínio público dela; depois configure `VITE_API_URL`, faça o deploy do front-end e atualize `CORS_ORIGIN` com o domínio final do front-end.

### Hardening do frontend

O frontend publica os headers de segurança no template do Nginx (`frontend/nginx.conf`):
`Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`,
`X-Frame-Options`, `Referrer-Policy` e `Permissions-Policy`. A CSP permite somente
o próprio frontend e o domínio público da API configurado atualmente. Se o domínio
da API mudar, atualize o `connect-src`, `img-src` e `media-src` antes do redeploy.

As fontes são empacotadas localmente pelo `@fontsource-variable/geist`; o frontend
não depende mais de `fonts.googleapis.com` ou `fonts.gstatic.com`. `robots.txt`
bloqueia indexação do painel autenticado e `.well-known/security.txt` publica o
canal de contato de segurança. Substitua o contato provisório desse arquivo pelo
canal oficial da empresa antes de publicar em produção.

## Ordem segura

1. Criar/adicionar o serviço PostgreSQL.
2. Configurar `DATABASE_URL` na API.
3. Fazer deploy da API e validar `/health` e `/api/healthz`.
4. Gerar o domínio público da API.
5. Configurar `VITE_API_URL` no front-end e fazer deploy.
6. Atualizar `CORS_ORIGIN` com o domínio do front-end e redeploy da API.
7. Testar login, Socket.IO, migrations e webhook da Z-API.

### Migrações no boot da API

O comando de inicialização da API executa `prisma migrate deploy` antes de abrir a porta HTTP. Assim, as migrações versionadas são aplicadas no banco referenciado por `DATABASE_URL` a cada release, incluindo as tabelas de fila, notificações e mídia. Confirme nos logs do serviço que a migração terminou com sucesso; se ela falhar, valide `DATABASE_URL` e as permissões do banco antes de investigar respostas 500.

### Baseline de banco legado (execução única)

Se o Postgres já possuir tabelas criadas antes do histórico Prisma, `prisma migrate deploy` retorna `P3005` e não aplica nenhuma migração. Nesse caso, faça backup e confirme que o schema existente corresponde ao estado anterior às migrações de fila/mídia. Com autorização explícita, registre somente as cinco migrações legadas como aplicadas e, em seguida, aplique as duas novas:

```bash
npx prisma migrate resolve --applied 20260811000000_add_agent_status_and_rbac
npx prisma migrate resolve --applied 20260811120000_add_shortcuts
npx prisma migrate resolve --applied 20260811180000_add_message_read_status
npx prisma migrate resolve --applied 20260812100000_add_versioned_flow_engine
npx prisma migrate resolve --applied 20260812110000_add_flow_publish_permission
npx prisma migrate deploy
```

Não use `prisma migrate reset` em produção. Depois do baseline, remova os comandos `resolve` do Railway e mantenha apenas `prisma migrate deploy` no pré-deploy.
