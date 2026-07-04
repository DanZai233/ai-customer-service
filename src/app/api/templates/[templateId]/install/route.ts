import { apiErrorResponse } from "@/lib/api-response";
import { authorizeRequest } from "@/lib/auth/context";
import { installIndustryTemplate } from "@/lib/templates/service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ templateId: string }> },
) {
  try {
    const authorization = await authorizeRequest(request, "knowledge.write");
    if (!authorization.authorized) return authorization.response;
    const { templateId } = await params;
    const data = await installIndustryTemplate({
      organizationId: authorization.context.user.organizationId,
      userId: authorization.context.user.id,
      templateId,
    });
    if (!data) {
      return Response.json({ error: "行业模板不存在" }, { status: 404 });
    }
    return Response.json({ data }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
