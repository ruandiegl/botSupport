import { PrismaClient } from "../src/generated/prisma/index.js";
const encoded = process.env.DB_BACKUP_GZIP_B64?.trim();
if (!encoded) { console.log("DB_BACKUP_GZIP_B64 não definido; restauração ignorada."); process.exit(0); }
const compressed = Buffer.from(encoded, "base64");
const backup = JSON.parse((await import("node:zlib")).gunzipSync(compressed).toString("utf8"));
if (backup.format !== "gtfbot-logical-backup-v1" || !Array.isArray(backup.tables)) throw new Error("Formato de backup inválido");
const prisma = new PrismaClient();
const qi = (v) => `\"${String(v).replaceAll('"', '""')}\"`;
const qs = (v) => `'${String(v).replaceAll("'", "''")}'`;
const lit = (v, type, udtName) => {
  if (v === null || v === undefined) return "NULL";
  if (type === "jsonb" || type === "json") return `${qs(JSON.stringify(v))}::${type}`;
  if (type === "ARRAY") {
    const elementType = String(udtName || "_text").replace(/^_/, "");
    return `ARRAY[${v.map(qs).join(",")}]::${elementType}[]`;
  }
  if (["integer", "bigint", "numeric", "double precision", "real", "boolean"].includes(type)) return typeof v === "boolean" ? (v ? "TRUE" : "FALSE") : String(v);
  return qs(v);
};
const names = backup.tables.map((t) => t.name).filter((n) => /^gtf_[a-z0-9_]+$/.test(n));
const metadata = {};
for (const name of names) metadata[name] = await prisma.$queryRawUnsafe(`SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${name}' ORDER BY ordinal_position`);
await prisma.$executeRawUnsafe("SET session_replication_role = replica");
try {
  if (names.length) await prisma.$executeRawUnsafe(`TRUNCATE ${names.map(qi).join(", ")} CASCADE`);
  for (const table of backup.tables) {
    const columns = metadata[table.name];
    if (!columns || !table.rows.length) continue;
    for (const row of table.rows) {
      const values = columns.map((c) => lit(row[c.column_name], c.data_type === "ARRAY" ? "ARRAY" : c.udt_name, c.udt_name));
      await prisma.$executeRawUnsafe(`INSERT INTO ${qi(table.name)} (${columns.map((c) => qi(c.column_name)).join(", ")}) VALUES (${values.join(", ")})`);
    }
  }
} finally {
  await prisma.$executeRawUnsafe("SET session_replication_role = DEFAULT");
  await prisma.$disconnect();
}
console.log(`BACKUP_RESTORED tables=${backup.tables.length} rows=${backup.tables.reduce((sum, table) => sum + table.rows.length, 0)}`);
