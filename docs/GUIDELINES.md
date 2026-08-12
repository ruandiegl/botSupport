# Diretrizes e Padrões de Desenvolvimento (GTF-Bot)

Este documento define as convenções de código, padrões de arquitetura, práticas de desenvolvimento e fluxo de trabalho recomendados para todas as contribuições no projeto **GTF-Bot**.

---

## 1. Princípios Gerais de Engenharia

1. **Separação de Responsabilidades (SoC)**: Cada camada ou módulo deve possuir uma única responsabilidade bem definida.
2. **Tipagem Estrita com TypeScript**: Evite o uso de `any`. Utilize interfaces, tipos utilitários ou schemas `Zod` para inferência de tipos seguros.
3. **Validação nas Fronteiras**: Todas as entradas de dados (requisições HTTP, payloads de webhook Z-API, env vars) devem ser validadas com schemas `Zod` antes do processamento.
4. **Código Autodocumentado**: Utilize nomes significativos de variáveis, funções e arquivos em inglês ou português coerente, reservando comentários apenas para decisões de design complexas.

---

## 2. Padrões do Backend (Node.js + Express 5 + Prisma)

O backend segue a arquitetura **Modular por Domínio** localizada em `backend/src/modules/`.

### 2.1 Estrutura de um Módulo

Cada módulo de domínio deve respeitar rigorosamente a seguinte estrutura:

```
src/modules/<modulo>/
├── <modulo>.routes.ts       # Apenas mapeamento de rotas e middlewares Express
├── <modulo>.controller.ts   # Extração de dados da requisição, chamada de serviço e resposta HTTP
├── <modulo>.service.ts      # Lógica de negócio pura, validações operacionais e orquestração
├── <modulo>.repository.ts   # Acesso ao banco de dados utilizando PrismaClient
└── <modulo>.schemas.ts      # Schemas de validação Zod para DTOs (Data Transfer Objects)
```

### 2.2 Regras das Camadas

- **Routes**: Não contêm lógica de código. Apenas conectam caminhos HTTP a funções do Controller.
- **Controller**: Trata `req` e `res`. Valida o payload/params via Zod schema (`safeParse`), retorna códigos de status adequados (`200`, `201`, `400`, `404`, `500`).
- **Service**: Concentra a regra de negócio. Não interage com objetos `req` ou `res` do Express.
- **Repository**: Concentra todas as consultas `prisma.<entidade>`. Nenhuma query Prisma deve ser executada fora da camada de repositório.

### 2.3 Tratamento de Erros e Logging

- Utilize o logger centralizado `pino` (`src/shared/logger.ts`) em vez de `console.log`.
- Capture exceções em blocos `try/catch` nos controllers e registre erros críticos com contexto:
  ```typescript
  logger.error({ err, conversationId }, 'Erro ao assumir conversa');
  ```

---

## 3. Padrões do Frontend (React 18 + Vite 5 + Tailwind v4)

O frontend adota uma arquitetura de **Páginas Descentralizadas e Autocontidas** em `frontend/src/pages/`.

### 3.1 Estrutura de uma Página

```
src/pages/<pagina>/
├── index.tsx                # Componente principal da rota/página
├── styles.css               # Estilos ou ajustes visuais específicos
├── hooks/                   # Custom Hooks (ex: useConversations, useAssumeConversation)
└── components/              # Componentes de UI exclusivos desta página
```

### 3.2 Gerenciamento de Estado e Requisições (React Query)

- Utilize `@tanstack/react-query` para requisições assíncronas, cache e sincronização com a API Backend.
- Isole chamadas da API dentro de custom hooks (ex: `hooks/useConversations.ts`).
- Não faça chamadas `fetch` diretas dentro dos componentes visuais.

### 3.3 Componentização e Estilização

- Utilize Tailwind CSS v4 para estilização via classes utilitárias ou variáveis CSS nativas.
- Para junção de classes condicionais, utilize a combinação `clsx` + `tailwind-merge` via função utilitária `cn()`.
- Utilize os ícones da biblioteca `lucide-react`.

---

## 4. Convenção de Commits e Branching

### 4.1 Padrão de Commits (Conventional Commits)

Os commits devem seguir o padrão: `<tipo>(<escopo>): <descrição curta>`

- `feat`: Nova funcionalidade (ex: `feat(conversations): adiciona filtro por departamento`)
- `fix`: Correção de bug (ex: `fix(zapi): corrige parsing de webhook de mídia`)
- `docs`: Alteração em documentação (ex: `docs(guidelines): adiciona regras de código`)
- `style`: Formatação, ponto e vírgula, sem alteração de código produtivo
- `refactor`: Refatoração que não altera comportamento público
- `test`: Adição ou ajuste de testes

### 4.2 Nomenclatura de Branches

- `feature/nome-da-feature`
- `bugfix/nome-do-bug`
- `hotfix/nome-da-correcao`

---

## 5. Checklist para Pull Requests (PRs)

Antes de solicitar code review ou fazer merge de uma funcionalidade:

- [ ] O código backend compila sem erros (`npm run build` na pasta `backend`).
- [ ] O código frontend compila e passa no TypeScript check (`npm run build` na pasta `frontend`).
- [ ] Todas as rotas de API possuem validação Zod para os dados recebidos.
- [ ] A interface responde de forma adaptativa/responsiva a telas menores.
- [ ] A documentação da API em `docs/API.md` foi atualizada se novos endpoints foram adicionados.

---

## 6. Fluxos versionados e segurança operacional

### 6.1 Regras de implementação

- O editor grava somente `DRAFT`; publicar é uma operação explícita, validada e transacional.
- Nunca use posição do array como identidade. Nós usam `stableKey` e escolhas externas usam `optionKey` imutável.
- Toda conversa iniciada no bot recebe `flowRevisionId` e não migra automaticamente para outra revisão.
- A transição `BOT -> QUEUED` pertence exclusivamente ao `HANDOFF`.
- Textos, departamentos e triagens pertencem à revisão; o adaptador Z-API não contém regra de negócio hardcoded.
- Persistência de resposta e avanço de nó devem ser idempotentes e protegidos contra callbacks concorrentes.

### 6.2 Fronteiras de segurança

- Valide payload, params e query com Zod, incluindo limites de tamanho, tipos discriminados, UUIDs e chaves permitidas.
- Aplique `flow:view`, `flow:edit` e `flow:publish` no backend; esconder controles no frontend não substitui autorização.
- Webhooks exigem validação do segredo/token e chave idempotente do provedor.
- Não renderize HTML vindo de mensagens ou configuração do fluxo. React deve tratar o conteúdo como texto; Markdown exige sanitização explícita.
- Não registre tokens, telefones completos, conteúdo das mensagens, prompts de triagem ou respostas em `flowContext`.
- Respostas de API administrativas não expõem credenciais Z-API. Tokens armazenados devem ser rotacionáveis e protegidos fora do repositório.
- Limite nós, transições, comprimento de textos, quantidade de botões e profundidade de execução para evitar abuso de recursos.

### 6.3 Observabilidade segura

Logs estruturados podem conter `conversationId`, `flowRevisionId`, `flowNodeId`, `eventId`, tipo de ação, duração e resultado. Métricas devem cobrir falha de publicação, conflito `409`, eventos duplicados, falha/retry Z-API, tempo em `BOT`, abandono e handoffs. Dados pessoais e segredos são proibidos em logs, métricas e traces.
