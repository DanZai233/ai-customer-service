import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

let provider: ReturnType<typeof createOpenAICompatible> | null = null;

export function getAiModel() {
  const baseURL = process.env.AI_BASE_URL;
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;

  if (!baseURL || !apiKey || !model) return null;

  if (!provider) {
    provider = createOpenAICompatible({
      name: "customer-service-provider",
      baseURL,
      apiKey,
      includeUsage: true,
    });
  }

  return provider(model);
}
