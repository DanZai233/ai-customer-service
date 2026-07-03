CREATE TYPE "public"."ai_provider_kind" AS ENUM('volcengine', 'openai-compatible');--> statement-breakpoint
CREATE TABLE "ai_provider_settings" (
	"organizationId" text PRIMARY KEY NOT NULL,
	"kind" "ai_provider_kind" DEFAULT 'volcengine' NOT NULL,
	"providerName" text DEFAULT '火山引擎方舟' NOT NULL,
	"baseUrl" text DEFAULT 'https://ark.cn-beijing.volces.com/api/v3' NOT NULL,
	"model" text,
	"apiKeyEncrypted" text,
	"apiKeyHint" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"lastTestedAt" timestamp with time zone,
	"lastTestStatus" text,
	"lastTestMessage" text,
	"updatedBy" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_settings" (
	"organizationId" text PRIMARY KEY NOT NULL,
	"timezone" text DEFAULT 'Asia/Shanghai' NOT NULL,
	"language" text DEFAULT 'zh-CN' NOT NULL,
	"businessHours" text DEFAULT '09:00 - 21:00' NOT NULL,
	"autoResolve" boolean DEFAULT true NOT NULL,
	"maskSensitive" boolean DEFAULT true NOT NULL,
	"updatedBy" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_provider_settings" ADD CONSTRAINT "ai_provider_settings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;