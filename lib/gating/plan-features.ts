import type { PlanTier } from "@/db/schema";

export interface PlanFeatures {
  maxApps: number;
  hasFullAnalytics: boolean;
  canAttachCustomDomain: boolean;
  analyticsRangeDays: number;
}

const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    maxApps: 1,
    hasFullAnalytics: false,
    canAttachCustomDomain: false,
    analyticsRangeDays: 0,
  },
  premium: {
    maxApps: 3,
    hasFullAnalytics: true,
    canAttachCustomDomain: true,
    analyticsRangeDays: 90,
  },
  ultra: {
    maxApps: 15,
    hasFullAnalytics: true,
    canAttachCustomDomain: true,
    analyticsRangeDays: 90,
  },
};

export function getPlanFeatures(planTier: PlanTier): PlanFeatures {
  return PLAN_FEATURES[planTier] ?? PLAN_FEATURES.free;
}

export function canAttachCustomDomain(planTier: PlanTier): boolean {
  return getPlanFeatures(planTier).canAttachCustomDomain;
}

export function hasFullAnalytics(planTier: PlanTier): boolean {
  return getPlanFeatures(planTier).hasFullAnalytics;
}

export function canCreateHostedApp(planTier: PlanTier, existingHostedApps: number): boolean {
  const features = getPlanFeatures(planTier);
  return existingHostedApps < features.maxApps;
}
