import { getDatabase, closeDatabase } from "./client";
import {
  conversations as conversationTable,
  customers,
  messages,
  orders,
  organizations,
} from "./schema";
import { conversations as demoConversations } from "../lib/demo-data";

const organizationId = "org-luma";

function messageDate(time: string, offset: number) {
  const [hour = 9, minute = 0] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hour, minute, offset, 0);
  return date;
}

function conversationDate(index: number) {
  return new Date(Date.now() - index * 12 * 60 * 1000);
}

async function seed() {
  const db = getDatabase();

  await db.transaction(async (transaction) => {
    await transaction
      .insert(organizations)
      .values({ id: organizationId, name: "Luma 客服中心", slug: "luma" })
      .onConflictDoNothing();

    for (const [index, conversation] of demoConversations.entries()) {
      const customerId = `customer-${conversation.id.slice(5)}`;

      await transaction
        .insert(customers)
        .values({
          id: customerId,
          organizationId,
          name: conversation.customer.name,
          initials: conversation.customer.initials,
          phone: conversation.customer.phone,
          email: conversation.customer.email,
          city: conversation.customer.city,
          plan: conversation.customer.plan,
          customerSince: conversation.customer.since,
        })
        .onConflictDoNothing();

      await transaction
        .insert(conversationTable)
        .values({
          id: conversation.id,
          organizationId,
          customerId,
          channel: conversation.channel,
          status: conversation.status,
          priority: conversation.priority,
          unread: conversation.unread,
          lastMessage: conversation.lastMessage,
          assignee: conversation.assignee,
          tags: conversation.tags,
          aiManaged: conversation.aiManaged,
          createdAt: conversationDate(index + 2),
          updatedAt: conversationDate(index),
        })
        .onConflictDoNothing();

      if (conversation.messages.length > 0) {
        await transaction
          .insert(messages)
          .values(
            conversation.messages.map((message, messageIndex) => ({
              id: message.id,
              organizationId,
              conversationId: conversation.id,
              role: message.role,
              content: message.content,
              sender: message.sender,
              createdAt: messageDate(message.time, messageIndex),
            })),
          )
          .onConflictDoNothing();
      }

      if (conversation.order) {
        await transaction
          .insert(orders)
          .values({
            id: conversation.order.id,
            organizationId,
            customerId,
            amountCents:
              Number(conversation.order.amount.replace(/[^\d.]/g, "")) * 100,
            status: conversation.order.status,
            placedAt: new Date(
              conversation.order.placedAt.replace(" ", "T") + ":00+08:00",
            ),
          })
          .onConflictDoNothing();
      }
    }
  });

  console.log(`Seeded ${demoConversations.length} conversations.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
