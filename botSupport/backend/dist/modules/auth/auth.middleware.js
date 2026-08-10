import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "gtfbot_super_secret_jwt_key_2026";
export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Token de autenticação não fornecido." });
        return;
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ error: "Token de autenticação inválido ou expirado." });
        return;
    }
}
export function requireRole(allowedRoles) {
    return (req, res, next) => {
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
