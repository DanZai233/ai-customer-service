import { describe, expect, it } from "vitest";

import { createDemoConversationRepository } from "@/lib/conversations/demo-repository";
import { conversations } from "@/lib/demo-data";

describe("demo conversation repository", () => {
  it("persists conversation updates for subsequent reads", async () => {
    const repository = createDemoConversationRepository(conversations);
    const updated = await repository.update("org-luma", conversations[0].id, {
      status: "resolved",
      unread: 0,
    });

    expect(updated.status).toBe("resolved");
    expect((await repository.list("org-luma"))[0].status).toBe("resolved");
  });

  it("appends messages and updates the conversation summary", async () => {
    const repository = createDemoConversationRepository(conversations);
    const updated = await repository.addMessage(
      "org-luma",
      conversations[0].id,
      { role: "agent", sender: "周宁", content: "已为你继续跟进。" },
    );

    expect(updated.lastMessage).toBe("已为你继续跟进。");
    expect(updated.messages.at(-1)?.sender).toBe("周宁");
  });
});
