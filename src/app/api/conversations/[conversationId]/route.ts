import { apiErrorResponse } from "@/lib/api-response";
import {
  defaultOrganizationId,
  getConversationRepository,
  getDataMode,
} from "@/lib/conversations/repository";
import { conversationPatchSchema } from "@/lib/conversations/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const patch = conversationPatchSchema.parse(await request.json());
    const conversation = await getConversationRepository().update(
      defaultOrganizationId,
      conversationId,
      patch,
    );
    return Response.json({ data: conversation, mode: getDataMode() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
