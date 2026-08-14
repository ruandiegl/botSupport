import { cp } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("src", "generated", "prisma");
const target = resolve("dist", "generated", "prisma");
await cp(source, target, { recursive: true, force: true });
