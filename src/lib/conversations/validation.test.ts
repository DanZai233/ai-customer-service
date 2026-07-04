import { describe, expect, it } from "vitest";

import {
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
  });
});
