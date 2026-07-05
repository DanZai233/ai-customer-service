import { authorizeRequest } from "@/lib/auth/context";
import {
  LastOwnerError,
  TeamMemberNotFoundError,
  updateTeamMember,
} from "@/lib/team/repository";
import { updateTeamMemberSchema } from "@/lib/team/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ memberId: string }> },
) {
  const authorization = await authorizeRequest(request, "team.manage");
  if (!authorization.authorized) return authorization.response;

  const parsed = updateTeamMemberSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "成员配置格式不正确", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { memberId } = await params;
    const data = await updateTeamMember(
      authorization.context.user.organizationId,
      authorization.context.user.id,
      memberId,
      parsed.data,
    );
    return Response.json({ data });
  } catch (error) {
    if (error instanceof TeamMemberNotFoundError) {
      return Response.json({ error: error.message }, { status: 404 });
    }
    if (error instanceof LastOwnerError) {
      return Response.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
