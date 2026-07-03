export type AiProviderKind = "volcengine" | "openai-compatible";

export type WorkspaceSettings = {
  name: string;
  timezone: string;
  language: string;
  businessHours: string;
  autoResolve: boolean;
  maskSensitive: boolean;
};

export type AiProviderConfig = {
  kind: AiProviderKind;
  provider: string;
  baseURL: string;
  apiKey: string | null;
  model: string | null;
  enabled: boolean;
  configured: boolean;
};

export type PublicAiProviderSettings = Omit<AiProviderConfig, "apiKey"> & {
  apiKeyConfigured: boolean;
  apiKeyHint: string | null;
  lastTestedAt: string | null;
  lastTestStatus: "success" | "error" | null;
  lastTestMessage: string | null;
};
