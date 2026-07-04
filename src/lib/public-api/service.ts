import { and, asc, eq, or } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { conversations, customers, messages } from "@/db/schema";
import type {
  createPublicConversationSchema,
  createPublicMessageSchema,
} from "@/lib/public-api/validation";
import type { z } from "zod";

type ConversationInput = z.infer<typeof createPublicConversationSchema>;
type MessageInput = z.infer<typeof createPublicMessageSchema>;

export class PublicConversationNotFoundError extends Error {
  constructor() {
    super("会话不存在");
    this.name = "PublicConversationNotFoundError";
  }
}

function customerInitials(name: string) {
  return [...name.trim()].slice(-2).join("").toUpperCase() || "访客";
}

function serializeMessage(message: typeof messages.$inferSelect) {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    sender: message.sender,
    externalId: message.externalId,
    createdAt: message.createdAt.toISOString(),
  };
}

export async function getPublicConversation(
  organizationId: string,
  conversationId: string,
) {
  const db = getDatabase();
  const [row] = await db
    .select({ conversation: conversations, customer: customers })
    .from(conversations)
    .innerJoin(customers, eq(conversations.customerId, customers.id))
    .where(
      and(
        eq(conversations.organizationId, organizationId),
        eq(conversations.id, conversationId),
      ),
    )
    .limit(1);
  if (!row) throw new PublicConversationNotFoundError();

  const messageRows = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.organizationId, organizationId),
        eq(messages.conversationId, conversationId),
      ),
    )
    .orderBy(asc(messages.createdAt));

  return {
    id: row.conversation.id,
    externalId: row.conversation.externalId,
    channel: row.conversation.channel,
    status: row.conversation.status,
    priority: row.conversation.priority,
    tags: row.conversation.tags,
    aiManaged: row.conversation.aiManaged,
    assignee: row.conversation.assignee,
    customer: {
      id: row.customer.id,
      externalId: row.customer.externalId,
      name: row.customer.name,
      email: row.customer.email,
      phone: row.customer.phone,
      city: row.customer.city,
      plan: row.customer.plan,
    },
    messages: messageRows.map(serializeMessage),
    createdAt: row.conversation.createdAt.toISOString(),
    updatedAt: row.conversation.updatedAt.toISOString(),
  };
}

export async function createPublicConversation(
  organizationId: string,
  input: ConversationInput,
) {
  const db = getDatabase();
  const now = new Date();
  let conversationId = "";

  await db.transaction(async (transaction) => {
    const customerMatch = input.customer.externalId
      ? or(
          eq(customers.externalId, input.customer.externalId),
          ...(input.customer.email
            ? [eq(customers.email, input.customer.email)]
            : []),
        )
      : eq(customers.email, input.customer.email!);
    const [existingCustomer] = await transaction
      .select()
      .from(customers)
      .where(and(eq(customers.organizationId, organizationId), customerMatch))
      .limit(1);

    const customerId =
      existingCustomer?.id ?? `customer-${crypto.randomUUID()}`;
    const email =
      input.customer.email ||
      existingCustomer?.email ||
      `${input.customer.externalId}@external.invalid`;

    if (existingCustomer) {
      await transaction
        .update(customers)
        .set({
          externalId: input.customer.externalId ?? existingCustomer.externalId,
          name: input.customer.name,
          initials: customerInitials(input.customer.name),
          email,
          phone: input.customer.phone ?? existingCustomer.phone,
          city: input.customer.city ?? existingCustomer.city,
          plan: input.customer.plan ?? existingCustomer.plan,
          updatedAt: now,
        })
        .where(eq(customers.id, customerId));
    } else {
      await transaction.insert(customers).values({
        id: customerId,
        organizationId,
        externalId: input.customer.externalId,
        name: input.customer.name,
        initials: customerInitials(input.customer.name),
        email,
        phone: input.customer.phone ?? "",
        city: input.customer.city ?? "",
        plan: input.customer.plan ?? "访客",
        customerSince: new Intl.DateTimeFormat("zh-CN", {
          year: "numeric",
          month: "long",
        }).format(now),
      });
    }

    const [existingConversation] = input.externalId
      ? await transaction
          .select({ id: conversations.id })
          .from(conversations)
          .where(
            and(
              eq(conversations.organizationId, organizationId),
              eq(conversations.channel, input.channel),
              eq(conversations.externalId, input.externalId),
            ),
          )
          .limit(1)
      : [];

    conversationId = existingConversation?.id ?? `conv-${crypto.randomUUID()}`;
    if (!existingConversation) {
      await transaction.insert(conversations).values({
        id: conversationId,
        organizationId,
        customerId,
        externalId: input.externalId,
        channel: input.channel,
        lastMessage: input.message.content,
        tags: input.tags,
        unread: 1,
        createdAt: now,
        updatedAt: now,
      });
    }

    const [existingMessage] = input.message.externalId
      ? await transaction
          .select({ id: messages.id })
          .from(messages)
          .where(
            and(
              eq(messages.organizationId, organizationId),
              eq(messages.externalId, input.message.externalId),
            ),
          )
          .limit(1)
      : [];

    if (!existingMessage) {
      await transaction.insert(messages).values({
        id: `msg-${crypto.randomUUID()}`,
        organizationId,
        conversationId,
        role: "customer",
        content: input.message.content,
        sender: input.customer.name,
        externalId: input.message.externalId,
        createdAt: now,
      });
      if (existingConversation) {
        await transaction
          .update(conversations)
          .set({
            lastMessage: input.message.content,
            unread: 1,
            updatedAt: now,
          })
          .where(eq(conversations.id, conversationId));
      }
    }
  });

  return getPublicConversation(organizationId, conversationId);
}

export async function addPublicCustomerMessage(
  organizationId: string,
  conversationId: string,
  input: MessageInput,
) {
  const db = getDatabase();
  const now = new Date();

  await db.transaction(async (transaction) => {
    const [conversation] = await transaction
      .select({ id: conversations.id, unread: conversations.unread })
      .from(conversations)
      .where(
        and(
          eq(conversations.organizationId, organizationId),
          eq(conversations.id, conversationId),
        ),
      )
      .limit(1);
    if (!conversation) throw new PublicConversationNotFoundError();

    const [existingMessage] = input.externalId
      ? await transaction
          .select({ id: messages.id })
          .from(messages)
          .where(
            and(
              eq(messages.organizationId, organizationId),
              eq(messages.externalId, input.externalId),
            ),
          )
          .limit(1)
      : [];
    if (existingMessage) return;

    await transaction.insert(messages).values({
      id: `msg-${crypto.randomUUID()}`,
      organizationId,
      conversationId,
      role: "customer",
      content: input.content,
      sender: input.sender,
      externalId: input.externalId,
      createdAt: now,
    });
    await transaction
      .update(conversations)
      .set({
        lastMessage: input.content,
        unread: conversation.unread + 1,
        updatedAt: now,
      })
      .where(eq(conversations.id, conversationId));
  });

  return getPublicConversation(organizationId, conversationId);
}
