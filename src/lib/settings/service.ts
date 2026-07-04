import { eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import {
  aiProviderSettings,
  organizations,
  organizationSettings,
} from "@/db/schema";
import { decryptSecret, encryptSecret } from "@/lib/settings/crypto";
import type {
  AiProviderConfig,
  AiProviderKind,
  PublicAiProviderSettings,
  WorkspaceSettings,
} from "@/lib/settings/types";

export const defaultArkBaseURL = "https://ark.cn-beijing.volces.com/api/v3";

const defaultWorkspaceSettings: Omit<WorkspaceSettings, "name"> = {
  timezone: "Asia/Shanghai",
  language: "zh-CN",
  businessHours: "09:00 - 21:00",
  autoResolve: true,
  maskSensitive: true,
};

export function normalizeAiProviderConfig(input?: {
  kind?: AiProviderKind | null;
  providerName?: string | null;
  baseUrl?: string | null;
  model?: string | null;
  apiKey?: string | null;
  enabled?: boolean | null;
}): AiProviderConfig {
  const kind = input?.kind ?? "volcengine";
  const provider =
    input?.providerName?.trim() ||
    (kind === "volcengine" ? "火山引擎方舟" : "OpenAI Compatible");
  const baseURL =
    input?.baseUrl?.trim() || (kind === "volcengine" ? defaultArkBaseURL : "");
  const apiKey = input?.apiKey?.trim() || null;
  const model = input?.model?.trim() || null;
  const enabled = input?.enabled ?? true;

  return {
    kind,
    provider,
    baseURL,
    apiKey,
    model,
    enabled,
    configured: Boolean(enabled && baseURL && apiKey && model),
  };
}

export async function getWorkspaceSettings(
  organizationId: string,
): Promise<WorkspaceSettings> {
  const db = getDatabase();
  const [organization, settings] = await Promise.all([
    db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      columns: { name: true },
    }),
    db.query.organizationSettings.findFirst({
      where: eq(organizationSettings.organizationId, organizationId),
    }),
  ]);

  return {
    name: organization?.name ?? "Luma 客服中心",
    timezone: settings?.timezone ?? defaultWorkspaceSettings.timezone,
    language: settings?.language ?? defaultWorkspaceSettings.language,
    businessHours:
      settings?.businessHours ?? defaultWorkspaceSettings.businessHours,
    autoResolve: settings?.autoResolve ?? defaultWorkspaceSettings.autoResolve,
    maskSensitive:
      settings?.maskSensitive ?? defaultWorkspaceSettings.maskSensitive,
  };
}

export async function updateWorkspaceSettings(
  organizationId: string,
  userId: string,
  input: WorkspaceSettings,
) {
  const db = getDatabase();
  const now = new Date();

  await db.transaction(async (transaction) => {
    await transaction
      .update(organizations)
      .set({ name: input.name })
      .where(eq(organizations.id, organizationId));

    await transaction
      .insert(organizationSettings)
      .values({
        organizationId,
        timezone: input.timezone,
        language: input.language,
        businessHours: input.businessHours,
        autoResolve: input.autoResolve,
        maskSensitive: input.maskSensitive,
        updatedBy: userId,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: organizationSettings.organizationId,
        set: {
          timezone: input.timezone,
          language: input.language,
          businessHours: input.businessHours,
          autoResolve: input.autoResolve,
          maskSensitive: input.maskSensitive,
          updatedBy: userId,
          updatedAt: now,
        },
      });
  });

  return getWorkspaceSettings(organizationId);
}

export async function getAiProviderConfig(
  organizationId: string,
): Promise<AiProviderConfig> {
  const settings = await getDatabase().query.aiProviderSettings.findFirst({
    where: eq(aiProviderSettings.organizationId, organizationId),
  });

  return normalizeAiProviderConfig(
    settings
      ? {
          ...settings,
          apiKey: settings.apiKeyEncrypted
            ? decryptSecret(settings.apiKeyEncrypted)
            : null,
        }
      : undefined,
  );
}

export async function getPublicAiProviderSettings(
  organizationId: string,
): Promise<PublicAiProviderSettings> {
  const settings = await getDatabase().query.aiProviderSettings.findFirst({
    where: eq(aiProviderSettings.organizationId, organizationId),
  });
  const config = normalizeAiProviderConfig(
    settings
      ? {
          ...settings,
          apiKey: settings.apiKeyEncrypted ? "configured" : null,
        }
      : undefined,
  );

  return {
    kind: config.kind,
    provider: config.provider,
    baseURL: config.baseURL,
    model: config.model,
    enabled: config.enabled,
    configured: config.configured,
    apiKeyConfigured: Boolean(settings?.apiKeyEncrypted),
    apiKeyHint: settings?.apiKeyHint ?? null,
    lastTestedAt: settings?.lastTestedAt?.toISOString() ?? null,
    lastTestStatus:
      settings?.lastTestStatus === "success" ||
      settings?.lastTestStatus === "error"
        ? settings.lastTestStatus
        : null,
    lastTestMessage: settings?.lastTestMessage ?? null,
  };
}

export async function updateAiProviderSettings(
  organizationId: string,
  userId: string,
  input: {
    kind: AiProviderKind;
    provider: string;
    baseURL: string;
    model: string;
    enabled: boolean;
    apiKey?: string;
    clearApiKey?: boolean;
  },
) {
  const db = getDatabase();
  const current = await db.query.aiProviderSettings.findFirst({
    where: eq(aiProviderSettings.organizationId, organizationId),
  });
  const nextApiKeyEncrypted = input.clearApiKey
    ? null
    : input.apiKey
      ? encryptSecret(input.apiKey)
      : (current?.apiKeyEncrypted ?? null);
  const nextApiKeyHint = input.clearApiKey
    ? null
    : input.apiKey
      ? input.apiKey.slice(-4)
      : (current?.apiKeyHint ?? null);
  const now = new Date();

  await db
    .insert(aiProviderSettings)
    .values({
      organizationId,
      kind: input.kind,
      providerName: input.provider,
      baseUrl: input.baseURL,
      model: input.model || null,
      apiKeyEncrypted: nextApiKeyEncrypted,
      apiKeyHint: nextApiKeyHint,
      enabled: input.enabled,
      lastTestedAt: null,
      lastTestStatus: null,
      lastTestMessage: null,
      updatedBy: userId,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: aiProviderSettings.organizationId,
      set: {
        kind: input.kind,
        providerName: input.provider,
        baseUrl: input.baseURL,
        model: input.model || null,
        apiKeyEncrypted: nextApiKeyEncrypted,
        apiKeyHint: nextApiKeyHint,
        enabled: input.enabled,
        lastTestedAt: null,
        lastTestStatus: null,
        lastTestMessage: null,
        updatedBy: userId,
        updatedAt: now,
      },
    });

  return getPublicAiProviderSettings(organizationId);
}

export async function recordAiConnectionTest(
  organizationId: string,
  result: { status: "success" | "error"; message: string },
) {
  await getDatabase()
    .update(aiProviderSettings)
    .set({
      lastTestedAt: new Date(),
      lastTestStatus: result.status,
      lastTestMessage: result.message,
    })
    .where(eq(aiProviderSettings.organizationId, organizationId));
}
