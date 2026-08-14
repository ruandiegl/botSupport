import { z } from "zod";

export const ListNotificationsQuerySchema = z.object({
  unreadOnly: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
}).strict();

export const NotificationIdParamSchema = z.object({ id: z.string().uuid() }).strict();

export const NotificationPreferenceSchema = z.object({
  soundEnabled: z.boolean().optional(),
  browserEnabled: z.boolean().optional(),
  unresolvedRemindersEnabled: z.boolean().optional(),
  unresolvedReminderMinutes: z.number().int().min(5).max(1440).optional(),
  reminderRepeatMinutes: z.number().int().min(5).max(1440).optional(),
}).strict();

export type NotificationPreferenceInput = z.infer<typeof NotificationPreferenceSchema>;
