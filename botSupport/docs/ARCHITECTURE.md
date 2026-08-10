# Arquitetura do Sistema GTF-Bot

## 1. Visão Geral

O sistema adota a separação limpa entre **Backend API (Node.js/Express)** e **Frontend SPA (React/Vite)**, utilizando **Docker Compose** para persistência PostgreSQL.

---

## 2. Backend — Arquitetura Modular Por Domínio

O backend é organizado em módulos em `backend/src/modules/`. Cada módulo é independente e segue o padrão em camadas:

```
src/modules/<modulo>/
├── <modulo>.routes.ts       # Declaração dos endpoints Express
├── <modulo>.controller.ts   # Validação Zod da requisição e envio de resposta HTTP
├── <modulo>.service.ts      # Lógica de negócio e regras operacionais
├── <modulo>.repository.ts   # Camada de persistência (queries Prisma)
└── <modulo>.schemas.ts      # Schemas de validação Zod
```

### Camada Shared (`src/shared/`)
- **`prisma.ts`**: Instância global singleton do `PrismaClient`.
- **`logger.ts`**: Logger `pino` para rastreabilidade de requisições e erros.

---

## 3. Frontend — Páginas Descentralizadas e Autocontidas

O frontend em `frontend/src/` abandona arquivos monolíticos em favor de uma estrutura descentralizada onde cada rota é um módulo autocontido:

```
src/pages/<pagina>/
├── index.tsx                # Componente principal da página
├── styles.css               # Estilos locais (quando necessário)
├── hooks/                   # Custom hooks (React Query) específicos da página
└── components/              # Componentes de UI exclusivos da página
```

### Estado Global e Servidor
- **React Query (`@tanstack/react-query`)**: Cache inteligente, revalidação e polling automático.
- **Wouter**: Roteador leve e intuitivo para SPA.
- **Tailwind CSS v4**: Design system moderno baseado em tokens CSS nativos.
