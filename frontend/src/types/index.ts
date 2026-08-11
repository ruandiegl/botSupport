export type ConversationStatus = "BOT" | "QUEUED" | "IN_PROGRESS" | "CLOSED";
export type MessageDirection = "IN" | "OUT";
export type SenderType = "CLIENT" | "AGENT" | "BOT";
export type AgentRole = "ADMIN" | "SUPERVISOR" | "AGENT";

export interface Contact {
  name: string;
  phone: string;
  initials: string;
}

export interface Message {
  id: string;
  direction: MessageDirection;
  senderType: SenderType;
  senderName: string | null;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  contact: Contact;
  status: ConversationStatus;
  departmentId: string | null;
  departmentName: string | null;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  unreadCount: number;
  lastMessage: string;
  messages: Message[];
  startedAt: string;
}

export interface Procedure {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  openCount: number;
  procedures: Procedure[];
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  role: AgentRole;
  isOnline: boolean;
  isActive: boolean;
  departmentId?: string | null;
  departmentName?: string | null;
}

export interface FlowOption {
  label: string;
  departmentId: string;
  procedureMessage: string;
}

export interface FlowDefinition {
  id: string;
  name: string;
  greeting: string;
  menuMessage: string;
  options: FlowOption[];
  updatedAt: string;
}

export type ShortcutType = "GREETING" | "CLOSING" | "DEPARTMENT" | "PERSONAL" | "GENERAL";
export type ShortcutScope = "GLOBAL" | "DEPARTMENT" | "PERSONAL";

export interface Shortcut {
  id: string;
  title: string;
  message: string;
  type: ShortcutType;
  scope: ShortcutScope;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  ownerId: string | null;
  owner?: { id: string; name: string } | null;
  createdBy: { id: string; name: string };
  updatedBy?: { id: string; name: string } | null;
  isActive: boolean;
  sortOrder: number;
  usageCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
}
