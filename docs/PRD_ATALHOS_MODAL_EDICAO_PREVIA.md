# PRD — Modal de Edição e Prévia de Atalhos & Procedimentos

> **Número do PRD**: PRD-SHORTCUTS-MODAL-001  
> **Data**: 2026-08-18  
> **Status**: Em Revisão  
> **Agentes Responsáveis**: Frontend Developer · Product Manager · QA Engineer  

---

## 1. Visão Geral

A tela de **Atalhos e Procedimentos** (`/admin/shortcuts`) exibe atualmente um layout de duas colunas: à esquerda a biblioteca de atalhos cadastrados e à direita um formulário inline de criação/edição (`shortcut-form-card`). Ao clicar em "Editar" em um atalho da lista, o formulário da direita é populado com os dados daquele atalho — substituindo o formulário de criação.

Este PRD especifica a **reestruturação da UX de edição** para um padrão mais limpo e consistente com o restante da aplicação:

1. **Edição via Modal**: Ao clicar em "Editar", abrir um **modal de edição** (`Dialog`) seguindo o mesmo padrão visual dos `ConfirmationDialog` e `Dialog` já existentes no design system.
2. **Coluna direita como Prévia**: O card à direita, que antes servia de formulário de edição, passa a ser um **painel de prévia dinâmica** — exibindo a mensagem formatada do atalho selecionado (com variáveis resolvidas ou destacadas visualmente).

---

## 2. Problema / Motivação

| Problema Atual | Impacto |
|---|---|
| Clicar em "Editar" substitui o formulário de criação pelo de edição **silenciosamente** — confunde o usuário sobre o estado da tela | UX confusa; usuário perde o contexto do que estava criando |
| Não há distinção visual clara entre "criar novo" e "editar existente" | Erros operacionais (salva dados incorretos no atalho errado) |
| A coluna direita fica **vazia ou ociosa** quando nenhum atalho está selecionado | Desperdício de espaço visual |
| Sem prévia da mensagem formatada antes de salvar | O usuário não sabe como a mensagem será enviada no WhatsApp |

---

## 3. Objetivos

1. Separar **criação** (formulário inline permanente na coluna direita) de **edição** (modal contextual).
2. Tornar o **painel direito um espaço de prévia dinâmica** do atalho selecionado ou do formulário de criação em andamento.
3. Manter total consistência visual com o design system existente (`Dialog`, `AlertDialog`, `ConfirmationDialog`).
4. Não introduzir novos endpoints de API — esta é uma mudança **exclusivamente de frontend**.

---

## 4. Comportamento Atual vs. Comportamento Esperado

### 4.1. Fluxo de Edição

| Estado | Comportamento Atual | Comportamento Esperado |
|---|---|---|
| Usuário clica em "Editar" em um card | O formulário da direita é preenchido com dados do atalho e o título muda para "Editar atalho" | Abre um `Dialog` com o formulário de edição preenchido |
| Usuário edita e clica em "Salvar alterações" | Exibe `ConfirmationDialog` → salva → fecha | Dentro do modal: exibe `ConfirmationDialog` → salva → fecha o modal |
| Usuário clica em "Cancelar" ou fecha o modal | Limpa o formulário | Fecha o modal sem alterar nada |
| Usuário clica em "Configurar saudação" / "Editar saudação" no banner de sistema | Preenche o formulário na direita | Abre o mesmo modal de edição |

### 4.2. Coluna Direita (Painel de Prévia)

| Estado | Comportamento Atual | Comportamento Esperado |
|---|---|---|
| Nenhum atalho selecionado, formulário em branco | Formulário vazio com título "Novo atalho" | Prévia em branco com placeholder ilustrativo |
| Usuário digita no formulário de criação | (sem prévia) | Painel direito atualiza a prévia em tempo real |
| Usuário clica em um atalho da lista (sem editar) | Preenche o formulário da direita | Painel direito exibe a prévia formatada do atalho selecionado |

---

## 5. Requisitos Funcionais

### RF-01 — Modal de Edição (`ShortcutEditModal`)

- O modal deve usar os primitivos `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` do design system existente em `@/components/ui/dialog.tsx`.
- O modal deve ter **largura maior** que o padrão `sm:max-w-sm` — usar `sm:max-w-2xl` para acomodar o formulário completo.
- O modal deve conter **todos os campos do formulário atual**: Título, Mensagem, botões de variável, Tipo, Escopo, Departamento (condicional) e Ordem.
- O rodapé do modal deve conter:
  - Botão **"Cancelar"** (`variant="outline"`) — fecha sem salvar.
  - Botão **"Salvar alterações"** (`variant="default"`) — dispara o `ConfirmationDialog` antes de salvar (padrão já existente).
- O modal deve ser acionado exclusivamente pelos botões "Editar" nos cards da lista e pelos botões de configuração no banner de mensagens de sistema.
- Ao fechar o modal (Cancelar, ESC ou clique no overlay), o estado do formulário de edição deve ser **descartado**.
- O modal **não afeta** o formulário de criação da coluna direita — são estados independentes.

**Critério de aceite**: Clicar em "Editar" em qualquer atalho abre o modal com os dados preenchidos; fechar o modal não altera o formulário de criação nem a lista.

### RF-02 — Painel de Prévia (`ShortcutPreviewPanel`)

O painel ocupa o espaço da coluna direita onde antes ficava o `shortcut-form-card` de edição. O painel tem **duas seções**:

#### Seção Superior — Formulário de Criação
- O formulário de **criação de novo atalho** permanece na coluna direita, imutável.
- Ao digitar no formulário de criação, a seção de prévia abaixo atualiza em tempo real.

#### Seção Inferior — Prévia da Mensagem
- Exibe a mensagem do formulário de criação (se houver texto) **ou** do último atalho clicado na lista (para visualização rápida sem editar).
- A prévia deve simular o visual de uma **bolha de mensagem WhatsApp** usando o componente `Bubble` do design system (já existente em `@/components/ui/bubble.tsx`).
- Variáveis no formato `{variableName}` devem ser exibidas como **badges de destaque** dentro da prévia (ex: `{agentName}` → badge azul com o texto "agentName").
- Se a mensagem estiver vazia, exibir um estado vazio com ícone e texto explicativo: *"A prévia da sua mensagem aparecerá aqui enquanto você digita."*
- Exibir abaixo da bolha os metadados do atalho: Tipo, Escopo, Departamento (se aplicável) e Ordem.

**Critério de aceite**: Ao digitar no campo "Mensagem" do formulário de criação, a bolha de prévia atualiza instantaneamente. Ao clicar em um card da lista (sem abrir edição), a bolha de prévia reflete aquele atalho.

### RF-03 — Seleção de Atalho para Prévia (sem editar)

- Ao **clicar em qualquer área do card** (exceto os botões de ação), o painel de prévia deve exibir a mensagem daquele atalho.
- O card selecionado deve receber destaque visual sutil (borda ou fundo levemente diferente).
- Clicar no mesmo card selecionado o **deseleciona** (toggle), voltando ao estado de prévia do formulário de criação.

**Critério de aceite**: Clicar em um card da lista sem tocar nos botões atualiza a prévia sem abrir o modal.

### RF-04 — Consistência com Mensagens de Sistema

- Os botões do banner de mensagens de sistema ("Editar saudação", "Configurar saudação", etc.) também devem abrir o **mesmo modal de edição** em vez de preencher o formulário da coluna direita.
- A lógica de `setupSystemGreeting`, `setupSystemClosing` e `setupSystemInactivityClosing` deve ser refatorada para acionar o modal.

---

## 6. Especificação de UX — Modal de Edição

```
┌─────────────────────────────────────────────────────────────┐
│  ✏️ Editar atalho                                      [✕]  │
│  A mensagem será inserida no chat sem envio automático.      │
├─────────────────────────────────────────────────────────────┤
│  Título                                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Saudação para primeiro contato                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Mensagem                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Olá, {contactName}! Meu nome é {agentName}...       │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  + {agentName}  + {contactName}  + {departmentName}         │
│  123/4000 caracteres                                         │
│                                                              │
│  Tipo           Escopo                                       │
│  ┌──────────┐   ┌──────────┐                               │
│  │ Saudação │   │  Global  │                               │
│  └──────────┘   └──────────┘                               │
│                                                              │
│  Ordem de exibição                                           │
│  ┌────────┐                                                  │
│  │   0    │                                                  │
│  └────────┘                                                  │
├─────────────────────────────────────────────────────────────┤
│  [Cancelar]                          [Salvar alterações →]  │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Especificação de UX — Painel de Prévia

```
┌─────────────────────────────────────────────────────────────┐
│  ─── FORMULÁRIO DE CRIAÇÃO (permanente) ──────────────────  │
│  Novo atalho                                                 │
│  A mensagem será inserida no chat sem envio automático.      │
│  [campos do formulário de criação]                           │
│  [Limpar] [Criar atalho]                                     │
├─────────────────────────────────────────────────────────────┤
│  ─── PRÉVIA DA MENSAGEM ──────────────────────────────────  │
│                                                              │
│  ┌─ Prévia — como aparecerá no WhatsApp ───────────────┐   │
│  │                                                      │   │
│  │         ┌─────────────────────────────────────┐     │   │
│  │         │ Olá, [contactName]! Meu nome é      │     │   │
│  │         │ [agentName], sou da equipe           │     │   │
│  │         │ [departmentName] e assumi...         │     │   │
│  │         └─────────────────────────────────────┘     │   │
│  │                                              12:34   │   │
│  │                                                      │   │
│  │  Tipo: Saudação · Escopo: Global · Ordem: 0         │   │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Componentes a Criar / Modificar

### 8.1. Novos Componentes

| Componente | Localização | Descrição |
|---|---|---|
| `ShortcutEditModal` | `pages/admin/shortcuts/components/ShortcutEditModal.tsx` | Modal de edição completo usando `Dialog` do design system |
| `ShortcutPreviewPanel` | `pages/admin/shortcuts/components/ShortcutPreviewPanel.tsx` | Painel de prévia com bolha WhatsApp e metadados |
| `VariableBadge` | `pages/admin/shortcuts/components/VariableBadge.tsx` | Badge inline para destacar variáveis `{varName}` na prévia |

### 8.2. Componentes Modificados

| Componente | Arquivo | Mudança |
|---|---|---|
| `ShortcutsAdmin` | `pages/admin/shortcuts/index.tsx` | Remover lógica de edição do formulário inline; adicionar state `editTarget`; separar state de criação e edição; adicionar clique no card para prévia; invocar `ShortcutEditModal` e `ShortcutPreviewPanel` |

### 8.3. Componentes Reutilizados (sem modificação)

| Componente | Uso |
|---|---|
| `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` | Estrutura do modal de edição |
| `ConfirmationDialog` | Confirmação antes de salvar dentro do modal |
| `Bubble` | Bolha de mensagem na prévia |
| `Button`, `Input`, `Textarea`, `Select`, `Badge` | Campos do formulário no modal |

---

## 9. Gestão de Estado

### Estado Atual (a ser refatorado)

```typescript
// ANTES — state único para criação e edição
const [selected, setSelected] = useState<Shortcut | null>(null);
const [form, setForm] = useState({ ...blank });
// edit() popula `form` com os dados do atalho selecionado
```

### Estado Proposto

```typescript
// DEPOIS — states independentes
const [createForm, setCreateForm] = useState({ ...blank }); // formulário de criação (coluna direita)
const [editTarget, setEditTarget] = useState<Shortcut | null>(null); // atalho sendo editado no modal
const [editForm, setEditForm] = useState({ ...blank }); // form dentro do modal
const [previewSource, setPreviewSource] = useState<"form" | Shortcut>("form"); // o que a prévia exibe
```

**Regras de transição:**
- `edit(item)` → define `editTarget = item`, `editForm = { ...item }`, abre o modal.
- Fechar o modal → `editTarget = null`, `editForm = blank`, sem afetar `createForm`.
- Clicar no card (área não-botão) → `previewSource = item` (toggle: se já selecionado, volta para `"form"`).
- Digitar em `createForm` → `previewSource = "form"` automaticamente.

---

## 10. Mapeamento de Agentes Responsáveis

| Agente | Responsabilidade |
|---|---|
| 🟣 [`frontend-developer`](../agents/frontend-developer.agent.md) | Implementação completa — criar `ShortcutEditModal`, `ShortcutPreviewPanel`, `VariableBadge`; refatorar `ShortcutsAdmin` separando states de criação e edição; integrar `Dialog` do design system; lógica de prévia dinâmica com variáveis destacadas |
| 🔴 [`product-manager`](../agents/product-manager.agent.md) | Validação da UX proposta, critérios de aceite, texto dos placeholders e mensagens vazias |
| 🟡 [`qa-testing-engineer`](../agents/qa-testing-engineer.agent.md) | Cenários de teste: editar sem afetar criação, prévia em tempo real, modal com ESC/overlay, sistema de mensagens de sistema, regressão de criação/arquivamento |

---

## 11. Critérios de Aceite Detalhados

### CA-01 — Modal de Edição
- [x] Clicar em "Editar" em qualquer card abre o modal com os dados do atalho preenchidos
- [x] Fechar o modal (ESC, overlay, botão ✕ ou "Cancelar") não salva nem altera nada
- [x] "Salvar alterações" dentro do modal exibe `ConfirmationDialog` antes de salvar
- [x] Após salvar, o modal fecha automaticamente e a lista é atualizada
- [x] O formulário de criação na coluna direita **não é afetado** ao abrir/fechar o modal
- [x] Botões de sistema ("Editar saudação", etc.) também abrem o modal

### CA-02 — Painel de Prévia
- [x] Digitar no campo "Mensagem" atualiza a bolha de prévia sem delay perceptível
- [x] Variáveis `{agentName}`, `{contactName}`, `{departmentName}` aparecem como badges na bolha
- [x] Clicar em um card da lista exibe a prévia daquele atalho (sem abrir o modal)
- [x] Clicar no mesmo card novamente deseleciona e volta para a prévia do formulário de criação
- [x] Estado vazio exibe placeholder com ícone explicativo
- [x] Metadados (Tipo, Escopo, Ordem) aparecem abaixo da bolha na prévia

### CA-03 — Regressão
- [x] Criar novo atalho continua funcionando normalmente
- [x] Arquivar atalho continua funcionando normalmente
- [x] Ativar/Desativar atalho continua funcionando normalmente
- [x] Filtros da lista continuam funcionando
- [x] Mensagens de sistema (saudação, encerramento, inatividade) continuam configuráveis

---

## 12. Arquivos a Criar / Modificar

| Ação | Arquivo |
|---|---|
| `NEW` | `frontend/src/pages/admin/shortcuts/components/ShortcutEditModal.tsx` |
| `NEW` | `frontend/src/pages/admin/shortcuts/components/ShortcutPreviewPanel.tsx` |
| `NEW` | `frontend/src/pages/admin/shortcuts/components/VariableBadge.tsx` |
| `MODIFY` | `frontend/src/pages/admin/shortcuts/index.tsx` |

> **Sem mudanças no backend.** Nenhum endpoint novo ou modificado é necessário.

---

## 13. Considerações de Acessibilidade

- O `Dialog` deve gerenciar o **foco** automaticamente ao abrir (o `@base-ui/react/dialog` já faz isso).
- Ao fechar o modal, o foco deve retornar ao botão "Editar" que o acionou.
- O modal deve ter `aria-labelledby` apontando para o `DialogTitle`.
- A bolha de prévia deve ter `aria-label="Prévia da mensagem"` para leitores de tela.
- Os badges de variável devem ter `title` com a descrição da variável (ex: `title="Nome do atendente"`).

---

## 14. Notas de Implementação para o Frontend Developer

### Parsing de Variáveis para Prévia

```typescript
// Exemplo de função para renderizar preview com badges
function renderMessagePreview(message: string): React.ReactNode[] {
  // Divide a string em partes: texto normal e variáveis {varName}
  const parts = message.split(/(\{[a-zA-Z]+\})/g);
  return parts.map((part, index) => {
    const match = part.match(/^\{([a-zA-Z]+)\}$/);
    if (match) {
      return <VariableBadge key={index} name={match[1]} />;
    }
    return <span key={index}>{part}</span>;
  });
}
```

### Largura do Modal

O modal de edição deve usar a classe `sm:max-w-2xl` em vez do padrão `sm:max-w-sm` do `DialogContent`. A prop `className` já é aceita pelo componente:

```tsx
<DialogContent className="sm:max-w-2xl">
```

### Separação de States

A função `edit(item)` atual popula o mesmo state do formulário. Após a refatoração:

```typescript
// Abrir modal de edição
const openEdit = (item: Shortcut) => {
  setEditTarget(item);
  setEditForm({ title: item.title, message: item.message, ... });
};

// Fechar modal sem salvar
const closeEdit = () => {
  setEditTarget(null);
};
```

O formulário de criação `createForm` nunca é tocado por `openEdit`/`closeEdit`.
