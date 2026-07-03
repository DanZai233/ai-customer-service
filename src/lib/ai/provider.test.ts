import { describe, expect, it } from "vitest";

import { normalizeAiProviderConfig } from "@/lib/settings/service";

describe("normalizeAiProviderConfig", () => {
  it("uses the Volcengine Ark preset and official base URL", () => {
    const config = normalizeAiProviderConfig({
      kind: "volcengine",
      apiKey: "test-key",
      model: "ep-test-endpoint",
    });

    expect(config).toMatchObject({
      kind: "volcengine",
      provider: "火山引擎方舟",
      baseURL: "https://ark.cn-beijing.volces.com/api/v3",
      model: "ep-test-endpoint",
      configured: true,
    });
  });

  it("uses a saved custom Ark base URL", () => {
    const config = normalizeAiProviderConfig({
      kind: "volcengine",
      apiKey: "test-key",
      model: "doubao-test-model",
      baseUrl: "https://ark.example.com/api/v3",
    });

    expect(config.kind).toBe("volcengine");
    expect(config.baseURL).toBe("https://ark.example.com/api/v3");
  });

  it("keeps generic OpenAI-compatible providers working", () => {
    const config = normalizeAiProviderConfig({
      kind: "openai-compatible",
      providerName: "Example Provider",
      baseUrl: "https://example.com/v1",
      apiKey: "test-key",
      model: "example-model",
    });

    expect(config).toMatchObject({
      kind: "openai-compatible",
      provider: "Example Provider",
      configured: true,
    });
  });
});
