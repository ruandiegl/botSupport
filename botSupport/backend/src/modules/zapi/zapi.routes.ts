import { Router } from "express";
import { zApiController } from "./zapi.controller.js";

const router = Router();

router.get("/zapi/config", (req, res) => zApiController.getConfig(req, res));
router.put("/zapi/config", (req, res) => zApiController.updateConfig(req, res));
router.post("/zapi/test", (req, res) => zApiController.testConnection(req, res));
router.get("/zapi/qr-code", (req, res) => zApiController.getQrCode(req, res));
router.post("/zapi/disconnect", (req, res) => zApiController.disconnect(req, res));
router.post("/zapi/webhook-url", (req, res) => zApiController.setWebhookUrl(req, res));
router.post("/webhooks/z-api", (req, res) => zApiController.handleWebhook(req, res));

export default router;
