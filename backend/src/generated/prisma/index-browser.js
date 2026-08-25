
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.DepartmentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.ProcedureScalarFieldEnum = {
  id: 'id',
  departmentId: 'departmentId',
  title: 'title',
  content: 'content',
  order: 'order'
};

exports.Prisma.AgentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  password: 'password',
  role: 'role',
  isActive: 'isActive',
  departmentId: 'departmentId',
  isOnline: 'isOnline',
  createdAt: 'createdAt'
};

exports.Prisma.RolePermissionScalarFieldEnum = {
  id: 'id',
  role: 'role',
  resource: 'resource',
  actions: 'actions',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  name: 'name',
  isRegistered: 'isRegistered',
  email: 'email',
  organization: 'organization',
  station: 'station',
  city: 'city',
  state: 'state',
  profileConfirmedAt: 'profileConfirmedAt',
  notes: 'notes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ContactPhoneScalarFieldEnum = {
  id: 'id',
  contactId: 'contactId',
  phone: 'phone',
  label: 'label',
  isPrimary: 'isPrimary',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BotExclusionScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  label: 'label',
  reason: 'reason',
  isActive: 'isActive',
  createdByAgentId: 'createdByAgentId',
  updatedByAgentId: 'updatedByAgentId',
  disabledAt: 'disabledAt',
  disabledByAgentId: 'disabledByAgentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  contactId: 'contactId',
  status: 'status',
  departmentId: 'departmentId',
  assignedAgentId: 'assignedAgentId',
  currentStep: 'currentStep',
  flowRevisionId: 'flowRevisionId',
  currentFlowNodeId: 'currentFlowNodeId',
  flowContext: 'flowContext',
  startedAt: 'startedAt',
  queuedAt: 'queuedAt',
  lastActivityAt: 'lastActivityAt',
  closedAt: 'closedAt',
  warningSentAt: 'warningSentAt',
  closeReason: 'closeReason',
  groupChatName: 'groupChatName',
  groupParticipant: 'groupParticipant'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  externalMessageId: 'externalMessageId',
  direction: 'direction',
  senderType: 'senderType',
  senderAgentId: 'senderAgentId',
  senderContactId: 'senderContactId',
  senderNameSnapshot: 'senderNameSnapshot',
  senderDepartmentSnapshot: 'senderDepartmentSnapshot',
  messageType: 'messageType',
  content: 'content',
  createdAt: 'createdAt',
  readAt: 'readAt'
};

exports.Prisma.ContactShareScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  canonicalContactId: 'canonicalContactId',
  displayName: 'displayName',
  phones: 'phones',
  primaryPhone: 'primaryPhone',
  email: 'email',
  organization: 'organization',
  note: 'note',
  createdAt: 'createdAt'
};

exports.Prisma.ConversationAssignmentScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  fromAgentId: 'fromAgentId',
  toAgentId: 'toAgentId',
  actorAgentId: 'actorAgentId',
  action: 'action',
  reason: 'reason',
  response: 'response',
  respondedAt: 'respondedAt',
  createdAt: 'createdAt'
};

exports.Prisma.OutgoingMediaScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  conversationId: 'conversationId',
  type: 'type',
  mimeType: 'mimeType',
  fileName: 'fileName',
  caption: 'caption',
  sizeBytes: 'sizeBytes',
  status: 'status',
  providerMessageId: 'providerMessageId',
  clientMessageId: 'clientMessageId',
  failureCode: 'failureCode',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConversationMediaScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  conversationId: 'conversationId',
  whatsappMessageId: 'whatsappMessageId',
  provider: 'provider',
  type: 'type',
  status: 'status',
  mimeType: 'mimeType',
  caption: 'caption',
  originalFileName: 'originalFileName',
  title: 'title',
  ptt: 'ptt',
  seconds: 'seconds',
  width: 'width',
  height: 'height',
  pageCount: 'pageCount',
  viewOnce: 'viewOnce',
  sourceUrlCiphertext: 'sourceUrlCiphertext',
  thumbnailUrlCiphertext: 'thumbnailUrlCiphertext',
  encryptionKeyVersion: 'encryptionKeyVersion',
  sourceCreatedAt: 'sourceCreatedAt',
  expiresAt: 'expiresAt',
  failureCode: 'failureCode',
  lastAccessErrorCode: 'lastAccessErrorCode',
  lastAccessedAt: 'lastAccessedAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FlowDefinitionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  greeting: 'greeting',
  menuMessage: 'menuMessage',
  options: 'options',
  updatedAt: 'updatedAt'
};

exports.Prisma.ZApiConfigScalarFieldEnum = {
  id: 'id',
  instanceId: 'instanceId',
  token: 'token',
  clientToken: 'clientToken',
  webhookUrl: 'webhookUrl',
  isActive: 'isActive',
  autoReply: 'autoReply',
  instancePhone: 'instancePhone',
  instanceLid: 'instanceLid',
  groupsEnabled: 'groupsEnabled',
  groupCooldownSeconds: 'groupCooldownSeconds',
  groupConfirmInGroup: 'groupConfirmInGroup',
  groupConfirmMessage: 'groupConfirmMessage',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessHoursPolicyScalarFieldEnum = {
  id: 'id',
  zApiConfigId: 'zApiConfigId',
  departmentId: 'departmentId',
  enabled: 'enabled',
  mode: 'mode',
  timezone: 'timezone',
  outsideMessage: 'outsideMessage',
  noAgentMessage: 'noAgentMessage',
  noticeFrequency: 'noticeFrequency',
  messageCooldownMinutes: 'messageCooldownMinutes',
  revision: 'revision',
  updatedByAgentId: 'updatedByAgentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessHoursIntervalScalarFieldEnum = {
  id: 'id',
  policyId: 'policyId',
  weekday: 'weekday',
  startMinute: 'startMinute',
  endMinute: 'endMinute',
  sortOrder: 'sortOrder'
};

exports.Prisma.BusinessHoursExceptionScalarFieldEnum = {
  id: 'id',
  policyId: 'policyId',
  localDate: 'localDate',
  kind: 'kind',
  intervalsJson: 'intervalsJson',
  reason: 'reason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BusinessHoursNoticeScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  policyId: 'policyId',
  reason: 'reason',
  windowKey: 'windowKey',
  status: 'status',
  messageId: 'messageId',
  sentAt: 'sentAt',
  lastError: 'lastError',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LabelScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  color: 'color',
  icon: 'icon',
  isSystem: 'isSystem',
  createdAt: 'createdAt'
};

exports.Prisma.ConversationLabelScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  labelId: 'labelId',
  addedByAgentId: 'addedByAgentId',
  createdAt: 'createdAt'
};

exports.Prisma.GroupMentionCooldownScalarFieldEnum = {
  id: 'id',
  groupKey: 'groupKey',
  participantKey: 'participantKey',
  lastMentionAt: 'lastMentionAt'
};

exports.Prisma.FlowRevisionScalarFieldEnum = {
  id: 'id',
  flowDefinitionId: 'flowDefinitionId',
  version: 'version',
  status: 'status',
  schemaVersion: 'schemaVersion',
  revision: 'revision',
  publishedAt: 'publishedAt',
  publishedById: 'publishedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FlowNodeScalarFieldEnum = {
  id: 'id',
  stableKey: 'stableKey',
  flowRevisionId: 'flowRevisionId',
  type: 'type',
  name: 'name',
  content: 'content',
  sortOrder: 'sortOrder',
  config: 'config',
  departmentId: 'departmentId'
};

exports.Prisma.FlowTransitionScalarFieldEnum = {
  id: 'id',
  flowRevisionId: 'flowRevisionId',
  fromNodeId: 'fromNodeId',
  toNodeId: 'toNodeId',
  optionKey: 'optionKey',
  label: 'label',
  sortOrder: 'sortOrder'
};

exports.Prisma.FlowExecutionEventScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  flowRevisionId: 'flowRevisionId',
  flowNodeId: 'flowNodeId',
  externalEventId: 'externalEventId',
  type: 'type',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.ShortcutScalarFieldEnum = {
  id: 'id',
  title: 'title',
  message: 'message',
  type: 'type',
  scope: 'scope',
  departmentId: 'departmentId',
  ownerId: 'ownerId',
  isActive: 'isActive',
  sortOrder: 'sortOrder',
  createdById: 'createdById',
  updatedById: 'updatedById',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  archivedAt: 'archivedAt'
};

exports.Prisma.ShortcutAuditScalarFieldEnum = {
  id: 'id',
  shortcutId: 'shortcutId',
  actorId: 'actorId',
  action: 'action',
  metadata: 'metadata',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  agentId: 'agentId',
  type: 'type',
  title: 'title',
  body: 'body',
  conversationId: 'conversationId',
  departmentId: 'departmentId',
  dedupeKey: 'dedupeKey',
  payload: 'payload',
  createdAt: 'createdAt',
  readAt: 'readAt',
  dismissedAt: 'dismissedAt'
};

exports.Prisma.NotificationPreferenceScalarFieldEnum = {
  id: 'id',
  agentId: 'agentId',
  soundEnabled: 'soundEnabled',
  browserEnabled: 'browserEnabled',
  unresolvedRemindersEnabled: 'unresolvedRemindersEnabled',
  unresolvedReminderMinutes: 'unresolvedReminderMinutes',
  reminderRepeatMinutes: 'reminderRepeatMinutes',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.MediaType = exports.$Enums.MediaType = {
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT'
};

exports.OutgoingMediaStatus = exports.$Enums.OutgoingMediaStatus = {
  PENDING: 'PENDING',
  SENDING: 'SENDING',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

exports.MediaProvider = exports.$Enums.MediaProvider = {
  ZAPI: 'ZAPI'
};

exports.MediaStatus = exports.$Enums.MediaStatus = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  EXPIRED: 'EXPIRED'
};

exports.BusinessHoursMode = exports.$Enums.BusinessHoursMode = {
  SCHEDULE_ONLY: 'SCHEDULE_ONLY',
  SCHEDULE_AND_ONLINE: 'SCHEDULE_AND_ONLINE',
  ONLINE_ONLY: 'ONLINE_ONLY'
};

exports.BusinessHoursExceptionKind = exports.$Enums.BusinessHoursExceptionKind = {
  CLOSED: 'CLOSED',
  SPECIAL_HOURS: 'SPECIAL_HOURS'
};

exports.BusinessHoursNoticeReason = exports.$Enums.BusinessHoursNoticeReason = {
  OUTSIDE_HOURS: 'OUTSIDE_HOURS',
  NO_AGENT_ONLINE: 'NO_AGENT_ONLINE'
};

exports.BusinessHoursNoticeStatus = exports.$Enums.BusinessHoursNoticeStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED'
};

exports.FlowRevisionStatus = exports.$Enums.FlowRevisionStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  ARCHIVED: 'ARCHIVED'
};

exports.FlowNodeType = exports.$Enums.FlowNodeType = {
  ENTRY: 'ENTRY',
  MESSAGE: 'MESSAGE',
  DECISION: 'DECISION',
  ROUTE: 'ROUTE',
  TRIAGE: 'TRIAGE',
  HANDOFF: 'HANDOFF',
  END: 'END'
};

exports.ShortcutType = exports.$Enums.ShortcutType = {
  GREETING: 'GREETING',
  CLOSING: 'CLOSING',
  DEPARTMENT: 'DEPARTMENT',
  PERSONAL: 'PERSONAL',
  GENERAL: 'GENERAL'
};

exports.ShortcutScope = exports.$Enums.ShortcutScope = {
  GLOBAL: 'GLOBAL',
  DEPARTMENT: 'DEPARTMENT',
  PERSONAL: 'PERSONAL'
};

exports.Prisma.ModelName = {
  Department: 'Department',
  Procedure: 'Procedure',
  Agent: 'Agent',
  RolePermission: 'RolePermission',
  Contact: 'Contact',
  ContactPhone: 'ContactPhone',
  BotExclusion: 'BotExclusion',
  Conversation: 'Conversation',
  Message: 'Message',
  ContactShare: 'ContactShare',
  ConversationAssignment: 'ConversationAssignment',
  OutgoingMedia: 'OutgoingMedia',
  ConversationMedia: 'ConversationMedia',
  FlowDefinition: 'FlowDefinition',
  ZApiConfig: 'ZApiConfig',
  BusinessHoursPolicy: 'BusinessHoursPolicy',
  BusinessHoursInterval: 'BusinessHoursInterval',
  BusinessHoursException: 'BusinessHoursException',
  BusinessHoursNotice: 'BusinessHoursNotice',
  Label: 'Label',
  ConversationLabel: 'ConversationLabel',
  GroupMentionCooldown: 'GroupMentionCooldown',
  FlowRevision: 'FlowRevision',
  FlowNode: 'FlowNode',
  FlowTransition: 'FlowTransition',
  FlowExecutionEvent: 'FlowExecutionEvent',
  Shortcut: 'Shortcut',
  ShortcutAudit: 'ShortcutAudit',
  Notification: 'Notification',
  NotificationPreference: 'NotificationPreference'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
