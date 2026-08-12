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

export type FlowRevisionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type FlowNodeType = "ENTRY" | "MESSAGE" | "DECISION" | "ROUTE" | "TRIAGE" | "HANDOFF" | "END";

export interface FlowNodeConfig {
  parentRouteId?: string;
  responseKey?: string;
  optionKey?: string;
  legacyOptionIndex?: number;
  [key: string]: unknown;
}

export interface FlowNode {
  id: string;
  stableKey: string;
  type: FlowNodeType;
  name: string;
  content: string;
  sortOrder: number;
  config: FlowNodeConfig;
  departmentId: string | null;
}

export interface FlowTransition {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  optionKey: string | null;
  label: string | null;
  sortOrder: number;
}

export interface FlowRevision {
  id: string;
  flowDefinitionId: string;
  name?: string;
  version: number;
  status: FlowRevisionStatus;
  schemaVersion: number;
  revision: number;
  nodes: FlowNode[];
  transitions: FlowTransition[];
  publishedAt?: string | null;
  updatedAt?: string;
  legacyDefinition?: FlowDefinition;
}

export interface FlowValidationIssue {
  nodeId?: string;
  field?: string;
  message: string;
}

export interface FlowValidationResult {
  valid: boolean;
  issues: FlowValidationIssue[];
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
