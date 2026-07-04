import { eq } from "drizzle-orm";

import { getDatabase, closeDatabase } from "./client";
import { user as authUser } from "./auth-schema";
import {
  aiProviderSettings,
  conversations as conversationTable,
  customers,
  knowledgeDocuments,
  messages,
  orders,
  organizations,
  organizationSettings,
} from "./schema";
import { conversations as demoConversations } from "../lib/demo-data";
import { getAuth } from "../lib/auth/server";
import { seedKnowledgeDocuments } from "../lib/knowledge/seed-data";
import { getOptionalRuntimeSecret } from "../lib/runtime-secrets";
import { updateAiProviderSettings } from "../lib/settings/service";

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

    await transaction
      .insert(organizationSettings)
      .values({ organizationId })
      .onConflictDoNothing();

    await transaction
      .insert(knowledgeDocuments)
      .values(
        seedKnowledgeDocuments.map((document) => ({
          ...document,
          organizationId,
          createdBy: "seed",
          updatedBy: "seed",
          publishedAt: document.status === "published" ? new Date() : undefined,
        })),
      )
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

  const existingAiSettings = await db
    .select({ organizationId: aiProviderSettings.organizationId })
    .from(aiProviderSettings)
    .where(eq(aiProviderSettings.organizationId, organizationId))
    .limit(1);
  const legacyArkApiKey = process.env.ARK_API_KEY?.trim();
  const legacyArkModel = process.env.ARK_MODEL?.trim();
  const legacyGenericApiKey = process.env.AI_API_KEY?.trim();
  const legacyGenericModel = process.env.AI_MODEL?.trim();

  if (existingAiSettings.length === 0 && legacyArkApiKey && legacyArkModel) {
    await updateAiProviderSettings(organizationId, "seed", {
      kind: "volcengine",
      provider: "火山引擎方舟",
      baseURL:
        process.env.ARK_BASE_URL?.trim() ||
        "https://ark.cn-beijing.volces.com/api/v3",
      model: legacyArkModel,
      enabled: true,
      apiKey: legacyArkApiKey,
    });
    console.log("Imported legacy Volcengine AI configuration into PostgreSQL.");
  } else if (
    existingAiSettings.length === 0 &&
    legacyGenericApiKey &&
    legacyGenericModel &&
    process.env.AI_BASE_URL?.trim()
  ) {
    await updateAiProviderSettings(organizationId, "seed", {
      kind: "openai-compatible",
      provider: process.env.AI_PROVIDER_NAME?.trim() || "OpenAI Compatible",
      baseURL: process.env.AI_BASE_URL.trim(),
      model: legacyGenericModel,
      enabled: true,
      apiKey: legacyGenericApiKey,
    });
    console.log(
      "Imported legacy OpenAI-compatible configuration into PostgreSQL.",
    );
  }

  const adminEmail = process.env.AUTH_SEED_EMAIL?.trim();
  const adminPassword = getOptionalRuntimeSecret(
    process.env.AUTH_SEED_PASSWORD,
    process.env.AUTH_SEED_PASSWORD_FILE,
  );
  if (adminEmail && adminPassword) {
    const existingAdmin = await db
      .select({ id: authUser.id })
      .from(authUser)
      .where(eq(authUser.email, adminEmail))
      .limit(1);

    if (existingAdmin.length === 0) {
      process.env.AUTH_ALLOW_SIGN_UP = "true";
      const created = await getAuth().api.signUpEmail({
        body: {
          name: "系统管理员",
          email: adminEmail,
          password: adminPassword,
        },
      });
      await db
        .update(authUser)
        .set({ role: "owner", organizationId })
        .where(eq(authUser.id, created.user.id));
      console.log(`Seeded owner account ${adminEmail}.`);
    }
  }

  console.log(`Seeded ${demoConversations.length} conversations.`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
