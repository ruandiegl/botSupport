import { Router } from "express";
import { departmentsController } from "./departments.controller.js";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";

const router = Router();

router.get("/departments", authMiddleware, requirePermission("departments", "view"), (req, res) => departmentsController.list(req, res));
router.post("/departments", authMiddleware, requirePermission("departments", "create"), (req, res) => departmentsController.create(req, res));
router.patch("/departments/:id", authMiddleware, requirePermission("departments", "update"), (req, res) => departmentsController.update(req, res));
router.delete("/departments/:id", authMiddleware, requirePermission("departments", "delete"), (req, res) => departmentsController.delete(req, res));

export default router;
