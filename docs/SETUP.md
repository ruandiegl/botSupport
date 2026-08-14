# Guia de Instalação e Execução Local

Este guia detalha como subir e rodar o projeto **GTF-Bot** no seu ambiente local.

---

## Pró-requisitos

1. **Node.js** v20 ou superior
2. **npm** (ou `pnpm` / `yarn`)
3. **Docker** e **Docker Compose**

---

## Passo 1: Subir o Banco de Dados PostgreSQL

Na raiz do projeto (`botSupport/`), rode:

```bash
docker compose up -d
```

Verifique se o container `gtfbot-db` está rodando:

```bash
docker ps
```

---

## Passo 2: Configurar e Inicializar o Backend

Navegue até a pasta `backend/`:

```bash
cd backend
npm install
```

Execute as migrações do Prisma e povoe o banco com dados de teste:

```bash
npx prisma migrate dev --name init
npm run db:seed
```

Inicie o servidor backend em modo de desenvolvimento:

```bash
npm run dev
```

O backend estará ativo em `http://localhost:3001`. Você pode testar em: `http://localhost:3001/api/healthz`.

---

## Passo 3: Inicializar o Frontend

Em um novo terminal, navegue até a pasta `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

O frontend estará ativo em `http://localhost:5173`.

---

## Comandos Úteis

- **Prisma Studio** (Visualizador visual de dados do banco):
  ```bash
  cd backend && npm run db:studio
  ```
- **Build de Produção Backend**:
  ```bash
  cd backend && npm run build
  ```
- **Build de Produção Frontend**:
  ```bash
  cd frontend && npm run build
  ```

## Configuração de mídia Z-API

Antes de habilitar mídia em produção:

1. confirme que `update-webhook-received` aponta para `https://<backend>/api/webhooks/z-api`;
2. envie fixtures reais de imagem, áudio, vídeo e documento e registre os domínios efetivos em `MEDIA_ALLOWED_SOURCE_HOSTS`;
3. gere segredos independentes para `MEDIA_URL_ENCRYPTION_KEY` e `MEDIA_ACCESS_TICKET_SECRET` no secret manager;
4. mantenha `MEDIA_RETENTION_DAYS=30` ou um valor menor;
5. aplique `npx prisma migrate deploy` antes de ativar `MEDIA_ZAPI_INGESTION_ENABLED` e `MEDIA_ZAPI_DISPLAY_ENABLED`;
6. consulte [`RUNBOOK_MIDIA_ZAPI.md`](RUNBOOK_MIDIA_ZAPI.md) para canary, rotação e rollback.

Nunca use os placeholders de `.env.example` em produção e nunca adicione URLs reais de mídia a logs ou fixtures versionadas.
