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
const tables = await prisma.$queryRawUnsafe("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
for (const table of tables) {
  const [{ count }] = await prisma.$queryRawUnsafe(`SELECT count(*)::int AS count FROM \"${table.table_name}\"`);
  console.log(`${table.table_name}\t${count}`);
}
await prisma.$disconnect();
