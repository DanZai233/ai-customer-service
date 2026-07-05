import { and, asc, desc, eq, inArray } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { conversations, customers, messages, orders } from "@/db/schema";
import {
  ConversationNotFoundError,
  type ConversationRepository,
} from "@/lib/conversations/contract";
import type { Conversation, NewMessage } from "@/lib/conversations/types";

function relativeTime(date: Date) {
  const minutes = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 60000),
  );
  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(date);
}

function messageTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function orderDate(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(date)
    .replaceAll("/", "-");
}

export function createPostgresConversationRepository(): ConversationRepository {
  async function list(organizationId: string) {
    const db = getDatabase();
    const conversationRows = await db
      .select({ conversation: conversations, customer: customers })
      .from(conversations)
      .innerJoin(customers, eq(conversations.customerId, customers.id))
      .where(eq(conversations.organizationId, organizationId))
      .orderBy(desc(conversations.updatedAt));

    if (conversationRows.length === 0) return [];

    const conversationIds = conversationRows.map(
      ({ conversation }) => conversation.id,
    );
    const customerIds = conversationRows.map(({ customer }) => customer.id);
    const [messageRows, orderRows] = await Promise.all([
      db
        .select()
        .from(messages)
        .where(
          and(
            eq(messages.organizationId, organizationId),
            inArray(messages.conversationId, conversationIds),
          ),
        )
        .orderBy(asc(messages.createdAt)),
      db
        .select()
        .from(orders)
        .where(
          and(
            eq(orders.organizationId, organizationId),
            inArray(orders.customerId, customerIds),
          ),
        )
        .orderBy(desc(orders.placedAt)),
    ]);

    const messagesByConversation = Map.groupBy(
      messageRows,
      (message) => message.conversationId,
    );
    const ordersByCustomer = Map.groupBy(
      orderRows,
      (order) => order.customerId,
    );

    return conversationRows.map<Conversation>(({ conversation, customer }) => {
      const recentOrder = ordersByCustomer.get(customer.id)?.[0];
      return {
        id: conversation.id,
        customer: {
          id: customer.id,
          name: customer.name,
          initials: customer.initials,
          phone: customer.phone,
          email: customer.email,
          city: customer.city,
          plan: customer.plan,
          since: customer.customerSince,
        },
        channel: conversation.channel,
        status: conversation.status,
        priority: conversation.priority,
        unread: conversation.unread,
        lastMessage: conversation.lastMessage,
        updatedAt: relativeTime(conversation.updatedAt),
        assignee: conversation.assignee,
        tags: conversation.tags,
        aiManaged: conversation.aiManaged,
        order: recentOrder
          ? {
              id: recentOrder.id,
              amount: new Intl.NumberFormat("zh-CN", {
                style: "currency",
                currency: recentOrder.currency,
              }).format(recentOrder.amountCents / 100),
              status: recentOrder.status,
              placedAt: orderDate(recentOrder.placedAt),
            }
          : undefined,
        messages: (messagesByConversation.get(conversation.id) ?? []).map(
          (message) => ({
            id: message.id,
            role: message.role,
            content: message.content,
            sender: message.sender ?? undefined,
            time: messageTime(message.createdAt),
          }),
        ),
      };
    });
  }

  async function find(
    organizationId: string,
    conversationId: string,
  ): Promise<Conversation> {
    const result = (await list(organizationId)).find(
      (conversation) => conversation.id === conversationId,
    );
    if (!result) throw new ConversationNotFoundError(conversationId);
    return result;
  }

  return {
    list,

    async update(organizationId, conversationId, patch) {
      const db = getDatabase();
      const updated = await db
        .update(conversations)
        .set({ ...patch, updatedAt: new Date() })
        .where(
          and(
            eq(conversations.id, conversationId),
            eq(conversations.organizationId, organizationId),
          ),
        )
        .returning({ id: conversations.id });
      if (updated.length === 0) {
        throw new ConversationNotFoundError(conversationId);
      }
      return find(organizationId, conversationId);
    },

    async addMessage(organizationId, conversationId, message: NewMessage) {
      const db = getDatabase();
      const now = new Date();
      await db.transaction(async (transaction) => {
        const existing = await transaction
          .select({ id: conversations.id })
          .from(conversations)
          .where(
            and(
              eq(conversations.id, conversationId),
              eq(conversations.organizationId, organizationId),
            ),
          )
          .limit(1);
        if (existing.length === 0) {
          throw new ConversationNotFoundError(conversationId);
        }

        await transaction.insert(messages).values({
          id: `msg-${crypto.randomUUID()}`,
          organizationId,
          conversationId,
          role: message.role,
          content: message.content,
          sender: message.sender,
          externalId: message.externalId,
          createdAt: now,
        });
        await transaction
          .update(conversations)
          .set({
            lastMessage: message.content,
            updatedAt: now,
            ...(message.role === "agent" && message.sender
              ? {
                  assignee: message.sender,
                  aiManaged: false,
                  status: "open" as const,
                }
              : {}),
          })
          .where(eq(conversations.id, conversationId));
      });

      return find(organizationId, conversationId);
    },
  };
}
