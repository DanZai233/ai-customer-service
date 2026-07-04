import { authorizeRequest } from "@/lib/auth/context";
import {
  getPublicAiProviderSettings,
  getWorkspaceSettings,
} from "@/lib/settings/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeRequest(request, "settings.read");
  if (!authorization.authorized) return authorization.response;

  const { organizationId } = authorization.context.user;
  const [workspace, ai] = await Promise.all([
    getWorkspaceSettings(organizationId),
    getPublicAiProviderSettings(organizationId),
  ]);

  return Response.json({ data: { workspace, ai } });
}
