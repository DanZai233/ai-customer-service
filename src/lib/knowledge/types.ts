export type KnowledgeDocumentStatus = "draft" | "published" | "archived";
export type KnowledgeDocumentSource =
  "manual" | "document" | "website" | "template";
export type KnowledgeRetrievalSource = "test" | "ai";

export type KnowledgeDocument = {
  id: string;
  title: string;
  category: string;
  content: string;
  status: KnowledgeDocumentStatus;
  source: KnowledgeDocumentSource;
  sourceUrl: string | null;
  hitCount: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KnowledgeMatch = {
  document: KnowledgeDocument;
  score: number;
};

export type KnowledgeStats = {
  total: number;
  published: number;
  retrievalsThisMonth: number;
};
