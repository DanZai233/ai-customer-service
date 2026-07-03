import type { Metadata } from "next";

import { KnowledgeWorkspace } from "@/components/knowledge/knowledge-workspace";

export const metadata: Metadata = {
  title: "知识库",
};

export default function KnowledgePage() {
  return <KnowledgeWorkspace />;
}
