import { describe, expect, it } from "vitest";

import { seedKnowledgeDocuments } from "./seed-data";
import { formatKnowledgeContext, rankKnowledgeDocuments } from "./search";
import type { KnowledgeDocument } from "./types";

const documents: KnowledgeDocument[] = seedKnowledgeDocuments.map(
  (document) => ({
    ...document,
    sourceUrl: null,
    publishedAt:
      document.status === "published" ? "2026-07-01T00:00:00.000Z" : null,
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
  }),
);

describe("knowledge search", () => {
  it("ranks logistics policy first for a stalled shipment question", () => {
    const [match] = rankKnowledgeDocuments("物流三天没有更新怎么办", documents);

    expect(match.document.id).toBe("kb-001");
    expect(match.score).toBeGreaterThan(0.4);
  });

  it("excludes draft documents from retrieval", () => {
    const matches = rankKnowledgeDocuments("周末人工客服时间", documents);
    const context = formatKnowledgeContext(matches.slice(0, 3));

    expect(context).not.toContain("周末及法定节假日服务时间");
  });

  it("returns no context for an empty query", () => {
    expect(rankKnowledgeDocuments("   ", documents)).toEqual([]);
  });
});
