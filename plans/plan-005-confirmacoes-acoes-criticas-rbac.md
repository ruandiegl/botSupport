# Plano 005 — Confirmações de Ações Críticas e Seleção em Massa no RBAC

> **Status:** Planejado
> **Relacionamento:** `docs/PRD.md`, `docs/PRD_ATALHOS_PROCEDIMENTOS.md`, `docs/PRD_ZAPI.md`, `docs/ARCHITECTURE.md`, `docs/GUIDELINES.md`, `docs/DESIGN_SYSTEM.md`, `docs/paleta.md` e `docs/API.md`
> **Escopo:** Front-end, revisão dos contratos existentes e validação funcional; sem alteração de regra de negócio ou banco prevista

## Objetivo

Padronizar as confirmações de ações críticas do GTF-Bot com componentes shadcn/ui, cobrindo todos os CRUDs, logout, encerramento de chamado e alterações sensíveis. O trabalho também corrige o modal de arquivamento de atalhos e adiciona seleção de todas as permissões aplicáveis em cada linha do RBAC, preservando APIs, permissões, validações e fluxos existentes.

## Fontes de verdade e decisões

1. `docs/paleta.md` prevalece visualmente: superfícies brancas opacas, fundo claro, borda `#D8E1EA`, primária `#2D89C8` e cores destrutivas por tokens semânticos.
2. Referências escuras antigas em `DESIGN_SYSTEM.md` não devem reintroduzir a temática futurista.
3. Confirmações usarão `AlertDialog` do shadcn/ui; `Dialog` continuará reservado a formulários.
4. `warning` será usado em criação, edição, publicação, ativação e mudanças sensíveis; `danger` em exclusão, arquivamento, desconexão e encerramento.
5. Cores e variantes serão centralizadas, nunca espalhadas diretamente nas páginas.
6. Edição local, digitação e drag-and-drop não exigem confirmação. O modal aparece antes da mutação persistente ou efeito externo.
7. Busca, filtros, cópia, leitura/atualização de consulta e envio rotineiro de mensagem não recebem confirmação desnecessária.

## Agentes recomendados

### Product Manager — `agents/product-manager.agent.md`

- validar classificação de risco, linguagem e impacto por jornada;
- impedir confirmações excessivas em tarefas frequentes;
- aprovar critérios de aceite.

### Tech Lead & Architect — `agents/tech-lead-architect.agent.md`

- definir a API compartilhada e os limites entre página, hook e serviço;
- impedir lógica duplicada e modais empilhados;
- revisar aderência à arquitetura modular.

### Frontend Developer — `agents/frontend-developer.agent.md`

- implementar a fundação shadcn/ui e integrar todos os módulos;
- padronizar estados pendentes, foco, erros e responsividade;
- implementar checkbox por linha e estado indeterminado no RBAC.

### Security Engineer — `agents/security-engineer.agent.md`

- revisar RBAC, logout, credenciais Z-API e redefinição de senha;
- garantir que segredos não apareçam em resumos;
- confirmar que o backend permaneça como fonte de verdade.

### QA & Testing Engineer — `agents/qa-testing-engineer.agent.md`

- validar sucesso, cancelamento, erro, concorrência e acessibilidade;
- verificar que nenhuma mutação ocorra antes da confirmação;
- testar os perfis e permissões aplicáveis.

### Apoio condicional

- `backend-developer.agent.md`: somente se aparecer endpoint não idempotente, transição sem validação ou erro insuficiente.
- `devops-infra-engineer.agent.md`: não é primário, pois não há migração, variável de ambiente ou infraestrutura prevista.

## Arquitetura proposta

Criar `frontend/src/components/ui/confirmation-dialog.tsx`, composto sobre o `AlertDialog` oficial, com:

- `open`, `onOpenChange` e `tone: "warning" | "danger"`;
- título e descrição obrigatórios;
- contexto opcional da entidade e lista curta de impactos;
- rótulos explícitos de confirmar/cancelar;
- ícone semântico;
- `isPending`, `onConfirm` assíncrono, erro e identificador de teste.

Regras:

- card branco opaco, borda, sombra e espaçamento do design system;
- rodapé com Cancelar secundário/outline e ação principal sólida;
- foco inicial em **Cancelar** nas ações destrutivas;
- fechamento apenas após sucesso; erro mantém modal e contexto;
- bloqueio de duplo clique, restauração de foco e suporte a teclado;
- título/descrição acessíveis e rodapé responsivo.

Se `AlertDialog` não estiver instalado, adicioná-lo pelo CLI do shadcn após documentação e `dry-run`. A variante `warning` deve existir uma única vez no `Button` ou ficar encapsulada no componente.

Cada página guarda a entidade/rascunho pendente localmente. `mutate`/`mutateAsync` só é chamado em `onConfirm`; cancelar não altera dados e erros preservam o rascunho.

## Matriz de ações críticas

| Módulo | Ação | Tom | Contexto mínimo |
|---|---|---:|---|
| Shell | Sair da conta | Warning | Encerramento da sessão atual |
| Conversa | Assumir atendimento | Warning | Contato e mudança de responsável |
| Conversa | Encerrar chamado | Danger | Contato, departamento e efeito do encerramento |
| Departamentos | Criar | Warning | Nome |
| Departamentos | Salvar edição | Warning | Nome e campos alterados |
| Departamentos | Excluir | Danger | Nome e vínculos relevantes |
| Atendentes | Criar | Warning | Nome, e-mail, função e departamento |
| Atendentes | Salvar edição | Warning | Usuário e alterações |
| Atendentes | Ativar/desativar | Warning | Usuário e novo estado |
| Atendentes | Redefinir senha | Warning | Usuário e impacto no acesso |
| Atendentes | Excluir | Danger | Usuário e vínculos |
| Fluxo | Publicar fluxo | Warning | Quantidade de rotas/alterações |
| Fluxo | Excluir rota | Danger | Nome e impacto na sequência |
| Atalhos | Criar | Warning | Título, tipo e escopo |
| Atalhos | Salvar edição | Warning | Título e alterações |
| Atalhos | Ativar/desativar | Warning | Título e novo estado |
| Atalhos | Arquivar | Danger | Título e retirada da biblioteca ativa |
| Z-API | Salvar credenciais | Warning | Identificador mascarado, sem tokens |
| Z-API | Registrar webhook | Warning | URL registrada |
| Z-API | Desconectar/novo QR | Danger | Interrupção do canal |
| RBAC | Salvar permissões | Warning | Função, quantidade e módulos alterados |

## Fase 1 — Inventário e contrato visual

1. Confrontar chamadas de mutação com `docs/API.md`.
2. Catalogar `window.confirm`, `alert`, diálogos locais e ações diretas.
3. Validar cada classificação da matriz.
4. Definir textos específicos, evitando o rótulo genérico “Confirmar”.
5. Documentar o contrato do componente.

**Entregáveis:** inventário revisado, API do componente e catálogo de textos.

## Fase 2 — Fundação shadcn/ui

1. Verificar configuração e adicionar `alert-dialog`, se ausente.
2. Criar `ConfirmationDialog` sem descaracterizar os componentes oficiais.
3. Centralizar tokens/variante `warning` e reutilizar `destructive` em `danger`.
4. Implementar carregamento, erro e bloqueio de submissão.
5. Registrar o padrão em `DESIGN_SYSTEM.md` ou `GUIDELINES.md`.

## Fase 3 — Arquivamento de atalhos

1. Substituir o modal comprimido/transparente pela composição compartilhada.
2. Exibir card branco, ícone, título do atalho e impactos.
3. Padronizar o acionador do card e o botão destrutivo.
4. Informar que o atalho deixará a biblioteca ativa, respeitando a regra atual de histórico.
5. Manter modal aberto com erro em falha.

**Aceite específico:** nenhum elemento transparente; Cancelar não chama API; Arquivar executa uma vez e mostra estado pendente.

## Fase 4 — CRUDs e ações operacionais

### Departamentos

- confirmar criação e edição em `warning`;
- substituir a confirmação nativa da exclusão por `danger`;
- preservar formulário ao cancelar ou ocorrer erro.

### Atendentes

- confirmar criação, edição, ativação/desativação e redefinição de senha em `warning`;
- confirmar exclusão em `danger`;
- não empilhar modais: o formulário avança a uma revisão ou entrega o rascunho à confirmação gerenciada pela página.

### Atalhos e procedimentos

- confirmar criação, edição e ativação/desativação em `warning`;
- confirmar arquivamento em `danger`;
- exibir escopo global, departamental ou pessoal.

### Fluxo do bot

- confirmar publicação do rascunho em `warning`;
- confirmar exclusão de rota em `danger`;
- manter criação, edição, botões e reordenação como rascunho local até publicar.

### Z-API

- confirmar salvamento de credenciais e webhook em `warning`;
- confirmar desconexão/novo QR em `danger`;
- mascarar credenciais e nunca interpolar tokens no modal.

### Conversas e sessão

- confirmar assumir atendimento em `warning`;
- confirmar encerramento em `danger`;
- centralizar logout no `Shell`, cobrindo os acionadores superior e lateral;
- não confirmar envio rotineiro de mensagens.

## Fase 5 — Selecionar tudo por linha no RBAC

Adicionar um checkbox shadcn ao lado do nome de cada recurso:

- marcado quando todas as ações aplicáveis estiverem selecionadas;
- desmarcado quando nenhuma estiver selecionada;
- indeterminado quando apenas parte estiver selecionada;
- marcar/desmarcar afeta somente ações suportadas naquela linha;
- células não aplicáveis não entram no cálculo;
- rótulo acessível, por exemplo “Selecionar todas as permissões de Departamentos”.

Persistência:

1. A seleção altera apenas o rascunho local.
2. A API só é chamada em **Salvar permissões**.
3. O salvamento abre `warning` com função, permissões adicionadas/removidas e módulos afetados.
4. Cancelar mantém o rascunho; erro mantém modal e matriz.
5. O backend continua validando autorização e escopo.

## Fase 6 — Testes e validação

### Componente

- tons `warning` e `danger`;
- foco inicial, Escape, contenção e restauração de foco;
- cancelamento sem mutação;
- chamada única sob cliques repetidos;
- carregamento, erro e sucesso;
- título e descrição acessíveis.

### Módulos

- sucesso, cancelamento e erro para todos os itens da matriz;
- perfis ADMIN, SUPERVISOR e AGENT;
- ausência de diálogos empilhados;
- logout pelos dois acionadores;
- fechamento em estados distintos da conversa;
- credenciais Z-API mascaradas;
- RBAC vazio, parcial, completo e com ações não aplicáveis;
- responsividade e ausência de overflow.

### Ferramentas

- executar builds de front-end e back-end;
- executar testes existentes;
- se não houver runner de componentes, propor Vitest + Testing Library como subetapa explícita;
- realizar validação visual e funcional no navegador.

## Arquivos previstos

### Fundação

- `frontend/src/components/ui/alert-dialog.tsx`;
- `frontend/src/components/ui/confirmation-dialog.tsx`;
- `frontend/src/components/ui/button.tsx`;
- `frontend/src/styles.css`.

### Integrações

- `frontend/src/app/Shell.tsx`;
- `frontend/src/pages/admin/departments/index.tsx`;
- `frontend/src/pages/admin/agents/index.tsx`;
- `frontend/src/pages/admin/agents/components/AgentModal.tsx`;
- `frontend/src/pages/admin/flow/index.tsx`;
- `frontend/src/pages/admin/zapi/index.tsx`;
- `frontend/src/pages/admin/rbac/index.tsx`;
- `frontend/src/pages/admin/shortcuts/index.tsx`;
- `frontend/src/pages/conversation/index.tsx`;
- hooks locais somente para estados assíncronos necessários.

### Documentação

- `docs/DESIGN_SYSTEM.md` e/ou `docs/GUIDELINES.md`.

## Critérios de aceite globais

1. Não restam `window.confirm` ou `alert()` como confirmação crítica no escopo.
2. Todas as mutações CRUD de criação, edição e exclusão/arquivamento seguem a matriz.
3. Edições/mudanças operacionais usam `warning`; exclusões, arquivamentos, desconexão e encerramento usam `danger`.
4. Logout e encerramento de chamado exigem confirmação.
5. O modal de arquivar usa card branco opaco e botões padronizados.
6. Cancelar nunca chama API.
7. Processamento bloqueia repetição.
8. Erro mantém modal e dados.
9. Toda confirmação possui título, descrição, teclado e foco corretos.
10. Checkbox por linha do RBAC suporta marcado, desmarcado e indeterminado, ignorando ações não aplicáveis.
11. Salvamento RBAC preserva o contrato da API e autorização.
12. Senhas, tokens e segredos nunca aparecem em confirmações.
13. APIs e regras funcionais não mudam além da confirmação visual anterior à chamada.
14. Builds de front-end e back-end passam.
15. Rotas afetadas são validadas em desktop e viewport reduzido.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Confirmações excessivas | Confirmar somente mutações persistentes/efeitos externos |
| Modal sobre modal | Etapa de revisão ou controle pela página |
| Dupla submissão | `isPending` e chamada única |
| Perda de rascunho | Manter estado até sucesso |
| Vazamento Z-API | Mascaramento e revisão de segurança |
| Seleção RBAC inválida | Considerar somente ações aplicáveis e revalidar no backend |
| Divergência visual | Um componente e variantes centralizadas |

## Ordem recomendada

1. validar inventário/textos com Product Manager e Tech Lead;
2. implementar/testar a fundação shadcn/ui;
3. corrigir o arquivamento de atalhos como referência;
4. integrar Departamentos, Atendentes e Atalhos;
5. integrar Fluxo, Z-API, Conversas e logout;
6. implementar seleção por linha e confirmação RBAC;
7. auditar mutações, testes, builds e segurança;
8. atualizar documentação e registrar evidências.

## Definição de pronto

Todas as ações da matriz usam o componente compartilhado, a seleção por linha do RBAC está funcional e acessível, não há confirmações nativas remanescentes no escopo, testes e builds passam e a documentação reflete o padrão adotado.
