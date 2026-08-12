# Plan 010: PRD - Departamento Real do Atendente em Chamados Colaborativos

> **Status:** Pronto para refinamento técnico  
> **Data:** 2026-08-12  
> **Repositório:** `C:\Users\ESTUDIO-TREINAMENTO\Desktop\botSupport`  
> **Tipo:** Correção funcional + melhoria de consistência operacional  
> **Módulo principal:** `backend/src/modules/conversations/`  
> **Módulos relacionados:** `frontend/src/pages/conversation/`, `backend/src/modules/agents/`, `backend/src/modules/shortcuts/`

---

## 1. Resumo Executivo

Atualmente, quando um atendente assume ou responde uma conversa, o sistema tende a usar o departamento escolhido pelo solicitante no fluxo do bot (`Conversation.department`) para compor mensagens, atalhos e identificação do atendimento. Isso funciona em chamados simples, mas falha quando mais de um departamento atua no mesmo chamado.

O comportamento correto é: **cada ação humana deve usar o departamento real do atendente que executou a ação**, preservando o departamento da conversa apenas como fila/origem operacional do chamado.

Exemplo:
- O solicitante escolhe no bot: `Transmissão / YouTube`.
- Um atendente de `Suporte T.I.` assume para verificar o computador.
- Um atendente de `Áudio e Vídeo` também responde para ajustar captura, câmera, áudio ou mesa.
- Cada mensagem enviada deve aparecer com o nome e o departamento real de quem enviou, sem herdar automaticamente `Transmissão / YouTube`.

---

## 2. Problema

### 2.1 Comportamento Atual

1. O bot encaminha a conversa para um departamento conforme a escolha do usuário.
2. A conversa recebe `departmentId` e passa para `QUEUED`.
3. Um atendente clica em **Assumir** e a conversa passa para `IN_PROGRESS`.
4. Ao enviar mensagem, o backend usa `conversation.department?.name` para montar o cabeçalho:

```text
*Nome do Atendente - Departamento da Conversa:*
```

5. Atalhos e mensagens pré-formatadas no frontend também interpolam `{departmentName}` com `conversation.departmentName`.

### 2.2 Impacto

- O cliente vê o departamento errado no cabeçalho da mensagem.
- O histórico da conversa perde rastreabilidade sobre qual setor realmente respondeu.
- Atendimentos colaborativos entre departamentos ficam ambíguos.
- O time pode interpretar incorretamente quem atuou em cada etapa.
- A escolha inicial do solicitante passa a ter peso indevido sobre a identidade do atendente.

### 2.3 Causa Raiz

Há duas entidades com significados diferentes sendo tratadas como se fossem a mesma coisa:

| Entidade | Significado Correto | Uso Atual Problemático |
|---|---|---|
| `Conversation.department` | Departamento/fila para onde o chamado foi roteado | Usado como departamento do atendente em mensagens |
| `Agent.department` | Departamento real cadastrado no perfil do atendente | Nem sempre carregado/propagado no envio e nos atalhos |

---

## 3. Objetivo

Garantir que mensagens, atalhos e registros de atuação humana usem o **departamento real do atendente logado/remetente**, mantendo `Conversation.department` apenas como departamento responsável pela fila ou contexto do chamado.

---

## 4. Não Objetivos

- Não criar transferência múltipla formal de chamado entre vários departamentos nesta entrega.
- Não alterar a regra de roteamento do bot nem a estrutura do fluxo v2.
- Não criar tabela de participantes do chamado nesta primeira etapa, salvo se a implementação exigir por auditoria.
- Não mudar permissões de RBAC além do necessário para consultar dados já permitidos do atendente autenticado.
- Não alterar textos de triagem, `HANDOFF` ou publicação de fluxo.

---

## 5. Documentação Consultada

- `docs/PRD.md`: define conversas, estados `BOT`, `QUEUED`, `IN_PROGRESS`, `CLOSED`, gestão de atendentes e vínculo com departamento.
- `docs/PRD_ZAPI.md`: define humanização do atendimento e assinatura visual de mensagens enviadas pelo painel.
- `docs/API.md`: descreve `POST /conversations/:id/assume`, `POST /conversations/:id` e gestão de agentes com `departmentId`.
- `docs/ARCHITECTURE.md`: exige arquitetura modular por domínio e separação `routes -> controller -> service -> repository -> schemas`.
- `docs/GUIDELINES.md`: reforça validação com Zod, queries no repository e regra de negócio no service.

---

## 6. Agents Utilizados

| Agent | Arquivo | Papel neste PRD |
|---|---|---|
| Product Manager | `agents/product-manager.agent.md` | Definir impacto operacional, histórias de usuário e critérios de aceite. |
| Tech Lead & Arquiteto | `agents/tech-lead-architect.agent.md` | Separar corretamente os conceitos de departamento da conversa e departamento do atendente. |
| Backend Developer | `agents/backend-developer.agent.md` | Propor ajuste em repository/service sem violar camadas do backend. |
| Frontend Developer | `agents/frontend-developer.agent.md` | Corrigir interpolação de atalhos e mensagens pré-formatadas na tela de conversa. |
| QA & Testing Engineer | `agents/qa-testing-engineer.agent.md` | Definir cenários de teste para chamados com múltiplos setores atuando. |

---

## 7. Personas e Histórias de Usuário

### 7.1 Atendente

Como atendente, eu quero que minhas mensagens exibam meu departamento cadastrado, para que o cliente e o histórico identifiquem corretamente qual setor respondeu.

### 7.2 Atendente de Segundo Departamento

Como atendente de outro departamento, eu quero conseguir participar de um chamado já assumido sem herdar o departamento escolhido pelo usuário no bot, para que minha atuação seja registrada corretamente.

### 7.3 Solicitante

Como solicitante, eu quero saber qual setor está falando comigo em cada mensagem, para entender melhor quem está conduzindo cada parte do atendimento.

### 7.4 Coordenador/Admin

Como coordenador, eu quero consultar o histórico e enxergar corretamente nome e setor de cada atendente, para auditar a colaboração entre departamentos.

---

## 8. Requisitos Funcionais

### RF01 - Resolver departamento efetivo do remetente

Ao enviar mensagem humana, o sistema deve resolver o departamento efetivo nesta ordem:

1. `Agent.department.name` do atendente que está enviando a mensagem.
2. `Conversation.assignedAgent.department.name`, apenas quando o remetente explícito não estiver disponível.
3. `Conversation.department.name`, apenas como fallback operacional.
4. `"Suporte T.I."`, apenas quando nenhum departamento puder ser resolvido.

### RF02 - Não confundir fila do chamado com departamento do atendente

`Conversation.departmentId` deve continuar representando a fila/departamento de roteamento do chamado. Esse valor não deve ser usado como fonte primária para assinar mensagens humanas.

### RF03 - Assumir conversa com departamento real

Ao executar `POST /conversations/:id/assume`, o backend deve vincular o atendente responsável e retornar dados suficientes para o frontend exibir:

- `assignedAgentId`
- `assignedAgentName`
- `assignedAgentDepartmentId`
- `assignedAgentDepartmentName`
- `departmentId`
- `departmentName`

### RF04 - Enviar mensagem com atendente explícito

O endpoint de envio de mensagem deve receber ou inferir com segurança o atendente remetente. A solução recomendada é evoluir o contrato para usar o usuário autenticado como fonte de verdade, evitando fallback silencioso para `findFirstAgent()`.

Se a autenticação já estiver disponível no controller, o `agentId` deve vir do contexto autenticado. Se ainda não estiver, aceitar temporariamente `agentId` no body pode ser usado como etapa intermediária, desde que validado com Zod e documentado como compatibilidade temporária.

### RF05 - Cabeçalho das mensagens

Toda mensagem humana enviada pelo painel deve usar:

```text
*{agentName} - {agentDepartmentName}:*

{content}
```

O cabeçalho não deve ser duplicado se o conteúdo já vier pré-formatado de forma intencional.

### RF06 - Atalhos com departamento real do atendente

As variáveis dinâmicas em atalhos devem priorizar o departamento real do atendente ativo:

- `{agentName}` -> nome do atendente ativo/logado.
- `{departmentName}` -> departamento real do atendente ativo/logado.
- `{contactName}` -> nome do contato.

`conversation.departmentName` deve ser fallback, não valor principal.

### RF07 - Histórico com remetente correto

Ao formatar mensagens do histórico, mensagens `AGENT` devem exibir o nome do atendente que enviou a mensagem, não necessariamente o `assignedAgent` atual da conversa.

Se o modelo atual de `Message` possuir apenas `senderAgentId`, o repository deve incluir dados do `senderAgent` ao buscar mensagens, quando suportado pelo schema Prisma.

### RF08 - Compatibilidade com atendente sem departamento

Atendentes sem departamento cadastrado não devem quebrar o envio. O sistema deve aplicar fallback previsível e registrar essa ausência de forma observável em log técnico, sem expor dados sensíveis.

---

## 9. Requisitos Não Funcionais

- Manter TypeScript estrito e evitar `any` novo.
- Validar entradas de API com Zod.
- Manter queries Prisma exclusivamente em arquivos `.repository.ts`.
- Manter regra de resolução de departamento em `.service.ts`.
- Evitar alteração de schema se o relacionamento `Agent.department` e `Message.senderAgentId` já forem suficientes.
- Preservar compatibilidade com conversas antigas.
- Não registrar telefone completo, conteúdo de mensagem ou dados sensíveis em logs.

---

## 10. Proposta Técnica

### 10.1 Backend

Arquivos esperados:

- `backend/src/modules/conversations/conversations.repository.ts`
- `backend/src/modules/conversations/conversations.service.ts`
- `backend/src/modules/conversations/conversations.schemas.ts`
- `backend/src/modules/conversations/conversations.controller.ts`
- `docs/API.md`, se o contrato HTTP mudar.

Alterações recomendadas:

1. Incluir `department` em consultas de agentes:

```typescript
assignedAgent: {
  include: { department: true }
}
```

2. Incluir `department` em `findAgentById` e `findFirstAgent`.

3. Se o schema permitir, incluir remetente real nas mensagens:

```typescript
messages: {
  include: {
    senderAgent: {
      include: { department: true }
    }
  },
  orderBy: { createdAt: "asc" }
}
```

4. Criar função de service para resolver assinatura:

```typescript
function resolveAgentSignature(input: {
  agentName?: string | null;
  agentDepartmentName?: string | null;
  fallbackDepartmentName?: string | null;
}) {
  return {
    agentName: input.agentName?.trim() || "Atendente",
    departmentName:
      input.agentDepartmentName?.trim() ||
      input.fallbackDepartmentName?.trim() ||
      "Suporte T.I.",
  };
}
```

5. Remover ou reduzir o uso de `findFirstAgent()` como fallback para envio humano. Esse fallback pode atribuir mensagem à pessoa errada.

### 10.2 Frontend

Arquivos esperados:

- `frontend/src/pages/conversation/index.tsx`
- `frontend/src/pages/conversation/components/ShortcutPicker.tsx`
- `frontend/src/pages/conversation/components/DetailPanel.tsx`
- `frontend/src/types` ou arquivo equivalente de tipos, se necessário.

Alterações recomendadas:

1. Derivar `activeAgentDepartmentName` do usuário/atendente ativo.
2. Passar esse valor para `ShortcutPicker`.
3. Passar esse valor para `DetailPanel` quando ele renderizar atalhos.
4. Usar `conversation.departmentName` apenas como fallback.
5. Atualizar os tipos de `Conversation` para incluir departamento do responsável, caso o backend passe esse dado.

### 10.3 Modelo de Dados

Preferência: **não criar migração nesta entrega**, desde que o schema atual já tenha:

- `Agent.departmentId`
- `Agent.department`
- `Conversation.departmentId`
- `Conversation.assignedAgentId`
- `Message.senderAgentId`

Se `Message` não possuir relação navegável para `senderAgent`, avaliar migração pequena para suportar histórico fiel por mensagem.

---

## 11. Critérios de Aceite

1. Dada uma conversa roteada para `Transmissão / YouTube`, quando um atendente de `Suporte T.I.` enviar mensagem, então o cabeçalho deve usar `Suporte T.I.`.
2. Dada a mesma conversa, quando um atendente de `Áudio e Vídeo` enviar outra mensagem, então o cabeçalho deve usar `Áudio e Vídeo`.
3. O departamento exibido como contexto/fila da conversa deve continuar sendo o departamento escolhido no fluxo, salvo transferência formal.
4. Atalhos de saudação e encerramento devem interpolar `{departmentName}` com o departamento real do atendente ativo.
5. Uma conversa sem departamento do atendente não deve falhar no envio; deve usar fallback documentado.
6. Mensagens antigas devem continuar carregando sem erro.
7. `npm run build` no backend deve passar.
8. `npm run build` no frontend deve passar.

---

## 12. Plano de QA

### Cenário 1 - Atendente assume chamado de outro departamento

Passos:
1. Criar conversa via bot escolhendo departamento `Transmissão / YouTube`.
2. Logar como atendente de `Suporte T.I.`.
3. Clicar em **Assumir**.
4. Enviar mensagem pelo composer.

Resultado esperado:
- Conversa permanece vinculada à fila `Transmissão / YouTube`.
- Mensagem enviada usa cabeçalho `*Nome - Suporte T.I.:*`.

### Cenário 2 - Dois departamentos no mesmo chamado

Passos:
1. Usar a mesma conversa em `IN_PROGRESS`.
2. Enviar mensagem como atendente A de `Suporte T.I.`.
3. Enviar mensagem como atendente B de `Áudio e Vídeo`.

Resultado esperado:
- Mensagem A usa `Suporte T.I.`.
- Mensagem B usa `Áudio e Vídeo`.
- O histórico não reescreve mensagens antigas com o último responsável.

### Cenário 3 - Atalhos

Passos:
1. Criar atalho com `{agentName}`, `{departmentName}` e `{contactName}`.
2. Abrir a conversa roteada para departamento diferente do atendente.
3. Inserir o atalho via `ShortcutPicker` e via `DetailPanel`.

Resultado esperado:
- `{departmentName}` é substituído pelo departamento real do atendente ativo.

### Cenário 4 - Atendente sem departamento

Passos:
1. Usar atendente sem `departmentId`.
2. Assumir ou enviar mensagem.

Resultado esperado:
- Envio não falha.
- Cabeçalho usa fallback permitido.
- O sistema não atribui aleatoriamente outro atendente.

### Cenário 5 - Regressão de fila

Passos:
1. Listar conversas por filtro de departamento.
2. Transferir conversa para outro departamento.
3. Assumir com atendente de departamento diferente.

Resultado esperado:
- Filtros continuam baseados em `Conversation.departmentId`.
- Cabeçalhos continuam baseados em `Agent.department`.

---

## 13. Riscos e Decisões Pendentes

| Risco | Impacto | Mitigação |
|---|---|---|
| O envio de mensagem não identifica o usuário autenticado | Pode usar atendente errado | Passar `agentId` autenticado do middleware para o service ou validar body temporário |
| Histórico usa `assignedAgent` atual para todas as mensagens | Mensagens antigas podem aparecer com nome errado | Buscar `senderAgent` por mensagem |
| Atalhos usam dados locais desatualizados | Preview pode divergir do backend | Backend continua sendo fonte final da assinatura |
| Atendente sem departamento | Cabeçalho incompleto | Fallback explícito e log técnico |

Decisão recomendada:

> O backend deve ser a fonte de verdade para assinatura final enviada ao WhatsApp. O frontend apenas melhora preview e preenchimento de atalhos.

---

## 14. Checklist de Implementação

- [ ] Atualizar repository para carregar `Agent.department`.
- [ ] Atualizar service para resolver assinatura pelo atendente remetente.
- [ ] Evitar fallback automático para primeiro atendente em envio humano.
- [ ] Retornar departamento do responsável em `formatConversation`.
- [ ] Ajustar histórico para usar `senderAgent`, quando disponível.
- [ ] Ajustar `ShortcutPicker` para receber departamento real do atendente ativo.
- [ ] Ajustar `DetailPanel` para interpolar atalhos com o departamento real do atendente ativo.
- [ ] Atualizar tipos do frontend.
- [ ] Atualizar `docs/API.md` se o contrato de envio/assume mudar.
- [ ] Criar/atualizar testes backend para resolução de assinatura.
- [ ] Executar build backend.
- [ ] Executar build frontend.

---

## 15. Resultado Esperado

Chamados continuam tendo um departamento responsável para fila, filtros e contexto operacional, mas cada mensagem humana passa a representar corretamente quem respondeu e de qual departamento essa pessoa realmente faz parte.

Isso permite atendimento colaborativo real entre `Suporte T.I.`, `Transmissão / YouTube`, `Áudio e Vídeo`, `Rede`, ou qualquer outro departamento sem distorcer a identidade de quem está falando com o cliente.
