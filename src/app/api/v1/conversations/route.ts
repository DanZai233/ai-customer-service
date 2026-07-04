import { authenticateApiRequest } from "@/lib/developer/api-keys";
import { runIdempotent } from "@/lib/public-api/idempotency";
import {
  apiRequestId,
  publicApiError,
  publicApiResponse,
} from "@/lib/public-api/response";
import { createPublicConversation } from "@/lib/public-api/service";
import { createPublicConversationSchema } from "@/lib/public-api/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = apiRequestId(request);
  try {
    const authentication = await authenticateApiRequest(
      request,
      "conversations:write",
    );
    const input = createPublicConversationSchema.parse(await request.json());
    const result = await runIdempotent({
      ...authentication,
      idempotencyKey: request.headers.get("idempotency-key"),
      fingerprint: input,
      execute: async () => ({
        status: 201,
        body: {
          data: await createPublicConversation(
            authentication.organizationId,
            input,
          ),
        },
      }),
    });
    return publicApiResponse(result.body, result.status, requestId);
  } catch (error) {
    return publicApiError(error, requestId);
  }
}
