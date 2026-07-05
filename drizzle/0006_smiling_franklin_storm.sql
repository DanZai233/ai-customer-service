CREATE TABLE "team_member_settings" (
	"userId" text PRIMARY KEY NOT NULL,
	"organizationId" text NOT NULL,
	"capacity" integer DEFAULT 8 NOT NULL,
	"updatedBy" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_member_settings" ADD CONSTRAINT "team_member_settings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_member_settings" ADD CONSTRAINT "team_member_settings_organizationId_organizations_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "team_member_settings_organization_idx" ON "team_member_settings" USING btree ("organizationId");