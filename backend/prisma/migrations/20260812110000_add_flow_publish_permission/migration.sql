UPDATE "gtf_role_permissions"
SET "actions" = array_append("actions", 'publish'), "updated_at" = CURRENT_TIMESTAMP
WHERE "role" = 'ADMIN'
  AND "resource" = 'flow'
  AND NOT ('publish' = ANY("actions"));
