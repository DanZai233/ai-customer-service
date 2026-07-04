import { z } from "zod";

import { apiKeyScopes } from "@/lib/developer/api-keys";

export const createApiKeySchema = z.object({
  name: z.string().trim().min(2, "名称至少 2 个字符").max(50),
  scopes: z
    .array(z.enum(apiKeyScopes))
    .min(1, "至少选择一个权限")
    .transform((scopes) => [...new Set(scopes)]),
  expiresInDays: z.number().int().min(1).max(365).nullable().optional(),
});
