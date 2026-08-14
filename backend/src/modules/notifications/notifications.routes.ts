import { Router } from "express";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";
import { notificationsController } from "./notifications.controller.js";

const router = Router();
const auth = [authMiddleware, requirePermission("queue", "view_own")];

router.get("/notifications", ...auth, (req, res) => notificationsController.list(req as any, res));
router.get("/notifications/unread-count", ...auth, (req, res) => notificationsController.unreadCount(req as any, res));
router.get("/notification-preferences", ...auth, (req, res) => notificationsController.getPreference(req as any, res));
router.patch("/notification-preferences", ...auth, (req, res) => notificationsController.preference(req as any, res));
router.post("/notifications/read-all", ...auth, (req, res) => notificationsController.markAllRead(req as any, res));
router.post("/notifications/:id/read", ...auth, (req, res) => notificationsController.markRead(req as any, res));
router.post("/notifications/:id/dismiss", ...auth, (req, res) => notificationsController.dismiss(req as any, res));

export default router;
