import { Router } from "express";

const router = Router();

const healthHandler = (_req: any, res: any) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "gtfbot-backend",
  });
};

router.get("/healthz", healthHandler);
router.get("/", healthHandler);

export default router;
