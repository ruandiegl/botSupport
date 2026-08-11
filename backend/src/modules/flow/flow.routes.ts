import { Router } from "express";
import { flowController } from "./flow.controller.js";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";

const router = Router();

router.get("/flow", authMiddleware, requirePermission("flow", "view"), (req, res) => flowController.get(req, res));
router.put("/flow", authMiddleware, requirePermission("flow", "edit"), (req, res) => flowController.update(req, res));

export default router;
