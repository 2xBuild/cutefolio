import { jsonNoStore, rateLimitResponse, parseJsonBody } from "@/lib/api/response";
import { collectAnalyticsEvent } from "@/lib/services/analytics-service";
import {
  resolvePublishedAppByCustomDomain,
  resolvePublishedAppBySlugAndHost,
} from "@/lib/services/apps-service";
import { findAppById } from "@/lib/repositories/apps-repo";
import {
  createSessionHash,
  createVisitorHash,
} from "@/lib/tracking/visitor-fingerprint";
import { resolveCountryCode } from "@/lib/tracking/geo";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { FIRST_PARTY_HOSTS, normalizeHost } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_METADATA_KEYS = 20;
const MAX_METADATA_VALUE_LENGTH = 500;

interface CollectPayload {
  appId?: string;
  path?: string;
  referrer?: string;
  linkId?: string;
  link_id?: string;
  linkUrl?: string;
  link_url?: string;
  metadata?: Record<string, unknown>;
}

function normalizePath(rawPath: string | undefined): string {
  const trimmed = String(rawPath ?? "/").trim();
  if (!trimmed) return "/";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.slice(0, 500);
}

function sanitizeMetadata(raw: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  const entries = Object.entries(raw).slice(0, MAX_METADATA_KEYS);
  const result: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    result[key] = typeof value === "string" ? value.slice(0, MAX_METADATA_VALUE_LENGTH) : value;
  }
  return result;
}

async function resolveAppIdFromContext(payloadPath: string, headers: Headers): Promise<string | null> {
  const host = normalizeHost(headers.get("x-forwarded-host") ?? headers.get("host"));
  if (!host) return null;

  if (FIRST_PARTY_HOSTS.has(host)) {
    const slug = payloadPath.split("/").filter(Boolean)[0];
    if (!slug) return null;

    const app = await resolvePublishedAppBySlugAndHost({ slug, host });
    return app?.app.id ?? null;
  }

  const app = await resolvePublishedAppByCustomDomain(host);
  return app?.app.id ?? null;
}

/**
 * Client-facing endpoint — only accepts link_click events.
 * page_view events are recorded server-side in [username]/page.tsx
 * so they cannot be forged from the browser.
 */
export async function POST(request: Request) {
  const limit = rateLimit({
    key: getRateLimitKey(request, "analytics_collect"),
    max: 60,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  const parsed = await parseJsonBody<CollectPayload>(request);
  if (!parsed.ok) return parsed.response;
  const payload = parsed.data;

  const path = normalizePath(payload.path);

  const resolvedAppId = await resolveAppIdFromContext(path, request.headers);
  const appId = String(resolvedAppId ?? payload.appId ?? "").trim();

  if (!appId) {
    return jsonNoStore({ error: "Unable to resolve app from request context." }, { status: 404 });
  }

  if (!resolvedAppId) {
    const app = await findAppById(appId);
    if (!app) {
      return jsonNoStore({ error: "App not found." }, { status: 404 });
    }
  }

  const headers = request.headers;

  await collectAnalyticsEvent({
    appId,
    eventType: "link_click",
    visitorHash: createVisitorHash({ headers }),
    sessionHash: createSessionHash({ headers }),
    countryCode: resolveCountryCode(headers),
    path,
    referrer: payload.referrer ?? headers.get("referer"),
    userAgent: headers.get("user-agent"),
    linkId: payload.linkId ?? payload.link_id ?? null,
    linkUrl: payload.linkUrl ?? payload.link_url ?? null,
    metadata: sanitizeMetadata(payload.metadata),
  });

  return jsonNoStore({ ok: true }, { status: 202 });
}
