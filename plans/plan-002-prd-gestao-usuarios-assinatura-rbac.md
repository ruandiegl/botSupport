# Plan 002: Correções e conclusão do PRD de Usuários, Assinatura e RBAC

> **Status:** Executado — implementação e validações concluídas em 2026-08-11.
> **Data:** 2026-08-11
> **PRD de referência:** `C:\Users\ESTUDIO-TREINAMENTO\.codex\attachments\4d354845-109a-4d03-a689-e1da4fff0f5b\pasted-text.txt`
> **Repositório de implementação:** `C:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`

## 1. Objetivo

Auditar o que já foi implementado para as três features do PRD, corrigir bugs e completar as lacunas necessárias para que os critérios de aceite sejam atendidos sem quebrar autenticação, conversas, departamentos ou integração Z-API.

O diretório `C:\Users\ESTUDIO-TREINAMENTO\Documents\ChatGPT\Z-API` contém um serviço auxiliar isolado da Z-API; ele só será alterado se a auditoria confirmar dependência direta com os fluxos do PRD.

## 2. Agentes selecionados e responsabilidades

- **Tech Lead & Arquiteto** (`agents/tech-lead-architect.agent.md`): governança, contrato de API, desenho do schema/migration e revisão de integração entre camadas.
- **Backend Developer** (`agents/backend-developer.agent.md`): módulos `agents`, `rbac`, `auth`, validações Zod, regras de negócio e persistência.
- **Frontend Developer** (`agents/frontend-developer.agent.md`): assinatura, tela de atendentes, drawer/modal, menu, guards, hooks e estados de erro/loading.
- **Security Engineer** (`agents/security-engineer.agent.md`): bcrypt, exposição de dados, autorização real no backend, secrets e regras de último administrador.
- **QA Testing Engineer** (`agents/qa-testing-engineer.agent.md`): testes de regressão, casos de borda e validação dos critérios de aceite.
- **DevOps & Infra** (`agents/devops-infra-engineer.agent.md`): migration Prisma, seed, build, ambiente e execução dos testes.

Sequência: Tech Lead → Backend/Security em conjunto → Frontend → QA/DevOps → revisão final do Tech Lead.

## 3. Diagnóstico inicial registrado

### 3.1 Assinatura de mensagens

- `frontend/src/pages/conversation/index.tsx` já concatena uma assinatura no envio e já remove o nome do remetente do meta para mensagens `OUT`.
- A detecção atual por `includes("-- ")` pode impedir a assinatura quando o texto do cliente contém esse trecho; deve ser substituída por uma regra explícita e idempotente.
- O rodapé usa `.signature` e travessão simples, enquanto o PRD exige assinatura padronizada `-- Nome` e estilo `.bubble-signature`; é necessário alinhar renderização, persistência e CSS.
- Mensagens antigas devem continuar sendo renderizadas corretamente, sem alterar mensagens `IN` ou `BOT`.

### 3.2 CRUD de atendentes

- Já existem página, modal, hooks e endpoints básicos de create/update/delete.
- O modelo `Agent` não possui `isActive`; a lista não exibe status ativo/inativo nem oferece ativar/desativar.
- Não há confirmação/endpoint separado para reset de senha e não há confirmação de senha no formulário.
- Controllers não usam schemas Zod; o service aceita tipos amplos (`any`/`string`) e não padroniza erros de unicidade, UUID, role ou departamento.
- Não há regra backend impedindo excluir o próprio usuário logado ou o último ADMIN ativo.
- A rota GET de agentes está sem autenticação explícita e as respostas/listagens precisam ser revisadas para não expor hash de senha.
- A atualização atual pode aceitar campos indevidos, incluindo presença, sem uma política clara de autorização.

### 3.3 RBAC

- Existe tela, hook e API preliminar, mas `rbac.service.ts` mantém permissões somente em memória; nada é persistido no Prisma.
- O modelo de permissões ainda não existe no schema e as ações do PRD não estão modeladas com granularidade (`assume`, `close`, `send_message`, etc.).
- O frontend e o `ProtectedRoute` usam `isAdmin`/`requireAdmin` hardcoded; supervisor somente leitura e filtros por tela ainda não são aplicados de forma geral.
- O menu administrativo aparece apenas para ADMIN, em vez de usar permissões por rota.
- É necessário manter autorização no backend como fonte de verdade; esconder menu no frontend não é controle de segurança.

## 4. Plano de execução após aprovação

### Fase 0 — Baseline e contrato

1. Consultar `docs/ARCHITECTURE.md`, `docs/GUIDELINES.md`, `docs/API.md` e o estado real das dependências.
2. Executar builds/testes existentes para registrar a linha de base.
3. Confirmar as rotas montadas em `backend/src/app.ts` e os contratos efetivos do frontend.
4. Produzir uma matriz PRD → código → teste antes de implementar.

### Fase 1 — Schema, autenticação e segurança

1. Adicionar `Agent.isActive Boolean @default(true)` e modelo persistente de permissões, com chaves/índices adequados e defaults conservadores.
2. Definir migration incremental e seed compatível com dados existentes; nunca colocar senha em texto puro.
3. Garantir bcrypt com salt rounds mínimo 12, rejeitar login de usuário inativo e não retornar `password` em nenhuma resposta.
4. Criar tipos compartilhados para roles, recursos e ações permitidas.

### Fase 2 — Backend de atendentes

1. Criar/ajustar schemas Zod para listagem, criação, edição, ativação, exclusão e reset de senha.
2. Implementar `findById`, update, soft-delete/ativação e reset de senha no repository/service.
3. Garantir email único, roles apenas `ADMIN | SUPERVISOR | AGENT`, departamento válido e mensagens de erro HTTP consistentes.
4. Impedir autoexclusão e exclusão/desativação do último ADMIN ativo; definir comportamento para tentar excluir usuário inexistente.
5. Proteger todas as mutações e a listagem conforme a política definida, registrando operações críticas sem secrets.
6. Atualizar `docs/API.md` com payloads e respostas.

### Fase 3 — RBAC persistente e guards

1. Criar repository/service/controller/routes para roles e permissões persistidas.
2. Implementar `requirePermission(resource, action)` e aplicá-lo nas rotas sensíveis, preservando `requireRole` apenas onde for regra fixa de ADMIN.
3. Cobrir os recursos e ações do PRD, incluindo conversas, fila, atendentes, departamentos, flow, Z-API, RBAC e relatórios.
4. Fazer `auth/me` retornar permissões atuais, com invalidação/revalidação após alterações para refletir mudanças sem novo login.
5. Implementar guard de rota e filtro de sidebar por permissão; SUPERVISOR terá leitura de atendentes conforme PRD, AGENT ficará bloqueado nas telas administrativas.
6. Criar resposta 403/`/unauthorized` consistente e evitar chamadas de navegação durante renderização.

### Fase 4 — Frontend de atendentes

1. Atualizar tipos e hooks para `isActive`, ativar/desativar e reset de senha.
2. Ajustar drawer/modal com validação de nome, email, senha/confirmar senha, role, departamento e estado ativo.
3. Exibir status Ativo/Inativo, ações condicionais e confirmação de exclusão; bloquear visualmente o usuário logado, mantendo a proteção no backend.
4. Garantir invalidação de cache e feedback de sucesso/erro após cada mutação.
5. Ajustar responsividade, acessibilidade, foco/fechamento do drawer e animação conforme o design system.

### Fase 5 — Frontend da assinatura

1. Centralizar a composição da mensagem assinada em uma função testável e idempotente.
2. Acrescentar `\n\n-- Nome` somente para mensagens enviadas pelo atendente, imediatamente antes da mutation.
3. Renderizar OUT com horário no `bubble-meta`, IN com contato + horário e BOT como `GTF-Bot`.
4. Estilizar a assinatura dentro da bolha com classe dedicada, sem alterar conteúdo visual de mensagens antigas.

### Fase 6 — QA, migração e revisão

1. Backend: build TypeScript, testes unitários de regras e testes de integração das rotas.
2. Frontend: build/TypeScript check e testes dos fluxos de formulário, guard, menu e assinatura.
3. Regressão: login, logout, fila, assumir/encerrar conversa, envio Z-API, departamentos, flow e configurações Z-API.
4. Segurança: usuário inativo, token inválido, acesso por role, tentativa de autoexclusão, último ADMIN, payload extra e vazamento de senha.
5. DevOps: validar migration em banco de desenvolvimento, seed idempotente e comandos de execução documentados.
6. Revisão final contra todos os critérios de aceite do PRD e relatório de pendências, se houver dependência externa.

## 5. Critérios de pronto

- Todos os critérios de aceite do PRD estão testados e marcados como atendidos.
- Backend e frontend compilam sem erros.
- Permissões são persistidas e aplicadas no backend, não apenas no menu.
- Não há hash/senha em respostas, logs ou mensagens de erro.
- Migration é incremental e reversível no ambiente de desenvolvimento.
- Alterações ficam limitadas ao escopo do PRD e não sobrescrevem mudanças existentes do usuário.

## 6. Riscos e decisões que serão preservadas

- A exclusão física só será mantida se não quebrar relações; caso contrário, será adotada desativação/soft-delete com compatibilidade.
- Permissões customizadas não serão inventadas além do modelo do PRD sem evidência no código ou aprovação adicional.
- O serviço auxiliar `Z-API` não será modificado por suposição; só entra no escopo se os testes demonstrarem que é a origem de um bug do fluxo.
- Não será executada migration, instalação de dependência, alteração de banco, commit ou deploy antes da aprovação deste plano.

## 7. Gate de aprovação

- [x] Plano aprovado pelo usuário.
- [x] Escopo de implementação aprovado para `Desktop\\botSupport`.
- [x] Execução autorizada.
