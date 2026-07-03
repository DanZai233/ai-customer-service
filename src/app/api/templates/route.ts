import { authorizeRequest } from "@/lib/auth/context";
import { listIndustryTemplates } from "@/lib/templates/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeRequest(request, "knowledge.read");
  if (!authorization.authorized) return authorization.response;
  const data = await listIndustryTemplates(
    authorization.context.user.organizationId,
  );
  return Response.json({ data });
}
