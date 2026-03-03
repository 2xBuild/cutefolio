import { Webhooks } from "@polar-sh/nextjs";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription";
import {
  setUserPlanTier,
  upsertSubscription,
} from "@/lib/repositories/billing-repo";
import type { PlanTier, SubscriptionStatus } from "@/db/schema";
 
const PRODUCT_TIER: Record<string, PlanTier> = {};

function loadProductTiers() {
  const pairs: [string | undefined, PlanTier][] = [
    [process.env.NEXT_PUBLIC_POLAR_PRODUCT_PRO_MONTHLY, "premium"],
    [process.env.NEXT_PUBLIC_POLAR_PRODUCT_PRO_YEARLY, "premium"],
    [process.env.NEXT_PUBLIC_POLAR_PRODUCT_ULTRA_MONTHLY, "ultra"],
    [process.env.NEXT_PUBLIC_POLAR_PRODUCT_ULTRA_YEARLY, "ultra"],
  ];
  for (const [id, tier] of pairs) {
    if (id) PRODUCT_TIER[id] = tier;
  }
}
loadProductTiers();

function resolveTier(productId: string, status: string): PlanTier {
  if (status !== "active" && status !== "trialing") return "free";
  return PRODUCT_TIER[productId] ?? "premium";
}

function mapStatus(raw: string): SubscriptionStatus {
  if (raw === "trialing") return "trialing";
  if (raw === "active") return "active";
  if (raw === "past_due") return "past_due";
  if (raw === "canceled" || raw === "cancelled") return "canceled";
  return "incomplete";
}

async function syncSubscription(sub: Subscription) {
  const userId = sub.customer.externalId;
  if (!userId) {
    console.warn("[polar] Webhook subscription missing externalId, skipping");
    return;
  }

  const status = mapStatus(sub.status);
  const planTier = resolveTier(sub.productId, sub.status);

  await upsertSubscription({
    userId,
    providerCustomerId: sub.customer.id,
    providerSubscriptionId: sub.id,
    planTier,
    status,
    currentPeriodStart: sub.currentPeriodStart,
    currentPeriodEnd: sub.currentPeriodEnd,
    cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
    canceledAt: sub.canceledAt,
  });

  await setUserPlanTier(userId, planTier);
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
  onSubscriptionCreated: async (payload) => syncSubscription(payload.data),
  onSubscriptionActive: async (payload) => syncSubscription(payload.data),
  onSubscriptionUpdated: async (payload) => syncSubscription(payload.data),
  onSubscriptionCanceled: async (payload) => syncSubscription(payload.data),
  onSubscriptionRevoked: async (payload) => syncSubscription(payload.data),
  onSubscriptionUncanceled: async (payload) => syncSubscription(payload.data),
});
