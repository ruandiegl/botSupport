import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatShortcutMessage(
  template: string,
  vars: { agentName?: string; contactName?: string; departmentName?: string }
): string {
  if (!template) return "";
  return template
    .replace(/\{agentName\}/gi, vars.agentName || "Atendente")
    .replace(/\{contactName\}/gi, vars.contactName || "Cliente")
    .replace(/\{departmentName\}/gi, vars.departmentName || "Suporte");
}
