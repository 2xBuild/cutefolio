import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  billingSubscriptions,
  users,
  type PlanTier,
  type SubscriptionStatus,
} from "@/db/schema";

export async function setUserPlanTier(userId: string, planTier: PlanTier): Promise<void> {
  await db
    .update(users)
    .set({
      planTier,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function upsertSubscription(input: {
  userId: string;
  providerCustomerId: string;
  providerSubscriptionId: string;
  planTier: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
}): Promise<void> {
  const now = new Date();
  await db
    .insert(billingSubscriptions)
    .values({
      userId: input.userId,
      provider: "polar",
      providerCustomerId: input.providerCustomerId,
      providerSubscriptionId: input.providerSubscriptionId,
      planTier: input.planTier,
      status: input.status,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
      canceledAt: input.canceledAt ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: billingSubscriptions.providerSubscriptionId,
      set: {
        status: input.status,
        planTier: input.planTier,
        currentPeriodStart: input.currentPeriodStart ?? null,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        canceledAt: input.canceledAt ?? null,
        updatedAt: now,
      },
    });
}

export async function getLatestActiveSubscription(userId: string) {
  try {
    const [row] = await db
      .select()
      .from(billingSubscriptions)
      .where(
        and(
          eq(billingSubscriptions.userId, userId),
          eq(billingSubscriptions.provider, "polar")
        )
      )
      .orderBy(desc(billingSubscriptions.updatedAt))
      .limit(1);

    return row ?? null;
  } catch (error) {
    console.error("Failed to load latest subscription", error);
    return null;
  }
}
