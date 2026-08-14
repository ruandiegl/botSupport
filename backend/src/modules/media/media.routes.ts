import { Router } from "express";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";
import { mediaController } from "./media.controller.js";

const router = Router();

router.post(
  "/conversations/:conversationId/messages/:messageId/media-access",
  authMiddleware,
  requirePermission("conversations", "view"),
  (req, res) => mediaController.createAccess(req, res),
);
router.get("/media/:mediaId/content", (req, res) => mediaController.content(req, res));
router.get("/media/:mediaId/thumbnail", (req, res) => mediaController.thumbnail(req, res));
router.get("/media/:mediaId/download", (req, res) => mediaController.download(req, res));

export default router;
