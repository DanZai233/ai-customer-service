import { apiErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/auth/context";
import {
  getConversationRepository,
  getDataMode,
} from "@/lib/conversations/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authorization = await authorizeRequest(request, "conversation.read");
    if (!authorization.authorized) return authorization.response;
    const conversations = await getConversationRepository().list(
      authorization.context.user.organizationId,
    );
    return Response.json({ data: conversations, mode: getDataMode() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
