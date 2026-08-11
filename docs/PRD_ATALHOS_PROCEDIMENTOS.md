# PRD — Atalhos e Procedimentos para Atendimento

## 1. Visão geral

Criar uma biblioteca centralizada de mensagens rápidas para uso durante os atendimentos do GTF-Bot. A funcionalidade deve permitir que administradores publiquem atalhos institucionais, supervisores organizem conteúdos operacionais e atendentes mantenham atalhos pessoais sem depender do cadastro de departamentos.

Os atalhos serão inseridos diretamente no composer do chat, reduzindo tempo de resposta e padronizando saudações, encerramentos e orientações recorrentes.

## 2. Objetivos

- Reduzir o tempo de resposta em conversas repetitivas.
- Padronizar mensagens de saudação, encerramento e orientação técnica.
- Descentralizar atalhos/procedimentos do CRUD de departamentos.
- Permitir conteúdo global, por departamento e pessoal.
- Controlar criação, edição, exclusão e uso via RBAC.
- Manter o fluxo do chat simples, pesquisável e acessível.

## 3. Escopo

### Incluído

- Tela `/admin/shortcuts` para CRUD e busca.
- Tipos: `SAUDAÇÃO`, `ENCERRAMENTO`, `DEPARTAMENTO`, `PESSOAL`, `GERAL`.
- Visibilidade: global, departamento específico ou usuário proprietário.
- Ativação/desativação, ordenação e arquivamento lógico.
- Inserção de atalhos no composer da conversa.
- Pré-visualização e edição antes do envio.
- Integração com RBAC para tela e recurso.
- Auditoria básica de criação, atualização, exclusão e uso.

### Fora do escopo inicial

- Envio automático sem ação do atendente.
- Editor rico com imagens, anexos ou variáveis dinâmicas.
- Sincronização com CRM externo.
- Substituição dos procedimentos legados já cadastrados em departamentos sem migração aprovada.

## 4. Personas e permissões

| Perfil | Acesso esperado |
|---|---|
| Administrador | CRUD completo, ativar/arquivar, escopo global/departamento/pessoal, RBAC |
| Supervisor | Criar/editar atalhos globais ou dos departamentos permitidos; usar atalhos |
| Atendente | Usar atalhos disponíveis e criar/editar os próprios atalhos pessoais |

Recursos RBAC propostos:

- `shortcuts.view`
- `shortcuts.create`
- `shortcuts.update`
- `shortcuts.delete`
- `shortcuts.publish` (ativar, desativar e alterar escopo compartilhado)
- `shortcuts.use` (inserir no composer)

A tela deve ser registrada como `/admin/shortcuts`. Permissões de uso no chat não devem exigir acesso à tela administrativa.

## 5. Requisitos funcionais

### RF-01 — Cadastro

O usuário autorizado poderá cadastrar título, mensagem, tipo, escopo, departamento opcional, status ativo e ordem de exibição.

Regras:

- Título obrigatório, entre 2 e 80 caracteres.
- Mensagem obrigatória, entre 1 e 4.000 caracteres.
- `DEPARTAMENTO` exige `departmentId`.
- `PESSOAL` grava o usuário proprietário e não pode ser editado por outro atendente.
- `GERAL`, `SAUDAÇÃO` e `ENCERRAMENTO` podem ser globais ou pessoais conforme permissão.

### RF-02 — Listagem e filtros

A tela deve permitir pesquisar por título/mensagem e filtrar por tipo, status, escopo e departamento. A listagem deve mostrar autor, última atualização e quantidade de usos, quando disponível.

### RF-03 — Biblioteca no chat

O composer deve possuir um acionador “Atalhos”. Ao abrir, deve apresentar busca, categorias e apenas itens que o usuário pode usar no contexto atual:

- atalhos globais ativos;
- atalhos do departamento da conversa;
- atalhos pessoais do usuário;
- atalhos compatíveis com o status da conversa.

Ao clicar, a mensagem será inserida no campo de composição, sem envio automático. O atendente poderá editar o texto antes de enviar.

### RF-04 — CRUD e ciclo de vida

- Criar, editar, ativar/desativar e arquivar.
- Exclusão preferencialmente lógica para preservar auditoria.
- Impedir exclusão de item em uso sem confirmação explícita.
- Alterações devem atualizar a biblioteca sem recarregar a página.

### RF-05 — Auditoria

Registrar usuário, data, operação e entidade afetada. O conteúdo anterior não precisa ser versionado na primeira entrega, mas a estrutura deve permitir evolução.

## 6. Modelo de dados proposto

Nova entidade `Shortcut` independente de `Department`:

- `id` UUID
- `title` string
- `message` text
- `type` enum
- `scope` enum (`GLOBAL`, `DEPARTMENT`, `PERSONAL`)
- `departmentId` nullable, apenas para escopo de departamento
- `ownerId` nullable, obrigatório para escopo pessoal
- `isActive` boolean
- `sortOrder` integer
- `createdById` UUID
- `updatedById` UUID nullable
- `createdAt`, `updatedAt`, `archivedAt` nullable

Índices: `(isActive, scope, type)`, `(departmentId, isActive)`, `(ownerId, isActive)` e busca textual conforme capacidade do PostgreSQL.

O vínculo com departamento será apenas um filtro de visibilidade; o conteúdo não será armazenado em `Department.procedures`.

## 7. API proposta

- `GET /shortcuts` — lista itens visíveis ao usuário; filtros `q`, `type`, `scope`, `departmentId`, `active`.
- `GET /shortcuts/:id` — detalhe autorizado.
- `POST /shortcuts` — criação.
- `PATCH /shortcuts/:id` — edição.
- `POST /shortcuts/:id/activate` — ativar/desativar.
- `DELETE /shortcuts/:id` — arquivamento lógico.
- `POST /shortcuts/:id/use` — registra uso opcional e retorna o item autorizado.

Todos os payloads devem ser validados com Zod, e cada rota deve aplicar autenticação e permissão RBAC.

## 8. UX/UI

- Usar componentes shadcn existentes: Card, Input, Textarea, Select, Badge, Button, Dialog, Empty e Skeleton.
- Tela administrativa em duas áreas: filtros/lista e formulário contextual.
- No chat, usar popover ou dropdown compacto ancorado ao botão de atalhos.
- Categorias visualmente distintas, sem excesso de cores.
- Seguir `docs/paleta.md`: fundo `#F4F7FA`, cards brancos, sidebar `#1A2B3D`, CTA `#2D89C8`.
- Responsivo: biblioteca em drawer/diálogo no mobile.

## 9. Critérios de aceite

- Um administrador consegue criar um atalho global e usá-lo no chat.
- Um atendente consegue criar e usar um atalho pessoal, sem visualização por outros atendentes.
- Um atalho de departamento aparece somente em conversas daquele departamento.
- Usuários sem `shortcuts.use` não veem o acionador no composer.
- O clique no atalho preenche o composer, mas não envia a mensagem.
- UUIDs nunca aparecem como rótulos na interface.
- Itens inativos/arquivados não aparecem na biblioteca.
- API rejeita escopos inválidos, departamento ausente e payloads fora dos limites.
- Auditoria registra operações administrativas.
- Frontend e backend compilam sem erros e os testes cobrem permissões e escopos.

## 10. Riscos e decisões

- **Duplicidade:** permitir títulos iguais em escopos diferentes, mas alertar duplicidade dentro do mesmo escopo.
- **Privacidade:** atalhos pessoais não devem ser retornados em endpoints administrativos para outros usuários.
- **Legado:** manter procedimentos de departamentos durante a transição e planejar migração separada.
- **Performance:** carregar a biblioteca sob demanda e limitar resultados; usar debounce na busca.
