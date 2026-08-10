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
