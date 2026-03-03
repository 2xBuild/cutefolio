UPDATE "apps" SET "status" = 'draft' WHERE "status" = 'archived';--> statement-breakpoint
ALTER TABLE "apps" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "apps" ALTER COLUMN "status" SET DEFAULT 'draft'::text;--> statement-breakpoint
DROP TYPE "public"."app_status";--> statement-breakpoint
CREATE TYPE "public"."app_status" AS ENUM('draft', 'published');--> statement-breakpoint
ALTER TABLE "apps" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."app_status";--> statement-breakpoint
ALTER TABLE "apps" ALTER COLUMN "status" SET DATA TYPE "public"."app_status" USING "status"::"public"."app_status";