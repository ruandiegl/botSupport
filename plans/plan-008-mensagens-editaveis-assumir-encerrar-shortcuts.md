# Plan 008: Edição de Mensagens de Assumir e Encerrar Chamado em Atalhos e Procedimentos

> **Status:** Aguardando Aprovação do Usuário
> **Data:** 2026-08-12
> **Repositório:** `c:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`

---

## 1. Objetivo

Permitir que as mensagens padrão utilizadas ao **Assumir Chamado** (saudação inicial do atendente) e ao **Encerrar Chamado** (mensagem de finalização do atendimento) sejam totalmente **editáveis** através da tela de **Atalhos e Procedimentos** (`/admin/shortcuts`), com suporte a variáveis dinâmicas (`{agentName}`, `{contactName}`, `{departmentName}`).

---

## 2. Diagnóstico da Estrutura Atual

1. **Modelo `Shortcut` (Prisma)**:
   - Já possui o enum `ShortcutType` contendo `GREETING` (Saudação) e `CLOSING` (Encerramento), e o `ShortcutScope` contendo `GLOBAL`, `DEPARTMENT` e `PERSONAL`.
2. **Tela de Atalhos (`/admin/shortcuts`)**:
   - Atualmente exibe uma lista genérica sem destaque especial para as mensagens vitais de sistema (Assumir e Encerrar).
3. **Página de Conversa (`/conversation/:id`)**:
   - Os botões "Assumir" e "Encerrar" executam a troca de status via API (`/assume` e `/close`), mas as mensagens de saudação e encerramento usadas durante a interação rápida ainda utilizam frases hardcoded no `DetailPanel` ou requerem digitação manual.

---

## 3. Agentes de IA Selecionados

- **Tech Lead & Arquiteto** (`agents/tech-lead-architect.agent.md`): Contrato de API, substituição segura de variáveis e integridade dos enums `GREETING` e `CLOSING`.
- **Desenvolvedor Frontend** (`agents/frontend-developer.agent.md`): Destaque de edição no `/admin/shortcuts`, chips de variáveis dinâmicas (`+ {agentName}`), e integração nos modais/fluxos de Assumir e Encerrar em `conversation/index.tsx`.
- **Desenvolvedor Backend** (`agents/backend-developer.agent.md`): Suporte no endpoint de conversas ou helper de atalhos para resolver as variáveis de sistema no envio.
- **Engenheiro de QA & Testes** (`agents/qa-testing-engineer.agent.md`): Validação de testes E2E e compilação do build.

---

## 4. Alterações Propostas

### 4.1 Tela de Atalhos e Procedimentos (`frontend/src/pages/admin/shortcuts/index.tsx`)
- Criar um painel de destaque no topo da página:
  **"Mensagens Padrão de Atendimento (Assumir & Encerrar)"**
- Permitir editar diretamente com 1 clique:
  - **Mensagem ao Assumir Chamado** (`GREETING` / `GLOBAL`)
  - **Mensagem ao Encerrar Chamado** (`CLOSING` / `GLOBAL`)
- Adicionar seletores/chips interativos para inserção de variáveis no texto:
  - `{agentName}` → Substituído pelo nome do atendente logado
  - `{contactName}` → Substituído pelo nome do cliente
  - `{departmentName}` → Substituído pelo nome do departamento

### 4.2 Fluxo no Chat de Atendimento (`frontend/src/pages/conversation/`)
- **Ao Assumir Chamado (`handleAssume`)**:
  - No modal de confirmação "Assumir atendimento", incluir checkbox/opção (marcada por padrão): *"Enviar mensagem de boas-vindas ao cliente"*.
  - Ao confirmar, envia automaticamente a mensagem de `GREETING` configurada no sistema com as variáveis substituídas.
- **Ao Encerrar Chamado (`handleClose`)**:
  - No modal de confirmação "Encerrar chamado", incluir checkbox/opção (marcada por padrão): *"Enviar mensagem de encerramento ao cliente"*.
  - Ao confirmar, envia a mensagem de `CLOSING` configurada no sistema antes de alterar o status para `CLOSED`.
- **No `DetailPanel` & `ShortcutPicker`**:
  - Exibir os atalhos de `GREETING` e `CLOSING` formatados com o nome real do atendente e do contato.

---

## 5. Critérios de Aceite

- [ ] A tela `/admin/shortcuts` permite visualizar e editar as mensagens padrão de **Assumir Chamado** e **Encerrar Chamado**.
- [ ] O formulário de edição de atalhos oferece chips de clique rápido para incluir `{agentName}`, `{contactName}` e `{departmentName}`.
- [ ] Ao assumir uma conversa no chat, o atendente pode enviar a mensagem de saudação editada com o seu nome.
- [ ] Ao encerrar uma conversa no chat, o atendente pode enviar a mensagem de encerramento editada.
- [ ] Compilação com `npm run build` na pasta `frontend` e `backend` sem erros.

---

## 6. Arquivos Impactados

- `frontend/src/pages/admin/shortcuts/index.tsx`
- `frontend/src/pages/admin/shortcuts/styles.css` (se necessário)
- `frontend/src/pages/conversation/index.tsx`
- `frontend/src/pages/conversation/components/DetailPanel.tsx`
- `backend/prisma/seed.ts` (garantir atalhos padrão iniciais de GREETING e CLOSING)
