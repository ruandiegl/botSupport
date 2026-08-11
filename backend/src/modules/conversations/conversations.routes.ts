import { Router } from "express";
import { conversationsController } from "./conversations.controller.js";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";

const router = Router();

router.get("/conversations", authMiddleware, requirePermission("queue", "view_own"), (req, res) => conversationsController.list(req, res));
router.get("/conversations/stream", authMiddleware, requirePermission("queue", "view_own"), (req, res) => conversationsController.streamEvents(req, res));
router.get("/conversations/:id", authMiddleware, requirePermission("conversations", "view"), (req, res) => conversationsController.getById(req, res));
router.post("/conversations/:id/read", authMiddleware, requirePermission("conversations", "view"), (req, res) => conversationsController.markAsRead(req, res));
router.post("/conversations/:id/assume", authMiddleware, requirePermission("conversations", "assume"), (req, res) => conversationsController.assume(req, res));
router.post("/conversations/:id/transfer", authMiddleware, requirePermission("conversations", "update"), (req, res) => conversationsController.transfer(req, res));
router.post("/conversations/:id/close", authMiddleware, requirePermission("conversations", "close"), (req, res) => conversationsController.close(req, res));
router.post("/conversations/:id", authMiddleware, requirePermission("conversations", "send_message"), (req, res) => conversationsController.sendMessage(req, res));

export default router;
