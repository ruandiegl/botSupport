import { z } from "zod";

export const BusinessHoursModeSchema = z.enum(["SCHEDULE_ONLY", "SCHEDULE_AND_ONLINE", "ONLINE_ONLY"]);
export const BusinessHoursExceptionKindSchema = z.enum(["CLOSED", "SPECIAL_HOURS"]);

const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use um horário no formato HH:mm.");
const weekday = z.number().int().min(0).max(6);

export const BusinessHoursIntervalSchema = z.object({
  weekday,
  start: clockTime,
  end: clockTime,
  sortOrder: z.number().int().min(0).max(100).optional(),
}).strict();

export const BusinessHoursExceptionSchema = z.object({
  id: z.string().uuid().optional(),
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use uma data no formato AAAA-MM-DD."),
  kind: BusinessHoursExceptionKindSchema,
  intervals: z.array(z.object({ start: clockTime, end: clockTime }).strict()).max(24).optional(),
  reason: z.string().trim().max(160).nullable().optional(),
}).strict();

const message = z.string().trim().min(1, "Informe uma mensagem.").max(2000);

export const BusinessHoursPolicyBodySchema = z.object({
  departmentId: z.string().uuid().nullable().optional(),
  enabled: z.boolean().default(false),
  mode: BusinessHoursModeSchema.default("SCHEDULE_AND_ONLINE"),
  timezone: z.string().trim().min(1).max(64).refine((value) => {
    try { new Intl.DateTimeFormat("en-US", { timeZone: value }).format(); return true; } catch { return false; }
  }, "Informe um timezone IANA válido."),
  outsideMessage: message,
  noAgentMessage: z.string().trim().max(2000).nullable().optional(),
  noticeFrequency: z.enum(["ONCE_PER_WINDOW", "COOLDOWN"]).default("ONCE_PER_WINDOW"),
  messageCooldownMinutes: z.number().int().min(5).max(1440).default(60),
  intervals: z.array(BusinessHoursIntervalSchema).max(56),
  exceptions: z.array(BusinessHoursExceptionSchema).max(366).default([]),
  revision: z.number().int().min(1).optional(),
}).strict();

export const BusinessHoursIdParamsSchema = z.object({ id: z.string().uuid() }).strict();

export const BusinessHoursPreviewBodySchema = z.object({
  at: z.string().datetime({ offset: true }).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  agentsOnline: z.boolean().optional(),
}).strict();

export type BusinessHoursMode = z.infer<typeof BusinessHoursModeSchema>;
export type BusinessHoursPolicyBody = z.infer<typeof BusinessHoursPolicyBodySchema>;
export type BusinessHoursPreviewBody = z.infer<typeof BusinessHoursPreviewBodySchema>;
