import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join } from "node:path";

const legacyMigrations = [
  "20260811000000_add_agent_status_and_rbac",
  "20260811120000_add_shortcuts",
  "20260811180000_add_message_read_status",
  "20260812100000_add_versioned_flow_engine",
  "20260812110000_add_flow_publish_permission",
];

function run(command, args, { capture = false } = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    stdio: capture ? "pipe" : "inherit",
    encoding: "utf8",
    shell: false,
  });

  if (capture) {
    return {
      ...result,
      output: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
    };
  }

  return result;
}

function exitOnFailure(result, step) {
  if (result.error) {
    console.error(`[startup] ${step} failed to start:`, result.error);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`[startup] ${step} failed with exit code ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

async function baselineLegacyMigrations() {
  const require = createRequire(import.meta.url);
  const { PrismaClient } = require("../src/generated/prisma/index.js");
  const prisma = new PrismaClient();

  try {
    // Prisma creates this table during `migrate resolve`; creating it explicitly
    // keeps the one-time recovery idempotent and avoids a separate CLI process
    // holding a migration lock on legacy databases.
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        "id" VARCHAR(36) PRIMARY KEY NOT NULL,
        "checksum" VARCHAR(64) NOT NULL,
        "finished_at" TIMESTAMPTZ,
        "migration_name" VARCHAR(255) NOT NULL,
        "logs" TEXT,
        "rolled_back_at" TIMESTAMPTZ,
        "started_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "applied_steps_count" INTEGER NOT NULL DEFAULT 0
      )
    `);
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "_prisma_migrations_migration_name_key" ON "_prisma_migrations" ("migration_name")`,
    );

    for (const migration of legacyMigrations) {
      const sqlPath = join(process.cwd(), "prisma", "migrations", migration, "migration.sql");
      const checksum = createHash("sha256").update(await readFile(sqlPath)).digest("hex");
      const id = randomUUID();
      await prisma.$executeRawUnsafe(
        `INSERT INTO "_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "started_at", "applied_steps_count")
         VALUES ($1, $2, now(), $3, now(), 1)
         ON CONFLICT ("migration_name") DO NOTHING`,
        id,
        checksum,
        migration,
      );
      console.log(`[startup] Legacy migration baseline recorded: ${migration}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

let deploy;
if (process.env.PRISMA_BASELINE_LEGACY === "true") {
  console.warn("[startup] Existing schema detected; applying one-time legacy Prisma baseline.");
  try {
    await baselineLegacyMigrations();
  } catch (error) {
    console.error("[startup] Legacy baseline failed:", error);
    process.exit(1);
  }
  deploy = run("npx", ["prisma", "migrate", "deploy"], { capture: true });
  process.stdout.write(deploy.stdout ?? "");
  process.stderr.write(deploy.stderr ?? "");
  exitOnFailure(deploy, "migrate deploy after baseline");
} else {
  deploy = run("npx", ["prisma", "migrate", "deploy"], { capture: true });
  process.stdout.write(deploy.stdout ?? "");
  process.stderr.write(deploy.stderr ?? "");
}

if (deploy.status !== 0) {
  exitOnFailure(deploy, "migrate deploy");
}

const server = run("node", ["dist/server.js"]);
exitOnFailure(server, "server");
