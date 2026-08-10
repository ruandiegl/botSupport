import "./load-env.js";
import { app } from "./app.js";
import { logger } from "./shared/logger.js";
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const server = app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Servidor GTF-Bot Backend rodando na porta ${PORT}`);
});
server.on("error", (error) => {
    logger.error(error, "Erro ao iniciar o servidor HTTP");
    process.exit(1);
});
process.on("unhandledRejection", (reason) => {
    logger.error(reason, "Unhandled Rejection");
});
process.on("uncaughtException", (error) => {
    logger.error(error, "Uncaught Exception");
});
