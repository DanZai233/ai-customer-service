import { describe, expect, it } from "vitest";

import { resolveAiProviderConfig } from "@/lib/ai/provider";

describe("resolveAiProviderConfig", () => {
  it("uses the Volcengine Ark preset and official base URL", () => {
    const config = resolveAiProviderConfig({
      AI_PROVIDER: "volcengine",
      ARK_API_KEY: "test-key",
      ARK_MODEL: "ep-test-endpoint",
    });

    expect(config).toMatchObject({
      kind: "volcengine",
      provider: "火山引擎方舟",
      baseURL: "https://ark.cn-beijing.volces.com/api/v3",
      model: "ep-test-endpoint",
      configured: true,
    });
  });

  it("detects Ark variables without requiring an explicit provider", () => {
    const config = resolveAiProviderConfig({
      ARK_API_KEY: "test-key",
      ARK_MODEL: "doubao-test-model",
      ARK_BASE_URL: "https://ark.example.com/api/v3",
    });

    expect(config.kind).toBe("volcengine");
    expect(config.baseURL).toBe("https://ark.example.com/api/v3");
  });

  it("keeps generic OpenAI-compatible providers working", () => {
    const config = resolveAiProviderConfig({
      AI_PROVIDER_NAME: "Example Provider",
      AI_BASE_URL: "https://example.com/v1",
      AI_API_KEY: "test-key",
      AI_MODEL: "example-model",
    });

    expect(config).toMatchObject({
      kind: "openai-compatible",
      provider: "Example Provider",
      configured: true,
    });
  });
});
