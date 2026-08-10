import { Router } from "express";
const router = Router();
router.get("/healthz", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "gtfbot-backend",
    });
});
export default router;
