import { authorizeRequest } from "@/lib/auth/context";
import { publishKnowledgeDocument } from "@/lib/knowledge/repository";

type RouteContext = { params: Promise<{ documentId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const authorization = await authorizeRequest(request, "knowledge.publish");
  if (!authorization.authorized) return authorization.response;
  const { documentId } = await context.params;
  const { id: userId, organizationId } = authorization.context.user;
  const document = await publishKnowledgeDocument(
    organizationId,
    documentId,
    userId,
  );
  return document
    ? Response.json({ data: document })
    : Response.json({ error: "知识条目不存在" }, { status: 404 });
}
