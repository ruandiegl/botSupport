# Plan 003: CRUD Dinâmico do Fluxo do Bot com Mapa Interativo

> **Status:** Pendente de aprovação
> **Data:** 2026-08-11
> **Repositório:** `c:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`
> **Referência visual:** Imagem de referência enviada pelo usuário (layout split: Mapa da conversa + Editor contextual)

---

## 1. Objetivo

Transformar a tela de **Fluxo do Bot** (`/admin/flow`) de uma visualização estática/rígida para uma interface interativa com CRUD completo, permitindo que o administrador:

1. **Selecione nós no mapa da conversa** (Boas-vindas, Menu Principal, Rotas) para editar suas mensagens no painel lateral.
2. **Adicione e remova rotas** dinamicamente (botão `+ Adicionar rota`).
3. **Visualize uma prévia da mensagem no WhatsApp** ao editar a saudação.
4. **Publique alterações** com feedback visual de rascunho vs. publicado.
5. **Veja o mapa refletindo em tempo real** cada edição feita no painel de formulário.

---

## 2. Análise do Estado Atual

### O que existe hoje

| Camada | Arquivo | Estado |
|---|---|---|
| **Prisma** | `schema.prisma` → `FlowDefinition` | Model com `name`, `greeting`, `menuMessage`, `options` (Json) e `updatedAt` |
| **Backend** | `flow.routes.ts` | `GET /flow` e `PUT /flow` com auth + permission |
| **Backend** | `flow.controller.ts` | GET retorna o flow mais recente; PUT valida com Zod e faz upsert |
| **Backend** | `flow.service.ts` | `getLatest()` e `update()` delegando para repository |
| **Backend** | `flow.repository.ts` | `findLatest()` e `upsert()` no Prisma |
| **Backend** | `flow.schemas.ts` | `UpdateFlowBodySchema` com validação de `name`, `greeting`, `menuMessage`, `options[]` |
| **Frontend** | `pages/admin/flow/index.tsx` | Layout em `admin-grid` 2 colunas: mapa estático (esquerda) + formulário simples (direita) |
| **Frontend** | `hooks/use-flow.ts` | `useGetFlow`, `useListDepartments`, `useUpdateFlow` |
| **CSS** | `styles.css` | Classes `.flow-canvas`, `.flow-node`, `.flow-node-head`, `.flow-arrow`, `.option-row` |

### Problemas identificados

1. **Mapa não é interativo**: Os nós do mapa são apenas visuais — não são clicáveis.
2. **Sem seleção contextual**: O formulário de edição (coluna direita) mostra TODOS os campos ao mesmo tempo em vez de exibir o formulário do nó selecionado.
3. **Sem adicionar/remover rotas**: As opções de roteamento são fixas; não há botão para criar novas rotas ou excluir existentes.
4. **Sem prévia WhatsApp**: Não existe uma visualização simulando como a mensagem aparecerá no WhatsApp.
5. **Sem indicador de rascunho**: Não diferencia claramente o estado "rascunho" do estado "publicado" no mapa.
6. **Select expondo UUIDs**: O seletor de departamento na opção de rota utiliza o componente `Select` do Base UI, que pode exibir o UUID do departamento em vez do nome legível (bug já identificado na sessão anterior).

---

## 3. Agentes Selecionados e Responsabilidades

| Agente | Arquivo | Responsabilidade nesta tarefa |
|---|---|---|
| **Tech Lead & Arquiteto** | `tech-lead-architect.agent.md` | Revisão da arquitetura e contrato de API. Garantir que o modelo `FlowDefinition` do Prisma suporta as necessidades sem migração. |
| **Frontend Developer** | `frontend-developer.agent.md` | Reconstrução completa da tela `flow/index.tsx` com mapa interativo, seleção de nó, formulário contextual, prévia WhatsApp e botão de adicionar/remover rotas. |
| **Backend Developer** | `backend-developer.agent.md` | Ajustes no schema Zod para validação de rotas opcionais/vazias e tratamento de erros mais robusto no controller. |
| **QA Testing Engineer** | `qa-testing-engineer.agent.md` | Validação de cenários de borda (0 rotas, rota sem departamento, nome vazio) e build final. |

**Sequência:** Tech Lead → Frontend + Backend em paralelo → QA

---

## 4. Design de Referência (Baseado na Imagem do Usuário)

### Layout Geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ADMINISTRAÇÃO / AUTOMAÇÃO                         [✓ Publicar]        │
│  Fluxo do bot                                                          │
│  Configure a conversa automática antes de chegar à equipe.             │
├────────────────────────┬────────────────────────────────────────────────┤
│                        │                                                │
│  🗺 Mapa da conversa   │  ✏ Editar: [Nome do nó selecionado]           │
│  rascunho              │                                                │
│  ─────────────────     │  NOME DO FLUXO                                │
│                        │  [Atendimento Suporte TI - Grupo GTF]         │
│  ┌──────────────────┐  │                                                │
│  │ Boas-vindas      │  │  MENSAGEM DE SAUDAÇÃO                        │
│  │      ENTRADA     │←──  Primeira mensagem enviada ao cliente.        │
│  │ "Olá, voce..."   │  │  [Olá, voce esta falando com Suporte...]     │
│  └──────────────────┘  │                                                │
│          ↓             │  ┌─ PRÉVIA NO WHATSAPP ──────────────────┐    │
│  ┌──────────────────┐  │  │ Olá, voce esta falando com Suporte    │    │
│  │ Menu principal   │  │  │ TI - Grupo GTF! Qual sua              │    │
│  │     DECISÃO      │  │  │ necessidade?                          │    │
│  │ "Para darmos..." │  │  │                                       │    │
│  └──────────────────┘  │  │ Nos do Grupo GTF temos o prazer de    │    │
│          ↓             │  │ atende-lo(a).                         │    │
│  ┌──────────────────┐  │  └───────────────────────────────────────┘    │
│  │ Suporte  ROTA 1  │  │                                                │
│  │ "Voce selecionou │  │                                                │
│  │  equipe Suporte" │  │                                                │
│  └──────────────────┘  │                                                │
│          ↓             │                                                │
│  ┌──────────────────┐  │                                                │
│  │ Rede/Int. ROTA 2 │  │                                                │
│  └──────────────────┘  │                                                │
│          ↓             │                                                │
│  ┌──────────────────┐  │                                                │
│  │ Áudio/Vd  ROTA 3 │  │                                                │
│  └──────────────────┘  │                                                │
│                        │                                                │
│  [+ Adicionar rota]    │                                                │
│                        │                                                │
└────────────────────────┴────────────────────────────────────────────────┘
```

### Comportamento de seleção de nó

Ao clicar em um nó do mapa (esquerda), o painel direito exibe o formulário correspondente:

| Nó selecionado | Campos exibidos no editor |
|---|---|
| **Boas-vindas** (Entrada) | `Nome do Fluxo` + `Mensagem de Saudação` (textarea) + **Prévia no WhatsApp** (balão com saudação) |
| **Menu principal** (Decisão) | `Mensagem do Menu` (textarea) + **Edição dos Botões do WhatsApp** (lista editável dos labels de cada rota: "Suporte", "Rede / Internet", "Áudio / Vídeo") + **Prévia completa no WhatsApp** (mensagem do menu + botões clicáveis abaixo) |
| **Rota N** (Suporte, Rede, etc.) | `Nome da Rota / Botão` (input — este é o texto que aparece como botão no WhatsApp) + `Departamento` (select nativo) + `Mensagem de encaminhamento` (textarea — mensagem enviada ao cliente após selecionar) + botão `Excluir Rota` |

---

## 5. Plano de Execução Detalhado

### Fase 1 — Backend: Ajustes de validação e resiliência

#### [MODIFY] `backend/src/modules/flow/flow.schemas.ts`
- Permitir `options` vazio (`z.array(...).min(0)`) para fluxos recém-criados.
- Adicionar `procedureMessage` como opcional com default `""` para compatibilidade.

#### [MODIFY] `backend/src/modules/flow/flow.controller.ts`
- Melhorar o tratamento de erro do Zod para retornar mensagens de campo específicas.

### Fase 2 — Frontend: Reconstrução da tela de Fluxo do Bot

#### [MODIFY] `frontend/src/pages/admin/flow/index.tsx`
Reconstrução completa com os seguintes requisitos:

1. **Estado de seleção de nó** (`selectedNode`):
   - `"greeting"` → Editor de Boas-vindas
   - `"menu"` → Editor de Menu Principal
   - `"option-{index}"` → Editor de Rota N

2. **Coluna esquerda — Mapa da Conversa**:
   - Cada nó é um `<div>` clicável com classe `flow-node` + `selected` quando ativo.
   - Nó selecionado recebe borda de destaque (ex: `border-left: 3px solid #2D89C8` ou `#00f0ff`).
   - Badge de tipo no canto superior direito: `ENTRADA`, `DECISÃO`, `ROTA N`.
   - Trecho truncado do conteúdo do nó como preview (máximo 2 linhas com ellipsis).
   - Indicador `rascunho` no header do painel quando há alterações não publicadas.
   - Botão `+ Adicionar rota` no final da lista de nós.

3. **Coluna direita — Editor Contextual**:
   - Título dinâmico: `✏ Editar: [Nome do nó]` (ex: "Editar: Boas-vindas", "Editar: Suporte").
   - Quando nó = `"greeting"`:
     - Campo `Nome do Fluxo` (input).
     - Campo `Mensagem de Saudação` (textarea).
     - **Card de prévia WhatsApp**: fundo branco/blue com bordas arredondadas simulando um balão de chat, exibindo o texto da saudação em tempo real.
   - Quando nó = `"menu"`:
      - Campo `Mensagem do Menu` (textarea) — ex: "Escolha uma equipe para iniciar o atendimento:".
      - **Edição dos botões do WhatsApp**: lista editável com o label de cada rota. Cada label possui um input inline que permite renomear o texto do botão (ex: "Suporte" → "Suporte Geral"). A ordem dos botões segue a ordem das rotas.
      - **Prévia completa no WhatsApp**: card visual que simula a conversa completa do bot, incluindo a mensagem do menu e os botões clicáveis abaixo (como na screenshot do WhatsApp fornecida pelo usuário).
   - Quando nó = `"option-{i}"`:
      - Campo `Nome da Rota / Texto do Botão` (input) — este é o mesmo texto que aparece como botão na conversa do WhatsApp.
      - Campo `Departamento` (**`<select>` nativo** — para evitar o bug de UUID do componente Select Base UI).
     - Campo `Mensagem de encaminhamento` (textarea).
     - Botão `Excluir esta rota` com confirmação.

4. **Botão de publicação** (`Publicar alterações`):
   - Desabilitado quando não há rascunho.
   - Ao salvar com sucesso, limpa o estado de draft e exibe toast de confirmação.

5. **Adicionar rota**:
   - Adiciona uma nova entrada ao array `options` com label, departmentId e procedureMessage vazios.
   - Seleciona automaticamente o novo nó.

6. **Remover rota**:
   - Confirmação via `window.confirm()`.
   - Remove do array `options` e seleciona o nó anterior ou "greeting".

#### [MODIFY] `frontend/src/pages/admin/flow/hooks/use-flow.ts`
- Sem mudanças estruturais necessárias (os hooks atuais já suportam GET/PUT).

### Fase 3 — Estilos CSS

#### [MODIFY] `frontend/src/styles.css`
Adicionar/ajustar:
- `.flow-node.selected` → borda de destaque com glow (box-shadow cyan).
- `.flow-node:hover` → cursor pointer + leve elevação.
- `.whatsapp-preview` → card com fundo branco, bordas arredondadas, sombra sutil e texto escuro simulando um balão de WhatsApp.
- `.whatsapp-preview-header` → rótulo "PRÉVIA NO WHATSAPP" em uppercase.
- `.flow-add-route` → botão com borda tracejada, estilo de adição.

---

## 6. Arquivos Impactados (Resumo)

| Ação | Arquivo |
|---|---|
| **[MODIFY]** | `backend/src/modules/flow/flow.schemas.ts` |
| **[MODIFY]** | `backend/src/modules/flow/flow.controller.ts` |
| **[MODIFY]** | `frontend/src/pages/admin/flow/index.tsx` |
| **[MODIFY]** | `frontend/src/styles.css` |

> **Nota:** Nenhum arquivo novo é criado. Nenhuma migração de banco é necessária (o campo `options` já é `Json` no Prisma e suporta arrays dinâmicos).

---

## 7. Critérios de Aceite

- [ ] Ao clicar em um nó do mapa (Boas-vindas, Menu, Rota), o painel direito exibe o formulário correspondente.
- [ ] Edições no formulário refletem imediatamente no texto do nó do mapa (tempo real).
- [ ] O botão `+ Adicionar rota` cria uma nova rota vazia e seleciona-a para edição.
- [ ] O botão `Excluir rota` remove a rota e atualiza o mapa.
- [ ] A seleção de departamento na rota exibe o nome legível (nunca o UUID).
- [ ] A prévia do WhatsApp mostra a mensagem de saudação formatada como balão de chat.
- [ ] O indicador `rascunho` aparece quando há alterações não publicadas.
- [ ] O botão `Publicar alterações` salva via `PUT /api/flow` e limpa o rascunho.
- [ ] `npm run build` compila sem erros (frontend e backend).

---

## 8. Verificação Final

### Build
```bash
cmd /c "npm run build"   # em frontend/
cmd /c "npm run build"   # em backend/
```

### Validação Visual
- Abrir `/admin/flow` no navegador.
- Verificar que o layout split está correto.
- Clicar em cada nó e verificar que o editor muda.
- Adicionar e remover uma rota.
- Editar a saudação e verificar a prévia.
- Publicar e confirmar que o rascunho é limpo.
