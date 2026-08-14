/**
 * Inactivity Worker
 *
 * Runs on a periodic interval (every 5 minutes) and:
 *  1. Sends a WhatsApp warning message to conversations that have been idle
 *     for more than INACTIVITY_WARNING_MINUTES without a client reply.
 *  2. Closes conversations that are still idle INACTIVITY_CLOSE_MINUTES
 *     after the warning was sent.
 *  3. On any incoming client message the warningSentAt is reset by the
 *     webhook handler so the clock restarts automatically.
 */

import { conversationsRepository } from "./conversations.repository.js";
import { zApiService } from "../zapi/zapi.service.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";
import { logger } from "../../shared/logger.js";

// ─── Configuration (env-overridable) ─────────────────────────────────────────
const INACTIVITY_WARNING_MINUTES = Number(process.env.INACTIVITY_WARNING_MINUTES ?? 30);
const INACTIVITY_CLOSE_MINUTES = Number(process.env.INACTIVITY_CLOSE_MINUTES ?? 15);
const CHECK_INTERVAL_MS = Number(process.env.INACTIVITY_CHECK_INTERVAL_MS ?? 5 * 60 * 1000); // 5 min

// ─── Message Templates ────────────────────────────────────────────────────────
function buildWarningMessage(conversationId: string): string {
  const shortId = conversationId.slice(0, 8).toUpperCase();
  return (
    `⚠️ *Aviso de Inatividade*\n\n` +
    `Olá! Notamos que você não respondeu no chamado *#${shortId}*.\n\n` +
    `Caso não haja resposta em *${INACTIVITY_CLOSE_MINUTES} minutos*, ` +
    `este atendimento será encerrado automaticamente.\n\n` +
    `_Se ainda precisar de ajuda, basta responder esta mensagem!_ 😊`
  );
}

function buildCloseMessage(conversationId: string): string {
  const shortId = conversationId.slice(0, 8).toUpperCase();
  return (
    `ℹ️ *Atendimento Encerrado*\n\n` +
    `O seu chamado *#${shortId}* foi encerrado automaticamente por falta de resposta.\n\n` +
    `Quando precisar de ajuda novamente, basta nos enviar uma mensagem! ` +
    `Estamos sempre aqui para ajudar. 🤝`
  );
}

// ─── Worker Logic ─────────────────────────────────────────────────────────────
export class InactivityWorker {
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  async runOnce(): Promise<void> {
    if (this.running) {
      logger.warn("inactivity-worker: previous run still in progress, skipping");
      return;
    }
    this.running = true;
    try {
      await this.sendWarnings();
      await this.closeInactive();
    } catch (error) {
      logger.error({ error }, "inactivity-worker: unhandled error");
    } finally {
      this.running = false;
    }
  }

  /** Stage 1: Send warning to conversations idle > INACTIVITY_WARNING_MINUTES with no warning yet. */
  private async sendWarnings(): Promise<void> {
    const conversations = await conversationsRepository.findInactiveWithoutWarning(INACTIVITY_WARNING_MINUTES);

    for (const conv of conversations) {
      const phone = conv.contact?.phone;
      if (!phone) continue;

      const message = buildWarningMessage(conv.id);
      try {
        await zApiService.sendText(phone, message);
        await conversationsRepository.markWarningSent(conv.id);
        logger.info({ conversationId: conv.id }, "inactivity-worker: warning sent");

        // Notify frontend in real-time
        socketEmitter.emitToConversation(conv.id, "conversation:inactivity_warning", {
          conversationId: conv.id,
        });
      } catch (error) {
        logger.error({ error, conversationId: conv.id }, "inactivity-worker: failed to send warning");
      }
    }

    if (conversations.length > 0) {
      logger.info(`inactivity-worker: sent ${conversations.length} warning(s)`);
    }
  }

  /** Stage 2: Close conversations that received a warning > INACTIVITY_CLOSE_MINUTES ago and still no reply. */
  private async closeInactive(): Promise<void> {
    const conversations = await conversationsRepository.findInactiveAfterWarning(INACTIVITY_CLOSE_MINUTES);

    for (const conv of conversations) {
      const phone = conv.contact?.phone;
      if (!phone) continue;

      try {
        await conversationsRepository.close(conv.id, "AUTO_TIMEOUT");

        const message = buildCloseMessage(conv.id);
        await zApiService.sendText(phone, message);

        logger.info({ conversationId: conv.id }, "inactivity-worker: conversation auto-closed");

        // Notify frontend in real-time
        conversationEvents.emit("conversation_updated", {
          conversationId: conv.id,
          status: "CLOSED",
          eventType: "AUTO_CLOSED",
        });

        socketEmitter.emitToConversation(conv.id, "conversation:auto_closed", {
          conversationId: conv.id,
          reason: "AUTO_TIMEOUT",
        });
      } catch (error) {
        logger.error({ error, conversationId: conv.id }, "inactivity-worker: failed to auto-close conversation");
      }
    }

    if (conversations.length > 0) {
      logger.info(`inactivity-worker: auto-closed ${conversations.length} conversation(s)`);
    }
  }

  start(): void {
    if (this.timer) {
      logger.warn("inactivity-worker: already started");
      return;
    }

    // Run immediately on startup, then on the interval
    this.runOnce();

    this.timer = setInterval(() => {
      this.runOnce();
    }, CHECK_INTERVAL_MS);

    // Unref so the timer never prevents graceful shutdown
    this.timer.unref();

    logger.info(
      {
        warningMinutes: INACTIVITY_WARNING_MINUTES,
        closeMinutes: INACTIVITY_CLOSE_MINUTES,
        intervalMs: CHECK_INTERVAL_MS,
      },
      "inactivity-worker: started",
    );
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info("inactivity-worker: stopped");
    }
  }
}

export const inactivityWorker = new InactivityWorker();
