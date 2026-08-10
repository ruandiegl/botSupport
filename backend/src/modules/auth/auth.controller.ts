import { Request, Response } from "express";
import { loginSchema } from "./auth.schemas.js";
import { authService } from "./auth.service.js";
import { AuthenticatedRequest } from "./auth.middleware.js";
import { logger } from "../../shared/logger.js";

export class AuthController {
  async login(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Dados de login inválidos",
        details: parsed.error.format(),
      });
      return;
    }

    try {
      const result = await authService.login(parsed.data);
      res.json(result);
    } catch (err: any) {
      logger.error(err, "Erro na tentativa de login");
      res.status(401).json({ error: err.message || "Falha na autenticação" });
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response) {
    if (!req.user?.id) {
      res.status(401).json({ error: "Não autenticado" });
      return;
    }

    try {
      const agent = await authService.getMe(req.user.id);
      res.json(agent);
    } catch (err: any) {
      res.status(404).json({ error: err.message || "Usuário não encontrado" });
    }
  }

  async logout(req: AuthenticatedRequest, res: Response) {
    if (req.user?.id) {
      await authService.logout(req.user.id);
    }
    res.json({ success: true, message: "Sessão encerrada" });
  }
}

export const authController = new AuthController();
