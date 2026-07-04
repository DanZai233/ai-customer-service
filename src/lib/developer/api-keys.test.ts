import { describe, expect, it } from "vitest";

import {
  generateApiKey,
  hashApiKey,
  readBearerToken,
} from "@/lib/developer/api-keys";

describe("API keys", () => {
  it("generates opaque keys and stable hashes", () => {
    const first = generateApiKey();
    const second = generateApiKey();
    expect(first.secret).toMatch(/^luma_live_[A-Za-z0-9_-]{43}$/);
    expect(first.secret).not.toBe(second.secret);
    expect(hashApiKey(first.secret)).toBe(first.hash);
    expect(first.hash).not.toContain(first.secret);
  });

  it("accepts only a single Bearer token", () => {
    expect(
      readBearerToken(
        new Request("https://example.com", {
          headers: { Authorization: "Bearer luma_live_test" },
        }),
      ),
    ).toBe("luma_live_test");
    expect(
      readBearerToken(
        new Request("https://example.com", {
          headers: { Authorization: "Basic luma_live_test" },
        }),
      ),
    ).toBeNull();
  });
});
