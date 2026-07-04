import { describe, expect, it } from "vitest";

import { decryptSecret, encryptSecret } from "./crypto";

describe("configuration secret encryption", () => {
  it("round-trips a secret without storing plaintext", () => {
    const encrypted = encryptSecret("ark-secret-key", "test-master-secret");

    expect(encrypted).not.toContain("ark-secret-key");
    expect(decryptSecret(encrypted, "test-master-secret")).toBe(
      "ark-secret-key",
    );
  });

  it("rejects decryption with a different key", () => {
    const encrypted = encryptSecret("ark-secret-key", "first-key");

    expect(() => decryptSecret(encrypted, "second-key")).toThrow();
  });
});
