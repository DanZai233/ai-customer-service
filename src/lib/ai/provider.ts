import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import { createHash } from "node:crypto";

import { getAiProviderConfig } from "@/lib/settings/service";
import type { AiProviderConfig } from "@/lib/settings/types";

let providerCache: {
  key: string;
  provider: ReturnType<typeof createOpenAICompatible>;
} | null = null;

export async function getAiProviderStatus(organizationId: string) {
  const config = await getAiProviderConfig(organizationId);

  return {
    kind: config.kind,
    configured: config.configured,
    mode: config.configured ? ("provider" as const) : ("unconfigured" as const),
    provider: config.provider,
    baseURL: config.baseURL,
    model: config.model,
  };
}

function createAiModel(config: AiProviderConfig) {
  if (!config.configured || !config.apiKey || !config.model) return null;

  const cacheKey = [
    config.kind,
    config.provider,
    config.baseURL,
    createHash("sha256").update(config.apiKey).digest("hex"),
  ].join(":");
  const provider =
    providerCache?.key === cacheKey
      ? providerCache.provider
      : createOpenAICompatible({
          name: config.kind,
          baseURL: config.baseURL,
          apiKey: config.apiKey,
          includeUsage: true,
        });

  if (providerCache?.key !== cacheKey) {
    providerCache = {
      key: cacheKey,
      provider,
    };
  }

  return provider(config.model);
}

export async function getAiModel(organizationId: string) {
  return createAiModel(await getAiProviderConfig(organizationId));
}

export async function testAiProviderConnection(organizationId: string) {
  const config = await getAiProviderConfig(organizationId);
  const model = createAiModel(config);
  if (!model) {
    throw new Error("请先填写 Base URL、Model ID 和 API Key 并启用模型");
  }

  const result = await generateText({
    model,
    prompt: "这是一次客服系统连通性测试。请只回复 OK。",
    maxOutputTokens: 8,
  });

  return {
    provider: config.provider,
    model: config.model,
    response: result.text.trim().slice(0, 80),
  };
}
