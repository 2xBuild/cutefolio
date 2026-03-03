import {
  bigserial,
  boolean,
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { billingProviderEnum, planTierEnum, subscriptionStatusEnum } from "./enums";
import { users } from "./auth";

export const billingSubscriptions = pgTable(
  "billing_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: billingProviderEnum("provider").notNull().default("polar"),
    providerCustomerId: text("provider_customer_id").notNull(),
    providerSubscriptionId: text("provider_subscription_id").notNull(),
    planTier: planTierEnum("plan_tier").notNull(),
    status: subscriptionStatusEnum("status").notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
      mode: "date",
    }),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
      mode: "date",
    }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    canceledAt: timestamp("canceled_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    providerSubscriptionUnique: unique("billing_subscriptions_provider_subscription_id_unique").on(
      table.providerSubscriptionId
    ),
    userStatusIdx: index("billing_subscriptions_user_idx").on(table.userId, table.status),
  })
);

export const billingWebhookEvents = pgTable(
  "billing_webhook_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    provider: billingProviderEnum("provider").notNull().default("polar"),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    status: text("status").notNull().default("pending"),
    processingError: text("processing_error"),
    receivedAt: timestamp("received_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),
  },
  (table) => ({
    providerEventIdUnique: unique("billing_webhook_events_provider_event_id_unique").on(
      table.providerEventId
    ),
    statusIdx: index("billing_webhook_events_status_idx").on(table.status, table.receivedAt),
  })
);

