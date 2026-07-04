import { testAiProviderConnection } from "@/lib/ai/provider";
import { authorizeRequest } from "@/lib/auth/context";
import { recordAiConnectionTest } from "@/lib/settings/service";

export const maxDuration = 30;

export async function POST(request: Request) {
  const authorization = await authorizeRequest(request, "settings.manage");
  if (!authorization.authorized) return authorization.response;

  const { organizationId } = authorization.context.user;
  try {
    const data = await testAiProviderConnection(organizationId);
    await recordAiConnectionTest(organizationId, {
      status: "success",
      message: `连接成功${data.response ? `，模型返回：${data.response}` : ""}`,
    });
    return Response.json({ data });
  } catch (error) {
    console.error("AI provider connection test failed", error);
    const message =
      error instanceof Error ? error.message.slice(0, 240) : "模型服务连接失败";
    await recordAiConnectionTest(organizationId, {
      status: "error",
      message,
    });
    return Response.json({ error: message }, { status: 502 });
  }
}
