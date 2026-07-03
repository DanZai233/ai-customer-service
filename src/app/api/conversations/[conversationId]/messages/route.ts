import { apiErrorResponse } from "@/lib/api-response";
import {
  defaultOrganizationId,
  getConversationRepository,
  getDataMode,
} from "@/lib/conversations/repository";
import { newMessageSchema } from "@/lib/conversations/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const { conversationId } = await params;
    const message = newMessageSchema.parse(await request.json());
    const conversation = await getConversationRepository().addMessage(
      defaultOrganizationId,
      conversationId,
      message,
    );
    return Response.json(
      { data: conversation, mode: getDataMode() },
      { status: 201 },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
