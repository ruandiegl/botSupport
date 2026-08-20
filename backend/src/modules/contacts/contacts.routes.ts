import { Router } from "express";
import { authMiddleware, requirePermission } from "../auth/auth.middleware.js";
import { contactsController } from "./contacts.controller.js";

const router = Router();
router.get("/contacts", authMiddleware, requirePermission("contacts", "view"), (req, res) => contactsController.list(req, res));
router.get("/contacts/:id", authMiddleware, requirePermission("contacts", "view"), (req, res) => contactsController.get(req, res));
router.post("/contacts", authMiddleware, requirePermission("contacts", "create"), (req, res) => contactsController.create(req, res));
router.patch("/contacts/:id", authMiddleware, requirePermission("contacts", "update"), (req, res) => contactsController.update(req, res));
router.get("/contacts/:id/conversations", authMiddleware, requirePermission("contacts", "view"), (req, res) => contactsController.conversations(req, res));

export default router;
