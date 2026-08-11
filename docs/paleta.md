# Paleta de Cores e Padrões Visuais (GTF-Bot)

Esta documentação especifica a paleta de cores oficial, tokens visuais e convenções de estilo do **GTF-Bot**, o sistema inteligente de gestão de atendimento via WhatsApp da Torre Forte.

---

## 1. Visão Geral do Tema Visual

O GTF-Bot adota uma interface **Operations Light / Editorial Clean**: uma área de trabalho clara, fria e silenciosa, combinada com navegação lateral navy. A composição prioriza legibilidade, alta densidade de informação e reconhecimento rápido dos estados operacionais.

---

## 2. Tabela Oficial de Cores e Tokens Visuais

| Categoria Token | Hex Code | HSL Representation | Aplicação no Sistema / UI |
| :--- | :--- | :--- | :--- |
| **Background** | `#F4F7FA` | `hsl(210, 29%, 97%)` | Fundo principal das páginas |
| **Sidebar Navy** | `#1A2B3D` | `hsl(211, 39%, 17%)` | Navegação lateral fixa |
| **Sidebar Active** | `#214566` | `hsl(208, 51%, 26%)` | Item ativo e hover destacado na navegação |
| **Surface / Card** | `#FFFFFF` | `hsl(0, 0%, 100%)` | Cards, tabelas, modais, topbar e composer |
| **Surface Muted** | `#EAF0F5` | `hsl(210, 29%, 94%)` | Chips, hovers, áreas secundárias e inputs auxiliares |
| **Border** | `#D8E1EA` | `hsl(210, 24%, 88%)` | Divisores, cards, tabelas e inputs |
| **Primary Blue** | `#2D89C8` | `hsl(205, 63%, 48%)` | CTAs, links, seleção de conversa e foco |
| **Primary Hover** | `#2478B3` | `hsl(205, 66%, 42%)` | Hover de botões e ações primárias |
| **Success / Online** | `#2C9D7B` | `hsl(162, 56%, 39%)` | Atendente online e conversa em atendimento |
| **Warning / Fila** | `#E9664D` | `hsl(10, 78%, 61%)` | Contatos aguardando atendimento |
| **Info / Bot** | `#7088A8` | `hsl(214, 25%, 55%)` | Atendimento automatizado e informação neutra |
| **Text Primary** | `#0D1B2E` | `hsl(213, 56%, 12%)` | Títulos, nomes e dados em destaque |
| **Text Secondary** | `#687F96` | `hsl(211, 18%, 49%)` | Descrições, legendas, rótulos e horários |

---

## 3. Status de Atendimento (Badges e Indicadores)

Para identificação visual instantânea pelos atendentes de suporte:

| Status | Hex Cor | Background CSS | Ícone Lucide | Significado Operacional |
| :--- | :--- | :--- | :--- | :--- |
| **Na Fila (`QUEUED`)** | `#E9664D` | `rgba(233, 102, 77, 0.12)` | `Clock` | Cliente aguardando atendimento por operador humano |
| **Em Atendimento (`IN_PROGRESS`)** | `#2C9D7B` | `rgba(44, 157, 123, 0.12)` | `UserCheck` | Conversa ativa sob responsabilidade de um atendente |
| **No Bot (`BOT`)** | `#7088A8` | `rgba(112, 136, 168, 0.12)` | `Bot` | Cliente interagindo com o robô interativo |
| **Encerrada (`CLOSED`)** | `#D69A2D` | `rgba(214, 154, 45, 0.12)` | `CheckCircle2` | Chamado finalizado e arquivado |

---

## 4. Variáveis CSS Globais (`:root`)

```css
:root {
  --background: 210 29% 97%;          /* #F4F7FA */
  --foreground: 213 56% 12%;          /* #0D1B2E */
  --card: 0 0% 100%;                  /* #FFFFFF */
  --card-foreground: 213 56% 12%;
  --sidebar: 211 39% 17%;             /* #1A2B3D */
  --sidebar-foreground: 208 38% 73%;  /* #9CB8CF */
  --sidebar-border: 211 33% 23%;      /* #273C51 */
  --border: 210 24% 88%;              /* #D8E1EA */
  --primary: 205 63% 48%;             /* #2D89C8 */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 29% 94%;           /* #EAF0F5 */
  --secondary-foreground: 213 56% 12%;
  --accent: 205 63% 48%;
  --accent-foreground: 0 0% 100%;
  --muted: 210 25% 94%;
  --muted-foreground: 211 18% 49%;    /* #687F96 */
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --input: 210 24% 88%;
  --ring: 205 63% 48%;
  --radius: 0.75rem;
}
```

---

## 5. Mapeamento de UI e Componentes

1. **Sidebar**: Fundo `#1A2B3D`, marca azul `#2D89C8`, itens inativos `#9CB8CF` e item ativo sobre `#214566`.
2. **Topbar**: Fundo branco translúcido, borda `#D8E1EA` e ações em azul-acinzentado.
3. **Balões de Chat**:
   - **Mensagens Recebidas (Cliente)**: Fundo branco, borda `#D8E1EA`, texto `#1A3044`.
   - **Mensagens Enviadas (Atendente/Bot)**: Fundo `#2D89C8` e texto branco.
4. **Tabelas & Forms**: Fundo branco, rótulos `#687F96`, divisores `#D8E1EA` e foco com anel azul translúcido.
