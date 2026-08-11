import { Router } from "express";
import { zApiController } from "./zapi.controller.js";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";

const router = Router();

router.get("/zapi/config", authMiddleware, requirePermission("zapi", "view"), (req, res) => zApiController.getConfig(req, res));
router.put("/zapi/config", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.updateConfig(req, res));
router.post("/zapi/test", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.testConnection(req, res));
router.get("/zapi/qr-code", authMiddleware, requirePermission("zapi", "view"), (req, res) => zApiController.getQrCode(req, res));
router.post("/zapi/disconnect", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.disconnect(req, res));
router.post("/zapi/webhook-url", authMiddleware, requirePermission("zapi", "configure"), (req, res) => zApiController.setWebhookUrl(req, res));
router.post("/webhooks/z-api", (req, res) => zApiController.handleWebhook(req, res));

export default router;
