import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { rateLimitResponse } from "@/lib/api/response";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  return handlers.GET(request);
}

export async function POST(request: NextRequest) {
  const limit = rateLimit({
    key: getRateLimitKey(request, "auth_post"),
    max: 50,
    windowMs: 60_000,
  });

  if (!limit.allowed) {
    return rateLimitResponse(limit);
  }

  return handlers.POST(request);
}
