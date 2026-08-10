import { Router } from "express";
import { departmentsController } from "./departments.controller.js";

const router = Router();

router.get("/departments", (req, res) => departmentsController.list(req, res));
router.post("/departments", (req, res) => departmentsController.create(req, res));
router.patch("/departments/:id", (req, res) => departmentsController.update(req, res));
router.delete("/departments/:id", (req, res) => departmentsController.delete(req, res));

export default router;
