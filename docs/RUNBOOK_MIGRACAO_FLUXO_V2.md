# Runbook — Migração, canário e rollback do fluxo v2

## Objetivo e escopo

Este runbook governa a implantação do fluxo versionado com triagem pós-rota. A migração é aditiva: cria revisões, nós, transições, eventos e campos opcionais na conversa, preservando `FlowDefinition`, `currentStep` e os endpoints legados durante a compatibilidade.

Arquivo de migração: `backend/prisma/migrations/20260812100000_add_versioned_flow_engine/migration.sql`.

## Responsáveis e janela

- **Owner técnico:** backend/arquitetura;
- **Executor:** DevOps com acesso ao banco e deploy;
- **Validação funcional:** QA com instância Z-API controlada;
- **Aprovação:** produto e operação de atendimento;
- **Janela:** baixo volume, sem alteração simultânea do fluxo legado.

Registre início, executor, backup, versão/commit implantado e resultado de cada gate. Não execute rollout se credenciais anteriormente documentadas ainda não tiverem sido rotacionadas.

## Pré-condições

- [ ] Builds backend e frontend aprovados.
- [ ] Testes automatizados e smoke da API aprovados.
- [ ] Migração revisada em homologação com cópia representativa dos dados.
- [ ] Backup restaurável testado, não apenas criado.
- [ ] `DATABASE_URL` aponta explicitamente para o ambiente correto.
- [ ] Segredos Z-API estão fora do repositório e foram rotacionados.
- [ ] Feature flag/executor v2 começa desativado ou restrito ao canário.
- [ ] Nenhum operador está editando/publicando o fluxo durante a conversão.
- [ ] Dashboard e alertas de webhook, execução e handoff estão disponíveis.

## 1. Backup e linha de base

PowerShell:

```powershell
$env:PGPASSWORD = '<senha-do-ambiente>'
pg_dump --format=custom --no-owner --no-acl --file="gtfbot-pre-flow-v2.dump" --dbname="$env:DATABASE_URL"
npx.cmd prisma migrate status
```

Bash:

```bash
export PGPASSWORD='<senha-do-ambiente>'
pg_dump --format=custom --no-owner --no-acl --file='gtfbot-pre-flow-v2.dump' --dbname="$DATABASE_URL"
npx prisma migrate status
```

Armazene o dump criptografado fora da VPS. Registre contagens de `gtf_flow_definitions`, conversas por status e conversas com `current_step` preenchido.

## 2. Ensaio de restauração

Restaure o dump em uma base temporária isolada e execute um smoke de leitura. Não use a base de produção como destino do ensaio.

```powershell
createdb gtfbot_restore_check
pg_restore --clean --if-exists --no-owner --no-acl --dbname="postgresql://<usuario>:<senha>@<host>:5432/gtfbot_restore_check" "gtfbot-pre-flow-v2.dump"
```

Gate: prossiga somente se o restore terminar sem erro e as contagens coincidirem com a linha de base.

## 3. Aplicação da migração aditiva

No diretório `backend`:

```powershell
npm.cmd run db:generate
npx.cmd prisma migrate deploy
npx.cmd prisma migrate status
npm.cmd run build
```

Em Linux, substitua `npm.cmd`/`npx.cmd` por `npm`/`npx`.

Não execute `prisma migrate reset`, `db push --force-reset` nem remova colunas legadas.

## 4. Verificações pós-migração

Execute consultas somente leitura:

```sql
SELECT migration_name, finished_at, rolled_back_at
FROM "_prisma_migrations"
WHERE migration_name = '20260812100000_add_versioned_flow_engine';

SELECT status, COUNT(*) FROM gtf_flow_revisions GROUP BY status;
SELECT type, COUNT(*) FROM gtf_flow_nodes GROUP BY type ORDER BY type;

SELECT fr.id, COUNT(*) FILTER (WHERE fn.type = 'ENTRY') AS entries
FROM gtf_flow_revisions fr
LEFT JOIN gtf_flow_nodes fn ON fn.flow_revision_id = fr.id
GROUP BY fr.id;

SELECT COUNT(*) AS invalid_conversation_refs
FROM gtf_conversations c
LEFT JOIN gtf_flow_revisions fr ON fr.id = c.flow_revision_id
WHERE c.flow_revision_id IS NOT NULL AND fr.id IS NULL;
```

Gates:

- migração finalizada e não marcada como rollback;
- uma revisão publicada por definição convertida;
- exatamente um `ENTRY` por revisão publicada;
- rotas convertidas terminam em `HANDOFF` ou `END`;
- referências inválidas de conversa = 0;
- triagem de Suporte contém o valor inicial aprovado e é editável no rascunho.

## 5. Ordem de deploy

1. Backend com schema v2, leitura dupla e executor v2 desativado.
2. Migração/conversão e verificações do passo 4.
3. Smoke dos endpoints legados e v2.
4. Frontend do editor v2.
5. Publicação de uma revisão controlada em homologação.
6. Ativação do executor para números/departamentos do canário.

Essa ordem evita que o frontend dependa de tabelas ou endpoints ausentes e mantém o fallback v1 disponível.

## 6. Smoke obrigatório

- `GET /api/healthz` retorna `200`.
- Usuário sem `flow:view` recebe `403` na leitura administrativa.
- Editor salva rascunho sem alterar o publicado.
- Publicação inválida é bloqueada; publicação válida troca o ativo atomicamente.
- Conflito de dois editores retorna `409` e preserva o rascunho local.
- Novo contato recebe entrada e decisão.
- Seleção Suporte executa triagem e permanece `BOT`.
- Resposta avança ao `HANDOFF`, define o departamento e muda uma única vez para `QUEUED`.
- Callback duplicado não cria mensagem/transição adicional.
- Conversa iniciada antes da publicação termina na revisão antiga.
- `autoReply=false`, `QUEUED` e `IN_PROGRESS` não reiniciam o bot.

## 7. Canário e observabilidade

Ative primeiro para uma instância/número controlado ou pequena parcela de novos contatos. Não migre conversas abertas para v2.

Monitore por pelo menos uma janela completa de atendimento:

- taxa de webhooks inválidos/duplicados;
- falhas e retries de envio Z-API;
- erros por tipo de nó e revisão;
- duração e abandono em `BOT`/`TRIAGE`;
- handoffs por departamento e duplicidade de `conversation_updated`;
- conflitos `409` e falhas de publicação;
- crescimento de eventos pendentes/outbox, se aplicável.

Interrompa expansão se houver encaminhamento incorreto, perda de contexto, avanço duplicado, aumento material de falhas Z-API ou PII/segredo em logs.

## 8. Rollback operacional

Rollback preferencial não destrói tabelas:

1. Desative a feature flag/executor v2 para novos contatos.
2. Reative a leitura/executor legado para novas conversas.
3. Preserve conversas já vinculadas a revisões v2; se o executor v2 estiver indisponível, encaminhe-as manualmente com auditoria, sem trocar `flowRevisionId` em massa.
4. Restaure a revisão funcional criando novo rascunho via `/flow/revisions/:id/restore` e publique após validação; não altere snapshots históricos.
5. Reverta backend/frontend para a versão compatível anterior somente se o schema aditivo continuar suportado.
6. Registre período afetado, conversas/revisões envolvidas e motivo.

Não derrube tabelas v2 enquanto houver conversas referenciando revisões. Rollback físico do banco é último recurso, requer indisponibilidade aceita e implica perda das gravações posteriores ao dump.

## 9. Restauração de desastre

Se corrupção impedir operação e o negócio aceitar perda desde o backup:

1. interrompa escritas e capture um dump forense do estado atual;
2. crie uma nova base, nunca restaure por cima sem validação;
3. restaure `gtfbot-pre-flow-v2.dump`;
4. aponte uma instância isolada do backend para a base restaurada;
5. execute healthcheck, contagens e smoke legado;
6. altere o tráfego somente após aprovação conjunta de DevOps, QA e produto.

## 10. Encerramento da compatibilidade

Remover formato/colunas v1 exige outro plano e outra migração, depois de:

- nenhuma conversa aberta depender do legado;
- período de estabilidade sem rollback;
- auditoria de revisões e eventos preservada;
- backup final e ensaio de restauração;
- clientes atualizados sem chamadas a `GET/PUT /flow` legado.

