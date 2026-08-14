import { mediaRepository } from "./media.repository.js";
import { logger } from "../../shared/logger.js";
import { socketEmitter } from "../../shared/socket.js";

let timer: NodeJS.Timeout | null = null;
let running = false;

async function expireBatch() {
  if (running) return;
  running = true;
  try {
    const expired = await mediaRepository.expireDue();
    for (const item of expired) {
      socketEmitter.emitToConversation(item.conversationId, "media:expired", {
        conversationId: item.conversationId,
        mediaId: item.id,
      });
    }
    if (expired.length) logger.info({ count: expired.length }, "URLs de mídia expiradas e eliminadas");
  } catch (error) {
    logger.error({ error }, "Falha ao expirar metadados de mídia");
  } finally {
    running = false;
  }
}

export const mediaExpirationWorker = {
  start() {
    if (timer || process.env.MEDIA_EXPIRATION_JOB_ENABLED === "false") return;
    const intervalMinutes = Math.max(
      1,
      Number(process.env.MEDIA_EXPIRATION_JOB_INTERVAL_MINUTES ?? "15") || 15,
    );
    void expireBatch();
    timer = setInterval(() => void expireBatch(), intervalMinutes * 60_000);
    timer.unref();
  },
  async runNow() {
    await expireBatch();
  },
};
