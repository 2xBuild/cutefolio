import { findAppByIdForOwner } from "@/lib/repositories/apps-repo";
import {
  getAnalyticsSummary,
  getCountryBreakdown,
  getDailyTrend,
  getTopLinks,
  getTopReferrers,
  trackAnalyticsEvent,
  type TrackAnalyticsEventInput,
} from "@/lib/repositories/analytics-repo";
import { getPlanFeatures } from "@/lib/gating/plan-features";
import type { PlanTier } from "@/db/schema";
import {
  createSessionHash,
  createVisitorHash,
} from "@/lib/tracking/visitor-fingerprint";
import { resolveCountryCode } from "@/lib/tracking/geo";

const RANGE_TO_DAYS = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
} as const;

export type AnalyticsRange = keyof typeof RANGE_TO_DAYS;

export function normalizeAnalyticsRange(raw: string | null | undefined): AnalyticsRange {
  if (!raw) return "7d";
  if (raw in RANGE_TO_DAYS) return raw as AnalyticsRange;
  return "7d";
}

function toRangeKey(days: number): AnalyticsRange {
  if (days <= 7) return "7d";
  if (days <= 30) return "30d";
  return "90d";
}

function buildRange(requestedRange: AnalyticsRange, maxDays: number) {
  const now = new Date();
  const requestedDays = RANGE_TO_DAYS[requestedRange];
  const effectiveDays = Math.min(requestedDays, maxDays);

  const from = new Date(now);
  from.setUTCDate(now.getUTCDate() - effectiveDays + 1);
  from.setUTCHours(0, 0, 0, 0);

  const to = new Date(now);
  to.setUTCDate(to.getUTCDate() + 1);
  to.setUTCHours(0, 0, 0, 0);

  return {
    from,
    to,
    days: effectiveDays,
    effectiveRange: toRangeKey(effectiveDays),
  };
}

export async function collectAnalyticsEvent(input: TrackAnalyticsEventInput): Promise<void> {
  await trackAnalyticsEvent(input);
}

export async function trackPageViewForRequest(input: {
  appId: string;
  path: string;
  headers: Headers;
}) {
  await collectAnalyticsEvent({
    appId: input.appId,
    eventType: "page_view",
    visitorHash: createVisitorHash({ headers: input.headers }),
    sessionHash: createSessionHash({ headers: input.headers }),
    countryCode: resolveCountryCode(input.headers),
    path: input.path,
    referrer: input.headers.get("referer"),
    userAgent: input.headers.get("user-agent"),
  });
}

export async function getOwnerAppAnalytics(input: {
  ownerId: string;
  appId: string;
  range: AnalyticsRange;
  planTier: PlanTier;
}) {
  const app = await findAppByIdForOwner(input.appId, input.ownerId);
  if (!app) {
    return { ok: false as const, code: "not_found" as const };
  }

  const features = getPlanFeatures(input.planTier);
  const period = buildRange(input.range, features.analyticsRangeDays);

  const summary = await getAnalyticsSummary({
    appId: input.appId,
    from: period.from,
    to: period.to,
  });

  const trend = await getDailyTrend({
    appId: input.appId,
    from: period.from,
    to: period.to,
  });

  const fullAnalytics = features.hasFullAnalytics;

  const countryBreakdown = fullAnalytics
    ? await getCountryBreakdown({
        appId: input.appId,
        from: period.from,
        to: period.to,
      })
    : [];

  const topLinks = fullAnalytics
    ? await getTopLinks({
        appId: input.appId,
        from: period.from,
        to: period.to,
        limit: 10,
      })
    : [];

  const topReferrers = fullAnalytics
    ? await getTopReferrers({
        appId: input.appId,
        from: period.from,
        to: period.to,
        limit: 10,
      })
    : [];

  return {
    ok: true as const,
    app,
    range: period.effectiveRange,
    requestedRange: input.range,
    summary,
    trend,
    countryBreakdown,
    topLinks,
    topReferrers,
    locks: {
      rangeRestricted: period.effectiveRange !== input.range,
      countryBreakdown: !fullAnalytics,
      topLinks: !fullAnalytics,
      referrers: !fullAnalytics,
    },
  };
}
