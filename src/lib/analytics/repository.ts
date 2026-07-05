import { and, eq, gte, inArray, lt, or, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { conversations, knowledgeRetrievals, messages } from "@/db/schema";
import { aggregateAnalytics } from "@/lib/analytics/aggregate";
import { getWorkspaceSettings } from "@/lib/settings/service";

const dayMs = 24 * 60 * 60 * 1000;

function startOfDay(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  const utcGuess = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
  );
  const zonedAtGuess = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  const offset = zonedAtGuess - Math.floor(date.getTime() / 1000) * 1000;
  return new Date(utcGuess - offset);
}

export async function getAnalyticsDashboard(organizationId: string) {
  const workspace = await getWorkspaceSettings(organizationId);
  const now = new Date();
  const todayStart = startOfDay(now, workspace.timezone);
  const elapsedToday = now.getTime() - todayStart.getTime();
  const previousStart = new Date(todayStart.getTime() - dayMs);
  const previousEnd = new Date(previousStart.getTime() + elapsedToday);
  const db = getDatabase();

  const [conversationRows, statusRows, retrievalRows] = await Promise.all([
    db
      .select({
        id: conversations.id,
        status: conversations.status,
        tags: conversations.tags,
        aiManaged: conversations.aiManaged,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.organizationId, organizationId),
          gte(conversations.createdAt, previousStart),
          lt(conversations.createdAt, now),
        ),
      ),
    db
      .select({
        status: conversations.status,
        count: sql<number>`count(*)::int`,
      })
      .from(conversations)
      .where(
        and(
          eq(conversations.organizationId, organizationId),
          or(
            eq(conversations.status, "open"),
            eq(conversations.status, "pending"),
          ),
        ),
      )
      .groupBy(conversations.status),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(knowledgeRetrievals)
      .where(
        and(
          eq(knowledgeRetrievals.organizationId, organizationId),
          eq(knowledgeRetrievals.source, "ai"),
          gte(knowledgeRetrievals.createdAt, todayStart),
        ),
      ),
  ]);

  const conversationIds = conversationRows.map((row) => row.id);
  const messageRows =
    conversationIds.length === 0
      ? []
      : await db
          .select({
            conversationId: messages.conversationId,
            role: messages.role,
            createdAt: messages.createdAt,
          })
          .from(messages)
          .where(
            and(
              eq(messages.organizationId, organizationId),
              inArray(messages.conversationId, conversationIds),
            ),
          );

  return aggregateAnalytics({
    now,
    timezone: workspace.timezone,
    todayStart,
    previousStart,
    previousEnd,
    conversations: conversationRows,
    messages: messageRows,
    openCount: statusRows.find((row) => row.status === "open")?.count ?? 0,
    pendingCount:
      statusRows.find((row) => row.status === "pending")?.count ?? 0,
    aiRetrievalCount: retrievalRows[0]?.count ?? 0,
  });
}
