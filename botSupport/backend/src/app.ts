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

export const app = express();

app.use(cors());
app.use(express.json());
app.use(pinoHttp({ logger: logger as any }));

// API Router Prefix
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", conversationsRoutes);
app.use("/api", departmentsRoutes);
app.use("/api", agentsRoutes);
app.use("/api", flowRoutes);
app.use("/api", zapiRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err);
  res.status(500).json({ error: "Erro interno do servidor" });
});
