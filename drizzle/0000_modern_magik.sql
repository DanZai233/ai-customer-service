CREATE TYPE "public"."channel" AS ENUM('web', 'wechat', 'email');--> statement-breakpoint
CREATE TYPE "public"."conversation_priority" AS ENUM('normal', 'high');--> statement-breakpoint
CREATE TYPE "public"."conversation_status" AS ENUM('open', 'pending', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('customer', 'assistant', 'agent', 'system');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"customerId" text NOT NULL,
	"channel" "channel" NOT NULL,
	"status" "conversation_status" DEFAULT 'open' NOT NULL,
	"priority" "conversation_priority" DEFAULT 'normal' NOT NULL,
	"unread" integer DEFAULT 0 NOT NULL,
	"lastMessage" text NOT NULL,
	"assignee" text DEFAULT '未分配' NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"aiManaged" boolean DEFAULT false NOT NULL,
	"externalId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"name" text NOT NULL,
	"initials" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"city" text NOT NULL,
	"plan" text NOT NULL,
	"customerSince" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"conversationId" text NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"sender" text,
	"externalId" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"customerId" text NOT NULL,
	"amountCents" integer NOT NULL,
	"currency" text DEFAULT 'CNY' NOT NULL,
	"status" text NOT NULL,
	"placedAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_customers_id_fk" FOREIGN KEY ("customerId") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversations_org_updated_idx" ON "conversations" USING btree ("organizationId","updatedAt");--> statement-breakpoint
CREATE INDEX "conversations_customer_idx" ON "conversations" USING btree ("customerId");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_external_idx" ON "conversations" USING btree ("organizationId","channel","externalId");--> statement-breakpoint
CREATE INDEX "customers_organization_idx" ON "customers" USING btree ("organizationId");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_org_email_idx" ON "customers" USING btree ("organizationId","email");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversationId","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "messages_external_idx" ON "messages" USING btree ("organizationId","externalId");--> statement-breakpoint
CREATE INDEX "orders_customer_placed_idx" ON "orders" USING btree ("customerId","placedAt");--> statement-breakpoint
CREATE UNIQUE INDEX "organizations_slug_idx" ON "organizations" USING btree ("slug");