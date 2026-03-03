import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { analyticsEvents, type AnalyticsEventType } from "@/db/schema";

export interface TrackAnalyticsEventInput {
  appId: string;
  eventType: AnalyticsEventType;
  visitorHash: string;
  sessionHash?: string | null;
  countryCode?: string | null;
  path: string;
  referrer?: string | null;
  userAgent?: string | null;
  linkId?: string | null;
  linkUrl?: string | null;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}

export interface AnalyticsSummary {
  pageViews: number;
  uniqueVisitors: number;
  linkClicks: number;
}

export interface DailyTrendPoint {
  day: string;
  pageViews: number;
  uniqueVisitors: number;
  linkClicks: number;
}

export interface CountryBreakdownPoint {
  countryCode: string;
  pageViews: number;
  uniqueVisitors: number;
  linkClicks: number;
}

export interface TopLinkPoint {
  linkId: string | null;
  linkUrl: string | null;
  clicks: number;
}

export interface TopReferrerPoint {
  referrer: string;
  visits: number;
}

/**
 * Upsert an analytics event. If the same visitor session already recorded
 * this (app, eventType, path, linkId) combination, the existing row's
 * hit_count is incremented instead of creating a duplicate.
 */
export async function trackAnalyticsEvent(input: TrackAnalyticsEventInput): Promise<void> {
  const occurredAt = input.occurredAt ?? new Date();
  const metadata = JSON.stringify(input.metadata ?? {});

  await db.execute(sql`
    INSERT INTO analytics_events (
      app_id, occurred_at, event_type, visitor_hash, session_hash,
      country_code, path, referrer, user_agent, link_id, link_url,
      metadata, hit_count
    ) VALUES (
      ${input.appId}, ${occurredAt}, ${input.eventType}, ${input.visitorHash},
      ${input.sessionHash ?? null}, ${input.countryCode ?? null}, ${input.path},
      ${input.referrer ?? null}, ${input.userAgent ?? null}, ${input.linkId ?? null},
      ${input.linkUrl ?? null}, ${metadata}::jsonb, 1
    )
    ON CONFLICT (COALESCE(session_hash, ''), app_id, event_type, path, COALESCE(link_id, ''))
    DO UPDATE SET
      hit_count = analytics_events.hit_count + 1,
      occurred_at = GREATEST(analytics_events.occurred_at, EXCLUDED.occurred_at)
  `);
}

export async function getAnalyticsSummary(input: {
  appId: string;
  from: Date;
  to: Date;
}): Promise<AnalyticsSummary> {
  const [row] = await db
    .select({
      pageViews: sql<number>`coalesce(sum(${analyticsEvents.hitCount}) filter (where ${analyticsEvents.eventType} = 'page_view'), 0)::int`,
      uniqueVisitors: sql<number>`count(distinct case when ${analyticsEvents.eventType} = 'page_view' then ${analyticsEvents.visitorHash} end)::int`,
      linkClicks: sql<number>`coalesce(sum(${analyticsEvents.hitCount}) filter (where ${analyticsEvents.eventType} = 'link_click'), 0)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.appId, input.appId),
        gte(analyticsEvents.occurredAt, input.from),
        lt(analyticsEvents.occurredAt, input.to)
      )
    );

  return {
    pageViews: row?.pageViews ?? 0,
    uniqueVisitors: row?.uniqueVisitors ?? 0,
    linkClicks: row?.linkClicks ?? 0,
  };
}

export async function getDailyTrend(input: {
  appId: string;
  from: Date;
  to: Date;
}): Promise<DailyTrendPoint[]> {
  const rows = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${analyticsEvents.occurredAt}), 'YYYY-MM-DD')`,
      pageViews: sql<number>`coalesce(sum(${analyticsEvents.hitCount}) filter (where ${analyticsEvents.eventType} = 'page_view'), 0)::int`,
      uniqueVisitors: sql<number>`count(distinct case when ${analyticsEvents.eventType} = 'page_view' then ${analyticsEvents.visitorHash} end)::int`,
      linkClicks: sql<number>`coalesce(sum(${analyticsEvents.hitCount}) filter (where ${analyticsEvents.eventType} = 'link_click'), 0)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.appId, input.appId),
        gte(analyticsEvents.occurredAt, input.from),
        lt(analyticsEvents.occurredAt, input.to)
      )
    )
    .groupBy(sql`date_trunc('day', ${analyticsEvents.occurredAt})`)
    .orderBy(sql`date_trunc('day', ${analyticsEvents.occurredAt})`);

  return rows;
}

export async function getCountryBreakdown(input: {
  appId: string;
  from: Date;
  to: Date;
}): Promise<CountryBreakdownPoint[]> {
  const rows = await db
    .select({
      countryCode: analyticsEvents.countryCode,
      pageViews: sql<number>`coalesce(sum(${analyticsEvents.hitCount}) filter (where ${analyticsEvents.eventType} = 'page_view'), 0)::int`,
      uniqueVisitors: sql<number>`count(distinct case when ${analyticsEvents.eventType} = 'page_view' then ${analyticsEvents.visitorHash} end)::int`,
      linkClicks: sql<number>`coalesce(sum(${analyticsEvents.hitCount}) filter (where ${analyticsEvents.eventType} = 'link_click'), 0)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.appId, input.appId),
        gte(analyticsEvents.occurredAt, input.from),
        lt(analyticsEvents.occurredAt, input.to),
        sql`${analyticsEvents.countryCode} is not null`
      )
    )
    .groupBy(analyticsEvents.countryCode)
    .orderBy(
      sql`coalesce(sum(${analyticsEvents.hitCount}) filter (where ${analyticsEvents.eventType} = 'page_view'), 0) desc`
    );

  return rows.map((row) => ({
    ...row,
    countryCode: row.countryCode?.toUpperCase() ?? "",
  }));
}

export async function getTopLinks(input: {
  appId: string;
  from: Date;
  to: Date;
  limit?: number;
}): Promise<TopLinkPoint[]> {
  const rows = await db
    .select({
      linkId: analyticsEvents.linkId,
      linkUrl: analyticsEvents.linkUrl,
      clicks: sql<number>`coalesce(sum(${analyticsEvents.hitCount}), 0)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.appId, input.appId),
        eq(analyticsEvents.eventType, "link_click"),
        gte(analyticsEvents.occurredAt, input.from),
        lt(analyticsEvents.occurredAt, input.to)
      )
    )
    .groupBy(analyticsEvents.linkId, analyticsEvents.linkUrl)
    .orderBy(sql`sum(${analyticsEvents.hitCount}) desc`)
    .limit(input.limit ?? 10);

  return rows;
}

const DIRECT_REFERRER_LABEL = "(direct)";

export async function getTopReferrers(input: {
  appId: string;
  from: Date;
  to: Date;
  limit?: number;
}): Promise<TopReferrerPoint[]> {
  const limit = input.limit ?? 10;

  const withReferrer = await db
    .select({
      referrer: analyticsEvents.referrer,
      visits: sql<number>`coalesce(sum(${analyticsEvents.hitCount}), 0)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.appId, input.appId),
        eq(analyticsEvents.eventType, "page_view"),
        gte(analyticsEvents.occurredAt, input.from),
        lt(analyticsEvents.occurredAt, input.to),
        sql`${analyticsEvents.referrer} is not null`,
        sql`length(trim(${analyticsEvents.referrer})) > 0`
      )
    )
    .groupBy(analyticsEvents.referrer)
    .orderBy(sql`sum(${analyticsEvents.hitCount}) desc`);

  const [directRow] = await db
    .select({
      visits: sql<number>`coalesce(sum(${analyticsEvents.hitCount}), 0)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.appId, input.appId),
        eq(analyticsEvents.eventType, "page_view"),
        gte(analyticsEvents.occurredAt, input.from),
        lt(analyticsEvents.occurredAt, input.to),
        sql`(${analyticsEvents.referrer} is null or length(trim(coalesce(${analyticsEvents.referrer}, ''))) = 0)`
      )
    );

  const directVisits = directRow?.visits ?? 0;
  const combined: TopReferrerPoint[] = [
    ...(directVisits > 0 ? [{ referrer: DIRECT_REFERRER_LABEL, visits: directVisits }] : []),
    ...withReferrer.map((row) => ({
      referrer: row.referrer ?? "",
      visits: row.visits,
    })),
  ]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit);

  return combined;
}

