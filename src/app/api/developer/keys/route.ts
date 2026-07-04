import { apiErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/auth/context";
import { createApiKey, listApiKeys } from "@/lib/developer/api-keys";
import { createApiKeySchema } from "@/lib/developer/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeRequest(request, "settings.read");
  if (!authorization.authorized) return authorization.response;
  const data = await listApiKeys(authorization.context.user.organizationId);
  return Response.json({ data });
}

export async function POST(request: Request) {
  try {
    const authorization = await authorizeRequest(request, "settings.manage");
    if (!authorization.authorized) return authorization.response;
    const input = createApiKeySchema.parse(await request.json());
    const data = await createApiKey({
      organizationId: authorization.context.user.organizationId,
      userId: authorization.context.user.id,
      name: input.name,
      scopes: input.scopes,
      expiresAt: input.expiresInDays
        ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
        : null,
    });
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
