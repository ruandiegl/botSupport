import { businessHoursRepository } from "./business-hours.repository.js";
import { evaluatePolicy, minutesFromClock, renderBusinessHoursTemplate, type ClockPolicy } from "./business-hours.clock.js";
import type { BusinessHoursPolicyBody, BusinessHoursPreviewBody } from "./business-hours.schemas.js";

export class BusinessHoursError extends Error {
  constructor(message: string, public readonly status = 400) {
    super(message);
    this.name = "BusinessHoursError";
  }
}

function clock(minute: number) {
  return String(Math.floor(minute / 60)).padStart(2, "0") + ":" + String(minute % 60).padStart(2, "0");
}

function publicPolicy(policy: any) {
  return {
    id: policy.id,
    departmentId: policy.departmentId,
    enabled: policy.enabled,
    mode: policy.mode,
    timezone: policy.timezone,
    outsideMessage: policy.outsideMessage,
    noAgentMessage: policy.noAgentMessage,
    noticeFrequency: policy.noticeFrequency,
    messageCooldownMinutes: policy.messageCooldownMinutes,
    revision: policy.revision,
    createdAt: policy.createdAt,
    updatedAt: policy.updatedAt,
    intervals: (policy.intervals ?? []).map((item: any) => ({ id: item.id, weekday: item.weekday, start: clock(item.startMinute), end: clock(item.endMinute), sortOrder: item.sortOrder })),
    exceptions: (policy.exceptions ?? []).map((item: any) => ({
      id: item.id,
      localDate: new Date(item.localDate).toISOString().slice(0, 10),
      kind: item.kind,
      intervals: Array.isArray(item.intervalsJson) ? item.intervalsJson.map((interval: any) => ({ start: clock(Number(interval.startMinute)), end: clock(Number(interval.endMinute)) })) : [],
      reason: item.reason,
    })),
  };
}

function normalizedData(body: BusinessHoursPolicyBody) {
  const intervals = body.intervals.map((interval, index) => ({ weekday: interval.weekday, startMinute: minutesFromClock(interval.start), endMinute: minutesFromClock(interval.end), sortOrder: interval.sortOrder ?? index }));
  for (const interval of intervals) {
    if (interval.endMinute <= interval.startMinute) throw new BusinessHoursError("O horário final deve ser maior que o inicial.");
  }
  for (let day = 0; day <= 6; day += 1) {
    const dayIntervals = intervals.filter((interval) => interval.weekday === day).sort((a, b) => a.startMinute - b.startMinute);
    for (let index = 1; index < dayIntervals.length; index += 1) {
      if (dayIntervals[index].startMinute < dayIntervals[index - 1].endMinute) throw new BusinessHoursError("Os intervalos do mesmo dia não podem se sobrepor.");
    }
  }
  if (body.enabled && body.mode !== "ONLINE_ONLY" && intervals.length === 0) throw new BusinessHoursError("Adicione ao menos um horário quando a política estiver ativa.");
  const exceptions = body.exceptions.map((exception) => ({
    localDate: exception.localDate,
    kind: exception.kind,
    intervals: (exception.intervals ?? []).map((interval) => ({ startMinute: minutesFromClock(interval.start), endMinute: minutesFromClock(interval.end) })),
    reason: exception.reason ?? null,
  }));
  for (const exception of exceptions) {
    for (const interval of exception.intervals) if (interval.endMinute <= interval.startMinute) throw new BusinessHoursError("O horário especial deve ter final maior que o inicial.");
    if (exception.kind === "SPECIAL_HOURS" && exception.intervals.length === 0) throw new BusinessHoursError("Informe os horários da exceção especial.");
  }
  return { ...body, intervals, exceptions };
}

function asClockPolicy(policy: any): ClockPolicy {
  return {
    enabled: policy.enabled,
    mode: policy.mode,
    timezone: policy.timezone,
    intervals: policy.intervals.map((item: any) => ({ weekday: item.weekday, startMinute: item.startMinute, endMinute: item.endMinute, sortOrder: item.sortOrder })),
    exceptions: policy.exceptions.map((item: any) => ({ localDate: new Date(item.localDate).toISOString().slice(0, 10), kind: item.kind, intervalsJson: item.intervalsJson })),
  };
}

export class BusinessHoursService {
  async list() {
    const config = await businessHoursRepository.getZApiConfig();
    if (!config) return [];
    return (await businessHoursRepository.listPolicies(config.id)).map(publicPolicy);
  }

  async get(id: string) {
    const policy = await businessHoursRepository.findPolicy(id);
    if (!policy) throw new BusinessHoursError("Política de horário não encontrada.", 404);
    return publicPolicy(policy);
  }

  async create(body: BusinessHoursPolicyBody, updatedByAgentId?: string) {
    const config = await businessHoursRepository.getZApiConfig();
    if (!config) throw new BusinessHoursError("Configure a conexão Z-API antes de cadastrar horários.", 409);
    const data = normalizedData(body);
    const existing = (await businessHoursRepository.listPolicies(config.id)).find((policy: any) => (policy.departmentId ?? null) === (data.departmentId ?? null));
    if (existing) throw new BusinessHoursError("Já existe uma política para este escopo.", 409);
    const created = await businessHoursRepository.createPolicy(config.id, { ...data, updatedByAgentId });
    return publicPolicy(created);
  }

  async update(id: string, body: BusinessHoursPolicyBody, updatedByAgentId?: string) {
    const data = normalizedData(body);
    if (!body.revision) throw new BusinessHoursError("A revisão da política é obrigatória para editar.", 409);
    const updated = await businessHoursRepository.updatePolicy(id, body.revision, { ...data, updatedByAgentId });
    if (!updated) throw new BusinessHoursError("Política de horário não encontrada.", 404);
    return publicPolicy(updated);
  }

  async disable(id: string, revision: number) {
    const result = await businessHoursRepository.disablePolicy(id, revision);
    if (!result.count) throw new BusinessHoursError("A política foi alterada ou não existe.", 409);
    return this.get(id);
  }

  async preview(body: BusinessHoursPreviewBody) {
    const config = await businessHoursRepository.getZApiConfig();
    if (!config) return { reason: "DISABLED", isOpen: true, message: null, policy: null };
    const policies = await businessHoursRepository.findApplicable(config.id, body.departmentId);
    const policy = policies[0];
    if (!policy) return { reason: "DISABLED", isOpen: true, message: null, policy: null };
    const agentsOnline = body.agentsOnline ?? Boolean(await businessHoursRepository.countOnlineAgents(policy.departmentId));
    const decision = evaluatePolicy(asClockPolicy(policy), body.at ? new Date(body.at) : new Date(), agentsOnline);
    const message = decision.reason === "OUTSIDE_HOURS" ? policy.outsideMessage : decision.reason === "NO_AGENT_ONLINE" ? policy.noAgentMessage : null;
    return { ...decision, message: message ? renderBusinessHoursTemplate(message, { proximaAbertura: decision.nextOpeningLabel }) : null, policy: publicPolicy(policy), agentsOnline };
  }

  async decide(input: { zApiConfigId: string; conversationId: string; departmentId?: string | null; contactName?: string | null; departmentName?: string | null; now?: Date }) {
    if (process.env.BUSINESS_HOURS_ENABLED === "false") return { shouldReply: false as const, reason: "DISABLED" as const };
    const policies = await businessHoursRepository.findApplicable(input.zApiConfigId, input.departmentId);
    const policy = policies[0];
    if (!policy) return { shouldReply: false as const, reason: "DISABLED" as const };
    const agentsOnline = policy.mode === "SCHEDULE_ONLY" ? true : Boolean(await businessHoursRepository.countOnlineAgents(policy.departmentId));
    const decision = evaluatePolicy(asClockPolicy(policy), input.now ?? new Date(), agentsOnline);
    if (decision.isOpen) return { shouldReply: false as const, reason: "OPEN" as const, policy };
    const reason = decision.reason as "OUTSIDE_HOURS" | "NO_AGENT_ONLINE";
    const template = reason === "OUTSIDE_HOURS" ? policy.outsideMessage : (policy.noAgentMessage || policy.outsideMessage);
    const message = renderBusinessHoursTemplate(template, { nome: input.contactName, departamento: input.departmentName, proximaAbertura: decision.nextOpeningLabel, horarioHoje: decision.nextOpeningLabel });
    const windowKey = policy.noticeFrequency === "COOLDOWN"
      ? reason + ":cooldown:" + Math.floor((input.now ?? new Date()).getTime() / (Math.max(5, policy.messageCooldownMinutes) * 60_000))
      : (decision.windowKey ?? "default");
    const notice = await businessHoursRepository.reserveNotice({ conversationId: input.conversationId, policyId: policy.id, reason, windowKey });
    if (!notice) return { shouldReply: false as const, reason, policy, deduplicated: true as const };
    return { shouldReply: true as const, reason, policy, notice, message, agentsOnline };
  }

  async markSent(noticeId: string, messageId: string) { return businessHoursRepository.markNoticeSent(noticeId, messageId); }
  async markFailed(noticeId: string, error: string) { return businessHoursRepository.markNoticeFailed(noticeId, error); }
}

export const businessHoursService = new BusinessHoursService();
