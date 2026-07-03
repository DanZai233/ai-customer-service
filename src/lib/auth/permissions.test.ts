import { describe, expect, it } from "vitest";

import { can, normalizeRole } from "@/lib/auth/permissions";

describe("role permissions", () => {
  it("allows owners to manage every protected module", () => {
    expect(can("owner", "channels.manage")).toBe(true);
    expect(can("owner", "settings.manage")).toBe(true);
  });

  it("keeps agents out of administration and analytics", () => {
    expect(can("agent", "conversation.respond")).toBe(true);
    expect(can("agent", "team.manage")).toBe(false);
    expect(can("agent", "analytics.read")).toBe(false);
  });

  it("falls back unknown database roles to agent", () => {
    expect(normalizeRole("unknown")).toBe("agent");
  });
});
