import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { rbacService } from "../rbac/rbac.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "gtfbot_super_secret_jwt_key_2026";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    departmentId?: string | null;
    isActive?: boolean;
  };
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token de autenticação não fornecido." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Token de autenticação inválido ou expirado." });
    return;
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: "Não autenticado." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Acesso negado. Ação restrita para as funções: ${allowedRoles.join(", ")}`,
      });
      return;
    }

    next();
  };
}

export function requirePermission(resource: string, action: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Não autenticado." });
    try {
      const allowed = await rbacService.hasPermission(req.user.role, resource, action);
      if (!allowed) return res.status(403).json({ error: "Você não possui permissão para esta ação." });
      next();
    } catch {
      res.status(500).json({ error: "Não foi possível validar a permissão." });
    }
  };
}
