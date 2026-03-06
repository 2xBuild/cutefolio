import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Crown, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Compare plans | cutefolio",
  description:
    "Compare Free, Pro, and Ultra hosted plans for cutefolio portfolios.",
};

const PLAN_PRICING = {
  free: { monthly: "Free", yearly: "Free" },
  premium: { monthly: "$2.99/mo", yearly: "$30/yr" },
  ultra: { monthly: "$20/mo", yearly: "$200/yr" },
};

const FEATURES = [
  {
    label: "Max. hosted apps",
    free: "1",
    premium: "3",
    ultra: "15",
  },
  {
    label: "Beautiful og:images for your apps",
    free: "Yes",
    premium: "Yes",
    ultra: "Yes",
  },

  {
    label: "Analytics (unique visitors, click tracker for links/buttons, referrers and country wise traffic)",
    free: null,
    premium: "Yes",
    ultra: "Yes",
  },  {
    label: "Custom domains",
    free: null,
    premium: "Yes",
    ultra: "Yes",
  },
  {
    label: "Min. username length",
    free: "4 characters",
    premium: "1 character",
    ultra: "1 character",
  },

  {
    label: "Priority support",
    free: null,
    premium: "Included",
    ultra: "Dedicated",
  },
  {
    label: "Early access to features",
    free: null,
    premium: "Yes",
    ultra: "Yes",
  },
];

function FeatureCell({ value }: { value: string | null }) {
  if (!value) {
    return (
      <div className="inline-flex items-center gap-2 text-muted-foreground">
        <X className="h-4 w-4 shrink-0" />
        <span className="text-sm">Not included</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
      <Check className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background font-landing">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="-ml-2 mb-6 text-muted-foreground hover:text-foreground"
        >
          <Link href="/" className="inline-flex items-center gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </Button>

        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Compare hosted plans
        </h1>
        <p className="mt-2 text-muted-foreground">
          All portfolios are hosted on cutefolio infrastructure.
        </p>

        <div className="mt-10 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse rounded-2xl border border-border bg-card text-left shadow-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-4 text-sm font-medium text-muted-foreground">Feature</th>
                <th className="px-4 py-4 text-sm font-semibold text-foreground">
                  <div className="flex flex-col gap-1.5">
                    <span>Free</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {PLAN_PRICING.free.monthly}
                    </span>
                    <Button asChild size="sm" variant="outline" className="mt-1 w-fit text-xs">
                      <Link href="/dashboard/create-app">Start free</Link>
                    </Button>
                  </div>
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-foreground">
                  <div className="flex flex-col gap-1.5">
                    <span>Pro</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {PLAN_PRICING.premium.monthly} · {PLAN_PRICING.premium.yearly}
                    </span>
                    <Button asChild size="sm" className="mt-1 w-fit text-xs gap-1.5">
                      <Link href="/login?callbackUrl=/dashboard/plan">
                        <Crown className="h-3.5 w-3.5" />
                        Get Pro
                      </Link>
                    </Button>
                  </div>
                </th>
                <th className="px-4 py-4 text-sm font-semibold text-foreground">
                  <div className="flex flex-col gap-1.5">
                    <span>Ultra</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {PLAN_PRICING.ultra.monthly} · {PLAN_PRICING.ultra.yearly}
                    </span>
                    <Button asChild size="sm" className="mt-1 w-fit text-xs gap-1.5">
                      <Link href="/login?callbackUrl=/dashboard/plan">
                        <Zap className="h-3.5 w-3.5" />
                        Get Ultra
                      </Link>
                    </Button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature) => (
                <tr key={feature.label} className="border-b border-border/60">
                  <td className="px-4 py-3 text-sm text-foreground">{feature.label}</td>
                  <td className="px-4 py-3">
                    <FeatureCell value={feature.free} />
                  </td>
                  <td className="px-4 py-3">
                    <FeatureCell value={feature.premium} />
                  </td>
                  <td className="px-4 py-3">
                    <FeatureCell value={feature.ultra} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Usernames must use lowercase letters, numbers, and hyphens only. Reserved routes and offensive terms cannot be claimed.{" "}
          <Link href="/tnc" className="underline underline-offset-2 text-foreground hover:text-muted-foreground">
            Privacy &amp; Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
