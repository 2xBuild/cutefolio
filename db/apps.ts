import { sql } from "drizzle-orm";
import { boolean, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

import { citext, appStatusEnum, appTypeEnum, domainStatusEnum } from "./enums";
import { users } from "./auth";

export const apps = pgTable(
  "apps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: citext("slug").notNull(),
    type: appTypeEnum("type").notNull(),
    templateId: text("template_id").notNull(),
    status: appStatusEnum("status").notNull().default("draft"),
    isPublic: boolean("is_public").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
  },
  (table) => ({
    slugUnique: uniqueIndex("apps_slug_unique_idx").on(table.slug),
    ownerIdx: index("apps_owner_idx").on(table.ownerId),
    ownerStatusIdx: index("apps_owner_status_idx").on(table.ownerId, table.status),
  })
);

export const appContent = pgTable(
  "app_content",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    schemaVersion: integer("schema_version").notNull().default(1),
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    isCurrent: boolean("is_current").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => ({
    appVersionUnique: uniqueIndex("app_content_app_version_unique_idx").on(
      table.appId,
      table.version
    ),
    singleCurrentUnique: uniqueIndex("app_content_single_current_idx")
      .on(table.appId)
      .where(sql`${table.isCurrent} = true`),
    contentGinIdx: index("app_content_json_gin_idx")
      .using("gin", table.content),
  })
);

export const appDomains = pgTable(
  "app_domains",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    appId: uuid("app_id")
      .notNull()
      .references(() => apps.id, { onDelete: "cascade" }),
    domain: citext("domain").notNull(),
    isPrimary: boolean("is_primary").notNull().default(false),
    status: domainStatusEnum("status").notNull().default("pending_verification"),
    verificationMethod: text("verification_method").notNull().default("txt"),
    verificationToken: text("verification_token").notNull(),
    dnsTarget: text("dns_target").notNull().default("cname.kno.li"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true, mode: "date" }),
    verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    domainUnique: uniqueIndex("app_domains_domain_unique_idx").on(table.domain),
    singlePrimaryActiveIdx: uniqueIndex("app_domains_single_primary_idx")
      .on(table.appId)
      .where(sql`${table.isPrimary} = true AND ${table.status} = 'active'`),
    appStatusIdx: index("app_domains_app_idx").on(table.appId, table.status),
  })
);

