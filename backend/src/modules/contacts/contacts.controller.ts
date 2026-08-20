import type { Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { ContactsError, contactsService } from "./contacts.service.js";
import { ContactConversationQuerySchema, ContactIdParamsSchema, CreateContactBodySchema, ListContactsQuerySchema, UpdateContactBodySchema } from "./contacts.schemas.js";

function invalid(res: Response, error: any) { return res.status(400).json({ error: "Dados inválidos.", fields: error.flatten?.().fieldErrors || {} }); }
async function respond(res: Response, action: () => Promise<unknown>, status = 200) {
  try { return res.status(status).json(await action()); } catch (error) { if (error instanceof ContactsError) return res.status(error.status).json({ error: error.message }); throw error; }
}

export class ContactsController {
  list(req: AuthenticatedRequest, res: Response) { const parsed = ListContactsQuerySchema.safeParse(req.query); if (!parsed.success) return invalid(res, parsed.error); return respond(res, () => contactsService.list(parsed.data, req.user)); }
  get(req: AuthenticatedRequest, res: Response) { const params = ContactIdParamsSchema.safeParse(req.params); if (!params.success) return invalid(res, params.error); return respond(res, async () => { const value = await contactsService.get(params.data.id, req.user); if (!value) throw new ContactsError(404, "Contato não encontrado."); return value; }); }
  create(req: AuthenticatedRequest, res: Response) { const parsed = CreateContactBodySchema.safeParse(req.body); if (!parsed.success) return invalid(res, parsed.error); return respond(res, () => contactsService.create(parsed.data, req.user), 201); }
  update(req: AuthenticatedRequest, res: Response) { const params = ContactIdParamsSchema.safeParse(req.params); const body = UpdateContactBodySchema.safeParse(req.body); if (!params.success) return invalid(res, params.error); if (!body.success) return invalid(res, body.error); return respond(res, () => contactsService.update(params.data.id, body.data, req.user)); }
  conversations(req: AuthenticatedRequest, res: Response) { const params = ContactIdParamsSchema.safeParse(req.params); const query = ContactConversationQuerySchema.safeParse(req.query); if (!params.success) return invalid(res, params.error); if (!query.success) return invalid(res, query.error); return respond(res, async () => { const value = await contactsService.conversations(params.data.id, query.data, req.user); if (!value) throw new ContactsError(404, "Contato não encontrado."); return value; }); }
}

export const contactsController = new ContactsController();
