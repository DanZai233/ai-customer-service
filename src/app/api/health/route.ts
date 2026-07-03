import { checkDatabaseConnection } from "@/db/client";
import { getAiProviderStatus } from "@/lib/ai/provider";
import { getDataMode } from "@/lib/conversations/repository";

export async function GET() {
  const ai = getAiProviderStatus();
  const dataMode = getDataMode();

  try {
    const databaseConnected = await checkDatabaseConnection();
    return Response.json({
      status: "ok",
      aiMode: ai.mode,
      aiModel: ai.model,
      dataMode,
      databaseConnected,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed", error);
    return Response.json(
      {
        status: "degraded",
        aiMode: ai.mode,
        aiModel: ai.model,
        dataMode,
        databaseConnected: false,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  }
}
