import { getAiProviderStatus } from "@/lib/ai/provider";
import { authorizeRequest } from "@/lib/auth/context";
import { getDataMode } from "@/lib/conversations/repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeRequest(request, "settings.read");
  if (!authorization.authorized) return authorization.response;

  return Response.json({
    data: {
      database: { mode: getDataMode() },
      ai: getAiProviderStatus(),
    },
  });
}
