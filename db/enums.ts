import { customType, pgEnum } from "drizzle-orm/pg-core";

export const citext = customType<{ data: string }>({
  dataType() {
    return "citext";
  },
});

export const planTierEnum = pgEnum("plan_tier", ["free", "premium", "ultra"]);
export const appTypeEnum = pgEnum("app_type", ["portfolio", "link-organiser"]);
export const appStatusEnum = pgEnum("app_status", ["draft", "published"]);
export const domainStatusEnum = pgEnum("domain_status", [
  "pending_verification",
  "active",
  "failed",
  "removed",
]);
export const analyticsEventTypeEnum = pgEnum("analytics_event_type", [
  "page_view",
  "link_click",
]);
export const billingProviderEnum = pgEnum("billing_provider", ["polar"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
]);

export type PlanTier = (typeof planTierEnum.enumValues)[number];
export type AppType = (typeof appTypeEnum.enumValues)[number];
export type AppStatus = (typeof appStatusEnum.enumValues)[number];
export type DomainStatus = (typeof domainStatusEnum.enumValues)[number];
export type AnalyticsEventType = (typeof analyticsEventTypeEnum.enumValues)[number];
export type SubscriptionStatus = (typeof subscriptionStatusEnum.enumValues)[number];

