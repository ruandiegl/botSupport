import type { Request, Response } from "express";
import { flowService } from "./flow.service.js";
import { UpdateFlowBodySchema } from "./flow.schemas.js";

export class FlowController {
  async get(_req: Request, res: Response): Promise<void> {
    const flow = await flowService.getLatest();
    if (!flow) {
      res.status(404).json({ error: "Fluxo ainda não configurado" });
      return;
    }
    res.json(flow);
  }

  async update(req: Request, res: Response): Promise<void> {
    const parsed = UpdateFlowBodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const flow = await flowService.update(parsed.data);
    res.json(flow);
  }
}

export const flowController = new FlowController();
