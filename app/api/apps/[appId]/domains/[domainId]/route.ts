import { getCurrentUser } from "@/lib/current-user";
import { jsonNoStore, rateLimitResponse } from "@/lib/api/response";
import { deleteCustomDomain } from "@/lib/services/domains-service";
import { getRateLimitKey, rateLimit } from "@/lib/rate-limit";
import { getDatabaseErrorHint } from "@/lib/db-errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ appId: string; domainId: string }>;
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) return jsonNoStore({ error: "Unauthorized." }, { status: 401 });

    const limit = rateLimit({
      key: `${getRateLimitKey(request, "domains_delete")}:${user.id}`,
      max: 20,
      windowMs: 60_000,
    });
    if (!limit.allowed) {
      return rateLimitResponse(limit);
    }

    const { appId, domainId } = await context.params;
    const result = await deleteCustomDomain({
      ownerId: user.id,
      appId,
      domainId,
    });

    if (!result.ok) {
      return jsonNoStore({ error: "Domain not found." }, { status: 404 });
    }

    return jsonNoStore({ ok: true });
  } catch (error) {
    console.error("Failed to delete domain", error);
    return jsonNoStore({ error: getDatabaseErrorHint(error) }, { status: 500 });
  }
}
