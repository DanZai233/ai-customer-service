import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

const defaultArkBaseURL = "https://ark.cn-beijing.volces.com/api/v3";

type AiProviderConfig = {
  kind: "volcengine" | "openai-compatible";
  provider: string;
  baseURL: string | null;
  apiKey: string | null;
  model: string | null;
  configured: boolean;
};

let providerCache: {
  key: string;
  provider: ReturnType<typeof createOpenAICompatible>;
} | null = null;

export function resolveAiProviderConfig(
  environment: Record<string, string | undefined> = process.env,
): AiProviderConfig {
  const providerId = environment.AI_PROVIDER?.trim().toLowerCase();
  const useVolcengine =
    providerId === "volcengine" ||
    Boolean(environment.ARK_API_KEY?.trim() || environment.ARK_MODEL?.trim());

  if (useVolcengine) {
    const baseURL = environment.ARK_BASE_URL?.trim() || defaultArkBaseURL;
    const apiKey = environment.ARK_API_KEY?.trim() || null;
    const model = environment.ARK_MODEL?.trim() || null;
    return {
      kind: "volcengine",
      provider: "火山引擎方舟",
      baseURL,
      apiKey,
      model,
      configured: Boolean(baseURL && apiKey && model),
    };
  }

  const baseURL = environment.AI_BASE_URL?.trim() || null;
  const apiKey = environment.AI_API_KEY?.trim() || null;
  const model = environment.AI_MODEL?.trim() || null;
  return {
    kind: "openai-compatible",
    provider: environment.AI_PROVIDER_NAME?.trim() || "OpenAI Compatible",
    baseURL,
    apiKey,
    model,
    configured: Boolean(baseURL && apiKey && model),
  };
}

export function getAiProviderStatus() {
  const config = resolveAiProviderConfig();

  return {
    kind: config.kind,
    configured: config.configured,
    mode: config.configured ? ("provider" as const) : ("demo" as const),
    provider: config.provider,
    baseURL: config.baseURL,
    model: config.model,
  };
}

export function getAiModel() {
  const config = resolveAiProviderConfig();

  if (!config.baseURL || !config.apiKey || !config.model) return null;

  const cacheKey = [
    config.kind,
    config.provider,
    config.baseURL,
    config.apiKey,
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
