import { apiErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/auth/context";
import {
  getConversationRepository,
  getDataMode,
} from "@/lib/conversations/repository";
import { conversationPatchSchema } from "@/lib/conversations/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const authorization = await authorizeRequest(
      request,
      "conversation.manage",
    );
    if (!authorization.authorized) return authorization.response;
    const { conversationId } = await params;
    const patch = conversationPatchSchema.parse(await request.json());
    const conversation = await getConversationRepository().update(
      authorization.context.user.organizationId,
      conversationId,
      patch,
    );
    return Response.json({ data: conversation, mode: getDataMode() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
