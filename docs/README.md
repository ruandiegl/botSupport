# Documentação do Projeto GTF-Bot

Bem-vindo à central de documentação técnica e de engenharia do **GTF-Bot**, o sistema de atendimento inteligente e gestão de filas de suporte via WhatsApp para a Torre Forte.

---

## Stack Tecnológica e Tipo de Aplicação

- **Tipo**: Aplicação Web Fullstack (SPA Frontend + API REST Backend com Automação WhatsApp)
- **Backend**: Node.js 20+, Express 5, TypeScript 5.3, Prisma ORM 5.10, PostgreSQL 16 (Docker), Zod 3.22, Pino Logger
- **Frontend**: React 18, Vite 5, TypeScript 5.3, Tailwind CSS v4, Wouter 3.0, React Query (@tanstack/react-query 5.18), Lucide Icons
# Documentação do Projeto GTF-Bot

Bem-vindo à central de documentação técnica e de engenharia do **GTF-Bot**, o sistema de atendimento inteligente e gestão de filas de suporte via WhatsApp para a Torre Forte.

---

## Stack Tecnológica e Tipo de Aplicação

- **Tipo**: Aplicação Web Fullstack (SPA Frontend + API REST Backend com Automação WhatsApp)
- **Backend**: Node.js 20+, Express 5, TypeScript 5.3, Prisma ORM 5.10, PostgreSQL 16 (Docker), Zod 3.22, Pino Logger
- **Frontend**: React 18, Vite 5, TypeScript 5.3, Tailwind CSS v4, Wouter 3.0, React Query (@tanstack/react-query 5.18), Lucide Icons
- **Integração WhatsApp**: Z-API Webhook & REST Client

---

## Índice da Documentação

- [**PRD (Product Requirements Document)**](PRD.md): Visão geral do produto, requisitos funcionais e objetivos de negócio.
- [**PRD: Auto-Close & Status Unificados**](PRD_AUTO_CLOSE_AND_UNIFIED_STATUS.md): Requisitos de encerramento automático por inatividade e simplificação para 3 status (`OPEN`, `IN_PROGRESS`, `CLOSED`).
- [**Arquitetura do Sistema**](ARCHITECTURE.md): Estrutura modular do Backend Express/Prisma e Frontend descentralizado em React.
- [**Diretrizes e Padrões (Guidelines)**](GUIDELINES.md): Convenções de código TypeScript, arquitetura em camadas, tratamento de erros, fluxo Git e commits.
- [**Design System e UI**](DESIGN_SYSTEM.md): Padrões visuais, cores, componentes e estados de interface (com referência à [Paleta de Cores](paleta.md)).
- [**Especificação da API REST**](API.md): Endpoints da API, schemas de requisição, respostas JSON e status HTTP.
- [**Integração Z-API (WhatsApp)**](PRD_ZAPI.md): Especificação de webhooks de mensagens recebidas, envio e atualização de conversas.
- [**PRD: Grupos, menções e etiquetas**](PRD_GRUPOS_MENCAO_ETIQUETAS.md): Atendimento privado originado por menção em grupos e organização de chamados por etiquetas.
- [**Plano 016: Identidade e delegação de chamados**](../plans/plan-016-identidade-remetente-delegacao-chamados.md): colaboração entre atendentes, autoria por mensagem, delegação e notificações.
- [**Runbook de identidade e delegação**](RUNBOOK_IDENTIDADE_DELEGACAO.md): migration, homologação, observabilidade e rollback.
- [**Runbook de grupos e etiquetas**](RUNBOOK_GRUPOS_ETIQUETAS.md): ativação segura, homologação, monitoramento e rollback.
- [**Guia de Configuração e Execução (Setup)**](SETUP.md): Instruções passo a passo para ambiente de desenvolvimento local e Docker Compose.
- [**Runbook de mídia Z-API**](RUNBOOK_MIDIA_ZAPI.md): homologação, secrets, retenção, canary e rollback de mídia.
- [**Matriz QA de mídia Z-API**](QA_MIDIA_ZAPI.md): contratos, segurança, expiração e regressão.
- [**Matriz QA de contatos compartilhados**](QA_CONTATOS_RECEBIDOS_ZAPI.md): parser, idempotência, RBAC e CRUD no chat.
- [**Runbook de contatos compartilhados**](RUNBOOK_CONTATOS_RECEBIDOS_ZAPI.md): migration, homologação e rollback.
- [**Plano 022: contatos recebidos via Z-API**](../plans/plan-022-contatos-recebidos-crud-conversas-zapi.md): ingestão, cartão no chat, CRUD e novas conversas.
- [**Plano 017: delay anti-spam e zoom de imagens**](../plans/plan-017-delay-anti-spam-midia-zoom.md): cooldown server-side para bot e prévia ampliada de mídia.
- [**Plano 018: exclusão de contatos das respostas do bot**](../plans/plan-018-exclusao-contatos-respostas-bot.md): bloqueio administrável de respostas automáticas com preservação do histórico.
- [**Runbook de exclusões do bot**](RUNBOOK_EXCLUSOES_BOT.md): migração, validação, observabilidade e rollback.
- [**Runbook de horários de funcionamento**](RUNBOOK_HORARIO_FUNCIONAMENTO.md): configuração, deduplicação, diagnóstico e rollback da mensagem de expediente.
├── agents/           # Agentes de IA do time de desenvolvimento e automação de bot
└── docker-compose.yml # PostgreSQL 16 para banco de dados local
```
