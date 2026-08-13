import express from "express";
import cors from "cors";
import { pinoHttp } from "pino-http";
import { logger } from "./shared/logger.js";
import healthRoutes from "./modules/health/health.routes.js";
import conversationsRoutes from "./modules/conversations/conversations.routes.js";
import departmentsRoutes from "./modules/departments/departments.routes.js";
import agentsRoutes from "./modules/agents/agents.routes.js";
import flowRoutes from "./modules/flow/flow.routes.js";
import zapiRoutes from "./modules/zapi/zapi.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import rbacRoutes from "./modules/rbac/rbac.routes.js";
import shortcutsRoutes from "./modules/shortcuts/shortcuts.routes.js";

export const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const apiCors = cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origem não autorizada pelo CORS"));
  },
  credentials: true,
});

// O webhook da Z-API é uma chamada servidor a servidor e não possui uma
// origem de navegador confiável. Ele precisa chegar ao controller para que
// a mensagem seja processada; o CORS continua restrito para as rotas do painel.
app.use((req, res, next) => {
  if (req.path === "/api/webhooks/z-api") {
    next();
    return;
  }

  apiCors(req, res, next);
});
app.use(express.json());
app.use(pinoHttp({ logger: logger as any }));

// API Router Prefix
app.use("/api", healthRoutes);
app.use("/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", conversationsRoutes);
app.use("/api", departmentsRoutes);
app.use("/api", agentsRoutes);
app.use("/api", flowRoutes);
app.use("/api", zapiRoutes);
app.use("/api", rbacRoutes);
app.use("/api", shortcutsRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});
