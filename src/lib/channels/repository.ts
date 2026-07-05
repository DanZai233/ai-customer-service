import { eq, sql } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { conversations } from "@/db/schema";
import { listApiKeys } from "@/lib/developer/api-keys";
import type { ChannelDashboard, ChannelId } from "@/lib/channels/types";

const channelNames: Record<ChannelId, string> = {
  web: "Web / 开放 API",
  wechat: "微信",
  email: "邮件",
};

export async function getChannelDashboard(
  organizationId: string,
): Promise<ChannelDashboard> {
  const [conversationRows, keys] = await Promise.all([
    getDatabase()
      .select({
        channel: conversations.channel,
        conversationCount: sql<number>`count(*)::int`,
        unresolvedCount: sql<number>`count(*) filter (where ${conversations.status} <> 'resolved')::int`,
      })
      .from(conversations)
      .where(eq(conversations.organizationId, organizationId))
      .groupBy(conversations.channel),
    listApiKeys(organizationId),
  ]);
  const stats = new Map(conversationRows.map((row) => [row.channel, row]));
  const activeWriteKeys = keys.filter(
    (key) =>
      key.status === "active" && key.scopes.includes("conversations:write"),
  );
  const lastUsedAt = activeWriteKeys
    .map((key) => key.lastUsedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  return {
    channels: (["web", "wechat", "email"] as const).map((id) => ({
      id,
      name: channelNames[id],
      nativeConnectorAvailable: id === "web" && activeWriteKeys.length > 0,
      conversationCount: stats.get(id)?.conversationCount ?? 0,
      unresolvedCount: stats.get(id)?.unresolvedCount ?? 0,
    })),
    api: {
      activeWriteKeys: activeWriteKeys.length,
      lastUsedAt: lastUsedAt ?? null,
    },
  };
}
