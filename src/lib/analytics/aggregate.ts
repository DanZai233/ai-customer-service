import type {
  AnalyticsConversationRow,
  AnalyticsDashboard,
  AnalyticsMessageRow,
  AnalyticsMetric,
} from "@/lib/analytics/types";

const twoHours = 2 * 60 * 60 * 1000;

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

export function formatDuration(seconds: number | null) {
  if (seconds === null) return "--";
  if (seconds < 60) return `${seconds} 秒`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟`;
  return `${Math.round((minutes / 60) * 10) / 10} 小时`;
}

function firstResponseSeconds(
  conversationId: string,
  messagesByConversation: Map<string, AnalyticsMessageRow[]>,
) {
  const rows = messagesByConversation.get(conversationId) ?? [];
  const firstCustomer = rows.find((message) => message.role === "customer");
  if (!firstCustomer) return null;
  const firstResponse = rows.find(
    (message) =>
      (message.role === "agent" || message.role === "assistant") &&
      message.createdAt > firstCustomer.createdAt,
  );
  return firstResponse
    ? Math.max(
        0,
        Math.round(
          (firstResponse.createdAt.getTime() -
            firstCustomer.createdAt.getTime()) /
            1000,
        ),
      )
    : null;
}

function rate(count: number, total: number) {
  return total === 0 ? 0 : Math.round((count / total) * 100);
}

function volumeDetail(current: number, previous: number) {
  if (previous === 0) {
    return current === 0 ? "较昨日无变化" : `较昨日新增 ${current}`;
  }
  const change = Math.round(((current - previous) / previous) * 1000) / 10;
  return `较昨日 ${change >= 0 ? "+" : ""}${change}%`;
}

function responseDetail(current: number | null, previous: number | null) {
  if (current === null) return "暂无已响应会话";
  if (previous === null) return "昨日同期无响应样本";
  const difference = current - previous;
  if (difference === 0) return "与昨日同期一致";
  return `较昨日${difference < 0 ? "快" : "慢"} ${formatDuration(Math.abs(difference))}`;
}

export function aggregateAnalytics(input: {
  now: Date;
  timezone: string;
  todayStart: Date;
  previousStart: Date;
  previousEnd: Date;
  conversations: AnalyticsConversationRow[];
  messages: AnalyticsMessageRow[];
  openCount: number;
  pendingCount: number;
  aiRetrievalCount: number;
}): AnalyticsDashboard {
  const today = input.conversations.filter(
    (conversation) => conversation.createdAt >= input.todayStart,
  );
  const previous = input.conversations.filter(
    (conversation) =>
      conversation.createdAt >= input.previousStart &&
      conversation.createdAt < input.previousEnd,
  );
  const messagesByConversation = Map.groupBy(
    [...input.messages].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    ),
    (message) => message.conversationId,
  );

  const todayAiRate = rate(
    today.filter((conversation) => conversation.aiManaged).length,
    today.length,
  );
  const previousAiRate = rate(
    previous.filter((conversation) => conversation.aiManaged).length,
    previous.length,
  );
  const todayResponse = median(
    today.flatMap((conversation) => {
      const value = firstResponseSeconds(
        conversation.id,
        messagesByConversation,
      );
      return value === null ? [] : [value];
    }),
  );
  const previousResponse = median(
    previous.flatMap((conversation) => {
      const value = firstResponseSeconds(
        conversation.id,
        messagesByConversation,
      );
      return value === null ? [] : [value];
    }),
  );

  const metrics: AnalyticsMetric[] = [
    {
      id: "conversations",
      label: "今日会话",
      value: String(today.length),
      detail: volumeDetail(today.length, previous.length),
      trend:
        today.length > previous.length
          ? "positive"
          : today.length < previous.length
            ? "negative"
            : "neutral",
    },
    {
      id: "aiRate",
      label: "AI 托管率",
      value: `${todayAiRate}%`,
      detail: `较昨日 ${todayAiRate - previousAiRate >= 0 ? "+" : ""}${todayAiRate - previousAiRate} 个百分点`,
      trend:
        todayAiRate > previousAiRate
          ? "positive"
          : todayAiRate < previousAiRate
            ? "negative"
            : "neutral",
    },
    {
      id: "firstResponse",
      label: "首次响应中位数",
      value: formatDuration(todayResponse),
      detail: responseDetail(todayResponse, previousResponse),
      trend:
        todayResponse === null || previousResponse === null
          ? "neutral"
          : todayResponse < previousResponse
            ? "positive"
            : todayResponse > previousResponse
              ? "negative"
              : "neutral",
    },
    {
      id: "backlog",
      label: "待处理会话",
      value: String(input.openCount + input.pendingCount),
      detail: `${input.openCount} 开放 · ${input.pendingCount} 待跟进`,
      trend: "neutral",
    },
  ];

  const volume = Array.from({ length: 12 }, (_, index) => {
    const start = input.todayStart.getTime() + index * twoHours;
    const end = start + twoHours;
    return {
      label: `${String(index * 2).padStart(2, "0")}:00`,
      value: today.filter((conversation) => {
        const time = conversation.createdAt.getTime();
        return time >= start && time < end;
      }).length,
    };
  });

  const assistantMessages = input.messages.filter(
    (message) =>
      message.role === "assistant" && message.createdAt >= input.todayStart,
  ).length;
  const aiManaged = today.filter(
    (conversation) => conversation.aiManaged,
  ).length;
  const aiResolved = today.filter(
    (conversation) =>
      conversation.aiManaged && conversation.status === "resolved",
  ).length;
  const signalCounts = [
    ["AI 托管会话", aiManaged],
    ["知识检索记录", input.aiRetrievalCount],
    ["AI 回复消息", assistantMessages],
    ["AI 已解决会话", aiResolved],
  ] as const;
  const maxSignal = Math.max(1, ...signalCounts.map(([, count]) => count));

  const queueMap = new Map<string, AnalyticsConversationRow[]>();
  for (const conversation of today) {
    const tags = conversation.tags.length > 0 ? conversation.tags : ["未分类"];
    for (const tag of tags) {
      queueMap.set(tag, [...(queueMap.get(tag) ?? []), conversation]);
    }
  }

  const queues = [...queueMap.entries()]
    .map(([name, rows]) => ({
      name,
      volume: rows.length,
      aiRate: rate(
        rows.filter((conversation) => conversation.aiManaged).length,
        rows.length,
      ),
      response: formatDuration(
        median(
          rows.flatMap((conversation) => {
            const value = firstResponseSeconds(
              conversation.id,
              messagesByConversation,
            );
            return value === null ? [] : [value];
          }),
        ),
      ),
      resolutionRate: rate(
        rows.filter((conversation) => conversation.status === "resolved")
          .length,
        rows.length,
      ),
    }))
    .sort(
      (a, b) => b.volume - a.volume || a.name.localeCompare(b.name, "zh-CN"),
    )
    .slice(0, 8);

  return {
    generatedAt: input.now.toISOString(),
    timezone: input.timezone,
    metrics,
    volume,
    aiSignals: signalCounts.map(([label, count]) => ({
      label,
      count,
      percent: Math.round((count / maxSignal) * 100),
    })),
    queues,
  };
}
