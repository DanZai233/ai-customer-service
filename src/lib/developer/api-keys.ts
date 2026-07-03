import { createHash, randomBytes } from "node:crypto";

import { and, desc, eq, isNull } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { apiKeys } from "@/db/schema";

export const apiKeyScopes = [
  "conversations:read",
  "conversations:write",
  "ai:generate",
] as const;

export type ApiKeyScope = (typeof apiKeyScopes)[number];

export type PublicApiKey = {
  id: string;
  name: string;
  prefix: string;
  hint: string;
  scopes: ApiKeyScope[];
  status: "active" | "expired" | "revoked";
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export class ApiAuthenticationError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiAuthenticationError";
  }
}

export function hashApiKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateApiKey() {
  const secret = `luma_live_${randomBytes(32).toString("base64url")}`;
  return {
    secret,
    hash: hashApiKey(secret),
    prefix: secret.slice(0, 18),
    hint: secret.slice(-4),
  };
}

export function readBearerToken(request: Request) {
  const authorization = request.headers.get("authorization")?.trim();
  if (!authorization) return null;
  const [scheme, token, ...rest] = authorization.split(/\s+/);
  if (scheme?.toLowerCase() !== "bearer" || !token || rest.length > 0) {
    return null;
  }
  return token;
}

function toPublicApiKey(row: typeof apiKeys.$inferSelect): PublicApiKey {
  return {
    id: row.id,
    name: row.name,
    prefix: row.keyPrefix,
    hint: row.keyHint,
    scopes: row.scopes,
    status: row.revokedAt
      ? ("revoked" as const)
      : row.expiresAt && row.expiresAt <= new Date()
        ? ("expired" as const)
        : ("active" as const),
    lastUsedAt: row.lastUsedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listApiKeys(organizationId: string) {
  const rows = await getDatabase()
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.organizationId, organizationId))
    .orderBy(desc(apiKeys.createdAt));
  return rows.map(toPublicApiKey);
}

export async function createApiKey(input: {
  organizationId: string;
  userId: string;
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: Date | null;
}) {
  const generated = generateApiKey();
  const [row] = await getDatabase()
    .insert(apiKeys)
    .values({
      id: `key-${crypto.randomUUID()}`,
      organizationId: input.organizationId,
      name: input.name,
      keyPrefix: generated.prefix,
      keyHash: generated.hash,
      keyHint: generated.hint,
      scopes: input.scopes,
      expiresAt: input.expiresAt ?? null,
      createdBy: input.userId,
    })
    .returning();

  return { ...toPublicApiKey(row), secret: generated.secret };
}

export async function revokeApiKey(organizationId: string, keyId: string) {
  const [row] = await getDatabase()
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(apiKeys.id, keyId),
        eq(apiKeys.organizationId, organizationId),
        isNull(apiKeys.revokedAt),
      ),
    )
    .returning();
  return row ? toPublicApiKey(row) : null;
}

export async function authenticateApiRequest(
  request: Request,
  requiredScope: ApiKeyScope,
) {
  const token = readBearerToken(request);
  if (!token || !token.startsWith("luma_live_")) {
    throw new ApiAuthenticationError(
      401,
      "invalid_api_key",
      "请提供有效的 Bearer API Key",
    );
  }

  const row = await getDatabase().query.apiKeys.findFirst({
    where: eq(apiKeys.keyHash, hashApiKey(token)),
  });
  if (!row || row.revokedAt || (row.expiresAt && row.expiresAt <= new Date())) {
    throw new ApiAuthenticationError(
      401,
      "invalid_api_key",
      "API Key 不存在、已过期或已被吊销",
    );
  }
  if (!row.scopes.includes(requiredScope)) {
    throw new ApiAuthenticationError(
      403,
      "insufficient_scope",
      `API Key 缺少 ${requiredScope} 权限`,
    );
  }

  await getDatabase()
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, row.id));

  return {
    apiKeyId: row.id,
    organizationId: row.organizationId,
    scopes: row.scopes,
  };
}
