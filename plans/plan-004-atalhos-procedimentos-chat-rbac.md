# Plano 004 — Atalhos e Procedimentos Descentralizados

> **Status:** Implementado em 2026-08-11
> **Relacionamento:** PRD `docs/PRD_ATALHOS_PROCEDIMENTOS.md`

## Objetivo

Entregar uma biblioteca de atalhos/procedimentos independente dos departamentos, com CRUD administrativo, escopos global/departamento/pessoal, uso rápido no chat e controle RBAC.

## Agentes recomendados

1. **Product Manager** — detalhar histórias, regras de escopo, categorias e critérios de aceite.
2. **Tech Lead & Arquiteto** — definir modelo Prisma, estratégia de migração, contratos e compatibilidade com procedimentos legados.
3. **Desenvolvedor Backend** — módulo REST, Zod, regras de visibilidade, auditoria e integração RBAC.
4. **Desenvolvedor Frontend** — tela CRUD, biblioteca no composer, busca, filtros e estados responsivos usando shadcn.
5. **Engenheiro de Segurança** — revisar autorização por escopo, isolamento de atalhos pessoais, XSS e auditoria.
6. **Engenheiro de QA & Testes** — testes de API, matriz de permissões, escopos, concorrência e fluxos de chat.
7. **DevOps & Infra** — executar migração Prisma, backup, observabilidade e preparação de deploy.

## Fase 1 — Descoberta e arquitetura

- Confirmar nomenclatura final: atalhos, procedimentos, categorias e escopos.
- Mapear permissões atuais do módulo RBAC e definir os novos recursos.
- Decidir se o uso será auditado em tabela própria ou evento de auditoria genérico.
- Definir política de transição dos procedimentos existentes em `Department`.
- Produzir contrato OpenAPI/Markdown e exemplos de payload.

## Fase 2 — Banco e backend

- Criar enum/model `Shortcut` no Prisma, com `departmentId`, `ownerId`, autorias e arquivamento lógico.
- Criar migração reversível e atualizar seed com exemplos globais, de departamento e pessoais.
- Criar `shortcuts.routes/controller/service/repository/schemas`.
- Implementar filtros de visibilidade no servidor, nunca apenas no frontend.
- Adicionar validação Zod e mensagens de erro por campo.
- Integrar `requirePermission` em cada rota.
- Atualizar tipos compartilhados e `docs/API.md`.
- Adicionar auditoria e limites de paginação/busca.

## Fase 3 — RBAC

- Adicionar recurso `shortcuts` aos recursos conhecidos do backend/frontend.
- Adicionar tela `/admin/shortcuts` ao mapa de permissões.
- Definir defaults: ADMIN completo; SUPERVISOR criar/editar/usar conforme escopo; AGENT usar e gerenciar pessoal.
- Garantir que `shortcuts.use` controle o botão no chat independentemente da permissão da tela administrativa.
- Testar deny-by-default para chamadas diretas à API.

## Fase 4 — Tela administrativa

- Criar `frontend/src/pages/admin/shortcuts/` com `index.tsx`, `hooks/` e componentes locais.
- Implementar listagem com busca, filtros, badges e estado vazio.
- Implementar formulário com validação visual e seleção de escopo/departamento.
- Implementar editar, ativar/desativar e arquivar via Dialog/AlertDialog.
- Usar shadcn como base para todos os controles e preservar a paleta clean.
- Adicionar rota protegida no app e item de navegação condicionado ao RBAC.

## Fase 5 — Integração no chat

- Criar componente `ShortcutPicker` no composer.
- Buscar itens disponíveis sob demanda, com debounce e cache React Query.
- Filtrar por conversa, departamento, usuário e status no backend.
- Inserir mensagem no Textarea sem disparar envio.
- Registrar uso após envio bem-sucedido, sem bloquear o envio se a auditoria falhar.
- Garantir acessibilidade por teclado e comportamento em mobile.

## Fase 6 — Qualidade, segurança e operação

- Testar isolamento entre usuários, departamentos e roles.
- Testar payloads vazios, limites, Unicode, HTML/script e títulos duplicados.
- Testar arquivamento, concorrência de edição e cache invalidation.
- Executar migração em ambiente de homologação com backup.
- Configurar logs, métricas de latência, erro e quantidade de usos.
- Validar builds frontend/backend e testes automatizados.

## Entregáveis

- Migração Prisma e seed.
- Módulo REST `/shortcuts`.
- Atualização do RBAC e documentação da API.
- Tela administrativa responsiva.
- Picker de atalhos no chat.
- Testes unitários, integração e autorização.
- Runbook de migração e rollback.

## Critérios de conclusão

- Todos os critérios de aceite do PRD atendidos.
- Nenhum atalho pessoal aparece para outro usuário.
- Nenhum conteúdo depende do relacionamento de procedimentos do departamento.
- `npm run build` passa em `frontend/` e `backend/`.
- Migração testada e rollback documentado.
