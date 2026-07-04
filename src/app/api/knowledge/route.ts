import { authorizeRequest } from "@/lib/auth/context";
import {
  createKnowledgeDocument,
  getKnowledgeStats,
  listKnowledgeDocuments,
} from "@/lib/knowledge/repository";
import type { KnowledgeDocumentStatus } from "@/lib/knowledge/types";
import { createKnowledgeDocumentSchema } from "@/lib/knowledge/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authorization = await authorizeRequest(request, "knowledge.read");
  if (!authorization.authorized) return authorization.response;
  const url = new URL(request.url);
  const statusValue = url.searchParams.get("status");
  const status =
    statusValue === "draft" ||
    statusValue === "published" ||
    statusValue === "archived"
      ? (statusValue as KnowledgeDocumentStatus)
      : undefined;
  const { organizationId } = authorization.context.user;
  const [documents, stats] = await Promise.all([
    listKnowledgeDocuments(organizationId, {
      search: url.searchParams.get("search") ?? undefined,
      status,
    }),
    getKnowledgeStats(organizationId),
  ]);
  return Response.json({ data: { documents, stats } });
}

export async function POST(request: Request) {
  const authorization = await authorizeRequest(request, "knowledge.write");
  if (!authorization.authorized) return authorization.response;
  const parsed = createKnowledgeDocumentSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: "知识内容格式不正确", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { id: userId, organizationId } = authorization.context.user;
  const document = await createKnowledgeDocument(
    organizationId,
    userId,
    parsed.data,
  );
  return Response.json({ data: document }, { status: 201 });
}
