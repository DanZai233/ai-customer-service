import { authorizeRequest } from "@/lib/auth/context";
import { revokeApiKey } from "@/lib/developer/api-keys";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ keyId: string }> },
) {
  const authorization = await authorizeRequest(request, "settings.manage");
  if (!authorization.authorized) return authorization.response;
  const { keyId } = await params;
  const data = await revokeApiKey(
    authorization.context.user.organizationId,
    keyId,
  );
  if (!data) {
    return Response.json(
      { error: "API Key 不存在或已经吊销" },
      { status: 404 },
    );
  }
  return Response.json({ data });
}
