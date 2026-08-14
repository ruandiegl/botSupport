import { spawnSync } from "node:child_process";

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

const deploy = run("npx", ["prisma", "migrate", "deploy"], { capture: true });
process.stdout.write(deploy.stdout ?? "");
process.stderr.write(deploy.stderr ?? "");

if (deploy.status !== 0 && process.env.PRISMA_BASELINE_LEGACY === "true" && /P3005|schema is not empty/i.test(deploy.output)) {
  console.warn("[startup] Existing schema detected; applying one-time legacy Prisma baseline.");

  for (const migration of legacyMigrations) {
    const resolved = run("npx", ["prisma", "migrate", "resolve", "--applied", migration], { capture: true });
    process.stdout.write(resolved.stdout ?? "");
    process.stderr.write(resolved.stderr ?? "");

    if (resolved.status !== 0 && !/already recorded|already applied|P3008/i.test(resolved.output)) {
      exitOnFailure(resolved, `baseline ${migration}`);
    }
  }

  exitOnFailure(run("npx", ["prisma", "migrate", "deploy"]), "migrate deploy after baseline");
} else if (deploy.status !== 0) {
  exitOnFailure(deploy, "migrate deploy");
}

const server = run("node", ["dist/server.js"]);
exitOnFailure(server, "server");
