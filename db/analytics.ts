import { sql } from "drizzle-orm";
import {
  bigserial,
  char,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { analyticsEventTypeEnum } from "./enums";
import { apps } from "./apps";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    eventType: analyticsEventTypeEnum("event_type").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    sessionHash: text("session_hash"),
    countryCode: char("country_code", { length: 2 }),
    path: text("path").notNull(),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    linkId: text("link_id"),
    linkUrl: text("link_url"),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    hitCount: integer("hit_count").notNull().default(1),
  },
  (table) => ({
    appTimeIdx: index("analytics_events_app_time_idx").on(table.appId, table.occurredAt),
    appEventTimeIdx: index("analytics_events_app_event_time_idx").on(
      table.appId,
      table.eventType,
      table.occurredAt
    ),
    countryIdx: index("analytics_events_country_idx").on(
      table.appId,
      table.countryCode,
      table.occurredAt
    ),
    linkClickIdx: index("analytics_events_link_click_idx")
      .on(table.appId, table.linkId, table.occurredAt)
      .where(sql`${table.eventType} = 'link_click'`),
  })
);

