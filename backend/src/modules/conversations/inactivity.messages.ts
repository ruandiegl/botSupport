/**
 * Messages and stable action identifiers used by the inactivity workflow.
 * Keeping these values in one module lets the worker and the webhook handler
 * agree on the same interactive actions without coupling their lifecycles.
 */

export const INACTIVITY_FINALIZE_ACTION = "inactivity_finalize" as const;
export const INACTIVITY_CONTINUE_ACTION = "inactivity_continue" as const;

export const inactivityActionOptions = [
  { optionKey: INACTIVITY_FINALIZE_ACTION, label: "Finalizar atendimento" },
  { optionKey: INACTIVITY_CONTINUE_ACTION, label: "Quero continuar atendimento" },
] as const;

export type InactivityAction = typeof INACTIVITY_FINALIZE_ACTION | typeof INACTIVITY_CONTINUE_ACTION;

export function resolveInactivityAction(content: string | undefined, selectedOptionId?: string): InactivityAction | null {
  const candidate = String(selectedOptionId || content || "").trim().toLowerCase();
  if (!candidate) return null;
  if (candidate === INACTIVITY_FINALIZE_ACTION || candidate === "finalizar atendimento") {
    return INACTIVITY_FINALIZE_ACTION;
  }
  if (candidate === INACTIVITY_CONTINUE_ACTION || candidate === "quero continuar atendimento") {
    return INACTIVITY_CONTINUE_ACTION;
  }
  return null;
}

export function buildInactivityWarningMessage(conversationId: string, closeMinutes: number): string {
  const shortId = conversationId.slice(0, 8).toUpperCase();
  return (
    `⚠️ *Aviso de inatividade*\n\n` +
    `Olá! Ainda não recebemos uma resposta sua no chamado *#${shortId}*.\n\n` +
    `Escolha uma opção abaixo para informar se deseja finalizar ou continuar o atendimento. ` +
    `Sem uma escolha nos próximos *${closeMinutes} minutos*, o atendimento será encerrado automaticamente.\n\n` +
    `_Estamos à disposição para ajudar!_ 😊`
  );
}

export function buildInactivityCloseMessage(conversationId: string): string {
  const shortId = conversationId.slice(0, 8).toUpperCase();
  return (
    `ℹ️ *Atendimento encerrado*\n\n` +
    `O chamado *#${shortId}* foi encerrado automaticamente após 2 horas sem interação.\n\n` +
    `Se ainda precisar de ajuda, envie uma nova mensagem para iniciar um novo atendimento. ` +
    `Estamos à disposição! 🤝`
  );
}

export function buildInactivityContinueMessage(): string {
  return `✅ *Atendimento retomado*\n\nComo podemos ajudar? Responda esta mensagem para continuar o atendimento.`;
}
