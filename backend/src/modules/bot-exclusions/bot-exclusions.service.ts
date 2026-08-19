import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import type { CreateBotExclusionBody, ListBotExclusionsQuery, UpdateBotExclusionBody } from "./bot-exclusions.schemas.js";
import { botExclusionsRepository } from "./bot-exclusions.repository.js";

export class BotExclusionError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function normalizeBotPhone(value: string | null | undefined) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
}

function phoneVariants(phone: string) {
  const variants = new Set([phone]);
  if (phone.startsWith("55") && phone.length === 13 && phone[4] === "9") variants.add(`${phone.slice(0, 4)}${phone.slice(5)}`);
  if (phone.startsWith("55") && phone.length === 12 && phone[4] !== "9") variants.add(`${phone.slice(0, 4)}9${phone.slice(4)}`);
  return [...variants];
}

function format(item: any) {
  return {
    id: item.id,
    phone: item.phone,
    label: item.label,
    reason: item.reason,
    isActive: item.isActive,
    disabledAt: item.disabledAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    createdByAgentId: item.createdByAgentId,
  };
}

export class BotExclusionsService {
  async list(query: ListBotExclusionsQuery) {
    const result = await botExclusionsRepository.list(query.q, query.activeOnly, query.page, query.limit);
    return { items: result.items.map(format), total: result.total, page: query.page, limit: query.limit, totalPages: Math.ceil(result.total / query.limit) };
  }

  async isBlocked(phone: string) {
    const normalized = normalizeBotPhone(phone);
    if (!normalized) return false;
    return Boolean(await botExclusionsRepository.findActiveByPhone(phoneVariants(normalized)));
  }

  async create(data: CreateBotExclusionBody, user?: AuthenticatedRequest["user"]) {
    const phone = normalizeBotPhone(data.phone);
    if (await botExclusionsRepository.findByPhones(phoneVariants(phone))) throw new BotExclusionError("Este número já está na lista de bloqueio.", 409);
    try {
      return format(await botExclusionsRepository.create({ phone, label: data.label ?? null, reason: data.reason ?? null, createdByAgentId: user?.id ?? null }));
    } catch (error: any) {
      if (error?.code === "P2002") throw new BotExclusionError("Este número já está na lista de bloqueio.", 409);
      throw error;
    }
  }

  async update(id: string, data: UpdateBotExclusionBody, user?: AuthenticatedRequest["user"]) {
    const current = await botExclusionsRepository.findById(id);
    if (!current) throw new BotExclusionError("Número não encontrado na lista de bloqueio.", 404);
    const phone = data.phone === undefined ? undefined : normalizeBotPhone(data.phone);
    if (phone && phone !== current.phone && await botExclusionsRepository.findByPhones(phoneVariants(phone))) throw new BotExclusionError("Este número já está na lista de bloqueio.", 409);
    const isActive = data.isActive ?? current.isActive;
    return format(await botExclusionsRepository.update(id, {
      ...(phone !== undefined ? { phone } : {}),
      ...(data.label !== undefined ? { label: data.label } : {}),
      ...(data.reason !== undefined ? { reason: data.reason } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive, disabledAt: isActive ? null : new Date(), disabledByAgentId: isActive ? null : (user?.id ?? null) } : {}),
      updatedByAgentId: user?.id ?? null,
    }));
  }

  async remove(id: string, user?: AuthenticatedRequest["user"]) {
    const current = await botExclusionsRepository.findById(id);
    if (!current) throw new BotExclusionError("Número não encontrado na lista de bloqueio.", 404);
    // Soft-disable keeps the audit trail and makes accidental deletion recoverable.
    return format(await botExclusionsRepository.update(id, { isActive: false, disabledAt: new Date(), disabledByAgentId: user?.id ?? null, updatedByAgentId: user?.id ?? null }));
  }
}

export const botExclusionsService = new BotExclusionsService();
