type Bucket = {
  count: number;
  resetAt: number;
};

const GLOBAL_KEY = "__kno_li_rate_limit_store__";

function getStore(): Map<string, Bucket> {
  const globalObject = globalThis as unknown as Record<string, unknown>;
  if (!globalObject[GLOBAL_KEY]) {
    globalObject[GLOBAL_KEY] = new Map<string, Bucket>();
  }
  return globalObject[GLOBAL_KEY] as Map<string, Bucket>;
}

let lastCleanup = 0;
const CLEANUP_INTERVAL_MS = 30_000;

function cleanupExpired(store: Map<string, Bucket>, now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }
}

export interface RateLimitInput {
  key: string;
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

export function rateLimit(input: RateLimitInput): RateLimitResult {
  const now = Date.now();
  const store = getStore();
  cleanupExpired(store, now);

  const existing = store.get(input.key);
  if (!existing || existing.resetAt <= now) {
    store.set(input.key, {
      count: 1,
      resetAt: now + input.windowMs,
    });
    return {
      allowed: true,
      remaining: Math.max(input.max - 1, 0),
      retryAfterMs: input.windowMs,
    };
  }

  if (existing.count >= input.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(existing.resetAt - now, 0),
    };
  }

  existing.count += 1;
  store.set(input.key, existing);
  return {
    allowed: true,
    remaining: Math.max(input.max - existing.count, 0),
    retryAfterMs: Math.max(existing.resetAt - now, 0),
  };
}

import { getClientIp } from "@/lib/tracking/visitor-fingerprint";

export { getClientIp };

export function getRateLimitKey(request: Request, scope: string): string {
  const ip = getClientIp(request.headers);
  return `${scope}:${ip}`;
}

