import { NextResponse } from "next/server";
import type { RateLimitResult } from "@/lib/rate-limit";

export function jsonNoStore(data: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "no-store");

  return NextResponse.json(data, {
    ...init,
    headers,
  });
}

export function rateLimitResponse(limit: RateLimitResult) {
  const retryAfter = Math.max(Math.ceil(limit.retryAfterMs / 1000), 1);
  return jsonNoStore(
    { error: "Rate limit exceeded. Try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfter) },
    }
  );
}

export async function parseJsonBody<T = unknown>(request: Request): Promise<
  | { ok: true; data: T }
  | { ok: false; response: NextResponse }
> {
  try {
    const data = (await request.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, response: jsonNoStore({ error: "Invalid JSON body." }, { status: 400 }) };
  }
}
