import type { Metadata } from "next";

import { KnowledgeWorkspace } from "@/components/knowledge/knowledge-workspace";
import { requirePageAuth } from "@/lib/auth/context";
import { can } from "@/lib/auth/permissions";
import {
  getKnowledgeStats,
  listKnowledgeDocuments,
} from "@/lib/knowledge/repository";

export const metadata: Metadata = {
  title: "知识库",
};

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const { user } = await requirePageAuth("knowledge.read");
  const [documents, stats] = await Promise.all([
    listKnowledgeDocuments(user.organizationId),
    getKnowledgeStats(user.organizationId),
  ]);
  return (
    <KnowledgeWorkspace
      initialDocuments={documents}
      initialStats={stats}
      canWrite={can(user.role, "knowledge.write")}
      canPublish={can(user.role, "knowledge.publish")}
    />
  );
}
