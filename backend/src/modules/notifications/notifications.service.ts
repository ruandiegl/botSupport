import { notificationsRepository } from "./notifications.repository.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";
import { logger } from "../../shared/logger.js";

export type NotificationEvent = {
  conversationId?: string;
  status?: string;
  eventType?: string;
  messageId?: string;
  departmentId?: string | null;
  assignedAgentId?: string | null;
  queuedAt?: string | Date | null;
  actorName?: string | null;
  reason?: string | null;
  assignmentId?: string;
  response?: "ACCEPTED" | "DECLINED";
};

let initialized = false;
let workerTimer: NodeJS.Timeout | undefined;

function dateKey(value: Date, repeatMinutes: number) {
  return Math.floor(value.getTime() / (repeatMinutes * 60 * 1000));
}

export class NotificationsService {
  async list(agentId: string, unreadOnly = false, page = 1, limit = 30) {
    const [[items, total], unreadCount] = await Promise.all([
      notificationsRepository.list(agentId, { unreadOnly, page, limit }),
      notificationsRepository.unreadCount(agentId),
    ]);
    return { items, page, limit, total, unreadCount, totalPages: Math.ceil(total / limit) };
  }

  unreadCount(agentId: string) {
    return notificationsRepository.unreadCount(agentId);
  }

  markRead(id: string, agentId: string) {
    return notificationsRepository.markRead(id, agentId).then((result) => {
      if (result.count) socketEmitter.emitToAgent(agentId, "notification:read", { notificationId: id });
      return result;
    });
  }

  markAllRead(agentId: string) {
    return notificationsRepository.markAllRead(agentId).then((result) => {
      socketEmitter.emitToAgent(agentId, "notification:read", { all: true });
      return result;
    });
  }

  dismiss(id: string, agentId: string) {
    return notificationsRepository.dismiss(id, agentId).then((result) => {
      if (result.count) socketEmitter.emitToAgent(agentId, "notification:dismissed", { notificationId: id });
      return result;
    });
  }

  preference(agentId: string) {
    return notificationsRepository.getPreference(agentId);
  }

  updatePreference(agentId: string, data: { soundEnabled?: boolean; browserEnabled?: boolean; unresolvedRemindersEnabled?: boolean; unresolvedReminderMinutes?: number; reminderRepeatMinutes?: number }) {
    return notificationsRepository.updatePreference(agentId, data);
  }

  async notifyConversation(event: NotificationEvent) {
    if (!event.conversationId) return [];
    const context = await notificationsRepository.findConversationContext(event.conversationId);
    if (!context) return [];
    const effectiveStatus = event.status ?? context.status;
    const effectiveDepartmentId = event.departmentId ?? context.departmentId;
    const effectiveAssignedAgentId = event.assignedAgentId ?? context.assignedAgentId;
    const effectiveQueuedAt = event.queuedAt ?? context.queuedAt;
    const type = event.eventType === "DELEGATED" && effectiveAssignedAgentId
      ? "CONVERSATION_DELEGATED"
      : event.eventType === "ASSIGNED" && effectiveAssignedAgentId
      ? "ASSIGNED_CONVERSATION"
      : event.eventType === "INACTIVITY_CONTINUED"
      ? "INACTIVITY_CONTINUED"
      : event.eventType === "MESSAGE_RECEIVED" || event.eventType === "NEW_MESSAGE"
      ? "NEW_MESSAGE"
      : effectiveStatus === "QUEUED" && event.eventType !== "READ"
      ? "NEW_QUEUE_CONVERSATION"
      : null;
    if (!type) return [];

    const occurrence = type === "NEW_MESSAGE" || type === "INACTIVITY_CONTINUED"
      ? event.messageId || String(effectiveQueuedAt || Date.now())
      : type === "CONVERSATION_DELEGATED"
      ? event.assignmentId || String(Date.now())
      : String(effectiveQueuedAt || event.conversationId);
    // No department/assignee means there is no safe recipient scope. Do not
    // broadcast a potentially private conversation to every agent.
    if (!effectiveDepartmentId && !effectiveAssignedAgentId) return [];
    const agents = await notificationsRepository.findEligibleAgents(effectiveDepartmentId, effectiveAssignedAgentId);
    const created = await notificationsRepository.createManyIdempotent(agents.map(({ id }) => ({
      agentId: id,
      type,
      title: type === "NEW_MESSAGE"
        ? "Nova mensagem recebida"
        : type === "INACTIVITY_CONTINUED"
        ? "Chamado retomado pelo cliente"
        : type === "CONVERSATION_DELEGATED"
        ? "Chamado delegado para você"
        : type === "ASSIGNED_CONVERSATION"
        ? "Atendimento assumido"
        : "Novo chamado na fila",
      body: type === "NEW_MESSAGE"
        ? "Uma conversa recebeu uma nova mensagem."
        : type === "INACTIVITY_CONTINUED"
        ? "O cliente escolheu continuar o atendimento. Verifique a conversa e dê prosseguimento."
        : type === "CONVERSATION_DELEGATED"
        ? `${event.actorName || "Um gestor"} delegou um atendimento para você.${event.reason ? ` Motivo: ${event.reason}` : ""}`
        : type === "ASSIGNED_CONVERSATION"
        ? "Um atendimento foi atribuído a você."
        : "Uma nova conversa aguarda atendimento.",
      conversationId: event.conversationId,
      departmentId: effectiveDepartmentId ?? null,
      dedupeKey: `${type}:${event.conversationId}:${occurrence}`,
      payload: {
        conversationId: event.conversationId,
        status: effectiveStatus,
        actorName: event.actorName ?? null,
        reason: event.reason ?? null,
        ...(type === "CONVERSATION_DELEGATED" ? { delegationAssignmentId: event.assignmentId ?? null } : {}),
      },
    })));
    for (const notification of created) {
      socketEmitter.emitToAgent(notification.agentId, "notification:new", {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        conversationId: notification.conversationId,
        payload: notification.payload,
        createdAt: notification.createdAt.toISOString(),
      });
    }
    return created;
  }

  async notifyDelegationResponse(data: {
    assignmentId: string;
    conversationId: string;
    delegatorAgentId: string;
    responderName: string;
    decision: "ACCEPTED" | "DECLINED";
  }) {
    const accepted = data.decision === "ACCEPTED";
    const rows = await notificationsRepository.createManyIdempotent([{
      agentId: data.delegatorAgentId,
      type: "DELEGATION_RESPONSE",
      title: accepted ? "Delegação aceita" : "Delegação recusada",
      body: accepted
        ? `${data.responderName} assumiu o chamado delegado.`
        : `${data.responderName} não assumiu o chamado delegado. Ele voltou para a responsabilidade anterior ou para a fila.`,
      conversationId: data.conversationId,
      dedupeKey: `DELEGATION_RESPONSE:${data.assignmentId}:${data.decision}`,
      payload: {
        conversationId: data.conversationId,
        delegationAssignmentId: data.assignmentId,
        decision: data.decision,
        responderName: data.responderName,
      },
    }]);
    for (const notification of rows) {
      socketEmitter.emitToAgent(notification.agentId, "notification:new", {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        conversationId: notification.conversationId,
        payload: notification.payload,
        createdAt: notification.createdAt.toISOString(),
      });
    }
    return rows;
  }

  async createUnresolvedReminders(now = new Date()) {
    // Fetch all open candidates up to now; each agent's preference determines
    // the effective age threshold below.
    const baseBefore = now;
    const queued = await notificationsRepository.findQueuedForReminder(baseBefore);
    const inProgress = await notificationsRepository.findInProgressForReminder(baseBefore);
    const created: any[] = [];
    for (const conversation of queued) {
      if (!conversation.queuedAt) continue;
      if (!conversation.departmentId && !conversation.assignedAgentId) continue;
      const agents = await notificationsRepository.findEligibleAgents(conversation.departmentId, conversation.assignedAgentId);
      for (const { id: agentId } of agents) {
        const preference = await notificationsRepository.getPreference(agentId);
        const ageMinutes = (now.getTime() - conversation.queuedAt.getTime()) / 60000;
        if (!preference.unresolvedRemindersEnabled || ageMinutes < preference.unresolvedReminderMinutes) continue;
        const row = await notificationsRepository.createManyIdempotent([{
          agentId,
          type: "UNRESOLVED_REMINDER",
          title: "Chamado aguardando atendimento",
          body: "Esta conversa está aguardando atendimento. Dê prosseguimento ou encerre o chamado.",
          conversationId: conversation.id,
          departmentId: conversation.departmentId,
          dedupeKey: `UNRESOLVED_REMINDER:${conversation.id}:${dateKey(now, preference.reminderRepeatMinutes)}`,
          payload: { conversationId: conversation.id, status: "QUEUED" },
        }]);
        created.push(...row);
      }
    }
    for (const conversation of inProgress) {
      if (!conversation.lastActivityAt || !conversation.assignedAgentId) continue;
      const agentId = conversation.assignedAgentId;
      const preference = await notificationsRepository.getPreference(agentId);
      const ageMinutes = (now.getTime() - conversation.lastActivityAt.getTime()) / 60000;
      if (!preference.unresolvedRemindersEnabled || ageMinutes < preference.unresolvedReminderMinutes) continue;
      const row = await notificationsRepository.createManyIdempotent([{
        agentId,
        type: "UNRESOLVED_REMINDER",
        title: "Atendimento sem atividade recente",
        body: "Este chamado continua aberto. Dê prosseguimento ou encerre o atendimento.",
        conversationId: conversation.id,
        departmentId: conversation.departmentId,
        dedupeKey: `UNRESOLVED_REMINDER:${conversation.id}:${dateKey(now, preference.reminderRepeatMinutes)}`,
        payload: { conversationId: conversation.id, status: "IN_PROGRESS" },
      }]);
      created.push(...row);
    }
    for (const notification of created) {
      socketEmitter.emitToAgent(notification.agentId, "notification:new", {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        conversationId: notification.conversationId,
        createdAt: notification.createdAt.toISOString(),
      });
    }
    return created;
  }

  start() {
    if (initialized) return;
    initialized = true;
    conversationEvents.on("conversation_updated", (event: NotificationEvent) => {
      void this.notifyConversation(event).catch((error) => logger.error({ error }, "Falha ao criar notificação da conversa"));
    });
    workerTimer = setInterval(() => {
      void this.createUnresolvedReminders().catch((error) => logger.error({ error }, "Falha no worker de lembretes"));
    }, 60_000);
    workerTimer.unref();
    void this.createUnresolvedReminders().catch((error) => logger.error({ error }, "Falha no primeiro ciclo de lembretes"));
  }

  stop() {
    if (workerTimer) clearInterval(workerTimer);
    workerTimer = undefined;
    initialized = false;
  }
}

export const notificationsService = new NotificationsService();
