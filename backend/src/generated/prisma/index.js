
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/library.js')


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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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




  const path = require('path')

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
  createdAt: 'createdAt'
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
  closeReason: 'closeReason'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  externalMessageId: 'externalMessageId',
  direction: 'direction',
  senderType: 'senderType',
  senderAgentId: 'senderAgentId',
  content: 'content',
  createdAt: 'createdAt',
  readAt: 'readAt'
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
  updatedAt: 'updatedAt'
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
exports.MediaProvider = exports.$Enums.MediaProvider = {
  ZAPI: 'ZAPI'
};

exports.MediaType = exports.$Enums.MediaType = {
  IMAGE: 'IMAGE',
  AUDIO: 'AUDIO',
  VIDEO: 'VIDEO',
  DOCUMENT: 'DOCUMENT'
};

exports.MediaStatus = exports.$Enums.MediaStatus = {
  AVAILABLE: 'AVAILABLE',
  UNAVAILABLE: 'UNAVAILABLE',
  EXPIRED: 'EXPIRED'
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
  Conversation: 'Conversation',
  Message: 'Message',
  ConversationMedia: 'ConversationMedia',
  FlowDefinition: 'FlowDefinition',
  ZApiConfig: 'ZApiConfig',
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
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\ESTUDIO-TREINAMENTO\\Desktop\\botSupport\\backend\\src\\generated\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [],
    "sourceFilePath": "C:\\Users\\ESTUDIO-TREINAMENTO\\Desktop\\botSupport\\backend\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider = \"prisma-client-js\"\n  output   = \"../src/generated/prisma\"\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel Department {\n  id            String         @id @default(uuid())\n  name          String\n  description   String?\n  createdAt     DateTime       @default(now()) @map(\"created_at\") @db.Timestamptz\n  procedures    Procedure[]\n  agents        Agent[]\n  conversations Conversation[]\n  shortcuts     Shortcut[]\n  flowNodes     FlowNode[]\n\n  @@map(\"gtf_departments\")\n}\n\nmodel Procedure {\n  id           String     @id @default(uuid())\n  departmentId String     @map(\"department_id\")\n  title        String\n  content      String\n  order        Int        @default(0)\n  department   Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)\n\n  @@map(\"gtf_procedures\")\n}\n\nmodel Agent {\n  id                     String                  @id @default(uuid())\n  name                   String\n  email                  String                  @unique\n  password               String                  @default(\"$2a$10$e8Tj4yqgO.tL5zD6.e8Tj.e8Tj4yqgO.tL5zD6\")\n  role                   String                  @default(\"AGENT\")\n  isActive               Boolean                 @default(true) @map(\"is_active\")\n  departmentId           String?                 @map(\"department_id\")\n  isOnline               Boolean                 @default(false) @map(\"is_online\")\n  createdAt              DateTime                @default(now()) @map(\"created_at\") @db.Timestamptz\n  department             Department?             @relation(fields: [departmentId], references: [id])\n  conversations          Conversation[]\n  messages               Message[]\n  ownedShortcuts         Shortcut[]              @relation(\"ShortcutOwner\")\n  createdShortcuts       Shortcut[]              @relation(\"ShortcutCreatedBy\")\n  updatedShortcuts       Shortcut[]              @relation(\"ShortcutUpdatedBy\")\n  shortcutAudits         ShortcutAudit[]\n  publishedFlowRevisions FlowRevision[]          @relation(\"FlowRevisionPublisher\")\n  notifications          Notification[]\n  notificationPreference NotificationPreference?\n\n  @@map(\"gtf_agents\")\n}\n\nmodel RolePermission {\n  id        String   @id @default(uuid())\n  role      String\n  resource  String\n  actions   String[]\n  updatedAt DateTime @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  @@unique([role, resource])\n  @@index([role])\n  @@map(\"gtf_role_permissions\")\n}\n\nmodel Contact {\n  id            String         @id @default(uuid())\n  phone         String         @unique\n  name          String\n  createdAt     DateTime       @default(now()) @map(\"created_at\") @db.Timestamptz\n  conversations Conversation[]\n\n  @@map(\"gtf_contacts\")\n}\n\nmodel Conversation {\n  id                String               @id @default(uuid())\n  contactId         String               @map(\"contact_id\")\n  status            String               @default(\"OPEN\")\n  departmentId      String?              @map(\"department_id\")\n  assignedAgentId   String?              @map(\"assigned_agent_id\")\n  currentStep       String?              @map(\"current_step\")\n  flowRevisionId    String?              @map(\"flow_revision_id\")\n  currentFlowNodeId String?              @map(\"current_flow_node_id\")\n  flowContext       Json?                @map(\"flow_context\")\n  startedAt         DateTime             @default(now()) @map(\"started_at\") @db.Timestamptz\n  queuedAt          DateTime?            @map(\"queued_at\") @db.Timestamptz\n  lastActivityAt    DateTime             @default(now()) @map(\"last_activity_at\") @db.Timestamptz\n  closedAt          DateTime?            @map(\"closed_at\") @db.Timestamptz\n  warningSentAt     DateTime?            @map(\"warning_sent_at\") @db.Timestamptz\n  closeReason       String?              @map(\"close_reason\")\n  contact           Contact              @relation(fields: [contactId], references: [id])\n  department        Department?          @relation(fields: [departmentId], references: [id])\n  assignedAgent     Agent?               @relation(fields: [assignedAgentId], references: [id])\n  messages          Message[]\n  flowRevision      FlowRevision?        @relation(fields: [flowRevisionId], references: [id], onDelete: SetNull)\n  currentFlowNode   FlowNode?            @relation(fields: [currentFlowNodeId], references: [id], onDelete: SetNull)\n  flowEvents        FlowExecutionEvent[]\n  notifications     Notification[]\n  media             ConversationMedia[]\n\n  @@index([flowRevisionId])\n  @@index([currentFlowNodeId])\n  @@index([status, departmentId, lastActivityAt])\n  @@index([status, queuedAt])\n  @@index([assignedAgentId, status, lastActivityAt])\n  @@index([lastActivityAt])\n  @@index([warningSentAt])\n  @@map(\"gtf_conversations\")\n}\n\nmodel Message {\n  id                String             @id @default(uuid())\n  conversationId    String             @map(\"conversation_id\")\n  externalMessageId String?            @unique @map(\"external_message_id\")\n  direction         String\n  senderType        String             @map(\"sender_type\")\n  senderAgentId     String?            @map(\"sender_agent_id\")\n  content           String\n  createdAt         DateTime           @default(now()) @map(\"created_at\") @db.Timestamptz\n  readAt            DateTime?          @map(\"read_at\") @db.Timestamptz\n  conversation      Conversation       @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n  senderAgent       Agent?             @relation(fields: [senderAgentId], references: [id])\n  media             ConversationMedia?\n\n  @@index([conversationId, direction, readAt])\n  @@map(\"gtf_messages\")\n}\n\nenum MediaProvider {\n  ZAPI\n}\n\nenum MediaType {\n  IMAGE\n  AUDIO\n  VIDEO\n  DOCUMENT\n}\n\nenum MediaStatus {\n  AVAILABLE\n  UNAVAILABLE\n  EXPIRED\n}\n\nmodel ConversationMedia {\n  id                     String        @id @default(uuid())\n  messageId              String        @unique @map(\"message_id\")\n  conversationId         String        @map(\"conversation_id\")\n  whatsappMessageId      String        @unique @map(\"whatsapp_message_id\")\n  provider               MediaProvider @default(ZAPI)\n  type                   MediaType\n  status                 MediaStatus   @default(AVAILABLE)\n  mimeType               String        @map(\"mime_type\")\n  caption                String?\n  originalFileName       String?       @map(\"original_file_name\")\n  title                  String?\n  ptt                    Boolean?\n  seconds                Int?\n  width                  Int?\n  height                 Int?\n  pageCount              Int?          @map(\"page_count\")\n  viewOnce               Boolean       @default(false) @map(\"view_once\")\n  sourceUrlCiphertext    String?       @map(\"source_url_ciphertext\")\n  thumbnailUrlCiphertext String?       @map(\"thumbnail_url_ciphertext\")\n  encryptionKeyVersion   Int           @default(1) @map(\"encryption_key_version\")\n  sourceCreatedAt        DateTime      @map(\"source_created_at\") @db.Timestamptz\n  expiresAt              DateTime      @map(\"expires_at\") @db.Timestamptz\n  failureCode            String?       @map(\"failure_code\")\n  lastAccessErrorCode    String?       @map(\"last_access_error_code\")\n  lastAccessedAt         DateTime?     @map(\"last_accessed_at\") @db.Timestamptz\n  createdAt              DateTime      @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt              DateTime      @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz\n  message                Message       @relation(fields: [messageId], references: [id], onDelete: Cascade)\n  conversation           Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n\n  @@index([conversationId, createdAt])\n  @@index([status, expiresAt])\n  @@map(\"gtf_conversation_media\")\n}\n\nmodel FlowDefinition {\n  id          String         @id @default(uuid())\n  name        String\n  greeting    String\n  menuMessage String         @map(\"menu_message\")\n  options     Json\n  updatedAt   DateTime       @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz\n  revisions   FlowRevision[]\n\n  @@map(\"gtf_flow_definitions\")\n}\n\nmodel ZApiConfig {\n  id          String   @id @default(uuid())\n  instanceId  String   @map(\"instance_id\")\n  token       String\n  clientToken String?  @map(\"client_token\")\n  webhookUrl  String?  @map(\"webhook_url\")\n  isActive    Boolean  @default(true) @map(\"is_active\")\n  autoReply   Boolean  @default(true) @map(\"auto_reply\")\n  updatedAt   DateTime @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz\n\n  @@map(\"gtf_zapi_config\")\n}\n\nenum FlowRevisionStatus {\n  DRAFT\n  PUBLISHED\n  ARCHIVED\n}\n\nenum FlowNodeType {\n  ENTRY\n  MESSAGE\n  DECISION\n  ROUTE\n  TRIAGE\n  HANDOFF\n  END\n}\n\nmodel FlowRevision {\n  id               String               @id @default(uuid())\n  flowDefinitionId String               @map(\"flow_definition_id\")\n  version          Int\n  status           FlowRevisionStatus   @default(DRAFT)\n  schemaVersion    Int                  @default(2) @map(\"schema_version\")\n  revision         Int                  @default(1)\n  publishedAt      DateTime?            @map(\"published_at\") @db.Timestamptz\n  publishedById    String?              @map(\"published_by_id\")\n  createdAt        DateTime             @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt        DateTime             @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz\n  flowDefinition   FlowDefinition       @relation(fields: [flowDefinitionId], references: [id], onDelete: Cascade)\n  publishedBy      Agent?               @relation(\"FlowRevisionPublisher\", fields: [publishedById], references: [id], onDelete: SetNull)\n  nodes            FlowNode[]\n  transitions      FlowTransition[]\n  conversations    Conversation[]\n  executionEvents  FlowExecutionEvent[]\n\n  @@unique([flowDefinitionId, version])\n  @@index([flowDefinitionId, status])\n  @@map(\"gtf_flow_revisions\")\n}\n\nmodel FlowNode {\n  id              String               @id @default(uuid())\n  stableKey       String               @map(\"stable_key\")\n  flowRevisionId  String               @map(\"flow_revision_id\")\n  type            FlowNodeType\n  name            String\n  content         String               @default(\"\")\n  sortOrder       Int                  @default(0) @map(\"sort_order\")\n  config          Json?\n  departmentId    String?              @map(\"department_id\")\n  flowRevision    FlowRevision         @relation(fields: [flowRevisionId], references: [id], onDelete: Cascade)\n  department      Department?          @relation(fields: [departmentId], references: [id], onDelete: SetNull)\n  outgoing        FlowTransition[]     @relation(\"FlowTransitionFrom\")\n  incoming        FlowTransition[]     @relation(\"FlowTransitionTo\")\n  conversations   Conversation[]\n  executionEvents FlowExecutionEvent[]\n\n  @@unique([flowRevisionId, stableKey])\n  @@index([flowRevisionId, type, sortOrder])\n  @@index([departmentId])\n  @@map(\"gtf_flow_nodes\")\n}\n\nmodel FlowTransition {\n  id             String       @id @default(uuid())\n  flowRevisionId String       @map(\"flow_revision_id\")\n  fromNodeId     String       @map(\"from_node_id\")\n  toNodeId       String       @map(\"to_node_id\")\n  optionKey      String?      @map(\"option_key\")\n  label          String?\n  sortOrder      Int          @default(0) @map(\"sort_order\")\n  flowRevision   FlowRevision @relation(fields: [flowRevisionId], references: [id], onDelete: Cascade)\n  fromNode       FlowNode     @relation(\"FlowTransitionFrom\", fields: [fromNodeId], references: [id], onDelete: Cascade)\n  toNode         FlowNode     @relation(\"FlowTransitionTo\", fields: [toNodeId], references: [id], onDelete: Cascade)\n\n  @@unique([flowRevisionId, optionKey])\n  @@index([fromNodeId, sortOrder])\n  @@index([toNodeId])\n  @@map(\"gtf_flow_transitions\")\n}\n\nmodel FlowExecutionEvent {\n  id              String       @id @default(uuid())\n  conversationId  String       @map(\"conversation_id\")\n  flowRevisionId  String       @map(\"flow_revision_id\")\n  flowNodeId      String?      @map(\"flow_node_id\")\n  externalEventId String?      @unique @map(\"external_event_id\")\n  type            String\n  metadata        Json?\n  createdAt       DateTime     @default(now()) @map(\"created_at\") @db.Timestamptz\n  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n  flowRevision    FlowRevision @relation(fields: [flowRevisionId], references: [id], onDelete: Cascade)\n  flowNode        FlowNode?    @relation(fields: [flowNodeId], references: [id], onDelete: SetNull)\n\n  @@index([conversationId, createdAt])\n  @@index([flowRevisionId, flowNodeId])\n  @@map(\"gtf_flow_execution_events\")\n}\n\nenum ShortcutType {\n  GREETING\n  CLOSING\n  DEPARTMENT\n  PERSONAL\n  GENERAL\n}\n\nenum ShortcutScope {\n  GLOBAL\n  DEPARTMENT\n  PERSONAL\n}\n\nmodel Shortcut {\n  id           String          @id @default(uuid())\n  title        String\n  message      String\n  type         ShortcutType\n  scope        ShortcutScope\n  departmentId String?         @map(\"department_id\")\n  ownerId      String?         @map(\"owner_id\")\n  isActive     Boolean         @default(true) @map(\"is_active\")\n  sortOrder    Int             @default(0) @map(\"sort_order\")\n  createdById  String          @map(\"created_by_id\")\n  updatedById  String?         @map(\"updated_by_id\")\n  createdAt    DateTime        @default(now()) @map(\"created_at\") @db.Timestamptz\n  updatedAt    DateTime        @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz\n  archivedAt   DateTime?       @map(\"archived_at\") @db.Timestamptz\n  department   Department?     @relation(fields: [departmentId], references: [id], onDelete: SetNull)\n  owner        Agent?          @relation(\"ShortcutOwner\", fields: [ownerId], references: [id], onDelete: SetNull)\n  createdBy    Agent           @relation(\"ShortcutCreatedBy\", fields: [createdById], references: [id])\n  updatedBy    Agent?          @relation(\"ShortcutUpdatedBy\", fields: [updatedById], references: [id], onDelete: SetNull)\n  audits       ShortcutAudit[]\n\n  @@index([isActive, scope, type])\n  @@index([departmentId, isActive])\n  @@index([ownerId, isActive])\n  @@map(\"gtf_shortcuts\")\n}\n\nmodel ShortcutAudit {\n  id         String    @id @default(uuid())\n  shortcutId String?   @map(\"shortcut_id\")\n  actorId    String    @map(\"actor_id\")\n  action     String\n  metadata   Json?\n  createdAt  DateTime  @default(now()) @map(\"created_at\") @db.Timestamptz\n  shortcut   Shortcut? @relation(fields: [shortcutId], references: [id], onDelete: SetNull)\n  actor      Agent     @relation(fields: [actorId], references: [id])\n\n  @@index([shortcutId, action])\n  @@index([actorId, createdAt])\n  @@map(\"gtf_shortcut_audits\")\n}\n\nmodel Notification {\n  id             String        @id @default(uuid())\n  agentId        String        @map(\"agent_id\")\n  type           String\n  title          String\n  body           String\n  conversationId String?       @map(\"conversation_id\")\n  departmentId   String?       @map(\"department_id\")\n  dedupeKey      String        @map(\"dedupe_key\")\n  payload        Json?\n  createdAt      DateTime      @default(now()) @map(\"created_at\") @db.Timestamptz\n  readAt         DateTime?     @map(\"read_at\") @db.Timestamptz\n  dismissedAt    DateTime?     @map(\"dismissed_at\") @db.Timestamptz\n  agent          Agent         @relation(fields: [agentId], references: [id], onDelete: Cascade)\n  conversation   Conversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n\n  @@unique([agentId, dedupeKey])\n  @@index([agentId, readAt, createdAt])\n  @@index([conversationId, type, createdAt])\n  @@map(\"gtf_notifications\")\n}\n\nmodel NotificationPreference {\n  id                         String   @id @default(uuid())\n  agentId                    String   @unique @map(\"agent_id\")\n  soundEnabled               Boolean  @default(false) @map(\"sound_enabled\")\n  browserEnabled             Boolean  @default(false) @map(\"browser_enabled\")\n  unresolvedRemindersEnabled Boolean  @default(true) @map(\"unresolved_reminders_enabled\")\n  unresolvedReminderMinutes  Int      @default(30) @map(\"unresolved_reminder_minutes\")\n  reminderRepeatMinutes      Int      @default(30) @map(\"reminder_repeat_minutes\")\n  updatedAt                  DateTime @default(now()) @updatedAt @map(\"updated_at\") @db.Timestamptz\n  agent                      Agent    @relation(fields: [agentId], references: [id], onDelete: Cascade)\n\n  @@map(\"gtf_notification_preferences\")\n}\n",
  "inlineSchemaHash": "8b957c3e0d258613d87a617d22a51885409b98887f166039cc818510a72b2be6",
  "copyEngine": true
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "src/generated/prisma",
    "generated/prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Department\":{\"dbName\":\"gtf_departments\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"description\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"procedures\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Procedure\",\"relationName\":\"DepartmentToProcedure\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"AgentToDepartment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToDepartment\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shortcuts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Shortcut\",\"relationName\":\"DepartmentToShortcut\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowNodes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowNode\",\"relationName\":\"DepartmentToFlowNode\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Procedure\":{\"dbName\":\"gtf_procedures\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departmentId\",\"dbName\":\"department_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Department\",\"relationName\":\"DepartmentToProcedure\",\"relationFromFields\":[\"departmentId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Agent\":{\"dbName\":\"gtf_agents\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"email\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"password\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"$2a$10$e8Tj4yqgO.tL5zD6.e8Tj.e8Tj4yqgO.tL5zD6\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"AGENT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departmentId\",\"dbName\":\"department_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isOnline\",\"dbName\":\"is_online\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Department\",\"relationName\":\"AgentToDepartment\",\"relationFromFields\":[\"departmentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"AgentToConversation\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Message\",\"relationName\":\"AgentToMessage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownedShortcuts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Shortcut\",\"relationName\":\"ShortcutOwner\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdShortcuts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Shortcut\",\"relationName\":\"ShortcutCreatedBy\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedShortcuts\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Shortcut\",\"relationName\":\"ShortcutUpdatedBy\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shortcutAudits\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ShortcutAudit\",\"relationName\":\"AgentToShortcutAudit\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishedFlowRevisions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowRevision\",\"relationName\":\"FlowRevisionPublisher\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"AgentToNotification\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notificationPreference\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NotificationPreference\",\"relationName\":\"AgentToNotificationPreference\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"RolePermission\":{\"dbName\":\"gtf_role_permissions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"role\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"resource\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actions\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[[\"role\",\"resource\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"role\",\"resource\"]}],\"isGenerated\":false},\"Contact\":{\"dbName\":\"gtf_contacts\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"phone\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ContactToConversation\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Conversation\":{\"dbName\":\"gtf_conversations\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contactId\",\"dbName\":\"contact_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"OPEN\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departmentId\",\"dbName\":\"department_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assignedAgentId\",\"dbName\":\"assigned_agent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentStep\",\"dbName\":\"current_step\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevisionId\",\"dbName\":\"flow_revision_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentFlowNodeId\",\"dbName\":\"current_flow_node_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowContext\",\"dbName\":\"flow_context\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"startedAt\",\"dbName\":\"started_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"queuedAt\",\"dbName\":\"queued_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastActivityAt\",\"dbName\":\"last_activity_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"closedAt\",\"dbName\":\"closed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"warningSentAt\",\"dbName\":\"warning_sent_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"closeReason\",\"dbName\":\"close_reason\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"contact\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Contact\",\"relationName\":\"ContactToConversation\",\"relationFromFields\":[\"contactId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Department\",\"relationName\":\"ConversationToDepartment\",\"relationFromFields\":[\"departmentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"assignedAgent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"AgentToConversation\",\"relationFromFields\":[\"assignedAgentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"messages\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Message\",\"relationName\":\"ConversationToMessage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevision\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowRevision\",\"relationName\":\"ConversationToFlowRevision\",\"relationFromFields\":[\"flowRevisionId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"currentFlowNode\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowNode\",\"relationName\":\"ConversationToFlowNode\",\"relationFromFields\":[\"currentFlowNodeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowExecutionEvent\",\"relationName\":\"ConversationToFlowExecutionEvent\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"notifications\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Notification\",\"relationName\":\"ConversationToNotification\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"media\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ConversationMedia\",\"relationName\":\"ConversationToConversationMedia\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Message\":{\"dbName\":\"gtf_messages\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversationId\",\"dbName\":\"conversation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"externalMessageId\",\"dbName\":\"external_message_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"direction\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"senderType\",\"dbName\":\"sender_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"senderAgentId\",\"dbName\":\"sender_agent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readAt\",\"dbName\":\"read_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToMessage\",\"relationFromFields\":[\"conversationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"senderAgent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"AgentToMessage\",\"relationFromFields\":[\"senderAgentId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"media\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ConversationMedia\",\"relationName\":\"ConversationMediaToMessage\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ConversationMedia\":{\"dbName\":\"gtf_conversation_media\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"messageId\",\"dbName\":\"message_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversationId\",\"dbName\":\"conversation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"whatsappMessageId\",\"dbName\":\"whatsapp_message_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"provider\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"MediaProvider\",\"default\":\"ZAPI\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"MediaType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"MediaStatus\",\"default\":\"AVAILABLE\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"mimeType\",\"dbName\":\"mime_type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"caption\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"originalFileName\",\"dbName\":\"original_file_name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ptt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seconds\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"width\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"height\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"pageCount\",\"dbName\":\"page_count\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"viewOnce\",\"dbName\":\"view_once\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceUrlCiphertext\",\"dbName\":\"source_url_ciphertext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"thumbnailUrlCiphertext\",\"dbName\":\"thumbnail_url_ciphertext\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"encryptionKeyVersion\",\"dbName\":\"encryption_key_version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sourceCreatedAt\",\"dbName\":\"source_created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"expiresAt\",\"dbName\":\"expires_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"failureCode\",\"dbName\":\"failure_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastAccessErrorCode\",\"dbName\":\"last_access_error_code\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"lastAccessedAt\",\"dbName\":\"last_accessed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"message\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Message\",\"relationName\":\"ConversationMediaToMessage\",\"relationFromFields\":[\"messageId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToConversationMedia\",\"relationFromFields\":[\"conversationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FlowDefinition\":{\"dbName\":\"gtf_flow_definitions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"greeting\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"menuMessage\",\"dbName\":\"menu_message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"options\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"revisions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowRevision\",\"relationName\":\"FlowDefinitionToFlowRevision\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ZApiConfig\":{\"dbName\":\"gtf_zapi_config\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"instanceId\",\"dbName\":\"instance_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"clientToken\",\"dbName\":\"client_token\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"webhookUrl\",\"dbName\":\"webhook_url\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"autoReply\",\"dbName\":\"auto_reply\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"FlowRevision\":{\"dbName\":\"gtf_flow_revisions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowDefinitionId\",\"dbName\":\"flow_definition_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"FlowRevisionStatus\",\"default\":\"DRAFT\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"schemaVersion\",\"dbName\":\"schema_version\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":2,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"revision\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":1,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishedAt\",\"dbName\":\"published_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishedById\",\"dbName\":\"published_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"flowDefinition\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowDefinition\",\"relationName\":\"FlowDefinitionToFlowRevision\",\"relationFromFields\":[\"flowDefinitionId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"publishedBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"FlowRevisionPublisher\",\"relationFromFields\":[\"publishedById\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nodes\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowNode\",\"relationName\":\"FlowNodeToFlowRevision\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"transitions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowTransition\",\"relationName\":\"FlowRevisionToFlowTransition\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToFlowRevision\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"executionEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowExecutionEvent\",\"relationName\":\"FlowExecutionEventToFlowRevision\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"flowDefinitionId\",\"version\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"flowDefinitionId\",\"version\"]}],\"isGenerated\":false},\"FlowNode\":{\"dbName\":\"gtf_flow_nodes\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"stableKey\",\"dbName\":\"stable_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevisionId\",\"dbName\":\"flow_revision_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowNodeType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"content\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":\"\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"config\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departmentId\",\"dbName\":\"department_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevision\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowRevision\",\"relationName\":\"FlowNodeToFlowRevision\",\"relationFromFields\":[\"flowRevisionId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Department\",\"relationName\":\"DepartmentToFlowNode\",\"relationFromFields\":[\"departmentId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"outgoing\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowTransition\",\"relationName\":\"FlowTransitionFrom\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"incoming\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowTransition\",\"relationName\":\"FlowTransitionTo\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversations\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToFlowNode\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"executionEvents\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowExecutionEvent\",\"relationName\":\"FlowExecutionEventToFlowNode\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"flowRevisionId\",\"stableKey\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"flowRevisionId\",\"stableKey\"]}],\"isGenerated\":false},\"FlowTransition\":{\"dbName\":\"gtf_flow_transitions\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevisionId\",\"dbName\":\"flow_revision_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fromNodeId\",\"dbName\":\"from_node_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"toNodeId\",\"dbName\":\"to_node_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"optionKey\",\"dbName\":\"option_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"label\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevision\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowRevision\",\"relationName\":\"FlowRevisionToFlowTransition\",\"relationFromFields\":[\"flowRevisionId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fromNode\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowNode\",\"relationName\":\"FlowTransitionFrom\",\"relationFromFields\":[\"fromNodeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"toNode\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowNode\",\"relationName\":\"FlowTransitionTo\",\"relationFromFields\":[\"toNodeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"flowRevisionId\",\"optionKey\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"flowRevisionId\",\"optionKey\"]}],\"isGenerated\":false},\"FlowExecutionEvent\":{\"dbName\":\"gtf_flow_execution_events\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversationId\",\"dbName\":\"conversation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevisionId\",\"dbName\":\"flow_revision_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowNodeId\",\"dbName\":\"flow_node_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"externalEventId\",\"dbName\":\"external_event_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToFlowExecutionEvent\",\"relationFromFields\":[\"conversationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowRevision\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowRevision\",\"relationName\":\"FlowExecutionEventToFlowRevision\",\"relationFromFields\":[\"flowRevisionId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"flowNode\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"FlowNode\",\"relationName\":\"FlowExecutionEventToFlowNode\",\"relationFromFields\":[\"flowNodeId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Shortcut\":{\"dbName\":\"gtf_shortcuts\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"message\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ShortcutType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"scope\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ShortcutScope\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departmentId\",\"dbName\":\"department_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ownerId\",\"dbName\":\"owner_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isActive\",\"dbName\":\"is_active\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sortOrder\",\"dbName\":\"sort_order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdById\",\"dbName\":\"created_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedById\",\"dbName\":\"updated_by_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"archivedAt\",\"dbName\":\"archived_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"department\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Department\",\"relationName\":\"DepartmentToShortcut\",\"relationFromFields\":[\"departmentId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"owner\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"ShortcutOwner\",\"relationFromFields\":[\"ownerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"ShortcutCreatedBy\",\"relationFromFields\":[\"createdById\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedBy\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"ShortcutUpdatedBy\",\"relationFromFields\":[\"updatedById\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"audits\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ShortcutAudit\",\"relationName\":\"ShortcutToShortcutAudit\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ShortcutAudit\":{\"dbName\":\"gtf_shortcut_audits\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shortcutId\",\"dbName\":\"shortcut_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actorId\",\"dbName\":\"actor_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"action\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"metadata\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shortcut\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Shortcut\",\"relationName\":\"ShortcutToShortcutAudit\",\"relationFromFields\":[\"shortcutId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"SetNull\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"actor\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"AgentToShortcutAudit\",\"relationFromFields\":[\"actorId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Notification\":{\"dbName\":\"gtf_notifications\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agentId\",\"dbName\":\"agent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"body\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversationId\",\"dbName\":\"conversation_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"departmentId\",\"dbName\":\"department_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dedupeKey\",\"dbName\":\"dedupe_key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"payload\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Json\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"dbName\":\"created_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"readAt\",\"dbName\":\"read_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dismissedAt\",\"dbName\":\"dismissed_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"AgentToNotification\",\"relationFromFields\":[\"agentId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"conversation\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Conversation\",\"relationName\":\"ConversationToNotification\",\"relationFromFields\":[\"conversationId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"agentId\",\"dedupeKey\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"agentId\",\"dedupeKey\"]}],\"isGenerated\":false},\"NotificationPreference\":{\"dbName\":\"gtf_notification_preferences\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":{\"name\":\"uuid(4)\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"agentId\",\"dbName\":\"agent_id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"soundEnabled\",\"dbName\":\"sound_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"browserEnabled\",\"dbName\":\"browser_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unresolvedRemindersEnabled\",\"dbName\":\"unresolved_reminders_enabled\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unresolvedReminderMinutes\",\"dbName\":\"unresolved_reminder_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":30,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"reminderRepeatMinutes\",\"dbName\":\"reminder_repeat_minutes\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":30,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"dbName\":\"updated_at\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"agent\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Agent\",\"relationName\":\"AgentToNotificationPreference\",\"relationFromFields\":[\"agentId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"MediaProvider\":{\"values\":[{\"name\":\"ZAPI\",\"dbName\":null}],\"dbName\":null},\"MediaType\":{\"values\":[{\"name\":\"IMAGE\",\"dbName\":null},{\"name\":\"AUDIO\",\"dbName\":null},{\"name\":\"VIDEO\",\"dbName\":null},{\"name\":\"DOCUMENT\",\"dbName\":null}],\"dbName\":null},\"MediaStatus\":{\"values\":[{\"name\":\"AVAILABLE\",\"dbName\":null},{\"name\":\"UNAVAILABLE\",\"dbName\":null},{\"name\":\"EXPIRED\",\"dbName\":null}],\"dbName\":null},\"FlowRevisionStatus\":{\"values\":[{\"name\":\"DRAFT\",\"dbName\":null},{\"name\":\"PUBLISHED\",\"dbName\":null},{\"name\":\"ARCHIVED\",\"dbName\":null}],\"dbName\":null},\"FlowNodeType\":{\"values\":[{\"name\":\"ENTRY\",\"dbName\":null},{\"name\":\"MESSAGE\",\"dbName\":null},{\"name\":\"DECISION\",\"dbName\":null},{\"name\":\"ROUTE\",\"dbName\":null},{\"name\":\"TRIAGE\",\"dbName\":null},{\"name\":\"HANDOFF\",\"dbName\":null},{\"name\":\"END\",\"dbName\":null}],\"dbName\":null},\"ShortcutType\":{\"values\":[{\"name\":\"GREETING\",\"dbName\":null},{\"name\":\"CLOSING\",\"dbName\":null},{\"name\":\"DEPARTMENT\",\"dbName\":null},{\"name\":\"PERSONAL\",\"dbName\":null},{\"name\":\"GENERAL\",\"dbName\":null}],\"dbName\":null},\"ShortcutScope\":{\"values\":[{\"name\":\"GLOBAL\",\"dbName\":null},{\"name\":\"DEPARTMENT\",\"dbName\":null},{\"name\":\"PERSONAL\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = undefined


const { warnEnvConflicts } = require('./runtime/library.js')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "src/generated/prisma/query_engine-windows.dll.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "src/generated/prisma/schema.prisma")
