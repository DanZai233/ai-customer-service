import { authorizeRequest } from "@/lib/auth/context";
import { updateAiProviderSettings } from "@/lib/settings/service";
import { aiProviderSettingsSchema } from "@/lib/settings/validation";

export async function PATCH(request: Request) {
  const authorization = await authorizeRequest(request, "settings.manage");
  if (!authorization.authorized) return authorization.response;

  const parsed = aiProviderSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "AI 配置格式不正确", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id: userId, organizationId } = authorization.context.user;
  const data = await updateAiProviderSettings(
    organizationId,
    userId,
    parsed.data,
  );
  return Response.json({ data });
}
