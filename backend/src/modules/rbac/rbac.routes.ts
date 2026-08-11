import { Router } from "express";
import { rbacController } from "./rbac.controller.js";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";

const router = Router();

router.get("/rbac/roles", authMiddleware, (req, res) => rbacController.getRoles(req, res));
router.get("/rbac/permissions/:role", authMiddleware, (req, res) => rbacController.getPermissions(req, res));
router.put("/rbac/permissions/:role", authMiddleware, requirePermission("rbac", "manage"), (req, res) =>
  rbacController.updatePermissions(req, res)
);

export default router;
