import { Router } from "express";
import { flowController } from "./flow.controller.js";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";

const router = Router();

router.get("/flow", authMiddleware, requirePermission("flow", "view"), (req, res) => flowController.get(req, res));
router.put("/flow", authMiddleware, requirePermission("flow", "edit"), (req, res) => flowController.update(req, res));
router.get("/flow/published", authMiddleware, requirePermission("flow", "view"), (req, res) => flowController.published(req, res));
router.get("/flow/draft", authMiddleware, requirePermission("flow", "edit"), (req, res) => flowController.draft(req, res));
router.post("/flow/draft", authMiddleware, requirePermission("flow", "edit"), (req, res) => flowController.createDraft(req, res));
router.put("/flow/draft/:id", authMiddleware, requirePermission("flow", "edit"), (req, res) => flowController.saveDraft(req, res));
router.post("/flow/draft/:id/validate", authMiddleware, requirePermission("flow", "edit"), (req, res) => flowController.validate(req, res));
router.post("/flow/draft/:id/publish", authMiddleware, requirePermission("flow", "publish"), (req, res) => flowController.publish(req, res));
router.get("/flow/revisions", authMiddleware, requirePermission("flow", "view"), (req, res) => flowController.revisions(req, res));
router.post("/flow/revisions/:id/restore", authMiddleware, requirePermission("flow", "publish"), (req, res) => flowController.restore(req, res));

export default router;
