export type ClockInterval = { startMinute: number; endMinute: number; sortOrder?: number };
export type ClockException = { localDate: string; kind: "CLOSED" | "SPECIAL_HOURS"; intervalsJson?: unknown };
export type ClockPolicy = {
  enabled: boolean;
  mode: string;
  timezone: string;
  intervals: Array<{ weekday: number; startMinute: number; endMinute: number; sortOrder?: number }>;
  exceptions: ClockException[];
};

const WEEKDAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;

function partsAt(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: weekday < 0 ? 0 : weekday,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

export function minutesFromClock(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

export function localDateKey(date: Date, timezone: string) {
  const local = partsAt(date, timezone);
  return `${String(local.year).padStart(4, "0")}-${String(local.month).padStart(2, "0")}-${String(local.day).padStart(2, "0")}`;
}

function exceptionFor(policy: ClockPolicy, dateKey: string) {
  return policy.exceptions.find((exception) => exception.localDate === dateKey) ?? null;
}

function exceptionIntervals(exception: ClockException | null): ClockInterval[] | null {
  if (!exception || exception.kind === "CLOSED") return exception ? [] : null;
  if (!Array.isArray(exception.intervalsJson)) return [];
  return exception.intervalsJson
    .filter((item): item is { startMinute: number; endMinute: number } => Boolean(item && typeof item === "object" && Number.isInteger((item as any).startMinute) && Number.isInteger((item as any).endMinute)))
    .map((item) => ({ startMinute: item.startMinute, endMinute: item.endMinute }));
}

export function intervalsForDate(policy: ClockPolicy, date: Date) {
  const local = partsAt(date, policy.timezone);
  const dateKey = localDateKey(date, policy.timezone);
  const exception = exceptionFor(policy, dateKey);
  const override = exceptionIntervals(exception);
  if (override !== null) return override;
  return policy.intervals
    .filter((interval) => interval.weekday === local.weekday)
    .sort((a, b) => a.startMinute - b.startMinute || (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
}

export function evaluatePolicy(policy: ClockPolicy, now: Date, agentsOnline: boolean) {
  if (!policy.enabled) return { reason: "DISABLED" as const, windowKey: null, isOpen: false, nextOpeningLabel: null, localDate: null };
  const local = partsAt(now, policy.timezone);
  const dateKey = localDateKey(now, policy.timezone);
  const currentMinute = local.hour * 60 + local.minute;
  const intervals = intervalsForDate(policy, now);
  const current = intervals.find((interval) => currentMinute >= interval.startMinute && currentMinute < interval.endMinute) ?? null;

  if (policy.mode !== "ONLINE_ONLY" && !current) {
    return { reason: "OUTSIDE_HOURS" as const, windowKey: `outside:${dateKey}`, isOpen: false, nextOpeningLabel: findNextOpeningLabel(policy, now), localDate: dateKey };
  }
  if (policy.mode !== "SCHEDULE_ONLY" && !agentsOnline) {
    const suffix = current ? `${current.startMinute}-${current.endMinute}` : "online";
    return { reason: "NO_AGENT_ONLINE" as const, windowKey: `no-agent:${dateKey}:${suffix}`, isOpen: false, nextOpeningLabel: findNextOpeningLabel(policy, now), localDate: dateKey };
  }
  return { reason: "OPEN" as const, windowKey: current ? `open:${dateKey}:${current.startMinute}-${current.endMinute}` : `open:${dateKey}`, isOpen: true, nextOpeningLabel: null, localDate: dateKey };
}

function dateFromLocalParts(year: number, month: number, day: number, offset: number) {
  return new Date(Date.UTC(year, month - 1, day + offset, 12, 0, 0));
}

export function findNextOpeningLabel(policy: ClockPolicy, now: Date) {
  const local = partsAt(now, policy.timezone);
  for (let offset = 0; offset <= 8; offset += 1) {
    const candidate = dateFromLocalParts(local.year, local.month, local.day, offset);
    const candidateLocal = partsAt(candidate, policy.timezone);
    const intervals = intervalsForDate(policy, candidate);
    for (const interval of intervals) {
      if (offset === 0 && interval.startMinute <= local.hour * 60 + local.minute) continue;
      const weekday = WEEKDAYS[candidateLocal.weekday].toLocaleLowerCase("pt-BR");
      const time = `${String(Math.floor(interval.startMinute / 60)).padStart(2, "0")}:${String(interval.startMinute % 60).padStart(2, "0")}`;
      return offset === 0 ? `hoje às ${time}` : `${weekday} às ${time}`;
    }
  }
  return null;
}

export function renderBusinessHoursTemplate(template: string, values: Record<string, string | null | undefined>) {
  return template.replace(/\{\{\s*(nome|departamento|proximaAbertura|horarioHoje)\s*\}\}/gi, (_match, key: string) => values[key] ?? "").replace(/[ \t]+\n/g, "\n").trim();
}
