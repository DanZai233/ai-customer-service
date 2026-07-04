import { authorizeRequest } from "@/lib/auth/context";
import {
  getKnowledgeDocument,
  updateKnowledgeDocument,
} from "@/lib/knowledge/repository";
import { updateKnowledgeDocumentSchema } from "@/lib/knowledge/validation";

type RouteContext = { params: Promise<{ documentId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const authorization = await authorizeRequest(request, "knowledge.read");
  if (!authorization.authorized) return authorization.response;
  const { documentId } = await context.params;
  const document = await getKnowledgeDocument(
    authorization.context.user.organizationId,
    documentId,
  );
  return document
    ? Response.json({ data: document })
    : Response.json({ error: "知识条目不存在" }, { status: 404 });
}

export async function PATCH(request: Request, context: RouteContext) {
  const authorization = await authorizeRequest(request, "knowledge.write");
  if (!authorization.authorized) return authorization.response;
  const parsed = updateKnowledgeDocumentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "知识内容格式不正确", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { documentId } = await context.params;
  const { id: userId, organizationId } = authorization.context.user;
  const document = await updateKnowledgeDocument(
    organizationId,
    documentId,
    userId,
    parsed.data,
  );
  return document
    ? Response.json({ data: document })
    : Response.json({ error: "知识条目不存在" }, { status: 404 });
}
