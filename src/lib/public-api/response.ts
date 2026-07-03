import { ZodError } from "zod";

import { ApiAuthenticationError } from "@/lib/developer/api-keys";
import { IdempotencyConflictError } from "@/lib/public-api/idempotency";
import { PublicConversationNotFoundError } from "@/lib/public-api/service";

export function apiRequestId(request: Request) {
  return (
    request.headers.get("x-request-id")?.slice(0, 100) || crypto.randomUUID()
  );
}

export function publicApiResponse(
  body: Record<string, unknown>,
  status: number,
  requestId: string,
) {
  return Response.json(body, {
    status,
    headers: { "X-Request-Id": requestId },
  });
}

export function publicApiError(error: unknown, requestId: string) {
  if (error instanceof ApiAuthenticationError) {
    return publicApiResponse(
      { error: { code: error.code, message: error.message }, requestId },
      error.status,
      requestId,
    );
  }
  if (error instanceof PublicConversationNotFoundError) {
    return publicApiResponse(
      {
        error: { code: "conversation_not_found", message: error.message },
        requestId,
      },
      404,
      requestId,
    );
  }
  if (error instanceof IdempotencyConflictError) {
    return publicApiResponse(
      {
        error: { code: "idempotency_conflict", message: error.message },
        requestId,
      },
      409,
      requestId,
    );
  }
  if (error instanceof SyntaxError) {
    return publicApiResponse(
      {
        error: { code: "invalid_json", message: "请求体不是有效的 JSON" },
        requestId,
      },
      400,
      requestId,
    );
  }
  if (error instanceof ZodError) {
    return publicApiResponse(
      {
        error: {
          code: "validation_error",
          message: "请求数据不合法",
          details: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        },
        requestId,
      },
      422,
      requestId,
    );
  }
  console.error(error);
  return publicApiResponse(
    {
      error: { code: "internal_error", message: "服务暂时不可用" },
      requestId,
    },
    500,
    requestId,
  );
}
