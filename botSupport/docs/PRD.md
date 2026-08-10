# PRD — Product Requirements Document (GTF-Bot)

## 1. Visão Geral do Produto
O **GTF-Bot** é uma plataforma centralizada de atendimento ao vivo e triagem automatizada via WhatsApp. Ele conecta contatos/solicitantes a atendentes de T.I. com suporte a roteamento por departamentos, procedimentos pré-definidos e automação de menus de opção.

---

## 2. Objetivos Principais
1. **Redução do Tempo de Espera**: Triagem instantânea pelo bot com encaminhamento para filas de departamento.
2. **Organização Operacional**: Visualização em tempo real das conversas ("Na Fila", "Em Atendimento", "No Bot", "Encerradas").
3. **Procedimentos Integrados**: Acesso rápido a rotinas técnicas por departamento para padronizar o suporte.
4. **Arquitetura Descentralizada e Escalonável**: Código limpo, modularizado e independente.

---

## 3. Requisitos Funcionais

### Fila de Atendimento e Conversas
- **Listagem ao vivo**: Exibição da lista de conversas com contadores e busca por texto/telefone/mensagem.
- **Filtros avançados**: Filtro por status (`QUEUED`, `IN_PROGRESS`, `BOT`, `CLOSED`) e por departamento.
- **Assumir Conversa**: Atendente altera o status de `QUEUED` para `IN_PROGRESS` e assume a responsabilidade.
- **Encerrar Conversa**: Finalização da conversa com carimbo de data/hora (`closedAt`).
- **Composer com Assinatura**: Respostas de atendentes são formatadas com a assinatura do perfil logado.

### Administração de Departamentos
- **CRUD de Departamentos**: Criar, visualizar, atualizar e excluir departamentos.
- **Procedimentos Associados**: Cada departamento possui uma lista ordenada de rotinas operacionais (ex: Reset de Senha, Diagnóstico VPN).

### Gestão de Atendentes
- **Monitoramento de Presença**: Visualização da equipe com indicador de status Online/Offline.
- **Vínculo com Departamento**: Atribuição de atendentes a departamentos específicos.

### Fluxo do Bot (WhatsApp Menu)
- **Editor de Fluxo**: Configuração de mensagem de boas-vindas, mensagem de menu e opções de roteamento.
- **Publicação Instantânea**: Atualização do fluxo sem necessidade de redeploy da aplicação.

---

## 4. Requisitos Não-Funcionais
- **Banco de Dados**: PostgreSQL 16 com ORM Prisma.
- **API Backend**: RESTful com suporte a JSON e validação com Zod.
- **Interface**: React 18, Vite 5, Tailwind CSS v4 com design system responsivo e moderno.
