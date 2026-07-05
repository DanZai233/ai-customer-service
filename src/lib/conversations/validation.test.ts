import { describe, expect, it } from "vitest";

import {
  agentReplySchema,
  conversationPatchSchema,
  newMessageSchema,
} from "@/lib/conversations/validation";

describe("conversation validation", () => {
  it("accepts supported conversation updates", () => {
    expect(
      conversationPatchSchema.parse({ aiManaged: true, assignee: "Luma AI" }),
    ).toEqual({ aiManaged: true, assignee: "Luma AI" });
  });

  it("rejects empty patches and blank messages", () => {
    expect(conversationPatchSchema.safeParse({}).success).toBe(false);
    expect(
      newMessageSchema.safeParse({ role: "agent", content: "   " }).success,
    ).toBe(false);
    expect(agentReplySchema.safeParse({ content: "   " }).success).toBe(false);
  });

  it("does not accept a client supplied reply identity", () => {
    expect(agentReplySchema.parse({ content: "已为你处理" })).toEqual({
      content: "已为你处理",
    });
    expect(
      agentReplySchema.safeParse({ content: "已为你处理", sender: "伪造坐席" })
        .success,
    ).toBe(false);
  });
});
