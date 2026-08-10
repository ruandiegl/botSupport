import { Router } from "express";
import { authController } from "./auth.controller.js";
import { authMiddleware } from "./auth.middleware.js";

const router = Router();

router.post("/login", (req, res) => authController.login(req, res));
router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));
router.post("/logout", authMiddleware, (req, res) => authController.logout(req, res));

export default router;
