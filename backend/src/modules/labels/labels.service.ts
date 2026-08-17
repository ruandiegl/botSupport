import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { socketEmitter } from "../../shared/socket.js";
import type { CreateLabelBody, ListLabelsQuery, UpdateLabelBody } from "./labels.schemas.js";
import { labelsRepository } from "./labels.repository.js";

export class LabelError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function formatLabel(item: any) {
  return { id: item.id, name: item.name, slug: item.slug, color: item.color, icon: item.icon, isSystem: item.isSystem, createdAt: item.createdAt, usageCount: item._count?.conversationLabels ?? 0 };
}

export class LabelsService {
  private canAccess(conversation: any, user?: AuthenticatedRequest["user"]) {
    if (!user) return false;
    if (user.role === "ADMIN" || user.role === "SUPERVISOR") return true;
    return conversation.assignedAgentId === user.id || Boolean(conversation.status === "OPEN" && user.departmentId && conversation.departmentId === user.departmentId);
  }

  async list(query: ListLabelsQuery) {
    const result = await labelsRepository.list(query.q, query.page, query.limit);
    return { items: result.items.map(formatLabel), total: result.total, page: query.page, limit: query.limit, totalPages: Math.ceil(result.total / query.limit) };
  }

  async create(data: CreateLabelBody) {
    try {
      return formatLabel(await labelsRepository.create({ ...data, slug: data.slug.toUpperCase(), icon: data.icon || null, isSystem: false }));
    } catch (error: any) {
      if (error?.code === "P2002") throw new LabelError("Já existe uma etiqueta com este nome ou identificador.", 409);
      throw error;
    }
  }

  async update(id: string, data: UpdateLabelBody) {
    const current = await labelsRepository.findById(id);
    if (!current) throw new LabelError("Etiqueta não encontrada.", 404);
    if (current.isSystem) throw new LabelError("Etiquetas do sistema não podem ser editadas.", 409);
    try {
      return formatLabel(await labelsRepository.update(id, { ...data, ...(data.slug ? { slug: data.slug.toUpperCase() } : {}), ...(data.icon !== undefined ? { icon: data.icon || null } : {}) }));
    } catch (error: any) {
      if (error?.code === "P2002") throw new LabelError("Já existe uma etiqueta com este nome ou identificador.", 409);
      throw error;
    }
  }

  async delete(id: string) {
    const current = await labelsRepository.findById(id);
    if (!current) return;
    if (current.isSystem) throw new LabelError("Etiquetas do sistema não podem ser excluídas.", 409);
    await labelsRepository.delete(id);
  }

  async assign(conversationId: string, labelId: string, user?: AuthenticatedRequest["user"]) {
    const [conversation, label] = await Promise.all([labelsRepository.getConversation(conversationId), labelsRepository.findById(labelId)]);
    if (!conversation) throw new LabelError("Conversa não encontrada.", 404);
    if (!this.canAccess(conversation, user)) throw new LabelError("Você não pode alterar esta conversa.", 403);
    if (!label) throw new LabelError("Etiqueta não encontrada.", 404);
    await labelsRepository.assign(conversationId, labelId, user?.id);
    return this.emitLabels(conversationId);
  }

  async remove(conversationId: string, labelId: string, user?: AuthenticatedRequest["user"]) {
    const conversation = await labelsRepository.getConversation(conversationId);
    if (!conversation) throw new LabelError("Conversa não encontrada.", 404);
    if (!this.canAccess(conversation, user)) throw new LabelError("Você não pode alterar esta conversa.", 403);
    await labelsRepository.remove(conversationId, labelId);
    return this.emitLabels(conversationId);
  }

  async assignSystem(conversationId: string, slug: string) {
    const label = await labelsRepository.findBySlug(slug);
    if (!label) throw new LabelError(`Etiqueta de sistema ${slug} não encontrada.`, 500);
    await labelsRepository.assign(conversationId, label.id, null);
    return this.emitLabels(conversationId);
  }

  private async emitLabels(conversationId: string) {
    const rows = await labelsRepository.listConversationLabels(conversationId);
    const labels = rows.map((row) => row.label);
    const payload = { conversationId, labels };
    socketEmitter.emitToConversation(conversationId, "conversation:labels_updated", payload);
    socketEmitter.emitToQueue("conversation:labels_updated", { conversationId });
    return { conversationId, labels };
  }
}

export const labelsService = new LabelsService();
