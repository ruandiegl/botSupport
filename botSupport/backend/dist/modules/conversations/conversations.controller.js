import { conversationsService } from "./conversations.service.js";
import { ListConversationsQuerySchema, AssumeConversationBodySchema, SendMessageBodySchema, } from "./conversations.schemas.js";
function getParam(req, key) {
    const val = req.params[key];
    return Array.isArray(val) ? val[0] : val || "";
}
export class ConversationsController {
    async list(req, res) {
        const parsed = ListConversationsQuerySchema.safeParse(req.query);
        if (!parsed.success) {
            res.status(400).json({ error: parsed.error.message });
            return;
        }
        const conversations = await conversationsService.list(parsed.data);
        res.json(conversations);
    }
    async getById(req, res) {
        const id = getParam(req, "id");
        const conversation = await conversationsService.getById(id);
        if (!conversation) {
            res.status(404).json({ error: "Conversa não encontrada" });
            return;
        }
        res.json(conversation);
    }
    async assume(req, res) {
        const id = getParam(req, "id");
        const body = AssumeConversationBodySchema.safeParse(req.body);
        if (!body.success) {
            res.status(400).json({ error: body.error.message });
            return;
        }
        const conversation = await conversationsService.assume(id, body.data.agentId);
        if (!conversation) {
            res.status(404).json({ error: "Conversa não encontrada" });
            return;
        }
        res.json(conversation);
    }
    async close(req, res) {
        const id = getParam(req, "id");
        const conversation = await conversationsService.close(id);
        if (!conversation) {
            res.status(404).json({ error: "Conversa não encontrada" });
            return;
        }
        res.json(conversation);
    }
    async sendMessage(req, res) {
        const id = getParam(req, "id");
        const body = SendMessageBodySchema.safeParse(req.body);
        if (!body.success) {
            res.status(400).json({ error: body.error.message });
            return;
        }
        const message = await conversationsService.sendMessage(id, body.data.content);
        if (!message) {
            res.status(404).json({ error: "Conversa não encontrada" });
            return;
        }
        res.status(201).json(message);
    }
    async transfer(req, res) {
        const id = getParam(req, "id");
        const departmentId = req.body.departmentId;
        if (!departmentId) {
            res.status(400).json({ error: "departmentId é obrigatório" });
            return;
        }
        const conversation = await conversationsService.transfer(id, departmentId);
        if (!conversation) {
            res.status(404).json({ error: "Conversa não encontrada" });
            return;
        }
        res.json(conversation);
    }
    async streamEvents(req, res) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
        const listener = (data) => {
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
