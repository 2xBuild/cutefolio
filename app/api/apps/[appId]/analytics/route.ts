import { getCurrentUser } from "@/lib/current-user";
import { jsonNoStore } from "@/lib/api/response";
import {
  getOwnerAppAnalytics,
  normalizeAnalyticsRange,
} from "@/lib/services/analytics-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ appId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const { appId } = await context.params;
  const { searchParams } = new URL(request.url);
  const range = normalizeAnalyticsRange(searchParams.get("range"));

  const result = await getOwnerAppAnalytics({
    ownerId: user.id,
    appId,
    range,
    planTier: user.planTier,
  });

  if (!result.ok) {
    return jsonNoStore({ error: "App not found." }, { status: 404 });
  }

  return jsonNoStore(result);
}
