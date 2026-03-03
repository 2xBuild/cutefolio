import { cache } from "react";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, type PlanTier } from "@/db/schema";

export interface CurrentUser {
  id: string;
  email: string | null;
  name: string | null;
  username: string | null;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  usernamePolicyConsent: boolean;
  planTier: PlanTier;
}

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sessionUser = session.user;
  const fallbackPlanTier: PlanTier = sessionUser.planTier ?? "free";

  try {
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        usernamePolicyConsent: users.usernamePolicyConsent,
        planTier: users.planTier,
      })
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .limit(1);

    if (!row) {
      return {
        id: sessionUser.id,
        email: sessionUser.email ?? null,
        name: sessionUser.name ?? null,
        username: null,
        displayName: sessionUser.name ?? null,
        bio: null,
        avatarUrl: sessionUser.image ?? null,
        usernamePolicyConsent: false,
        planTier: fallbackPlanTier,
      };
    }

    return row;
  } catch (error) {
    console.error("Failed to load current user from database", error);

    return {
      id: sessionUser.id,
      email: sessionUser.email ?? null,
      name: sessionUser.name ?? null,
      username: null,
      displayName: sessionUser.name ?? null,
      bio: null,
      avatarUrl: sessionUser.image ?? null,
      usernamePolicyConsent: false,
      planTier: fallbackPlanTier,
    };
  }
});
