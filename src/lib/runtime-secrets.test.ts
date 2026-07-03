import { describe, expect, it } from "vitest";

import {
  getOptionalRuntimeSecret,
  getRequiredRuntimeSecret,
} from "./runtime-secrets";

describe("runtime secrets", () => {
  it("prefers a direct secret value", () => {
    expect(getOptionalRuntimeSecret(" direct ", "/missing")).toBe("direct");
  });

  it("returns null for an unavailable optional secret", () => {
    expect(getOptionalRuntimeSecret(undefined, "/missing")).toBeNull();
  });

  it("requires deployment root secrets", () => {
    expect(() =>
      getRequiredRuntimeSecret(undefined, undefined, "Root secret"),
    ).toThrow("Root secret is not configured");
  });
});
