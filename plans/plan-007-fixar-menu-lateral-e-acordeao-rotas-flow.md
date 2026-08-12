# Plan 007: Fixar Painel Lateral do Editor e Implementar Acordeão de Rotas no Fluxo do Bot

> **Status:** Aguardando Aprovação do Usuário
> **Data:** 2026-08-12
> **Repositório:** `c:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`
> **Módulo principal:** `frontend/src/pages/admin/flow/`

---

## 1. Objetivo

Melhorar a experiência de uso e a organização visual da página de **Administração do Fluxo do Bot** (`/admin/flow`) através de dois ajustes principais de UI/UX:

1. **Fixar o Painel Lateral Direito (`.flow-builder-sidebar`)**:
   - Garantir que o painel contendo o **Inspetor de Etapas** (`FlowInspector`) e a **Prévia do WhatsApp** (`WhatsAppFlowPreview`) permaneça **fixado na viewport (sticky)** durante a rolagem do Mapa da Conversa.
   - Definir limite de altura (`max-height: calc(100vh - 96px)`) e scrollbar interna no painel lateral para evitar que a tela toda role desnecessariamente ou que o painel suma ao rolar um mapa longo.

2. **Padrão Acordeão (Minimizar / Maximizar) nas Rotas do Mapa (`FlowMap`)**:
   - Atualmente, todas as rotas e suas sub-etapas (triagem, handoff, mensagens) aparecem totalmente expandidas verticalmente, tornando a visualização muito longa e poluída ("muito ampliada").
   - Implementar funcionalidade de **Acordeão Colapsável** individual para cada Rota da Decisão.
   - Adicionar controles globais ("Expandir todas" / "Recolher todas") e botões de toggle por rota.
   - Exibir um resumo compacto quando a rota estiver minimizada (ex: `3 sub-etapas` · `Suporte Geral`).
   - Expandir automaticamente a rota pai quando o usuário selecionar uma de suas sub-etapas.

---

## 2. Embasamento na Documentação e Código Atual

De acordo com as diretrizes do projeto:
- `docs/ARCHITECTURE.md`: O frontend é organizado em páginas descentralizadas e autocontidas (`frontend/src/pages/admin/flow/`).
- `docs/DESIGN_SYSTEM.md`: Utilização de Tailwind CSS v4, tokens de design, acessibilidade (`aria-expanded`, `aria-controls`), ícones da biblioteca `lucide-react` e badges de status.
- `docs/GUIDELINES.md`: Tipagem estrita com TypeScript, componentização limpa e preservação de acessibilidade.

### Diagnóstico do Código Atual

1. **Painel Lateral (`styles.css`)**:
   - O container `.flow-builder-sidebar` possui `position: sticky; top: 78px;`, porém não possui `max-height` nem `overflow-y: auto;`. Quando o conteúdo do formulário + prévia excede a altura da janela, o sticky empurra a página toda ou causa rolagem conjunta.
2. **Mapa de Rotas (`FlowMap.tsx`)**:
   - As rotas renderizam em `.flow-routes` onde cada `.flow-route-lane` exibe diretamente o `SortableFlowNode` da rota, a lista inteira de `branch` e o botão `<AddFlowStep mode="branch">`. Não há controle de estado para recolher/minimizar sub-etapas.

---

## 3. Seleção de Agentes e Responsabilidades

- **Tech Lead & Arquiteto** (`agents/tech-lead-architect.agent.md`): Governança de UI/UX, contrato de props e acessibilidade.
- **Desenvolvedor Frontend** (`agents/frontend-developer.agent.md`): Implementação do estado colapsável em React (`FlowMap.tsx`, `SortableFlowNode.tsx`, `FlowNodeCard.tsx`) e estilização CSS sticky/scroll.
- **Engenheiro de QA & Testes** (`agents/qa-testing-engineer.agent.md`): Validação visual, responsividade e compilação do build.

---

## 4. Alterações Propostas

### 4.1 Painel Lateral Fixo (`styles.css`)
- Ajustar `.flow-builder-sidebar`:
  ```css
  .flow-builder-sidebar {
    position: sticky;
    top: 78px;
    max-height: calc(100vh - 96px);
    overflow-y: auto;
    padding-right: 4px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  ```
- Adicionar estilização de scrollbar suave para `.flow-builder-sidebar`.

### 4.2 Acordeão de Rotas (`FlowMap.tsx` e componentes relacionados)
- **Estado no `FlowMap`**:
  ```tsx
  const [collapsedRoutes, setCollapsedRoutes] = useState<Record<string, boolean>>({});
  ```
- **Ações no Header das Rotas**:
  - Adicionar botões no cabeçalho das rotas (`.flow-route-heading`):
    - `Recolher todas` / `Expandir todas` (com ícones `ChevronsUp` / `ChevronsDown`).
- **Controle Individual por Rota**:
  - Botão de toggle com ícone `ChevronDown` / `ChevronRight` no header de cada raia de rota (`.flow-route-lane-header`).
- **Comportamento Inteligente**:
  - Quando a rota está **minimizada (colapsada)**:
    - Oculta o ramo de sub-etapas (`.flow-branch-sequence`) e o botão de adicionar etapa.
    - Exibe uma barra sintética informando: `N sub-etapas configuradas`.
  - Ao selecionar uma sub-etapa via clique no mapa ou no inspetor, a rota pai é expandida automaticamente se estiver colapsada.

---

## 5. Plano de Testes e Verificação

1. **Verificação de Fixação (Sticky)**:
   - Rolar o mapa da esquerda em um fluxo longo.
   - Confirmar que o painel lateral da direita permanece visível e fixo no topo da janela.
2. **Verificação do Acordeão**:
   - Clicar no botão de recolher/expandir em uma rota específica.
   - Testar o botão "Recolher todas" e "Expandir todas".
   - Confirmar que a rota expande automaticamente ao selecionar uma sub-etapa.
3. **Build e Tipagem**:
   - Executar `cmd /c "npm run build"` na pasta `frontend` para garantir compilação sem erros.

---

## 6. Arquivos Impactados

- `frontend/src/pages/admin/flow/styles.css`
- `frontend/src/pages/admin/flow/components/FlowMap.tsx`
- `frontend/src/pages/admin/flow/components/FlowNodeCard.tsx`
