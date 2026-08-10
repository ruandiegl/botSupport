import { Router } from "express";
import { agentsController } from "./agents.controller.js";
import { authMiddleware, requireRole } from "../auth/auth.middleware.js";
const router = Router();
router.get("/agents", (req, res) => agentsController.list(req, res));
router.post("/agents", authMiddleware, requireRole(["ADMIN"]), (req, res) => agentsController.create(req, res));
router.patch("/agents/:id", authMiddleware, requireRole(["ADMIN"]), (req, res) => agentsController.update(req, res));
router.delete("/agents/:id", authMiddleware, requireRole(["ADMIN"]), (req, res) => agentsController.delete(req, res));
export default router;
