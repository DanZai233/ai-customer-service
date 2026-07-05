import { describe, expect, it } from "vitest";

import { aggregateAnalytics } from "@/lib/analytics/aggregate";

const todayStart = new Date("2026-07-05T00:00:00.000Z");

describe("analytics aggregation", () => {
  it("derives metrics from conversation and message rows", () => {
    const result = aggregateAnalytics({
      now: new Date("2026-07-05T12:00:00.000Z"),
      timezone: "UTC",
      todayStart,
      previousStart: new Date("2026-07-04T00:00:00.000Z"),
      previousEnd: new Date("2026-07-04T12:00:00.000Z"),
      openCount: 1,
      pendingCount: 1,
      aiRetrievalCount: 2,
      conversations: [
        {
          id: "today-ai",
          status: "resolved",
          tags: ["订单"],
          aiManaged: true,
          createdAt: new Date("2026-07-05T02:10:00.000Z"),
        },
        {
          id: "today-open",
          status: "open",
          tags: ["订单"],
          aiManaged: false,
          createdAt: new Date("2026-07-05T03:10:00.000Z"),
        },
        {
          id: "previous",
          status: "resolved",
          tags: [],
          aiManaged: false,
          createdAt: new Date("2026-07-04T01:00:00.000Z"),
        },
      ],
      messages: [
        {
          conversationId: "today-ai",
          role: "customer",
          createdAt: new Date("2026-07-05T02:10:00.000Z"),
        },
        {
          conversationId: "today-ai",
          role: "assistant",
          createdAt: new Date("2026-07-05T02:10:20.000Z"),
        },
      ],
    });

    expect(result.metrics.map((metric) => metric.value)).toEqual([
      "2",
      "50%",
      "20 秒",
      "2",
    ]);
    expect(result.volume[1].value).toBe(2);
    expect(result.queues[0]).toMatchObject({
      name: "订单",
      volume: 2,
      aiRate: 50,
      resolutionRate: 50,
    });
    expect(result.aiSignals.map((signal) => signal.count)).toEqual([
      1, 2, 1, 1,
    ]);
  });
});
