import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

let provider: ReturnType<typeof createOpenAICompatible> | null = null;

export function getAiProviderStatus() {
  const baseURL = process.env.AI_BASE_URL?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();
  const configured = Boolean(baseURL && apiKey && model);

  return {
    configured,
    mode: configured ? ("provider" as const) : ("demo" as const),
    provider: process.env.AI_PROVIDER_NAME?.trim() || "OpenAI Compatible",
    baseURL: baseURL || null,
    model: model || null,
  };
}

export function getAiModel() {
  const baseURL = process.env.AI_BASE_URL?.trim();
  const apiKey = process.env.AI_API_KEY?.trim();
  const model = process.env.AI_MODEL?.trim();

  if (!baseURL || !apiKey || !model) return null;

  if (!provider) {
    provider = createOpenAICompatible({
      name: process.env.AI_PROVIDER_NAME?.trim() || "customer-service-provider",
      baseURL,
      apiKey,
      includeUsage: true,
    });
  }

  return provider(model);
}
