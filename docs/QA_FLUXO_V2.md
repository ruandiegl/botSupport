# Matriz de QA e segurança — Fluxo v2

## Escopo da rodada

Revisão realizada em 2026-08-12 sobre schema/migração, schemas Zod, validador do documento, adaptador legado, API administrativa, executor, Z-API, RBAC e editor. Estados significam:

- **Automatizado**: executado pelo `npm test`;
- **Revisado**: inspeção estática, ainda sem prova integrada;
- **Pendente**: requer implementação, banco, mock ou teste E2E adicional;
- **Bloqueado**: falha atual impede a evidência.

## Matriz

| Área | Cenário | Evidência | Estado |
|---|---|---|---|
| Migração | modelos, enums e campos da conversa | `flow-v2.migration.test.js` | Automatizado |
| Migração | mudança aditiva, sem `DROP`/`TRUNCATE` | `flow-v2.migration.test.js` | Automatizado |
| Migração | uma publicação e chaves estáveis | índices SQL + teste | Automatizado |
| Migração | backfill Entrada → Saudação → Decisão → Rota → Triagem → Handoff | SQL + teste | Automatizado |
| Produto | triagem inicial de Suporte e `responseKey` | SQL/serviço + testes de contrato | Automatizado |
| Schema | UUIDs, revisão positiva, limites de nós/textos | `flow-v2.service.test.js` | Automatizado |
| Validador | entrada, duplicidade, referências, decisão, triagem, alcançabilidade, ciclo e terminal | testes unitários + contrato | Automatizado |
| API | RBAC `view/edit/publish` nas rotas v2 | `flow.routes.ts` | Revisado |
| API | `400/401/403/404/409` reais | sem harness HTTP/API | Pendente |
| Publicação | rascunho não altera publicado; troca atômica e departamento existente | transação/validação no serviço | Revisado |
| Concorrência | revisão otimista retorna `409` | implementação revisada, sem banco concorrente | Pendente |
| Motor | decisão por `optionKey`, número e texto | implementação revisada | Pendente |
| Motor | rota → triagem → resposta → handoff | implementação revisada | Pendente |
| Motor | `BOT -> QUEUED` somente no handoff | implementação revisada | Pendente |
| Motor | conversa permanece na revisão original | campo e leitura revisados | Pendente |
| Webhook | texto, botão, lista e eventos ignorados | `zapi.service.test.js` | Automatizado |
| Submenu | rota → decisão secundária → triagem preserva equipe e assunto | `flow-v2.integration.test.js` | Automatizado |
| Submenu | `optionKey`, payload de lista e `referenceMessageId` | `flow-v2.service.test.js` + `zapi.service.test.js` | Automatizado |
| Idempotência | callback duplicado não avança | claim atômico trata `P2002`; concorrência real não provada | Revisado |
| Falha externa | envio Z-API não avança silenciosamente | sem outbox/teste de falha | Pendente |
| Segurança | segredos ausentes da documentação | `PRD_ZAPI.md` | Revisado |
| Segurança | tokens/PII ausentes de logs | payload/telefone removidos dos logs; prova automatizada pendente | Revisado |
| Frontend | CRUD/reorder de todos os tipos | sem harness React | Pendente |
| Acessibilidade | mouse, toque, teclado, foco e Backspace | sem E2E/manual formal | Pendente |
| Operação | backup, restore, canário e rollback | `RUNBOOK_MIGRACAO_FLUXO_V2.md` | Revisado |

## Gates encontrados

### P0 — estado dos bloqueadores

Os exemplos do ambiente e os placeholders da interface foram substituídos por valores inequivocamente fictícios. Como os valores anteriores estiveram versionados, a **rotação das credenciais no provedor continua sendo um gate operacional obrigatório antes do rollout**.

### P1 — necessários antes de expandir o canário

1. É necessária prova de falha/retry Z-API sem avanço silencioso; preferir outbox ou estado de envio recuperável.
2. Criar testes HTTP para autenticação, RBAC, payload inválido, `404` e `409`.
3. Criar testes de integração do executor com banco para várias triagens, revisões antigas, departamento inexistente e callbacks duplicados.
4. Automatizar a verificação de logging seguro para impedir regressão de payload, telefone, token e respostas de triagem.

### P2 — qualidade e experiência

1. Adicionar harness de frontend (Testing Library/Vitest ou E2E equivalente).
2. Cobrir reorder por mouse, touch, teclado, ações alternativas, placeholder, foco e Backspace.
3. Cobrir reload do rascunho, erro de rede, cancelamento, `409` e responsividade.

## Execução registrada

Comando:

```powershell
cd backend
npm.cmd run db:generate
npm.cmd test
```

Resultado intermediário: build e 14 testes passaram após regenerar os tipos Prisma. O Prisma reportou `EPERM` ao tentar substituir a DLL do query engine que estava em uso no Windows; parar o backend antes da geração resolve o bloqueio de arquivo.

Resultado final após correção do empacotamento Prisma: build e suíte concluídos com exit code `0`; **27 testes descobertos, 22 aprovados e 5 marcados como TODO**. Permanecem lacunas integradas de API, PostgreSQL, falha externa e E2E.

Rodada do Plano 020 em 2026-08-19: build backend e suíte completa concluídos com exit code `0`; **65 testes aprovados, sem falhas ou TODO**. Foram cobertos submenu dentro da rota, preservação da equipe/assunto, resposta ligada a prompt antigo, payloads `send-button-list`/`send-option-list` e compatibilidade do fluxo sem submenu. A homologação real na instância Z-API continua necessária para confirmar os limites comerciais da conta.

## Cenário E2E obrigatório em homologação

1. Publicar uma revisão com Entrada, Decisão, rota Suporte, Triagem e Handoff.
2. Iniciar novo contato WhatsApp e selecionar Suporte pelo botão.
3. Confirmar mensagem de triagem exata e conversa ainda em `BOT`.
4. Responder nome, emissora, cidade/UF e necessidade conforme configuração.
5. Confirmar resposta em `flowContext`, sem conteúdo equivalente nos logs.
6. Confirmar handoff único, departamento Suporte e status `QUEUED`.
7. Reenviar o mesmo callback e confirmar ausência de nova mensagem/transição.
8. Publicar outra revisão durante uma segunda conversa e confirmar que ela termina na revisão original.
