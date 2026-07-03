import { describe, expect, it } from "vitest";

import {
  createKnowledgeDocumentSchema,
  searchKnowledgeSchema,
  updateKnowledgeDocumentSchema,
} from "./validation";

describe("knowledge validation", () => {
  it("accepts a complete knowledge draft", () => {
    expect(
      createKnowledgeDocumentSchema.safeParse({
        title: "换货申请处理规则",
        category: "售后政策",
        content: "商品签收后七日内符合条件时可以申请换货，并由人工确认库存。",
      }).success,
    ).toBe(true);
  });

  it("rejects an empty update", () => {
    expect(updateKnowledgeDocumentSchema.safeParse({}).success).toBe(false);
  });

  it("limits retrieval result count", () => {
    expect(
      searchKnowledgeSchema.safeParse({ query: "物流异常", limit: 20 }).success,
    ).toBe(false);
  });
});
