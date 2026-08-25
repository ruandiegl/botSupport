import type { Prisma, ShortcutScope, ShortcutType } from "../../generated/prisma/index.js";
import type { CreateShortcutBody, ShortcutListQuery, UpdateShortcutBody } from "./shortcuts.schemas.js";
import { shortcutsRepository } from "./shortcuts.repository.js";

export interface ShortcutActor {
  id: string;
  role: string;
  departmentId?: string | null;
}

export class ShortcutError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

function formatShortcut(item: any) {
  const { audits, ...shortcut } = item;
  return { ...shortcut, usageCount: audits?.length || 0, lastUsedAt: audits?.[0]?.createdAt || null };
}

export class ShortcutsService {
  private visibility(actor: ShortcutActor, includeArchived = false): Prisma.ShortcutWhereInput {
    const sharedScopes: Prisma.ShortcutWhereInput[] = [{ scope: "GLOBAL" }];
    if (actor.role === "ADMIN") sharedScopes.push({ scope: "DEPARTMENT" });
    else if (actor.departmentId) sharedScopes.push({ scope: "DEPARTMENT", departmentId: actor.departmentId });
    sharedScopes.push({ scope: "PERSONAL", ownerId: actor.id });
    return { ...(includeArchived ? {} : { archivedAt: null }), OR: sharedScopes };
  }

  private normalizeScope(data: CreateShortcutBody | UpdateShortcutBody, actor: ShortcutActor, existing?: any) {
    const scope = (data.scope || existing?.scope) as ShortcutScope;
    const departmentId = data.departmentId !== undefined ? data.departmentId : existing?.departmentId;

    if (actor.role === "AGENT" && scope !== "PERSONAL") {
      throw new ShortcutError("Atendentes podem gerenciar apenas atalhos pessoais.", 403);
    }
    if (scope === "DEPARTMENT" && !departmentId) {
      throw new ShortcutError("Selecione um departamento para este atalho.");
    }
    if (scope === "DEPARTMENT" && actor.role !== "ADMIN" && departmentId !== actor.departmentId) {
      throw new ShortcutError("Você só pode gerenciar atalhos do seu departamento.", 403);
    }
    return {
      scope,
      departmentId: scope === "DEPARTMENT" ? departmentId : null,
      ownerId: scope === "PERSONAL" ? actor.id : null,
    };
  }

  private assertManageable(item: any, actor: ShortcutActor) {
    if (!item || item.archivedAt) throw new ShortcutError("Atalho não encontrado.", 404);
    if (item.scope === "PERSONAL" && item.ownerId !== actor.id) throw new ShortcutError("Atalho pessoal pertence a outro usuário.", 403);
    if (actor.role !== "ADMIN" && item.scope === "DEPARTMENT" && item.departmentId !== actor.departmentId) {
      throw new ShortcutError("Atalho pertence a outro departamento.", 403);
    }
  }

  async list(actor: ShortcutActor, query: ShortcutListQuery) {
    const result = await shortcutsRepository.list(this.visibility(actor), {
      ...query,
      type: query.type as ShortcutType | undefined,
      scope: query.scope as ShortcutScope | undefined,
    });
    return { items: result.items.map(formatShortcut), total: result.total, page: query.page, limit: query.limit };
  }

  async available(actor: ShortcutActor, conversationId?: string, q?: string, type?: ShortcutType) {
    const conversation = conversationId ? await shortcutsRepository.getConversation(conversationId) : null;
    if (conversationId && !conversation) throw new ShortcutError("Conversa não encontrada.", 404);
    const where: Prisma.ShortcutWhereInput = {
      archivedAt: null,
      isActive: true,
      OR: [
        { scope: "GLOBAL" },
        ...(conversation?.departmentId || actor.departmentId
          ? [{ scope: "DEPARTMENT" as const, departmentId: conversation?.departmentId || actor.departmentId }]
          : []),
        { scope: "PERSONAL", ownerId: actor.id },
      ],
    };
    const result = await shortcutsRepository.list(where, { q, type, active: true, page: 1, limit: 100 });
    return result.items.map(formatShortcut);
  }

  async get(id: string, actor: ShortcutActor) {
    const item = await shortcutsRepository.findById(id);
    this.assertManageable(item, actor);
    return formatShortcut(item);
  }

  async create(data: CreateShortcutBody, actor: ShortcutActor) {
    const scope = this.normalizeScope(data, actor);
    const item = await shortcutsRepository.create({ ...data, ...scope, createdById: actor.id });
    await shortcutsRepository.audit(item.id, actor.id, "CREATE");
    return formatShortcut(item);
  }

  async update(id: string, data: UpdateShortcutBody, actor: ShortcutActor) {
    const existing = await shortcutsRepository.findById(id);
    this.assertManageable(existing, actor);
    const scope = this.normalizeScope(data, actor, existing);
    const item = await shortcutsRepository.update(id, { ...data, ...scope, updatedById: actor.id });
    await shortcutsRepository.audit(id, actor.id, "UPDATE");
    return formatShortcut(item);
  }

  async setActive(id: string, isActive: boolean, actor: ShortcutActor) {
    const existing = await shortcutsRepository.findById(id);
    this.assertManageable(existing, actor);
    const item = await shortcutsRepository.update(id, { isActive, updatedById: actor.id });
    await shortcutsRepository.audit(id, actor.id, isActive ? "ACTIVATE" : "DEACTIVATE");
    return formatShortcut(item);
  }

  async archive(id: string, actor: ShortcutActor) {
    const existing = await shortcutsRepository.findById(id);
    this.assertManageable(existing, actor);
    await shortcutsRepository.update(id, { archivedAt: new Date(), isActive: false, updatedById: actor.id });
    await shortcutsRepository.audit(id, actor.id, "ARCHIVE");
  }

  async registerUse(id: string, actor: ShortcutActor, conversationId?: string) {
    const item = await shortcutsRepository.findById(id);
    if (!item || item.archivedAt || !item.isActive) throw new ShortcutError("Atalho indisponível.", 404);
    const conversation = conversationId ? await shortcutsRepository.getConversation(conversationId) : null;
    if (conversationId && !conversation) throw new ShortcutError("Conversa não encontrada.", 404);
    const visible = item.scope === "GLOBAL" || item.ownerId === actor.id || (
      item.scope === "DEPARTMENT" && item.departmentId === (conversation?.departmentId || actor.departmentId)
    );
    if (!visible) throw new ShortcutError("Atalho indisponível para este usuário.", 403);
    await shortcutsRepository.audit(id, actor.id, "USE", conversationId ? { conversationId } : undefined);
    return formatShortcut(item);
  }
}

export const shortcutsService = new ShortcutsService();
