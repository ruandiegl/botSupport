import { Router } from "express";
import { flowController } from "./flow.controller.js";

const router = Router();

router.get("/flow", (req, res) => flowController.get(req, res));
router.put("/flow", (req, res) => flowController.update(req, res));

export default router;
