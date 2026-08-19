import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../auth/auth.middleware.js";
import { conversationsService } from "./conversations.service.js";
import {
  ListConversationsQuerySchema,
  AssumeConversationBodySchema,
  DelegateConversationBodySchema,
  DelegationResponseBodySchema,
  SendMessageBodySchema,
  ListMessagesQuerySchema,
} from "./conversations.schemas.js";

function getParam(req: Request, key: string): string {
  const val = req.params[key];
  return Array.isArray(val) ? val[0] : val || "";
}

export class ConversationsController {
  async list(req: AuthenticatedRequest, res: Response): Promise<void> {
    const parsed = ListConversationsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    if (req.user?.role === "AGENT" && parsed.data.departmentId && parsed.data.departmentId !== "ALL" && parsed.data.departmentId !== req.user.departmentId) {
      res.status(403).json({ error: "Você não pode consultar outro departamento." });
      return;
    }
    const filters = {
      ...parsed.data,
      ...(parsed.data.assignedAgentId === "me" ? { assignedAgentId: req.user?.id } : {}),
      ...(req.user?.role === "AGENT" && req.user.departmentId ? { departmentId: req.user.departmentId } : {}),
      ...(req.user?.role === "AGENT" && parsed.data.assignedAgentId && parsed.data.assignedAgentId !== "me" ? { assignedAgentId: req.user.id } : {}),
    };
    const conversations = await conversationsService.list(filters, req.user);
    res.json(conversations);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const conversation = await conversationsService.getById(id, (req as AuthenticatedRequest).user);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    res.json(conversation);
  }

  async listMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const parsed = ListMessagesQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const result = await conversationsService.listMessages(id, parsed.data, req.user);
    if (!result) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    if ("invalidCursor" in result) {
      res.status(400).json({ error: "Cursor de mensagens inválido" });
      return;
    }
    res.json(result);
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const conversation = await conversationsService.markAsRead(id, (req as AuthenticatedRequest).user);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    res.json(conversation);
  }

  async assume(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const body = AssumeConversationBodySchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const conversation = await conversationsService.assume(id, body.data.agentId, (req as AuthenticatedRequest).user);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    res.json(conversation);
  }

  async listEligibleAssignees(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const result = await conversationsService.listEligibleAssignees(id, req.user);
    if (!result) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    if ("forbidden" in result) {
      res.status(403).json({ error: "Você não pode delegar este chamado." });
      return;
    }
    res.json(result);
  }

  async delegate(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const body = DelegateConversationBodySchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const result = await conversationsService.delegate(id, body.data.agentId, body.data.reason, req.user);
    switch (result.kind) {
      case "NOT_FOUND":
        res.status(404).json({ error: "Conversa não encontrada" });
        return;
      case "FORBIDDEN":
        res.status(403).json({ error: "Você não pode delegar este chamado para este atendente." });
        return;
      case "INVALID_TARGET":
        res.status(409).json({ error: "O atendente selecionado não está disponível ou já é o responsável." });
        return;
      case "CLOSED":
        res.status(409).json({ error: "Chamados encerrados não podem ser delegados." });
        return;
      case "CONFLICT":
        res.status(409).json({ error: "O chamado foi alterado por outro atendente. Atualize e tente novamente." });
        return;
      case "OK":
        res.json(result.conversation);
        return;
    }
  }

  async respondToDelegation(req: AuthenticatedRequest, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const body = DelegationResponseBodySchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const result = await conversationsService.respondToDelegation(id, body.data.assignmentId, body.data.decision, req.user);
    switch (result.kind) {
      case "NOT_FOUND":
        res.status(404).json({ error: "Delegação não encontrada ou sem acesso." });
        return;
      case "ALREADY_RESPONDED":
        res.status(409).json({ error: "Esta delegação já recebeu uma resposta." });
        return;
      case "CLOSED":
        res.status(409).json({ error: "Chamados encerrados não podem receber resposta de delegação." });
        return;
      case "OK":
        res.json(result.conversation);
        return;
    }
  }

  async close(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const conversation = await conversationsService.close(id, (req as AuthenticatedRequest).user);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    res.json(conversation);
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const body = SendMessageBodySchema.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }

    const result = await conversationsService.sendMessage(id, body.data.content, (req as AuthenticatedRequest).user);
    switch (result.kind) {
      case "NOT_FOUND":
        res.status(404).json({ error: "Conversa não encontrada ou sem acesso" });
        return;
      case "AGENT_UNAVAILABLE":
        res.status(403).json({ error: "Seu usuário não está disponível para enviar mensagens." });
        return;
      case "EMPTY":
        res.status(400).json({ error: "Digite uma mensagem antes de enviar." });
        return;
      case "OK":
        res.status(201).json(result.message);
        return;
    }
  }

  async transfer(req: Request, res: Response): Promise<void> {
    const id = getParam(req, "id");
    const departmentId = req.body.departmentId;
    if (!departmentId) {
      res.status(400).json({ error: "departmentId é obrigatório" });
      return;
    }

    const conversation = await conversationsService.transfer(id, departmentId, (req as AuthenticatedRequest).user);
    if (!conversation) {
      res.status(404).json({ error: "Conversa não encontrada" });
      return;
    }
    res.json(conversation);
  }

  async streamEvents(req: Request, res: Response): Promise<void> {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    const listener = (data: any) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const { conversationEvents } = await import("../../shared/events.js");
    conversationEvents.on("conversation_updated", listener);

    req.on("close", () => {
      conversationEvents.removeListener("conversation_updated", listener);
    });
  }
}

export const conversationsController = new ConversationsController();
