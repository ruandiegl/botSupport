import fs from "node:fs";
import { PrismaClient } from "../backend/src/generated/prisma/index.js";

for (const line of fs.readFileSync("backend/.env", "utf8").split(/\r?\n/)) {
  const separator = line.indexOf("=");
  if (separator < 1) continue;
  let value = line.slice(separator + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
  process.env[line.slice(0, separator).trim()] = value;
}

const prisma = new PrismaClient();
const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' AND table_name LIKE 'gtf_%' ORDER BY table_name");
const backup = { format: "gtfbot-logical-backup-v1", createdAt: new Date().toISOString(), tables: [] };

for (const table of tables) {
  const columns = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='${table.table_name}' ORDER BY ordinal_position`);
  const names = columns.map(({ column_name }) => column_name);
  const rows = await prisma.$queryRawUnsafe(`SELECT * FROM \"${table.table_name}\"`);
  backup.tables.push({ name: table.table_name, columns: names, rows });
}

fs.mkdirSync("backups", { recursive: true });
const output = `backups/gtfbot-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
fs.writeFileSync(output, JSON.stringify(backup, (_key, value) => typeof value === "bigint" ? Number(value) : value));
console.log(output);
console.log(`tables=${backup.tables.length} rows=${backup.tables.reduce((sum, table) => sum + table.rows.length, 0)}`);
await prisma.$disconnect();
