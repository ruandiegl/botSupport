import { Router } from "express";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";
import { botExclusionsController } from "./bot-exclusions.controller.js";

const router = Router();
router.get("/bot-exclusions", authMiddleware, requirePermission("bot_exclusions", "view"), (req, res) => botExclusionsController.list(req, res));
router.post("/bot-exclusions", authMiddleware, requirePermission("bot_exclusions", "create"), (req, res) => botExclusionsController.create(req, res));
router.patch("/bot-exclusions/:id", authMiddleware, requirePermission("bot_exclusions", "update"), (req, res) => botExclusionsController.update(req, res));
router.delete("/bot-exclusions/:id", authMiddleware, requirePermission("bot_exclusions", "delete"), (req, res) => botExclusionsController.remove(req, res));

export default router;
