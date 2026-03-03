import { getCurrentUser } from "@/lib/current-user";
import { jsonNoStore, parseJsonBody } from "@/lib/api/response";
import {
  deleteUserApp,
  getUserApp,
  updateUserApp,
} from "@/lib/services/apps-service";
import { parseUpdateAppInput } from "@/lib/validators/app-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ appId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const { appId } = await context.params;
  const app = await getUserApp(user.id, appId);

  if (!app) {
    return jsonNoStore({ error: "App not found." }, { status: 404 });
  }

  return jsonNoStore(app);
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = parseUpdateAppInput(body.data);
  if (!parsed.ok) {
    return jsonNoStore({ error: parsed.error }, { status: 400 });
  }

  const { appId } = await context.params;
  const result = await updateUserApp({
    ownerId: user.id,
    planTier: user.planTier,
    usernamePolicyConsent: user.usernamePolicyConsent,
    appId,
    patch: parsed.data,
  });

  if (!result.ok) {
    const code = result.code;
    const errorMap: Record<string, { error: string; status: number }> = {
      slug_taken: { error: "Slug already in use.", status: 409 },
      invalid_username_policy: { error: "Username violates policy.", status: 400 },
      not_found: { error: "App not found.", status: 404 },
    };
    const mapped = (code && errorMap[code]) ?? { error: `Update failed: ${code}`, status: 400 };
    return jsonNoStore({ error: mapped.error }, { status: mapped.status });
  }

  return jsonNoStore({ app: result.app });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const { appId } = await context.params;
  const result = await deleteUserApp(user.id, appId);
  if (!result.ok) {
    return jsonNoStore({ error: "App not found." }, { status: 404 });
  }

  return jsonNoStore({ ok: true });
}
