CREATE TYPE "public"."knowledge_document_source" AS ENUM('manual', 'document', 'website');--> statement-breakpoint
CREATE TYPE "public"."knowledge_document_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "knowledge_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"status" "knowledge_document_status" DEFAULT 'draft' NOT NULL,
	"source" "knowledge_document_source" DEFAULT 'manual' NOT NULL,
	"sourceUrl" text,
	"hitCount" integer DEFAULT 0 NOT NULL,
	"createdBy" text,
	"updatedBy" text,
	"publishedAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_retrievals" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"documentId" text NOT NULL,
	"query" text NOT NULL,
	"scoreBasisPoints" integer NOT NULL,
	"source" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "knowledge_documents" ADD CONSTRAINT "knowledge_documents_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_retrievals" ADD CONSTRAINT "knowledge_retrievals_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_retrievals" ADD CONSTRAINT "knowledge_retrievals_documentId_knowledge_documents_id_fk" FOREIGN KEY ("documentId") REFERENCES "public"."knowledge_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "knowledge_documents_org_status_updated_idx" ON "knowledge_documents" USING btree ("organizationId","status","updatedAt");--> statement-breakpoint
CREATE INDEX "knowledge_retrievals_org_created_idx" ON "knowledge_retrievals" USING btree ("organizationId","createdAt");--> statement-breakpoint
CREATE INDEX "knowledge_retrievals_document_idx" ON "knowledge_retrievals" USING btree ("documentId");