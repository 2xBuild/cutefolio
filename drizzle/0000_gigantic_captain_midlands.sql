CREATE EXTENSION IF NOT EXISTS citext;--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS pgcrypto;--> statement-breakpoint
CREATE TYPE "public"."analytics_event_type" AS ENUM('page_view', 'link_click');--> statement-breakpoint
CREATE TYPE "public"."app_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."app_type" AS ENUM('portfolio', 'link-organiser');--> statement-breakpoint
CREATE TYPE "public"."billing_provider" AS ENUM('polar');--> statement-breakpoint
CREATE TYPE "public"."domain_status" AS ENUM('pending_verification', 'active', 'failed', 'removed');--> statement-breakpoint
CREATE TYPE "public"."host_mode" AS ENUM('kno-li', 'github-self-host');--> statement-breakpoint
CREATE TYPE "public"."plan_tier" AS ENUM('free', 'premium', 'ultra');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('trialing', 'active', 'past_due', 'canceled', 'incomplete');--> statement-breakpoint
CREATE TABLE "account" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" text NOT NULL,
	"transports" text,
	CONSTRAINT "authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"emailVerified" timestamp,
	"image" text,
	"username" "citext",
	"display_name" text,
	"bio" text,
	"avatar_url" text,
	"username_policy_consent" boolean DEFAULT false NOT NULL,
	"username_policy_consent_at" timestamp with time zone,
	"planTier" "plan_tier" DEFAULT 'free' NOT NULL,
	"polarCustomerId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_polar_customer_id_unique" UNIQUE("polarCustomerId")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "platform_domain_host_mode_access" (
	"platform_domain_id" uuid NOT NULL,
	"host_mode" "host_mode" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_domain_host_mode_access_pk" PRIMARY KEY("platform_domain_id","host_mode")
);
--> statement-breakpoint
CREATE TABLE "platform_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"domain" "citext" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"schema_version" integer DEFAULT 1 NOT NULL,
	"content" jsonb NOT NULL,
	"is_current" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" text
);
--> statement-breakpoint
CREATE TABLE "app_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"domain" "citext" NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"status" "domain_status" DEFAULT 'pending_verification' NOT NULL,
	"verification_method" text DEFAULT 'txt' NOT NULL,
	"verification_token" text NOT NULL,
	"dns_target" text DEFAULT 'cname.cutefolio' NOT NULL,
	"last_checked_at" timestamp with time zone,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "apps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" text NOT NULL,
	"slug" "citext" NOT NULL,
	"type" "app_type" NOT NULL,
	"host_mode" "host_mode" DEFAULT 'kno-li' NOT NULL,
	"template_id" text NOT NULL,
	"status" "app_status" DEFAULT 'draft' NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "apps_github_mode_portfolio_only_chk" CHECK ("apps"."host_mode" <> 'github-self-host' OR "apps"."type" = 'portfolio')
);
--> statement-breakpoint
CREATE TABLE "analytics_daily_app_stats" (
	"day" date NOT NULL,
	"app_id" uuid NOT NULL,
	"page_views" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"link_clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_daily_app_stats_pk" PRIMARY KEY("day","app_id")
);
--> statement-breakpoint
CREATE TABLE "analytics_daily_country_stats" (
	"day" date NOT NULL,
	"app_id" uuid NOT NULL,
	"country_code" char(2) NOT NULL,
	"page_views" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"link_clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "analytics_daily_country_stats_pk" PRIMARY KEY("day","app_id","country_code")
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"app_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_type" "analytics_event_type" NOT NULL,
	"visitor_hash" text NOT NULL,
	"session_hash" text,
	"country_code" char(2),
	"path" text NOT NULL,
	"referrer" text,
	"user_agent" text,
	"link_id" text,
	"link_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "billing_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"provider" "billing_provider" DEFAULT 'polar' NOT NULL,
	"provider_customer_id" text NOT NULL,
	"provider_subscription_id" text NOT NULL,
	"plan_tier" "plan_tier" NOT NULL,
	"status" "subscription_status" NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false NOT NULL,
	"canceled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billing_subscriptions_provider_subscription_id_unique" UNIQUE("provider_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "billing_webhook_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"provider" "billing_provider" DEFAULT 'polar' NOT NULL,
	"provider_event_id" text NOT NULL,
	"event_type" text NOT NULL,
	"payload" jsonb NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"processing_error" text,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "billing_webhook_events_provider_event_id_unique" UNIQUE("provider_event_id")
);
--> statement-breakpoint
CREATE TABLE "github_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"github_user_id" bigint NOT NULL,
	"github_login" text NOT NULL,
	"access_token_encrypted" text NOT NULL,
	"refresh_token_encrypted" text,
	"token_expires_at" timestamp with time zone,
	"scope" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "github_connections_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "github_connections_github_user_id_unique" UNIQUE("github_user_id")
);
--> statement-breakpoint
CREATE TABLE "github_publish_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"repo_owner" text NOT NULL,
	"repo_name" text DEFAULT 'it-iz-me' NOT NULL,
	"repo_url" text,
	"branch" text DEFAULT 'main' NOT NULL,
	"commit_sha" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "authenticator" ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_domain_host_mode_access" ADD CONSTRAINT "platform_domain_host_mode_access_platform_domain_id_platform_domains_id_fk" FOREIGN KEY ("platform_domain_id") REFERENCES "public"."platform_domains"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_content" ADD CONSTRAINT "app_content_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_content" ADD CONSTRAINT "app_content_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_domains" ADD CONSTRAINT "app_domains_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "apps" ADD CONSTRAINT "apps_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_daily_app_stats" ADD CONSTRAINT "analytics_daily_app_stats_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_daily_country_stats" ADD CONSTRAINT "analytics_daily_country_stats_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_connections" ADD CONSTRAINT "github_connections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_publish_jobs" ADD CONSTRAINT "github_publish_jobs_app_id_apps_id_fk" FOREIGN KEY ("app_id") REFERENCES "public"."apps"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_publish_jobs" ADD CONSTRAINT "github_publish_jobs_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_plan_tier_idx" ON "user" USING btree ("planTier");--> statement-breakpoint
CREATE INDEX "platform_domain_host_mode_access_mode_idx" ON "platform_domain_host_mode_access" USING btree ("host_mode");--> statement-breakpoint
CREATE UNIQUE INDEX "platform_domains_domain_unique_idx" ON "platform_domains" USING btree ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX "app_content_app_version_unique_idx" ON "app_content" USING btree ("app_id","version");--> statement-breakpoint
CREATE UNIQUE INDEX "app_content_single_current_idx" ON "app_content" USING btree ("app_id") WHERE "app_content"."is_current" = true;--> statement-breakpoint
CREATE INDEX "app_content_json_gin_idx" ON "app_content" USING gin ("content");--> statement-breakpoint
CREATE UNIQUE INDEX "app_domains_domain_unique_idx" ON "app_domains" USING btree ("domain");--> statement-breakpoint
CREATE UNIQUE INDEX "app_domains_single_primary_idx" ON "app_domains" USING btree ("app_id") WHERE "app_domains"."is_primary" = true AND "app_domains"."status" = 'active';--> statement-breakpoint
CREATE INDEX "app_domains_app_idx" ON "app_domains" USING btree ("app_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "apps_slug_unique_idx" ON "apps" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "apps_owner_idx" ON "apps" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "apps_owner_status_idx" ON "apps" USING btree ("owner_id","status");--> statement-breakpoint
CREATE INDEX "analytics_events_app_time_idx" ON "analytics_events" USING btree ("app_id","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_app_event_time_idx" ON "analytics_events" USING btree ("app_id","event_type","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_country_idx" ON "analytics_events" USING btree ("app_id","country_code","occurred_at");--> statement-breakpoint
CREATE INDEX "analytics_events_link_click_idx" ON "analytics_events" USING btree ("app_id","link_id","occurred_at") WHERE "analytics_events"."event_type" = 'link_click';--> statement-breakpoint
CREATE INDEX "billing_subscriptions_user_idx" ON "billing_subscriptions" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "billing_webhook_events_status_idx" ON "billing_webhook_events" USING btree ("status","received_at");--> statement-breakpoint
CREATE INDEX "github_publish_jobs_app_idx" ON "github_publish_jobs" USING btree ("app_id","requested_at");