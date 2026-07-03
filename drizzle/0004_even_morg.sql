CREATE TYPE "public"."api_key_scope" AS ENUM('conversations:read', 'conversations:write', 'ai:generate');--> statement-breakpoint
CREATE TABLE "api_idempotency_records" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"apiKeyId" text NOT NULL,
	"idempotencyKey" text NOT NULL,
	"requestHash" text NOT NULL,
	"responseStatus" integer NOT NULL,
	"responseBody" jsonb NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"name" text NOT NULL,
	"keyPrefix" text NOT NULL,
	"keyHash" text NOT NULL,
	"keyHint" text NOT NULL,
	"scopes" "api_key_scope"[] NOT NULL,
	"lastUsedAt" timestamp with time zone,
	"expiresAt" timestamp with time zone,
	"revokedAt" timestamp with time zone,
	"createdBy" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "externalId" text;--> statement-breakpoint
ALTER TABLE "api_idempotency_records" ADD CONSTRAINT "api_idempotency_records_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_idempotency_records" ADD CONSTRAINT "api_idempotency_records_apiKeyId_api_keys_id_fk" FOREIGN KEY ("apiKeyId") REFERENCES "public"."api_keys"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "api_idempotency_key_idx" ON "api_idempotency_records" USING btree ("apiKeyId","idempotencyKey");--> statement-breakpoint
CREATE INDEX "api_idempotency_expires_idx" ON "api_idempotency_records" USING btree ("expiresAt");--> statement-breakpoint
CREATE INDEX "api_keys_org_created_idx" ON "api_keys" USING btree ("organizationId","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_hash_idx" ON "api_keys" USING btree ("keyHash");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_org_external_idx" ON "customers" USING btree ("organizationId","externalId");