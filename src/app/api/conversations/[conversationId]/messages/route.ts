import { apiErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/auth/context";
import {
  getConversationRepository,
  getDataMode,
} from "@/lib/conversations/repository";
import { agentReplySchema } from "@/lib/conversations/validation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  try {
    const authorization = await authorizeRequest(
      request,
      "conversation.respond",
    );
    if (!authorization.authorized) return authorization.response;
    const { conversationId } = await params;
    const input = agentReplySchema.parse(await request.json());
    const conversation = await getConversationRepository().addMessage(
      authorization.context.user.organizationId,
      conversationId,
      {
        role: "agent",
        sender: authorization.context.user.name,
        content: input.content,
      },
    );
    return Response.json(
      { data: conversation, mode: getDataMode() },
      { status: 201 },
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}
