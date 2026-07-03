import { getAiProviderStatus } from "@/lib/ai/provider";
import { getDataMode } from "@/lib/conversations/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    data: {
      database: { mode: getDataMode() },
      ai: getAiProviderStatus(),
    },
  });
}
