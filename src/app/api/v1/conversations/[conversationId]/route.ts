import { authenticateApiRequest } from "@/lib/developer/api-keys";
import {
  apiRequestId,
  publicApiError,
  publicApiResponse,
} from "@/lib/public-api/response";
import { getPublicConversation } from "@/lib/public-api/service";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const requestId = apiRequestId(request);
  try {
    const authentication = await authenticateApiRequest(
      request,
      "conversations:read",
    );
    const { conversationId } = await params;
    const data = await getPublicConversation(
      authentication.organizationId,
      conversationId,
    );
    return publicApiResponse({ data }, 200, requestId);
  } catch (error) {
    return publicApiError(error, requestId);
  }
}
