import { getCurrentUser } from "@/lib/current-user";
import { jsonNoStore, parseJsonBody } from "@/lib/api/response";
import { createAppForUser, listUserApps } from "@/lib/services/apps-service";
import { SLUG_RE, normalizeAppSlug, parseCreateAppInput } from "@/lib/validators/app-schema";
import { findAppBySlug } from "@/lib/repositories/apps-repo";
import { validateUsernamePolicy } from "@/lib/username-policy";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (slug) {
    const normalizedSlug = normalizeAppSlug(slug);

    if (!SLUG_RE.test(normalizedSlug)) {
      return jsonNoStore(
        {
          error: "Invalid app name. Use lowercase letters, numbers, and hyphens.",
        },
        { status: 400 }
      );
    }

    const usernamePolicy = validateUsernamePolicy({
      username: normalizedSlug,
      planTier: user.planTier,
      requireConsent: false,
      hasConsent: user.usernamePolicyConsent,
    });
    if (!usernamePolicy.ok) {
      return jsonNoStore({ error: usernamePolicy.message }, { status: 400 });
    }

    const existing = await findAppBySlug(normalizedSlug);
    if (!existing) {
      return jsonNoStore({ error: "App not found." }, { status: 404 });
    }

    return jsonNoStore({ exists: true }, { status: 200 });
  }

  const owner = searchParams.get("owner");
  if (owner && owner !== "self") {
    return jsonNoStore({ error: "Only owner=self is supported." }, { status: 400 });
  }

  const apps = await listUserApps(user.id);
  return jsonNoStore({ apps });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await parseJsonBody<Record<string, unknown>>(request);
  if (!body.ok) return body.response;
  const payloadRecord = body.data;
  if (typeof payloadRecord !== "object" || payloadRecord === null) {
    return jsonNoStore({ error: "Invalid JSON body." }, { status: 400 });
  }

  const acceptUsernamePolicy = payloadRecord.acceptUsernamePolicy === true;
  const effectiveConsent = user.usernamePolicyConsent || acceptUsernamePolicy;
  if (acceptUsernamePolicy && !user.usernamePolicyConsent) {
    await db
      .update(users)
      .set({
        usernamePolicyConsent: true,
        usernamePolicyConsentAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
  }

  const parsed = parseCreateAppInput(payloadRecord);
  if (!parsed.ok) {
    return jsonNoStore({ error: parsed.error }, { status: 400 });
  }

  const result = await createAppForUser({
    ownerId: user.id,
    planTier: user.planTier,
    usernamePolicyConsent: effectiveConsent,
    payload: parsed.data,
  });

  if (!result.ok) {
    if (result.code === "slug_taken") {
      return jsonNoStore({ error: result.message }, { status: 409 });
    }
    if (result.code === "plan_limit") {
      return jsonNoStore({ error: result.message, code: result.code }, { status: 403 });
    }
    if (result.code === "invalid_username_policy") {
      return jsonNoStore({ error: result.message, code: result.code }, { status: 400 });
    }
    return jsonNoStore({ error: result.message }, { status: 400 });
  }

  return jsonNoStore(
    {
      appId: result.appId,
      slug: result.slug,
    },
    { status: 201 }
  );
}
