import { Router } from "express";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";
import { labelsController } from "./labels.controller.js";

const router = Router();
router.get("/labels", authMiddleware, requirePermission("labels", "view"), (req, res) => labelsController.list(req, res));
router.post("/labels", authMiddleware, requirePermission("labels", "create"), (req, res) => labelsController.create(req, res));
router.patch("/labels/:id", authMiddleware, requirePermission("labels", "update"), (req, res) => labelsController.update(req, res));
router.delete("/labels/:id", authMiddleware, requirePermission("labels", "delete"), (req, res) => labelsController.delete(req, res));
router.post("/conversations/:id/labels", authMiddleware, requirePermission("labels", "update"), (req, res) => labelsController.assign(req, res));
router.delete("/conversations/:id/labels/:labelId", authMiddleware, requirePermission("labels", "update"), (req, res) => labelsController.remove(req, res));
export default router;
