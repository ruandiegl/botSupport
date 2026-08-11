import { PrismaClient } from "../../src/generated/prisma/index.js";

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
