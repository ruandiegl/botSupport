export type ConversationStatus = "OPEN" | "IN_PROGRESS" | "CLOSED";
export type MessageDirection = "IN" | "OUT";
export type SenderType = "CLIENT" | "AGENT" | "BOT";
export type AgentRole = "ADMIN" | "SUPERVISOR" | "AGENT";

export interface ConversationLabel {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon?: string | null;
  isSystem: boolean;
  usageCount?: number;
}

export interface Contact {
  id?: string;
  name: string;
  phone: string;
  initials: string;
  email?: string | null;
  organization?: string | null;
  notes?: string | null;
  phones?: ContactPhone[];
}

export interface ContactPhone {
  id?: string;
  phone: string;
  label?: string | null;
  isPrimary: boolean;
}

export interface ContactShare {
  id: string;
  displayName: string;
  phones: string[];
  primaryPhone?: string | null;
  email?: string | null;
  organization?: string | null;
  note?: string | null;
  canonicalContactId?: string | null;
}

export interface Message {
  id: string;
  direction: MessageDirection;
  senderType: SenderType;
  senderName: string | null;
  senderDepartmentName?: string | null;
  senderContactId?: string | null;
  content: string;
  messageType?: "TEXT" | "CONTACT" | string;
  contactShare?: ContactShare | null;
  createdAt: string;
  media?: ConversationMedia | null;
}

export type ConversationMediaType = "IMAGE" | "AUDIO" | "VIDEO" | "DOCUMENT";
export type ConversationMediaStatus = "AVAILABLE" | "UNAVAILABLE" | "EXPIRED";

export interface ConversationMedia {
  id: string;
  type: ConversationMediaType;
  status: ConversationMediaStatus;
  mimeType: string;
  caption?: string | null;
  fileName?: string | null;
  title?: string | null;
  ptt?: boolean | null;
  seconds?: number | null;
  width?: number | null;
  height?: number | null;
  pageCount?: number | null;
  viewOnce: boolean;
  hasThumbnail: boolean;
  expiresAt: string;
  available: boolean;
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
  messagesPagination?: {
    limit: number;
    hasPrevious: boolean;
    previousCursor: string | null;
  };
  startedAt: string;
  queuedAt?: string | null;
  lastActivityAt?: string | null;
  labels?: ConversationLabel[];
  groupChatName?: string | null;
  assignments?: ConversationAssignment[];
}

export interface ConversationAssignment {
  id: string;
  action: "ASSUME" | "DELEGATE" | "RELEASE" | string;
  reason?: string | null;
  response?: "ACCEPTED" | "DECLINED" | null;
  respondedAt?: string | null;
  createdAt: string;
  fromAgent?: { id: string; name: string } | null;
  toAgent?: { id: string; name: string; departmentName?: string | null } | null;
  actorAgent?: { id: string; name: string } | null;
}

/** Lightweight row returned by the paginated queue endpoint. */
export type ConversationSummary = Omit<Conversation, "messages"> & { messages: [] };

export interface MessagePage {
  items: Message[];
  pagination: {
    limit: number;
    hasPrevious: boolean;
    previousCursor: string | null;
  };
}

export interface ConversationListResponse {
  items: Conversation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  appliedFilters?: Record<string, unknown>;
  counts?: {
    all?: number;
    open: number;
    inProgress: number;
    closed: number;
    mine: number;
    unread: number;
  };
}

export type NotificationType =
  | "NEW_QUEUE_CONVERSATION"
  | "NEW_MESSAGE"
  | "ASSIGNED_CONVERSATION"
  | "UNRESOLVED_REMINDER"
  | "CONVERSATION_DELEGATED"
  | "DELEGATION_RESPONSE"
  | (string & {});

export interface AgentNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  conversationId?: string | null;
  departmentId?: string | null;
  createdAt: string;
  readAt?: string | null;
  dismissedAt?: string | null;
  dedupeKey?: string | null;
  payload?: Record<string, unknown> | null;
}

export interface NotificationListResponse {
  items: AgentNotification[];
  page: number;
  limit: number;
  total: number;
  unreadCount: number;
  totalPages: number;
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

export interface AssignedConversationSummary {
  id: string;
  contactName: string;
  departmentName: string | null;
  status: ConversationStatus;
  unreadCount: number;
  startedAt: string;
  lastActivityAt: string;
}

export interface AgentWorkloadItem {
  id: string;
  name: string;
  role: AgentRole;
  departmentId: string | null;
  departmentName: string | null;
  isOnline: boolean;
  isActive: boolean;
  activeConversationCount: number;
  conversations: AssignedConversationSummary[];
}

export interface AgentWorkloadResponse {
  items: AgentWorkloadItem[];
  totals: {
    agents: number;
    online: number;
    offline: number;
    activeConversations: number;
  };
  generatedAt: string;
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

export interface BotExclusion {
  id: string;
  phone: string;
  label: string | null;
  reason: string | null;
  isActive: boolean;
  disabledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByAgentId?: string | null;
}

export interface BotExclusionListResponse {
  items: BotExclusion[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type FlowRevisionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type FlowNodeType = "ENTRY" | "MESSAGE" | "DECISION" | "ROUTE" | "TRIAGE" | "HANDOFF" | "END";

export interface FlowDecisionOption {
  optionKey: string;
  label: string;
  description?: string;
}

export interface FlowNodeConfig {
  parentRouteId?: string;
  responseKey?: string;
  optionKey?: string;
  legacyOptionIndex?: number;
  decisionScope?: "ROOT" | "ROUTE";
  decisionOptions?: FlowDecisionOption[];
  buttonMessage?: string;
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
