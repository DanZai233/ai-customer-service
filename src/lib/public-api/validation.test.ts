import { describe, expect, it } from "vitest";

import { createPublicConversationSchema } from "@/lib/public-api/validation";

describe("public API validation", () => {
  it("requires a stable customer identity", () => {
    const result = createPublicConversationSchema.safeParse({
      customer: { name: "访客" },
      message: { content: "你好" },
    });
    expect(result.success).toBe(false);
  });

  it("normalizes defaults for a valid request", () => {
    const result = createPublicConversationSchema.parse({
      customer: { externalId: "customer-1", name: "张女士" },
      message: { content: "查询订单" },
    });
    expect(result.channel).toBe("web");
    expect(result.tags).toEqual([]);
  });
});
