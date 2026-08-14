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
Fila e detalhe usam projeÃ§Ãµes diferentes: a fila recebe `ConversationSummary`, sem histÃ³rico integral ou binÃ¡rios de mÃ­dia; o detalhe carrega mensagens recentes e usa cursor para mensagens anteriores. `message:new` atualiza o cache por `messageId`, enquanto `conversation:updated` cuida de fila/status. Refetch completo fica reservado para reconciliaÃ§Ã£o apÃ³s reconexÃ£o ou payload incompleto.
- **React Query (`@tanstack/react-query`)**: Cache inteligente, revalidação e polling automático.
- **Wouter**: Roteador leve e intuitivo para SPA.
- **Tailwind CSS v4**: Design system moderno baseado em tokens CSS nativos.

---

## 4. Fluxo do bot versionado

O fluxo é dividido em três responsabilidades independentes:

1. **Definição e publicação (`modules/flow`)**: mantém a identidade do fluxo, revisões, nós e transições; valida e publica snapshots imutáveis.
2. **Execução (`modules/flow-execution`)**: interpreta a revisão fixada na conversa, persiste contexto e nó atual e produz ações de saída.
3. **Transporte (`modules/zapi`)**: normaliza webhooks e executa ações na Z-API, sem textos ou regras de roteamento hardcoded.

### Modelo persistido

- `FlowDefinition`: identidade permanente do fluxo;
- `FlowRevision`: snapshot `DRAFT`, `PUBLISHED` ou `ARCHIVED`, com controle otimista por `revision`;
- `FlowNode`: etapa com `stableKey`, tipo discriminado, conteúdo, configuração e ordem;
- `FlowTransition`: ligação ordenada, com `optionKey` estável para saídas de decisão;
- `Conversation.flowRevisionId`, `currentFlowNodeId` e `flowContext`: estado persistente da execução;
- `FlowExecutionEvent`: trilha técnica de transições e falhas, sem conteúdo sensível.

### Invariantes de publicação

- exatamente um `ENTRY` e ao menos uma decisão válida;
- `stableKey` e `optionKey` únicos dentro da revisão;
- todos os nós são alcançáveis e não há ciclos infinitos;
- toda decisão tem saída e toda rota termina em `HANDOFF` ou `END`;
- `TRIAGE` tem prompt, chave de resposta e próxima transição;
- `HANDOFF` referencia departamento existente e ativo;
- troca da revisão publicada é transacional;
- conversas em andamento permanecem na revisão em que começaram.

### Transação de webhook

O webhook deve ser idempotente pelo identificador externo. Persistência da entrada, evolução do estado e registro do evento precisam impedir avanço duplicado. Quando o envio externo não puder participar da mesma transação, use estado recuperável/outbox: falhar ao enviar não pode avançar silenciosamente o nó.

### Compatibilidade

Durante a migração, o backend opera em leitura dupla: revisões v2 têm precedência e o formato legado permanece como fallback. Os endpoints legados `/flow` são temporários e não devem receber novas capacidades. A remoção de colunas e rotas v1 só ocorre depois de não existirem conversas vinculadas ao legado e de uma janela de estabilidade registrada no runbook.

## 5. Proxy de mídia Z-API

O módulo `modules/media` segue Route → Controller → Service → Repository. O webhook não baixa arquivos: ele persiste uma única `ConversationMedia` vinculada à `Message` dentro da mesma transação idempotente. As URLs temporárias permanecem cifradas no PostgreSQL.

O navegador primeiro solicita um ticket autenticado. Depois, o proxy valida ticket, expiração e destino HTTPS, resolve DNS, bloqueia redes privadas, revalida redirects, limita streams/tamanho/tempo e transmite com backpressure. A URL original e o JWT nunca são repassados entre as camadas externas. `mediaExpirationWorker` executa limpeza idempotente e o endpoint aplica a expiração de forma síncrona, sem depender do scheduler.

No frontend, `MessageMedia` compõe os primitives shadcn `Message`, `Bubble`, `Attachment`, `Dialog`, `Badge`, `Button` e `Skeleton`. React Query guarda somente o ticket interno; imagem é lazy, áudio/vídeo não usam autoplay e documentos exigem ação explícita.
