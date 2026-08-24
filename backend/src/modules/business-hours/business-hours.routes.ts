import { Router } from "express";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";
import { businessHoursController } from "./business-hours.controller.js";

const router = Router();
router.get("/business-hours", authMiddleware, requirePermission("business_hours", "view"), (req, res) => businessHoursController.list(req, res));
router.get("/business-hours/:id", authMiddleware, requirePermission("business_hours", "view"), (req, res) => businessHoursController.get(req, res));
router.post("/business-hours", authMiddleware, requirePermission("business_hours", "configure"), (req, res) => businessHoursController.create(req, res));
router.patch("/business-hours/:id", authMiddleware, requirePermission("business_hours", "configure"), (req, res) => businessHoursController.update(req, res));
router.patch("/business-hours/:id/disable", authMiddleware, requirePermission("business_hours", "configure"), (req, res) => businessHoursController.disable(req, res));
router.post("/business-hours/preview", authMiddleware, requirePermission("business_hours", "view"), (req, res) => businessHoursController.preview(req, res));
export default router;
