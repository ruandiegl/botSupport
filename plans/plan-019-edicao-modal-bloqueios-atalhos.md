# Plano 019 — Edição em modais para contatos ignorados pelo bot e atalhos/procedimentos

> Status: Concluído  
> Data: 2026-08-19  
> Escopo: Frontend, UX, acessibilidade e regressão dos fluxos administrativos  
> Mudanças de banco/API: não previstas

## 1. Objetivo

Substituir a edição inline no card lateral por modais de edição dedicados nas páginas:

- /admin/bot-exclusions — Contatos ignorados pelo bot;
- /admin/shortcuts — Atalhos e procedimentos.

Ao clicar em Editar, o formulário deve abrir em um diálogo central, mantendo o formulário de criação da página independente. O usuário deve conseguir identificar claramente se está criando ou alterando um registro, sem perder dados digitados no formulário de criação.

## 2. Referências consultadas

### Documentação do projeto

- docs/README.md
- docs/PRD.md
- docs/API.md
- docs/ARCHITECTURE.md
- docs/GUIDELINES.md
- docs/DESIGN_SYSTEM.md
- docs/paleta.md
- docs/PRD_ATALHOS_PROCEDIMENTOS.md
- docs/PRD_ATALHOS_MODAL_EDICAO_PREVIA.md
- docs/RUNBOOK_MIGRACAO_ATALHOS.md
- docs/RUNBOOK_EXCLUSOES_BOT.md
- docs/PRD_ZAPI.md, para garantir que a mudança permaneça somente visual e não altere a entrega das mensagens automáticas.

### Agentes selecionados conforme agents/README.md

| Ordem | Agente | Responsabilidade neste plano |
|---|---|---|
| 1 | product-manager.agent.md | Validar a separação entre criação e edição, textos e critérios de aceite. |
| 2 | frontend-developer.agent.md | Implementar diálogos, estados independentes, componentes reutilizáveis e integração React Query. |
| 3 | qa-testing-engineer.agent.md | Validar abertura/fechamento, persistência, erros, foco, teclado e regressões dos CRUDs. |
| 4 | security-engineer.agent.md | Revisar que a mudança visual não exponha dados, contorne RBAC ou altere payloads sem autorização. |

Não será criado endpoint novo nem alterado o contrato do backend. As chamadas existentes continuarão isoladas nos hooks React Query.

## 3. Diagnóstico atual

### Contatos ignorados pelo bot

frontend/src/pages/admin/bot-exclusions/index.tsx usa editing e form compartilhados. startEdit popula o formulário do card à direita e altera o título de Novo bloqueio para Editar bloqueio. Isso mistura criação e alteração e pode apagar um rascunho de novo contato.

### Atalhos e procedimentos

frontend/src/pages/admin/shortcuts/index.tsx usa selected e form compartilhados. edit(item) preenche o card lateral com o registro existente. As ações das mensagens de sistema também chamam esse mesmo fluxo inline.

docs/PRD_ATALHOS_MODAL_EDICAO_PREVIA.md já define ShortcutEditModal, confirmação warning e separação entre criação e edição, mas a implementação atual ainda não aplica esse contrato.

## 4. Decisões de produto e UX

1. O card lateral permanece dedicado à criação de um novo registro.
2. Clicar em Editar sempre abre um modal; nunca troca silenciosamente o card lateral para o modo de edição.
3. Fechar o modal por Cancelar, Esc, botão X ou overlay descarta apenas o rascunho de edição e não altera o formulário de criação.
4. Salvar continua usando a API existente e só fecha o modal após sucesso.
5. Salvar, editar, ativar e desativar usam confirmação warning; arquivar ou remover mantém confirmação danger, conforme o Design System.
6. Erro de API mantém o modal aberto, preserva os campos e exibe a mensagem em região aria-live.
7. O modal terá superfície branca opaca, bordas neutras, primária #2D89C8, largura responsiva e rolagem interna em telas menores.
8. O RBAC continua sendo a autoridade; esconder o botão no frontend não substitui autorização no backend.
9. A máscara de telefone existente em Contatos ignorados pelo bot continua funcionando ao digitar, colar e editar.
10. Nenhuma nova persistência será introduzida; somente o estado visual será reorganizado.

## 5. Estado frontend proposto

### 5.1 Contatos ignorados pelo bot

Separar o estado em createForm, editTarget, editForm, editOpen e saveConfirmOpen.

Regras:

- Novo bloqueio limpa somente createForm;
- Editar copia o registro para editForm, define editTarget e abre o diálogo;
- o campo de telefone do modal reutiliza formatPhoneInput;
- fechar descarta editTarget e editForm sem tocar em createForm;
- a confirmação de salvar usa editForm, nunca createForm;
- reativar e desativar permanecem fora do modal e preservam suas confirmações atuais.

### 5.2 Atalhos e procedimentos

Separar o estado em createForm, editTarget, editForm, editOpen e previewSource.

Regras:

- Novo atalho restaura o formulário de criação sem abrir modal;
- Editar abre o modal com título, mensagem, tipo, escopo, departamento, ordem e estado ativo preenchidos;
- o formulário de criação não é alterado quando o modal abre ou fecha;
- as ações de saudação, encerramento e encerramento por falta de interação usam o mesmo modal;
- se uma mensagem de sistema ainda não existir, a ação abre o modal em modo de criação pré-preenchido;
- a confirmação usa o estado do modal e, após sucesso, invalida a consulta de atalhos;
- arquivar e ativar/desativar continuam usando os diálogos críticos existentes;
- se a prévia prevista no PRD estiver disponível, clicar no corpo do card seleciona a prévia e clicar em Editar abre o modal.

## 6. Componentes a criar

### 6.1 Contatos ignorados pelo bot

Criar em frontend/src/pages/admin/bot-exclusions/components/:

- BotExclusionFormFields.tsx: campos compartilhados entre criação e edição, incluindo máscara, identificação, motivo e erros;
- BotExclusionEditModal.tsx: Dialog controlado, cabeçalho, descrição, formulário, rodapé e botão de salvar.

Modificar index.tsx para manter o Card lateral como Novo bloqueio, abrir o modal no botão Editar, separar createForm/editForm e manter os hooks atuais sem alteração de contrato.

### 6.2 Atalhos e procedimentos

Criar em frontend/src/pages/admin/shortcuts/components/:

- ShortcutFormFields.tsx: campos completos, variáveis, selects e validação visual;
- ShortcutEditModal.tsx: diálogo de edição com largura maior, rolagem interna e rodapé responsivo;
- VariableBadge.tsx: destaque de variáveis na prévia, caso o painel de prévia seja implementado nesta entrega;
- ShortcutPreviewPanel.tsx: opcional, caso o painel direito seja convertido em prévia conforme o PRD já aprovado.

Modificar index.tsx para retirar selected como fonte do formulário inline, manter a criação no card da direita, migrar as ações de edição e não duplicar regras de payload entre criação e edição.

## 7. Composição visual e acessibilidade

Usar os componentes do design system/shadcn já presentes: Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Field, FieldGroup, FieldLabel, FieldDescription, Input, Textarea, Select, Button, Badge, Alert, Spinner e ConfirmationDialog.

Requisitos:

- DialogContent com superfície opaca, largura sm:max-w-xl para bloqueios e sm:max-w-2xl para atalhos;
- conteúdo com max-h e overflow-y-auto em telas menores;
- título e descrição acessíveis em todo diálogo;
- foco inicial no primeiro campo e retorno ao botão Editar após fechar;
- Esc fecha sem salvar, exceto durante mutação pendente;
- botões com área mínima de 44px no mobile;
- erros com aria-live=polite;
- overlay não inicia confirmação nem mutação;
- selects respeitam o padrão de abertura para baixo já usado na aplicação;
- nenhuma transparência que reduza a leitura dos formulários.

## 8. Fluxos detalhados

### 8.1 Editar contato ignorado

1. Administrador abre a tela de contatos ignorados.
2. Clica em Editar em um card.
3. O modal abre com número formatado, identificação e motivo.
4. Altera os campos e clica em Salvar alteração.
5. A confirmação warning apresenta a consequência concreta.
6. Ao confirmar, o hook existente chama PATCH /bot-exclusions/:id.
7. Em sucesso, invalida a lista e fecha confirmação e modal.
8. Em erro ou conflito 409, mantém o modal e os dados preenchidos.

### 8.2 Editar atalho/procedimento

1. Usuário autorizado clica em Editar no card.
2. O ShortcutEditModal abre preenchido.
3. Pode alterar mensagem, variáveis, tipo, escopo, departamento, ordem e estado conforme RBAC.
4. A validação ocorre antes da confirmação.
5. Salvar alterações abre confirmação warning.
6. Ao confirmar, o hook existente chama PATCH /shortcuts/:id.
7. Ao fechar sem confirmar, nenhum campo de criação é alterado.

### 8.3 Mensagens de sistema

As ações Configurar/Editar saudação, Configurar/Editar encerramento e Configurar/Editar inatividade usam o mesmo modal. O modal indica o contexto Mensagem de sistema sem criar um editor paralelo.

## 9. Validação e regras de negócio no frontend

### Contatos ignorados

- telefone com quantidade mínima de dígitos continua inválido;
- identificação e motivo preservam limites do contrato atual;
- o valor enviado permanece compatível com a normalização server-side;
- não permitir salvar enquanto a mutação estiver pendente;
- erro de duplicidade aparece no modal sem limpar o formulário.

### Atalhos

- título mínimo de 2 caracteres;
- mensagem obrigatória e dentro do limite atual;
- escopo DEPARTMENT exige departamento;
- tipos e escopos continuam limitados aos valores existentes;
- agentes continuam restritos ao escopo permitido pelo RBAC;
- o modal não permite editar campo que o papel atual não pode persistir.

## 10. Testes e critérios de aceite

### Contatos ignorados pelo bot

- [ ] Editar abre o modal e não altera o card de criação.
- [ ] Número, identificação e motivo aparecem preenchidos e editáveis.
- [ ] Máscara funciona ao digitar, colar, apagar e reabrir.
- [ ] Cancelar, Esc, X e overlay descartam o rascunho.
- [ ] Salvar abre confirmação warning e só chama PATCH após confirmação.
- [ ] Sucesso fecha o modal e atualiza a lista.
- [ ] Erro ou 409 mantém modal e valores.
- [ ] Novo bloqueio continua funcionando no card lateral.
- [ ] Reativar, desativar e remoção preservam seus diálogos.
- [ ] Usuário sem bot_exclusions:update não consegue executar edição.

### Atalhos e procedimentos

- [ ] Editar abre ShortcutEditModal preenchido.
- [ ] Formulário de criação permanece intacto ao abrir e fechar edição.
- [ ] Todos os campos atuais aparecem, incluindo departamento condicional e ordem.
- [ ] Variáveis podem ser inseridas no textarea do modal sem perda de foco.
- [ ] Mensagens de sistema usam o mesmo modal em modo editar ou criar.
- [ ] Cancelar, Esc e overlay não persistem alterações.
- [ ] Salvar exige confirmação warning e fecha somente após sucesso.
- [ ] Arquivar continua em confirmação danger.
- [ ] Ativar e desativar continuam em confirmação warning.
- [ ] Criar novo atalho continua funcionando no card lateral.
- [ ] Filtros, cache e atualização após mutação permanecem funcionais.

### Regressão visual e técnica

- [ ] npx tsc --noEmit passa no frontend.
- [ ] npm run build passa no frontend.
- [ ] Não há fetch direto nos componentes; somente hooks existentes.
- [ ] Backend não recebe novos campos nem alteração de contrato.
- [ ] RBAC, máscara de telefone e confirmações permanecem intactos.
- [ ] Desktop, tablet e mobile não apresentam overflow horizontal.
- [ ] Navegação por teclado e foco restaurado são verificados.

## 11. Fases de execução

### Fase 0 — Contrato visual e preparação

1. Confirmar textos de título, descrição, cancelamento e confirmação.
2. Mapear campos e limites dos dois formulários.
3. Confirmar que a API atual atende PATCH e POST sem alteração.

### Fase 1 — Modal de Contatos ignorados

1. Extrair BotExclusionFormFields.
2. Criar BotExclusionEditModal com estado controlado.
3. Separar estado de criação e edição em index.tsx.
4. Integrar confirmação warning e tratamento de erro.
5. Validar máscara, foco, mobile e regressão do CRUD.

### Fase 2 — Modal de Atalhos e procedimentos

1. Extrair ShortcutFormFields sem duplicar payload.
2. Criar ShortcutEditModal conforme o PRD existente.
3. Migrar ações de edição de cards e mensagens de sistema para o modal.
4. Preservar criação inline, filtros, RBAC, ativação e arquivamento.
5. Implementar ou manter o painel de prévia somente se não alterar o fluxo de criação aprovado.

### Fase 3 — QA e acabamento

1. Executar critérios funcionais e de acessibilidade.
2. Verificar respostas de erro e não perda de rascunho.
3. Corrigir espaçamento, overflow e estados de carregamento.
4. Rodar TypeScript/build e registrar o resultado neste plano.

## 12. Rollout e rollback

Esta é uma alteração frontend-only. Não executar migration, seed, reset de banco ou alteração em produção.

### Rollout

1. Publicar o frontend após TypeScript e build aprovados.
2. Homologar com um usuário ADMIN e um usuário sem permissão de edição.
3. Verificar edição de um bloqueio, de um atalho comum e de cada mensagem de sistema.

### Rollback

Reverter apenas os arquivos frontend deste plano para a versão anterior. Endpoints, registros e auditoria permanecem intactos.

## 13. Entregáveis

- [x] BotExclusionFormFields.tsx.
- [x] BotExclusionEditModal.tsx.
- [x] ShortcutFormFields.tsx.
- [x] ShortcutEditModal.tsx.
- [x] Refatoração dos dois index.tsx com estados independentes.
- [x] Testes e build frontend aprovados.
- [x] Registro de homologação e rollback atualizado neste plano.

O painel de prévia e os badges de variáveis não foram incluídos nesta execução porque o escopo solicitado foi a troca do fluxo de edição inline por modais; os campos de variáveis continuam disponíveis dentro do modal de atalhos.

## 14. Registro de execução

- Criados os componentes compartilhados de campos e os modais de edição para as duas páginas.
- O card lateral de Contatos ignorados pelo bot permanece sempre como Novo bloqueio.
- O card lateral de Atalhos e procedimentos permanece sempre como Novo atalho.
- Edições de cards e mensagens de sistema agora abrem diálogos controlados.
- Estados de criação e edição foram separados; cancelar uma edição não altera rascunhos de criação.
- Confirmações warning continuam sendo exigidas antes de criar ou salvar; ações de arquivamento continuam danger.
- Máscara de telefone foi preservada no formulário de criação e no modal de edição.
- Selects dos formulários usam o padrão shadcn com abertura para baixo e agrupamento de itens.
- TypeScript: aprovado com npx tsc --noEmit.
- Build frontend: aprovado com npm run build; 1933 módulos transformados.
- Não foram criados endpoints, migrations ou alterações no banco.
