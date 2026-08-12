import { conversationsRepository } from "./conversations.repository.js";
import { zApiService } from "../zapi/zapi.service.js";
import { conversationEvents } from "../../shared/events.js";
import { socketEmitter } from "../../shared/socket.js";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export class ConversationsService {
  async formatConversation(id: string) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;

    const messages = conversation.messages || [];
    const lastMessage = messages.at(-1)?.content ?? "Nenhuma mensagem ainda";
    const unreadCount = messages.filter((m) => m.direction === "IN" && !m.readAt).length;

    return {
      id: conversation.id,
      contact: {
        name: conversation.contact?.name ?? "Contato sem nome",
        phone: conversation.contact?.phone ?? "",
        initials: getInitials(conversation.contact?.name ?? "CS"),
      },
      status: conversation.status,
      departmentId: conversation.departmentId,
      departmentName: conversation.department?.name ?? null,
      assignedAgentId: conversation.assignedAgentId,
      assignedAgentName: conversation.assignedAgent?.name ?? null,
      unreadCount,
      lastMessage,
      messages: messages.map((m) => ({
        id: m.id,
        direction: m.direction,
        senderType: m.senderType,
        senderName:
          m.senderType === "AGENT"
            ? conversation.assignedAgent?.name ?? "Atendente"
            : m.senderType === "BOT"
            ? "GTF-Bot"
            : conversation.contact?.name ?? "Cliente",
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
      startedAt: conversation.startedAt.toISOString(),
    };
  }

  async list(filters: { status?: string; departmentId?: string }) {
    const list = await conversationsRepository.findMany(filters);
    const results = await Promise.all(list.map((c) => this.formatConversation(c.id)));
    return results.filter(Boolean);
  }

  async getById(id: string) {
    return this.formatConversation(id);
  }

  async markAsRead(id: string) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;

    await conversationsRepository.markIncomingMessagesAsRead(id);
    conversationEvents.emit("conversation_updated", { conversationId: id, unreadCount: 0 });

    return this.formatConversation(id);
  }

  async assume(id: string, agentId: string) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;

    await conversationsRepository.updateStatusAndAgent(id, "IN_PROGRESS", agentId);

    conversationEvents.emit("conversation_updated", { conversationId: id });

    return this.formatConversation(id);
  }

  async close(id: string) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;

    await conversationsRepository.close(id);

    conversationEvents.emit("conversation_updated", { conversationId: id });

    return this.formatConversation(id);
  }

  async sendMessage(id: string, rawContent: string) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;

    let agent = conversation.assignedAgent;
    if (!agent && conversation.assignedAgentId) {
      agent = await conversationsRepository.findAgentById(conversation.assignedAgentId);
    }
    if (!agent) {
      agent = await conversationsRepository.findFirstAgent();
    }

    const agentName = agent?.name ?? "Atendente";
    const deptName = conversation.department?.name ?? "Suporte T.I.";
    const cleanContent = rawContent.trim();

    const content = cleanContent.startsWith("*")
      ? cleanContent
      : `*${agentName} - ${deptName}:*\n\n${cleanContent}`;

    const message = await conversationsRepository.addMessage({
      conversationId: id,
      direction: "OUT",
      senderType: "AGENT",
      senderAgentId: agent?.id ?? null,
      content,
    });

    // Disparar via Z-API no WhatsApp real
    if (conversation.contact?.phone) {
      await zApiService.sendText(conversation.contact.phone, content);
    }

    const formattedMsg = {
      id: message.id,
      direction: message.direction,
      senderType: message.senderType,
      senderName: agentName,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };

    socketEmitter.emitToConversation(id, "message:new", {
      conversationId: id,
      message: formattedMsg,
    });

    conversationEvents.emit("conversation_updated", { conversationId: id });

    return formattedMsg;
  }

  async transfer(id: string, departmentId: string) {
    const conversation = await conversationsRepository.findById(id);
    if (!conversation) return null;

    const dept = await conversationsRepository.findDepartmentById(departmentId);
    const deptName = dept?.name ?? "Novo Departamento";

    await conversationsRepository.updateStatusAndAgent(id, "QUEUED", null);
    await conversationsRepository.updateDepartment(id, departmentId);

    const transferText = `Seu atendimento foi transferido para a fila de *${deptName}*. Em breve um atendente deste departamento irá assumir.`;

    await conversationsRepository.addMessage({
      conversationId: id,
      direction: "OUT",
      senderType: "BOT",
      content: transferText,
    });

    if (conversation.contact?.phone) {
      await zApiService.sendText(conversation.contact.phone, transferText);
    }

    conversationEvents.emit("conversation_updated", { conversationId: id });

    return this.formatConversation(id);
  }
}

export const conversationsService = new ConversationsService();
