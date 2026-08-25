import { Router } from "express";
import { zApiController } from "./zapi.controller.js";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";

const router = Router();

router.get("/zapi/config", authMiddleware, requirePermission("zapi", "view"), (req, res) => zApiController.getConfig(req, res));
router.get("/zapi/groups", authMiddleware, requirePermission("groups", "view"), (req, res) => zApiController.getGroups(req, res));
router.get("/zapi/groups/:groupId/messages", authMiddleware, requirePermission("groups", "view"), (req, res) => zApiController.getGroupHistory(req, res));
router.post("/zapi/groups/:groupId/messages", authMiddleware, requirePermission("groups", "send_message"), (req, res) => zApiController.sendGroupMessage(req, res));
router.put("/zapi/config", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.updateConfig(req, res));
router.post("/zapi/test", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.testConnection(req, res));
router.get("/zapi/qr-code", authMiddleware, requirePermission("zapi", "view"), (req, res) => zApiController.getQrCode(req, res));
router.post("/zapi/disconnect", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.disconnect(req, res));
router.post("/zapi/webhook-url", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.setWebhookUrl(req, res));
router.post("/webhooks/z-api", (req, res) => zApiController.handleWebhook(req, res));
// Aliases kept for webhook URLs registered by older deployments and the PRD
// path (`/webhooks/zapi/message`). All aliases share the same idempotent handler.
router.post("/webhooks/zapi/message", (req, res) => zApiController.handleWebhook(req, res));
router.post("/webhooks/z-api/message", (req, res) => zApiController.handleWebhook(req, res));

export default router;
