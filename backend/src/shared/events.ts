import { EventEmitter } from "events";
import { socketEmitter } from "./socket.js";

export const conversationEvents = new EventEmitter();

conversationEvents.on("conversation_updated", (data: any) => {
  socketEmitter.emitToQueue("conversation:updated", data);
  if (data?.conversationId) {
    socketEmitter.emitToConversation(data.conversationId, "conversation:updated", data);
  }
});

conversationEvents.on("message_received", (data: any) => {
  if (data?.conversationId) {
    socketEmitter.emitToConversation(data.conversationId, "message:new", data);
  }
  socketEmitter.emitToQueue("conversation:updated", data);
});
