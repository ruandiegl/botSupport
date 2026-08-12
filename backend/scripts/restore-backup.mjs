import fs from "node:fs";
import { PrismaClient } from "../src/generated/prisma/index.js";

const encoded = process.env.DB_BACKUP_GZIP_B64?.trim();
if (!encoded) {
  console.log("DB_BACKUP_B64 não definido; restauração ignorada.");
  process.exit(0);
}

const compressed = Buffer.from(encoded, "base64");
const backup = JSON.parse((await import("node:zlib")).gunzipSync(compressed).toString("utf8"));
if (backup.format !== "gtfbot-logical-backup-v1" || !Array.isArray(backup.tables)) {
  throw new Error("Formato de backup inválido");
}

const prisma = new PrismaClient();
const quoteIdentifier = (value) => `\"${String(value).replaceAll('"', '""')}\"`;
const quoteString = (value) => `'${String(value).replaceAll("'", "''")}'`;
const literal = (value, type) => {
  if (value === null || value === undefined) return "NULL";
  if (type === "jsonb" || type === "json") return `${quoteString(JSON.stringify(value))}::${type}`;
  if (type === "ARRAY") {
    return `ARRAY[${value.map((item) => quoteString(item)).join(",")}]`;
  }
  if (type === "integer" || type === "bigint" || type === "numeric" || type === "double precision" || type === "real" || type === "boolean") {
    return typeof value === "boolean" ? (value ? "TRUE" : "FALSE") : String(value);
  }
  return quoteString(value);
};

const tableNames = backup.tables.map((table) => table.name).filter((name) => /^gtf_[a-z0-9_]+$/.test(name));
const metadata = {};
for (const table of tableNames) {
  metadata[table] = await prisma.$queryRawUnsafe(`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${table}' ORDER BY ordinal_position`);
}

await prisma.$executeRawUnsafe("SET session_replication_role = replica");
try {
  if (tableNames.length) await prisma.$executeRawUnsafe(`TRUNCATE ${tableNames.map(quoteIdentifier).join(", ")} CASCADE`);
  for (const table of backup.tables) {
    if (!metadata[table.name] || !table.rows.length) continue;
    const columns = metadata[table.name];
    for (const row of table.rows) {
      const values = columns.map((column) => literal(row[column.column_name], column.data_type === "ARRAY" ? "ARRAY" : column.udt_name));
      await prisma.$executeRawUnsafe(`INSERT INTO ${quoteIdentifier(table.name)} (${columns.map((column) => quoteIdentifier(column.column_name)).join(", ")}) VALUES (${values.join(", ")})`);
    }
  }
} finally {
  await prisma.$executeRawUnsafe("SET session_replication_role = DEFAULT");
  await prisma.$disconnect();
}

console.log(`Backup restaurado: ${backup.tables.length} tabelas.`);
