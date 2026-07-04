import { and, eq } from "drizzle-orm";

import { getDatabase } from "@/db/client";
import { apiIdempotencyRecords } from "@/db/schema";
import { hashApiKey } from "@/lib/developer/api-keys";

export class IdempotencyConflictError extends Error {
  constructor() {
    super("同一个 Idempotency-Key 不能用于不同的请求体");
    this.name = "IdempotencyConflictError";
  }
}

export async function runIdempotent<T extends Record<string, unknown>>(input: {
  organizationId: string;
  apiKeyId: string;
  idempotencyKey: string | null;
  fingerprint: unknown;
  execute: () => Promise<{ status: number; body: T }>;
}) {
  if (!input.idempotencyKey) return input.execute();
  const key = input.idempotencyKey.trim().slice(0, 120);
  const requestHash = hashApiKey(JSON.stringify(input.fingerprint));
  const db = getDatabase();
  const existing = await db.query.apiIdempotencyRecords.findFirst({
    where: and(
      eq(apiIdempotencyRecords.apiKeyId, input.apiKeyId),
      eq(apiIdempotencyRecords.idempotencyKey, key),
    ),
  });
  if (existing) {
    if (existing.requestHash !== requestHash) {
      throw new IdempotencyConflictError();
    }
    return {
      status: existing.responseStatus,
      body: existing.responseBody as T,
      replayed: true,
    };
  }

  const result = await input.execute();
  await db.insert(apiIdempotencyRecords).values({
    id: `idem-${crypto.randomUUID()}`,
    organizationId: input.organizationId,
    apiKeyId: input.apiKeyId,
    idempotencyKey: key,
    requestHash,
    responseStatus: result.status,
    responseBody: result.body,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  return { ...result, replayed: false };
}
