# Plano 017 — Delay anti-spam do bot e visualização ampliada de imagens

> **Status:** Concluído
> **Data:** 2026-08-18
> **Escopo:** webhook Z-API, execução do fluxo, histórico da conversa e componente de mídia

## 1. Objetivo

Evitar que mensagens automáticas de saudação, escolha de departamento e triagem sejam repetidas quando o cliente envia várias mensagens em sequência. O bot deverá respeitar uma janela de 15 minutos entre respostas automáticas equivalentes, dando tempo para um atendente assumir o chamado. Mensagens do cliente continuam sendo persistidas normalmente e a ação explícita de botão pode furar o bloqueio para não impedir uma escolha deliberada.

Também será aprimorada a visualização de imagens recebidas: miniatura maior no histórico, abertura em card quadrático centralizado ocupando aproximadamente 60% da viewport, carregamento da imagem original e zoom por controles e gesto de roda/pinça quando suportado.

## 2. Referências consultadas

- `docs/README.md`
- `docs/PRD_ZAPI.md`
- `docs/ARCHITECTURE.md`
- `docs/API.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/PRD_SOCKETIO.md`
- `docs/RUNBOOK_MIDIA_ZAPI.md`
- `docs/QA_MIDIA_ZAPI.md`
- `agents/README.md`
- `agents/backend-developer.agent.md`
- `agents/frontend-developer.agent.md`
- `agents/qa-testing-engineer.agent.md`
- `agents/security-engineer.agent.md`

## 3. Decisões de produto

1. A janela padrão será `BOT_REPLY_COOLDOWN_MINUTES=15`, configurável por ambiente e limitada a valores seguros.
2. O bloqueio é aplicado no servidor, usando a última mensagem `BOT` da conversa; não depende de estado local do navegador.
3. Dentro da janela, novas mensagens do cliente são gravadas e não geram outra saudação, lista ou pergunta automática.
4. Uma resposta explícita de botão/lista (`selectedOptionId`) pode avançar o nó de decisão durante a janela.
5. Conversas já encaminhadas para a fila (`currentStep=QUEUED`) ou aguardando atendimento (`AWAITING_DETAILS`) nunca reiniciam o fluxo automaticamente.
6. A imagem continua sendo entregue pelo proxy protegido da Z-API; nenhum URL sensível será exposto no HTML/API público.
7. O preview terá superfície opaca, título/descrição acessíveis, fechamento por `Esc`/botão e área quadrática responsiva próxima de 60vw/60vh.

## 4. Implementação

### Fase A — Anti-spam no backend

- Adicionar consulta `findLastBotMessageAt` no repositório Z-API.
- Criar constante e normalização do cooldown de 15 minutos.
- Antes de repetir uma decisão inválida no executor v2/legado, retornar `bot_cooldown` quando a janela estiver ativa. Seleções válidas por ID, índice ou texto do rótulo e respostas de triagem nunca são atrasadas.
- Não reiniciar fluxo em `QUEUED`/`AWAITING_DETAILS`.
- Manter idempotência por `messageId`, persistência de mensagens e avanço por botão.
- Cobrir logs sem conteúdo sensível e sem alterar mensagens históricas.

### Fase B — Imagem ampliada e zoom

- Aumentar a miniatura da imagem no componente `MessageMedia`.
- Criar preview central quadrático com `Dialog` shadcn, imagem original protegida e estado de loading/erro.
- Adicionar zoom in/out, reset, arraste quando ampliada e suporte a roda do mouse; manter `alt`, foco e fechamento por teclado.
- Não alterar o contrato do proxy, tickets ou retenção de 30 dias.

### Fase C — Documentação e QA

- Registrar o cooldown e as exceções em `docs/PRD_ZAPI.md`, `docs/API.md` e `docs/ARCHITECTURE.md`.
- Adicionar testes de contrato para cooldown, seleção durante cooldown, estados de fila e preview de imagem.
- Executar build backend/frontend, testes focados e `git diff --check`.
- Verificar que URLs da Z-API continuam ausentes dos DTOs públicos e que o card não causa overflow em mobile.

## 5. Critérios de aceite

- Duas ou mais mensagens livres em até 15 minutos não repetem saudação, botões ou triagem.
- A seleção de uma rota por botão, lista, índice ou texto exato continua sendo processada imediatamente dentro do cooldown.
- Chamados em `QUEUED`/`AWAITING_DETAILS` não reiniciam a saudação do bot.
- Após o cooldown, uma nova mensagem pode retomar o fluxo de forma determinística.
- Miniatura ocupa área maior e preserva proporção sem distorção.
- Clique abre card central quadrático; zoom permite leitura de detalhes e reset sem expor URL original.
- Áudio, vídeo, documento, mídia expirada e `viewOnce` permanecem com o comportamento atual.
- Backend e frontend compilam; testes focados passam.

## 6. Rollback

O recurso é aditivo e não exige migração. Para rollback, definir `BOT_REPLY_COOLDOWN_MINUTES=0` (ou remover a variável) e reverter o componente visual; dados de mensagens e tickets de mídia permanecem intactos.

## 7. Execução e validação

- Backend compilado com `npm run build`.
- Frontend validado com `npx tsc --noEmit` e `npm run build`.
- Contratos do plano: `backend/test/plan-017.contract.test.js` — 3/3 aprovados.
- Nenhuma migration ou alteração destrutiva de banco foi necessária.
