import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { contactsRepository, type ContactAccessScope } from "./contacts.repository.js";

export class ContactsError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function phoneDto(item: any) { return { id: item.id, phone: item.phone, label: item.label ?? null, isPrimary: item.isPrimary }; }
function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "CT";
}
function contactDto(contact: any) {
  return {
    id: contact.id,
    name: contact.name,
    initials: initials(contact.name),
    phone: contact.phone,
    email: contact.email ?? null,
    organization: contact.organization ?? null,
    notes: contact.notes ?? null,
    phones: (contact.phoneNumbers || []).map(phoneDto),
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
  };
}
function mapError(error: any): never {
  if (error?.code === "P2002") throw new ContactsError(409, "Um dos telefones já pertence a outro contato.");
  if (error?.code === "CONTACT_SHARE_ALREADY_LINKED") throw new ContactsError(409, "Este cartão já foi adicionado a um contato.");
  if (error?.code === "P2025") throw new ContactsError(404, "Contato não encontrado.");
  throw error;
}

function scopeFor(user?: AuthenticatedRequest["user"]): ContactAccessScope | undefined {
  return user ? { role: user.role, id: user.id, departmentId: user.departmentId } : undefined;
}

export class ContactsService {
  async list(filters: { q?: string; page: number; limit: number }, user?: AuthenticatedRequest["user"]) {
    const result = await contactsRepository.list(filters, scopeFor(user));
    return { ...result, items: result.items.map(contactDto) };
  }

  async get(id: string, user?: AuthenticatedRequest["user"]) {
    const contact = await contactsRepository.findById(id, scopeFor(user));
    return contact ? contactDto(contact) : null;
  }

  async create(data: any, _user?: AuthenticatedRequest["user"]) {
    const scope = scopeFor(_user);
    const share = data.contactShareId ? await contactsRepository.findShareById(data.contactShareId, scope) : null;
    if (data.contactShareId && !share) throw new ContactsError(404, "Cartão de contato não encontrado.");
    if (share?.canonicalContactId) throw new ContactsError(409, "Este cartão já foi adicionado a um contato.");
    let existing = null;
    for (const item of data.phones) {
      existing = await contactsRepository.findByPhone(item.phone);
      if (existing) break;
    }
    if (existing) throw new ContactsError(409, "Um dos telefones já está cadastrado.");
    try {
      const contact = data.contactShareId
        ? await contactsRepository.createWithShare(data, data.contactShareId, data.phones.find((item: any) => item.isPrimary)?.phone ?? data.phones[0].phone)
        : await contactsRepository.create(data);
      if (!contact) throw new ContactsError(500, "Não foi possível criar o contato.");
      return contactDto((await contactsRepository.findById(contact.id))!);
    } catch (error) { return mapError(error); }
  }

  async update(id: string, data: any, user?: AuthenticatedRequest["user"]) {
    const visible = await contactsRepository.findById(id, scopeFor(user));
    if (!visible) throw new ContactsError(404, "Contato não encontrado.");
    if (data.phones) {
      for (const item of data.phones) {
        const owner = await contactsRepository.findByPhone(item.phone);
        if (owner && owner.id !== id) throw new ContactsError(409, "Um dos telefones já está cadastrado em outro contato.");
      }
    }
    try { return contactDto((await contactsRepository.update(id, data))!); } catch (error) { return mapError(error); }
  }

  async conversations(id: string, filters: { openOnly: boolean; page: number; limit: number }, user?: AuthenticatedRequest["user"]) {
    const scope = scopeFor(user);
    const contact = await contactsRepository.findById(id, scope);
    if (!contact) return null;
    const result = await contactsRepository.listConversations(id, filters, scope);
    return {
      ...result,
      items: result.items.map((item: any) => ({
        id: item.id,
        status: item.status,
        departmentId: item.departmentId,
        departmentName: item.department?.name ?? null,
        assignedAgentId: item.assignedAgentId,
        assignedAgentName: item.assignedAgent?.name ?? null,
        unreadCount: item._count?.messages ?? 0,
        startedAt: item.startedAt.toISOString(),
        lastActivityAt: item.lastActivityAt.toISOString(),
      })),
    };
  }
}

export const contactsService = new ContactsService();
