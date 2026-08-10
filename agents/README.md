# Agentes de IA do Time de Software (GTF-Bot)

Esta pasta contém o ecossistema de **Agentes de IA Especializados** projetados para atuar nas diferentes funções de engenharia de software dentro do projeto **GTF-Bot**. Cada arquivo `.md` estabelece a identidade, stack tecnológica, responsabilidades e instruções de sistema (prompt) para o agente operar com máxima eficiência e alinhamento às diretrizes do repositório.

---

## Matriz de Agentes do Time de Software

| Agente | Arquivo Especializado | Função Principal | Stack Principal |
| :--- | :--- | :--- | :--- |
| **Tech Lead & Arquiteto** | [`tech-lead-architect.agent.md`](tech-lead-architect.agent.md) | Governança técnica, schema de banco e arquitetura | Node.js, Express, Prisma, React |
| **Desenvolvedor Backend** | [`backend-developer.agent.md`](backend-developer.agent.md) | APIs REST, regras de negócio, Zod e Z-API | Node.js 20, Express 5, Prisma, Zod |
| **Desenvolvedor Frontend** | [`frontend-developer.agent.md`](frontend-developer.agent.md) | Interface SPA, UI/UX, componentes e hooks | React 18, Vite 5, Tailwind v4, React Query |
| **Engenheiro de QA & Testes** | [`qa-testing-engineer.agent.md`](qa-testing-engineer.agent.md) | Planos de testes, validação Zod e cenários de borda | HTTP REST, Schemas Zod, E2E |
| **Engenheiro DevOps & Infra** | [`devops-infra-engineer.agent.md`](devops-infra-engineer.agent.md) | Docker, PostgreSQL, migrações e scripts de build | Docker Compose, PostgreSQL 16, Prisma |
| **Product Manager** | [`product-manager.agent.md`](product-manager.agent.md) | Requisitos de produto, PRD e fluxos do WhatsApp | PRD, Fluxos do Bot, User Stories |
| **Engenheiro de Segurança** | [`security-engineer.agent.md`](security-engineer.agent.md) | Sanitização de dados, segurança de webhooks e secrets | Helmet, CORS, Sanitização Zod |

---

## Guia Prático: Quando Usar Cada Agente

### 🟢 Use o [`tech-lead-architect`](tech-lead-architect.agent.md) quando:
- Precisar projetar uma nova funcionalidade que envolva alterações no banco de dados (`prisma/schema.prisma`).
- For definir o contrato inicial de uma nova API ou reestruturação de pastas.
- Estiver em dúvida sobre em qual camada posicionar determinado código ou serviço.

### 🔵 Use o [`backend-developer`](backend-developer.agent.md) quando:
- Criar ou alterar rotas, controllers, services ou repositories na pasta `backend/src/modules/`.
- Integrar novos webhooks da Z-API / WhatsApp ou refatorar o envio de mensagens.
- Adicionar schemas de validação `Zod` para requisições da API Backend.

### 🟣 Use o [`frontend-developer`](frontend-developer.agent.md) quando:
- Construir ou alterar páginas e componentes visuais na pasta `frontend/src/pages/`.
- Criar Custom Hooks com `@tanstack/react-query` para consumir a API REST.
- Ajustar estilos com Tailwind CSS v4, animações Framer Motion ou ícones Lucide.

### 🟡 Use o [`qa-testing-engineer`](qa-testing-engineer.agent.md) quando:
- Quiser criar um plano de testes completo para homologar um novo recurso.
- Precisar validar se os endpoints tratam corretamente erros, parâmetros ausentes ou tipos inválidos.
- Simular cenários complexos da fila de atendimento no WhatsApp.

### 🟧 Use o [`devops-infra-engineer`](devops-infra-engineer.agent.md) quando:
- Houver problemas com o banco de dados PostgreSQL ou o container Docker (`docker compose`).
- Precisar executar migrações do Prisma (`npx prisma migrate dev`) ou popular o banco (`seed.ts`).
- For atualizar arquivos de configuração de ambiente (`.env.example`, `tsconfig`, Dockerfiles).

### 🔴 Use o [`product-manager`](product-manager.agent.md) quando:
- Precisar definir o fluxo de triagem e opções do menu do bot WhatsApp (`/flow`).
- For documentar novos requisitos no [`PRD.md`](../docs/PRD.md) ou histórias de usuário.
- Estiver desenhando a regra operacional de um novo departamento de suporte T.I.

### 🔒 Use o [`security-engineer`](security-engineer.agent.md) quando:
- For auditar a segurança de webhooks do WhatsApp e tokens de autenticação.
- Precisar garantir a proteção contra injeção de dados (SQLi/XSS) ou vazamento de segredos.
- For revisar políticas de CORS, headers HTTP e sanitização de dados de entrada.

---

## Recursos Adicionais na Pasta `agents/`

- **`global-router.agent.json`**: Esquema de configuração do agente roteador de intenções do bot.
- **`prompts/triage-agent.md`**: Prompt do bot automatizado no WhatsApp.
- **`prompts/support-copilot.md`**: Prompt do copiloto de atendimento humano.
