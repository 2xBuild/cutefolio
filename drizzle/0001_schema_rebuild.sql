ALTER TABLE "authenticator" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "platform_domain_host_mode_access" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "platform_domains" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "analytics_daily_app_stats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "analytics_daily_country_stats" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "github_connections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "github_publish_jobs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "authenticator" CASCADE;--> statement-breakpoint
DROP TABLE "platform_domain_host_mode_access" CASCADE;--> statement-breakpoint
DROP TABLE "platform_domains" CASCADE;--> statement-breakpoint
DROP TABLE "analytics_daily_app_stats" CASCADE;--> statement-breakpoint
DROP TABLE "analytics_daily_country_stats" CASCADE;--> statement-breakpoint
DROP TABLE "github_connections" CASCADE;--> statement-breakpoint
DROP TABLE "github_publish_jobs" CASCADE;--> statement-breakpoint
ALTER TABLE "apps" DROP CONSTRAINT "apps_github_mode_portfolio_only_chk";--> statement-breakpoint
ALTER TABLE "apps" DROP COLUMN "host_mode";--> statement-breakpoint
DROP TYPE "public"."host_mode";