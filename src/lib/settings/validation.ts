import { z } from "zod";

export const workspaceSettingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  timezone: z.enum(["Asia/Shanghai", "UTC"]),
  language: z.enum(["zh-CN", "en"]),
  businessHours: z.string().trim().min(5).max(40),
  autoResolve: z.boolean(),
  maskSensitive: z.boolean(),
});

export const aiProviderSettingsSchema = z
  .object({
    kind: z.enum(["volcengine", "openai-compatible"]),
    provider: z.string().trim().min(2).max(80),
    baseURL: z.url().max(500),
    model: z.string().trim().max(200),
    enabled: z.boolean(),
    apiKey: z.string().trim().min(8).max(1000).optional(),
    clearApiKey: z.boolean().optional(),
  })
  .refine((value) => !(value.apiKey && value.clearApiKey), {
    message: "不能同时设置和清除 API Key",
  });
