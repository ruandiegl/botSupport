import { z } from "zod";

export const ExecuteFlowInputSchema = z.object({
  conversationId: z.string().uuid(),
  content: z.string().max(10000),
  selectedOptionId: z.string().max(100).optional(),
  referenceMessageId: z.string().max(200).optional(),
  externalEventId: z.string().max(200).optional(),
  isNewConversation: z.boolean(),
  isGroup: z.boolean().optional().default(false),
});
export type ExecuteFlowInput = z.infer<typeof ExecuteFlowInputSchema>;
export type FlowExecutionAction =
  | { type: "SEND_TEXT"; content: string }
  | { type: "SEND_OPTIONS"; nodeId: string; content: string; options: Array<{ optionKey: string; label: string; description?: string; categoryLabel?: string; departmentId: string }> }
  | { type: "HANDOFF"; departmentId: string };
