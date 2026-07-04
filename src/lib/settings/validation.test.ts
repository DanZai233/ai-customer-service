import { describe, expect, it } from "vitest";

import {
  aiProviderSettingsSchema,
  workspaceSettingsSchema,
} from "./validation";

describe("settings validation", () => {
  it("accepts a Volcengine configuration without replacing an existing key", () => {
    expect(
      aiProviderSettingsSchema.safeParse({
        kind: "volcengine",
        provider: "火山引擎方舟",
        baseURL: "https://ark.cn-beijing.volces.com/api/v3",
        model: "ep-example",
        enabled: true,
      }).success,
    ).toBe(true);
  });

  it("rejects conflicting API key operations", () => {
    expect(
      aiProviderSettingsSchema.safeParse({
        kind: "volcengine",
        provider: "火山引擎方舟",
        baseURL: "https://ark.cn-beijing.volces.com/api/v3",
        model: "ep-example",
        enabled: true,
        apiKey: "new-secret-key",
        clearApiKey: true,
      }).success,
    ).toBe(false);
  });

  it("validates persistent workspace settings", () => {
    expect(
      workspaceSettingsSchema.safeParse({
        name: "Luma 客服中心",
        timezone: "Asia/Shanghai",
        language: "zh-CN",
        businessHours: "09:00 - 21:00",
        autoResolve: true,
        maskSensitive: true,
      }).success,
    ).toBe(true);
  });
});
