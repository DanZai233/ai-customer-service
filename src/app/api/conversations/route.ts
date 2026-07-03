import {
  defaultOrganizationId,
  getConversationRepository,
  getDataMode,
} from "@/lib/conversations/repository";
import { apiErrorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const conversations = await getConversationRepository().list(
      defaultOrganizationId,
    );
    return Response.json({ data: conversations, mode: getDataMode() });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
