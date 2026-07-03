import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const channelEnum = pgEnum("channel", ["web", "wechat", "email"]);
export const conversationStatusEnum = pgEnum("conversation_status", [
  "open",
  "pending",
  "resolved",
]);
export const conversationPriorityEnum = pgEnum("conversation_priority", [
  "normal",
  "high",
]);
export const messageRoleEnum = pgEnum("message_role", [
  "customer",
  "assistant",
  "agent",
  "system",
]);
export const aiProviderKindEnum = pgEnum("ai_provider_kind", [
  "volcengine",
  "openai-compatible",
]);
export const knowledgeDocumentStatusEnum = pgEnum("knowledge_document_status", [
  "draft",
  "published",
  "archived",
]);
export const knowledgeDocumentSourceEnum = pgEnum("knowledge_document_source", [
  "manual",
  "document",
  "website",
]);

export const organizations = pgTable(
  "organizations",
  {
    id: text().primaryKey(),
    name: text().notNull(),
    slug: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex("organizations_slug_idx").on(table.slug)],
);

export const customers = pgTable(
  "customers",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: text().notNull(),
    initials: text().notNull(),
    phone: text().notNull(),
    email: text().notNull(),
    city: text().notNull(),
    plan: text().notNull(),
    customerSince: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("customers_organization_idx").on(table.organizationId),
    uniqueIndex("customers_org_email_idx").on(
      table.organizationId,
      table.email,
    ),
  ],
);

export const conversations = pgTable(
  "conversations",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customerId: text()
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    channel: channelEnum().notNull(),
    status: conversationStatusEnum().default("open").notNull(),
    priority: conversationPriorityEnum().default("normal").notNull(),
    unread: integer().default(0).notNull(),
    lastMessage: text().notNull(),
    assignee: text().default("未分配").notNull(),
    tags: jsonb().$type<string[]>().default([]).notNull(),
    aiManaged: boolean().default(false).notNull(),
    externalId: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("conversations_org_updated_idx").on(
      table.organizationId,
      table.updatedAt,
    ),
    index("conversations_customer_idx").on(table.customerId),
    uniqueIndex("conversations_external_idx").on(
      table.organizationId,
      table.channel,
      table.externalId,
    ),
  ],
);

export const messages = pgTable(
  "messages",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    conversationId: text()
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: messageRoleEnum().notNull(),
    content: text().notNull(),
    sender: text(),
    externalId: text(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),
    uniqueIndex("messages_external_idx").on(
      table.organizationId,
      table.externalId,
    ),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    customerId: text()
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    amountCents: integer().notNull(),
    currency: text().default("CNY").notNull(),
    status: text().notNull(),
    placedAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("orders_customer_placed_idx").on(table.customerId, table.placedAt),
  ],
);

export const organizationSettings = pgTable("organization_settings", {
  organizationId: text()
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  timezone: text().default("Asia/Shanghai").notNull(),
  language: text().default("zh-CN").notNull(),
  businessHours: text().default("09:00 - 21:00").notNull(),
  autoResolve: boolean().default(true).notNull(),
  maskSensitive: boolean().default(true).notNull(),
  updatedBy: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const aiProviderSettings = pgTable("ai_provider_settings", {
  organizationId: text()
    .primaryKey()
    .references(() => organizations.id, { onDelete: "cascade" }),
  kind: aiProviderKindEnum().default("volcengine").notNull(),
  providerName: text().default("火山引擎方舟").notNull(),
  baseUrl: text().default("https://ark.cn-beijing.volces.com/api/v3").notNull(),
  model: text(),
  apiKeyEncrypted: text(),
  apiKeyHint: text(),
  enabled: boolean().default(true).notNull(),
  lastTestedAt: timestamp({ withTimezone: true }),
  lastTestStatus: text(),
  lastTestMessage: text(),
  updatedBy: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    title: text().notNull(),
    category: text().notNull(),
    content: text().notNull(),
    status: knowledgeDocumentStatusEnum().default("draft").notNull(),
    source: knowledgeDocumentSourceEnum().default("manual").notNull(),
    sourceUrl: text(),
    hitCount: integer().default(0).notNull(),
    createdBy: text(),
    updatedBy: text(),
    publishedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("knowledge_documents_org_status_updated_idx").on(
      table.organizationId,
      table.status,
      table.updatedAt,
    ),
  ],
);

export const knowledgeRetrievals = pgTable(
  "knowledge_retrievals",
  {
    id: text().primaryKey(),
    organizationId: text()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    documentId: text()
      .notNull()
      .references(() => knowledgeDocuments.id, { onDelete: "cascade" }),
    query: text().notNull(),
    scoreBasisPoints: integer().notNull(),
    source: text().notNull(),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("knowledge_retrievals_org_created_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    index("knowledge_retrievals_document_idx").on(table.documentId),
  ],
);
