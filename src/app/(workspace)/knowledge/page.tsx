import type { Metadata } from "next";

import { KnowledgeWorkspace } from "@/components/knowledge/knowledge-workspace";
import { requirePageAuth } from "@/lib/auth/context";

export const metadata: Metadata = {
  title: "知识库",
};

export default async function KnowledgePage() {
  await requirePageAuth("knowledge.read");
  return <KnowledgeWorkspace />;
}
