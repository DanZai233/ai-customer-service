import { describe, expect, it } from "vitest";

import { buildKnowledgeContext, searchKnowledge } from "./knowledge-data";

describe("searchKnowledge", () => {
  it("ranks a logistics article for a stalled shipment question", () => {
    const [match] = searchKnowledge("物流三天没有更新怎么办");

    expect(match.article.id).toBe("kb-001");
    expect(match.score).toBeGreaterThan(0.4);
  });

  it("excludes draft articles from retrieval context", () => {
    const context = buildKnowledgeContext("周末人工客服时间");

    expect(context).not.toContain("周末及法定节假日服务时间");
  });
});
