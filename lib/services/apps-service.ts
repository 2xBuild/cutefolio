import {
  countHostedAppsByOwner,
  createAppWithInitialContent,
  updateCurrentContentInPlace,
  deleteAppById,
  findAppBySlug,
  findPublishedAppBySlug,
  getAppWithCurrentContentForOwner,
  getContentVersion,
  getCurrentContent,
  listAppsByOwner,
  updateAppById,
} from "@/lib/repositories/apps-repo";
import { db } from "@/lib/db";
import { findActiveDomainMapping } from "@/lib/repositories/domains-repo";
import { isFirstPartyHost, DISPLAY_DOMAINS } from "@/lib/constants";
import { canCreateHostedApp, getPlanFeatures } from "@/lib/gating/plan-features";
import { users, type AppStatus, type AppType, type PlanTier } from "@/db/schema";
import { normalizeAppSlug } from "@/lib/validators/app-schema";
import { validateUsernamePolicy } from "@/lib/username-policy";
import { eq } from "drizzle-orm";

export interface CreateAppForUserInput {
  slug: string;
  type: AppType;
  templateId: string;
  status?: AppStatus;
  isPublic?: boolean;
  content: Record<string, unknown>;
  schemaVersion?: number;
}

export type CreateAppForUserResult =
  | { ok: true; appId: string; slug: string }
  | {
      ok: false;
      code: "slug_taken" | "plan_limit" | "invalid_username_policy";
      message: string;
    };

export async function createAppForUser(input: {
  ownerId: string;
  planTier: PlanTier;
  usernamePolicyConsent: boolean;
  payload: CreateAppForUserInput;
}): Promise<CreateAppForUserResult> {
  const slug = normalizeAppSlug(input.payload.slug);
  let hostedCount = 0;

  const usernamePolicy = validateUsernamePolicy({
    username: slug,
    planTier: input.planTier,
    requireConsent: true,
    hasConsent: input.usernamePolicyConsent,
  });
  if (!usernamePolicy.ok) {
    return {
      ok: false,
      code: "invalid_username_policy",
      message: usernamePolicy.message,
    };
  }

  const existing = await findAppBySlug(slug);
  if (existing) {
    return {
      ok: false,
      code: "slug_taken",
      message: "This slug is already taken.",
    };
  }

  hostedCount = await countHostedAppsByOwner(input.ownerId);
  if (!canCreateHostedApp(input.planTier, hostedCount)) {
    const features = getPlanFeatures(input.planTier);
    return {
      ok: false,
      code: "plan_limit",
      message: `Plan limit reached. ${input.planTier} allows up to ${features.maxApps} app(s).`,
    };
  }

  const created = await createAppWithInitialContent({
    ownerId: input.ownerId,
    slug,
    type: input.payload.type,
    templateId: input.payload.templateId,
    status: input.payload.status ?? "draft",
    isPublic: input.payload.isPublic ?? true,
    createdBy: input.ownerId,
    content: input.payload.content,
    schemaVersion: input.payload.schemaVersion ?? 1,
  });

  {
    const now = new Date();
    const updates: Record<string, unknown> = {
      usernamePolicyConsent: input.usernamePolicyConsent,
      updatedAt: now,
    };

    if (input.usernamePolicyConsent) {
      updates.usernamePolicyConsentAt = now;
    }

    if (hostedCount === 0) {
      updates.username = slug;
    }

    await db.update(users).set(updates).where(eq(users.id, input.ownerId));
  }

  return { ok: true, appId: created.app.id, slug: created.app.slug };
}


export async function listUserApps(ownerId: string) {
  try {
    const rows = await listAppsByOwner(ownerId);

    return Promise.all(
      rows.map(async (app) => {
        const currentContent = await getCurrentContent(app.id);
        return {
          ...app,
          currentContent,
          firstPartyDomains: DISPLAY_DOMAINS,
        };
      })
    );
  } catch (error) {
    console.error("Failed to list user apps", error);
    return [];
  }
}

export async function getUserApp(ownerId: string, appId: string) {
  return getAppWithCurrentContentForOwner(appId, ownerId);
}

export async function updateUserApp(input: {
  ownerId: string;
  planTier: PlanTier;
  usernamePolicyConsent: boolean;
  appId: string;
  patch: Partial<{
    slug: string;
    type: AppType;
    templateId: string;
    status: AppStatus;
    isPublic: boolean;
  }>;
}) {
  const existing = await getAppWithCurrentContentForOwner(input.appId, input.ownerId);
  if (!existing) {
    return { ok: false, code: "not_found" as const };
  }

  if (input.patch.slug && input.patch.slug !== existing.app.slug) {
    const nextSlug = normalizeAppSlug(input.patch.slug);
    const usernamePolicy = validateUsernamePolicy({
      username: nextSlug,
      planTier: input.planTier,
      requireConsent: true,
      hasConsent: input.usernamePolicyConsent,
    });
    if (!usernamePolicy.ok) {
      return { ok: false, code: "invalid_username_policy" as const };
    }

    const bySlug = await findAppBySlug(nextSlug);
    if (bySlug) {
      return { ok: false, code: "slug_taken" as const };
    }

    input.patch.slug = nextSlug;
  }

  const now = new Date();
  const status = input.patch.status;
  const isPublishing = status === "published" && existing.app.status !== "published";

  const updated = await updateAppById(input.appId, input.ownerId, {
    ...input.patch,
    publishedAt: isPublishing ? now : existing.app.publishedAt,
  });

  return updated
    ? { ok: true, app: updated }
    : { ok: false, code: "not_found" as const };
}

export async function deleteUserApp(ownerId: string, appId: string) {
  const deleted = await deleteAppById(appId, ownerId);
  return { ok: deleted };
}

export async function saveUserAppContent(input: {
  ownerId: string;
  appId: string;
  content: Record<string, unknown>;
  schemaVersion: number;
}) {
  const existing = await getAppWithCurrentContentForOwner(input.appId, input.ownerId);
  if (!existing) {
    return { ok: false, code: "not_found" as const };
  }

  const updated = await updateCurrentContentInPlace({
    appId: input.appId,
    content: input.content,
    schemaVersion: input.schemaVersion,
  });

  if (!updated) {
    return { ok: false, code: "not_found" as const };
  }

  return { ok: true, content: updated };
}

export async function readUserAppContent(input: {
  ownerId: string;
  appId: string;
  version?: number;
}) {
  const existing = await getAppWithCurrentContentForOwner(input.appId, input.ownerId);
  if (!existing) {
    return { ok: false, code: "not_found" as const };
  }

  const content =
    typeof input.version === "number"
      ? await getContentVersion(input.appId, input.version)
      : await getCurrentContent(input.appId);

  if (!content) {
    return { ok: false, code: "not_found" as const };
  }

  return { ok: true, content };
}

export async function resolvePublishedAppBySlugAndHost(input: {
  slug: string;
  host: string;
}) {
  const host = (input.host.replace(/^https?:\/\//, "").split(":")[0] ?? "").toLowerCase();
  if (!isFirstPartyHost(host)) return null;

  const record = await findPublishedAppBySlug(normalizeAppSlug(input.slug));
  if (!record?.currentContent) return null;

  return {
    app: record.app,
    content: record.currentContent,
  };
}

export async function resolvePublishedAppByCustomDomain(host: string) {
  const normalizedHost = (host.replace(/^https?:\/\//, "").split(":")[0] ?? "").toLowerCase();
  const domainMapping = await findActiveDomainMapping(normalizedHost);
  if (!domainMapping) return null;

  const app = await findPublishedAppBySlug(domainMapping.slug);
  if (!app?.currentContent) return null;

  return {
    app: app.app,
    content: app.currentContent,
  };
}
