import { Router } from "express";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";
import { shortcutsController } from "./shortcuts.controller.js";

const router = Router();

router.get("/shortcuts/available", authMiddleware, requirePermission("shortcuts", "use"), (req, res) => shortcutsController.available(req, res));
router.get("/shortcuts", authMiddleware, requirePermission("shortcuts", "view"), (req, res) => shortcutsController.list(req, res));
router.get("/shortcuts/:id", authMiddleware, requirePermission("shortcuts", "view"), (req, res) => shortcutsController.get(req, res));
router.post("/shortcuts", authMiddleware, requirePermission("shortcuts", "create"), (req, res) => shortcutsController.create(req, res));
router.patch("/shortcuts/:id", authMiddleware, requirePermission("shortcuts", "update"), (req, res) => shortcutsController.update(req, res));
router.post("/shortcuts/:id/activate", authMiddleware, requirePermission("shortcuts", "publish"), (req, res) => shortcutsController.setActive(req, res));
router.post("/shortcuts/:id/use", authMiddleware, requirePermission("shortcuts", "use"), (req, res) => shortcutsController.registerUse(req, res));
router.delete("/shortcuts/:id", authMiddleware, requirePermission("shortcuts", "delete"), (req, res) => shortcutsController.archive(req, res));

export default router;
