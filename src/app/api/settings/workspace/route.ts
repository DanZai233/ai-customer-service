import { authorizeRequest } from "@/lib/auth/context";
import { updateWorkspaceSettings } from "@/lib/settings/service";
import { workspaceSettingsSchema } from "@/lib/settings/validation";

export async function PATCH(request: Request) {
  const authorization = await authorizeRequest(request, "settings.manage");
  if (!authorization.authorized) return authorization.response;

  const parsed = workspaceSettingsSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "工作空间配置格式不正确", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { id: userId, organizationId } = authorization.context.user;
  const data = await updateWorkspaceSettings(
    organizationId,
    userId,
    parsed.data,
  );
  return Response.json({ data });
}
