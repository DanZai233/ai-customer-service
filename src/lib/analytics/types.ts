export type AnalyticsMetric = {
  id: "conversations" | "aiRate" | "firstResponse" | "backlog";
  label: string;
  value: string;
  detail: string;
  trend: "positive" | "negative" | "neutral";
};

export type AnalyticsDashboard = {
  generatedAt: string;
  timezone: string;
  metrics: AnalyticsMetric[];
  volume: Array<{ label: string; value: number }>;
  aiSignals: Array<{ label: string; count: number; percent: number }>;
  queues: Array<{
    name: string;
    volume: number;
    aiRate: number;
    response: string;
    resolutionRate: number;
  }>;
};

export type AnalyticsConversationRow = {
  id: string;
  status: "open" | "pending" | "resolved";
  tags: string[];
  aiManaged: boolean;
  createdAt: Date;
};

export type AnalyticsMessageRow = {
  conversationId: string;
  role: "customer" | "assistant" | "agent" | "system";
  createdAt: Date;
};
