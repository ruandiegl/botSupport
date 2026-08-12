# Design System e Padrões Visuais (GTF-Bot)

Este documento define os padrões visuais, paleta de cores, tipografia e diretrizes de UI do sistema **GTF-Bot**.

---

## 1. Visão Geral Visual

O GTF-Bot utiliza um tema moderno, limpo e voltado para eficiência operacional em ambientes de suporte técnico e T.I.

- **Estilo Base**: Dark Mode elegante com acentos vibrantes em Azul/Ciano e destaques em Esmeralda (Online/Sucesso) e Âmbar (Aguardando/Fila).
- **Framework Visual**: Tailwind CSS v4 com `tw-animate-css` e ícones `lucide-react`.

---

## 2. Paleta de Cores e Tokens Visuais

A paleta oficial baseia-se na documentação [`paleta.md`](paleta.md):

| Categoria | Hex Code | Aplicação de UI |
| :--- | :--- | :--- |
| **Primary Accent** | `#00F0FF` / `#0066FF` | Botões primários, links ativos, badges de destaque |
| **Background Dark** | `#090D16` / `#0D111D` | Fundo principal da aplicação e painéis lateis |
| **Surface Dark** | `#161B26` / `#1E2638` | Cards de conversa, modais, headers de tabelas |
| **Border Dark** | `#262F45` / `#334155` | Divisores, bordas de cards e inputs |
| **Success / Online** | `#10B981` (Emerald-500) | Indicador de atendente Online, conversa resolvida |
| **Warning / Fila** | `#F59E0B` (Amber-500) | Status `QUEUED` (Conversa na Fila), chamados pendentes |
| **Info / Bot** | `#8B5CF6` (Violet-500) | Status `BOT` (Conversa em atendimento automatizado) |
| **Text Primary** | `#F8FAFC` (Slate-50) | Títulos, textos principais, nomes de contatos |
| **Text Secondary** | `#94A3B8` (Slate-400) | Horários, trechos de última mensagem, legendas |

---

## 3. Status de Atendimento (Badges e Indicadores)

Para garantir clareza visual instantânea aos atendentes de suporte, as conversas possuem badges padronizadas:

- **Na Fila (`QUEUED`)**:
  - Badge: Fundo `amber-500/10`, Texto `amber-400`, Borda `amber-500/20`
  - Ícone: `Clock`
- **Em Atendimento (`IN_PROGRESS`)**:
  - Badge: Fundo `emerald-500/10`, Texto `emerald-400`, Borda `emerald-500/20`
  - Ícone: `UserCheck`
- **No Bot (`BOT`)**:
  - Badge: Fundo `violet-500/10`, Texto `violet-400`, Borda `violet-500/20`
  - Ícone: `Bot`
- **Encerrada (`CLOSED`)**:
  - Badge: Fundo `slate-500/10`, Texto `slate-400`, Borda `slate-500/20`
  - Ícone: `CheckCircle2`

---

## 4. Tipografia e Espaçamento

- **Fonte**: Inter / system-ui, sans-serif.
- **Hierarquia Visual**:
  - `h1`: `text-2xl font-bold tracking-tight text-slate-50`
  - `h2`: `text-lg font-semibold text-slate-100`
  - `body`: `text-sm text-slate-300 leading-relaxed`
  - `caption`: `text-xs text-slate-400`
- **Espaçamento**: Base 4px (`p-2`, `p-4`, `p-6`, `gap-3`, `gap-4`).

---

## 5. Diretrizes de Componentes de UI

1. **Responsividade**: Todos os painéis de atendimento (ex: Lista de Conversas vs Detalhes do Chat) devem se adaptar de layouts de 2/3 colunas no Desktop para drawer/tabs no Mobile.
2. **Estados nulos e de carregamento**: Exibir skeletons ou spinners (`lucide-react Loader2`) durante requisições de backend, e estados vazios amigáveis quando a fila estiver limpa.
3. **Animações Fluidas**: Transições suaves com Framer Motion ou utilitários CSS para troca de tabs e abertura de gavetas laterais.

---

## 6. Confirmações de ações críticas

- A paleta operacional clara de `docs/paleta.md` prevalece para novos componentes: superfície branca opaca, borda neutra e primária `#2D89C8`.
- Confirmações devem usar o `ConfirmationDialog`, composto sobre o `AlertDialog` do shadcn/ui. Formulários continuam usando `Dialog`.
- Use `warning` para criar, editar, publicar, ativar/desativar, assumir atendimento, alterar credenciais, permissões ou sessão.
- Use `danger` para excluir, arquivar, desconectar integrações e encerrar chamados.
- O botão de confirmação deve informar a ação concreta, por exemplo `Excluir departamento`; não usar apenas `Confirmar`.
- A mutação só pode ser disparada pelo botão de confirmação. Cancelamento nunca chama a API.
- Durante a requisição, desabilite os controles e componha o botão com `Spinner`. Em erro, mantenha o modal e o rascunho abertos.
- Todo diálogo deve possuir título e descrição acessíveis, restaurar foco ao acionador e oferecer operação por teclado.
- Não empilhe diálogos. Formulários complexos devem avançar para uma etapa interna de revisão antes da persistência.
- Senhas, tokens e segredos nunca devem aparecer no resumo da confirmação.

### RBAC

- Cada linha da matriz possui um checkbox para selecionar ou limpar todas as permissões exibidas naquele recurso.
- O checkbox deve representar os estados marcado, desmarcado e indeterminado.
- A seleção altera somente o rascunho local; a persistência ocorre em `Salvar permissões`, após confirmação `warning`.

---

## 7. Editor visual do fluxo

- O mapa e o inspector usam superfícies brancas opacas, borda neutra e primária `#2D89C8`; transparência não pode comprometer legibilidade.
- Cada card exibe tipo, nome, resumo de até duas linhas e estado de validação. UUIDs e chaves técnicas não são apresentados como rótulo principal.
- O arraste começa somente pelo handle. Inputs, textareas e selects preservam foco; Backspace nunca inicia drag nem seleciona o card.
- Durante o arraste, os demais cards cedem espaço e um placeholder mostra a posição final, com `DragOverlay` e auto-scroll.
- A mesma operação deve existir por teclado e pelas ações “Mover para cima” e “Mover para baixo”. Mudanças de posição são anunciadas em uma live region.
- Erros marcam card e campo, e a ação de publicar leva foco ao primeiro erro.
- O preview WhatsApp preserva quebras de linha e apresenta o ramo selecionado sem executar envios.
- Publicação usa confirmação `warning`; exclusão de nó/rota usa `danger`. Em falha, o modal e o rascunho permanecem abertos.
- No mobile, o inspector abre em `Sheet`; mapa e painéis não podem causar rolagem horizontal da aplicação.
