import { authenticateApiRequest } from "@/lib/developer/api-keys";
import { runIdempotent } from "@/lib/public-api/idempotency";
import {
  apiRequestId,
  publicApiError,
  publicApiResponse,
} from "@/lib/public-api/response";
import { addPublicCustomerMessage } from "@/lib/public-api/service";
import { createPublicMessageSchema } from "@/lib/public-api/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const requestId = apiRequestId(request);
  try {
    const authentication = await authenticateApiRequest(
      request,
      "conversations:write",
    );
    const { conversationId } = await params;
    const input = createPublicMessageSchema.parse(await request.json());
    const result = await runIdempotent({
      ...authentication,
      idempotencyKey: request.headers.get("idempotency-key"),
      fingerprint: { conversationId, ...input },
      execute: async () => ({
        status: 201,
        body: {
          data: await addPublicCustomerMessage(
            authentication.organizationId,
            conversationId,
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
