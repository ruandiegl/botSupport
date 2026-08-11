# Runbook — Migração de atalhos e procedimentos

## Preparação

1. Gere um backup consistente do PostgreSQL antes da janela de implantação.
2. Confirme que backend e frontend da mesma versão serão publicados juntos.
3. Valide `DATABASE_URL` em homologação e execute `npx prisma validate`.

## Implantação

No diretório `backend/`:

```bash
npx prisma migrate deploy
npx prisma generate
npm run build
```

A migração cria `gtf_shortcuts`, `gtf_shortcut_audits`, os enums e índices. Os procedimentos existentes em `gtf_procedures` não são alterados nem removidos.

Depois do deploy, autentique novamente para que as novas permissões e a rota `/admin/shortcuts` sejam incorporadas aos papéis já existentes.

## Verificação

- Criar um atalho global e confirmar sua presença no chat.
- Confirmar que um atalho pessoal não aparece para outro usuário.
- Confirmar que um atalho de departamento aparece apenas na conversa do departamento correspondente.
- Desativar e arquivar itens e confirmar que deixam de aparecer no picker.
- Verificar registros `CREATE`, `UPDATE`, `ACTIVATE`, `DEACTIVATE`, `ARCHIVE` e `USE` em `gtf_shortcut_audits`.

## Rollback

Antes do rollback, exporte as tabelas de atalhos caso seja necessário preservar conteúdo criado após a implantação.

```sql
DROP TABLE IF EXISTS "gtf_shortcut_audits";
DROP TABLE IF EXISTS "gtf_shortcuts";
DROP TYPE IF EXISTS "ShortcutScope";
DROP TYPE IF EXISTS "ShortcutType";
```

Em seguida, publique a versão anterior do backend e frontend. Esse rollback não altera `gtf_procedures`.
