import { authorizeRequest } from "@/lib/auth/context";
import {
  getKnowledgeStats,
  searchKnowledgeDocuments,
} from "@/lib/knowledge/repository";
import { searchKnowledgeSchema } from "@/lib/knowledge/validation";

export async function POST(request: Request) {
  const authorization = await authorizeRequest(request, "knowledge.read");
  if (!authorization.authorized) return authorization.response;
  const parsed = searchKnowledgeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "检索问题格式不正确" }, { status: 400 });
  }
  const { organizationId } = authorization.context.user;
  const matches = await searchKnowledgeDocuments(
    organizationId,
    parsed.data.query,
    { source: "test", limit: parsed.data.limit },
  );
  const stats = await getKnowledgeStats(organizationId);
  return Response.json({ data: { matches, stats } });
}
