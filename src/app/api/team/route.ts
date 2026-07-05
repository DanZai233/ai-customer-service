import { authorizeRequest } from "@/lib/auth/context";
import { getTeamDashboard } from "@/lib/team/repository";

export async function GET(request: Request) {
  const authorization = await authorizeRequest(request, "team.read");
  if (!authorization.authorized) return authorization.response;

  const data = await getTeamDashboard(
    authorization.context.user.organizationId,
  );
  return Response.json({ data });
}
