import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { hasFullAnalytics } from "@/lib/gating/plan-features";
import { listUserApps } from "@/lib/services/apps-service";
import {
  getOwnerAppAnalytics,
  normalizeAnalyticsRange,
} from "@/lib/services/analytics-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";

/** ISO 3166-1 alpha-2 country code → flag emoji (e.g. "US" → "🇺🇸"). */
function countryFlag(countryCode: string): string {
  if (countryCode.length !== 2) return "";
  return countryCode
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join("");
}

interface AnalyticsPageProps {
  searchParams: Promise<{
    appId?: string;
    range?: string;
  }>;
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const params = await searchParams;
  const range = normalizeAnalyticsRange(params.range);

  const apps = await listUserApps(userId);
  if (apps.length === 0) {
    return (
      <div className="p-8">
        <Card>
          <CardHeader>
            <CardTitle>No apps yet</CardTitle>
            <CardDescription>Create an app before viewing analytics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/create-app">
              <Button>Create app</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const planTier = session.user.planTier ?? "free";
  if (!hasFullAnalytics(planTier)) {
    const selectedApp = apps[0];
    const demoSummary = { pageViews: 18420, uniqueVisitors: 12450, linkClicks: 2890 };
    const demoTrend = [
      { day: "2025-02-23", pageViews: 4120, uniqueVisitors: 2890, linkClicks: 612 },
      { day: "2025-02-24", pageViews: 4680, uniqueVisitors: 3120, linkClicks: 734 },
      { day: "2025-02-25", pageViews: 4520, uniqueVisitors: 2980, linkClicks: 698 },
      { day: "2025-02-26", pageViews: 5100, uniqueVisitors: 3460, linkClicks: 846 },
    ];
    const demoCountries = [
      { countryCode: "US", pageViews: 6240, uniqueVisitors: 4180, linkClicks: 892 },
      { countryCode: "GB", pageViews: 2890, uniqueVisitors: 1920, linkClicks: 445 },
      { countryCode: "DE", pageViews: 2150, uniqueVisitors: 1480, linkClicks: 312 },
      { countryCode: "IN", pageViews: 1680, uniqueVisitors: 1120, linkClicks: 278 },
      { countryCode: "FR", pageViews: 1420, uniqueVisitors: 980, linkClicks: 198 },
      { countryCode: "CA", pageViews: 1180, uniqueVisitors: 820, linkClicks: 156 },
      { countryCode: "NL", pageViews: 890, uniqueVisitors: 620, linkClicks: 124 },
      { countryCode: "AU", pageViews: 760, uniqueVisitors: 540, linkClicks: 98 },
    ];
    const demoTopLinks = [
      { linkId: "GitHub", linkUrl: "https://github.com/username", clicks: 42 },
      { linkId: "LinkedIn", linkUrl: "https://linkedin.com/in/username", clicks: 28 },
      { linkId: "Twitter", linkUrl: "https://x.com/username", clicks: 15 },
      { linkId: "Email", linkUrl: "mailto:you@example.com", clicks: 12 },
    ];
    const demoReferrers = [
      { referrer: "google.com", visits: 312 },
      { referrer: "linkedin.com", visits: 189 },
      { referrer: "twitter.com", visits: 98 },
      { referrer: "github.com", visits: 67 },
      { referrer: "(direct)", visits: 226 },
    ];

    return (
      <div className="relative h-[100dvh] overflow-hidden p-8 md:h-auto md:min-h-[60vh] md:overflow-visible">
        <div className="pointer-events-none select-none blur-[3px] transition-[filter]">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
              <p className="text-muted-foreground">{selectedApp.slug} • 7d • demo</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["7d", "30d", "90d"] as const).map((candidate) => (
                <Button key={candidate} variant={candidate === "7d" ? "default" : "outline"} size="sm" disabled>
                  {candidate}
                </Button>
              ))}
            </div>
          </header>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="default">{selectedApp.slug}</Badge>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <StatCard label="Page views" value={demoSummary.pageViews} />
            <StatCard label="Unique visitors" value={demoSummary.uniqueVisitors} />
            <StatCard label="Link clicks" value={demoSummary.linkClicks} />
          </div>

          <Card className="mt-6 flex h-[320px] flex-col">
            <CardHeader className="shrink-0">
              <CardTitle>Daily trend</CardTitle>
              <CardDescription>Aggregated daily statistics for this app.</CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b bg-background">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Day</th>
                    <th className="px-3 py-2 font-medium">Views</th>
                    <th className="px-3 py-2 font-medium">Visitors</th>
                    <th className="px-3 py-2 font-medium">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {demoTrend.map((point) => (
                    <tr key={point.day} className="border-b last:border-0">
                      <td className="px-3 py-2">{point.day}</td>
                      <td className="px-3 py-2">{point.pageViews.toLocaleString()}</td>
                      <td className="px-3 py-2">{point.uniqueVisitors.toLocaleString()}</td>
                      <td className="px-3 py-2">{point.linkClicks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <Card className="flex h-[320px] flex-col">
              <CardHeader className="shrink-0">
                <CardTitle>Country breakdown</CardTitle>
                <CardDescription>Traffic by country.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 border-b bg-background">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Country</th>
                      <th className="px-3 py-2 font-medium">Views</th>
                      <th className="px-3 py-2 font-medium">Visitors</th>
                      <th className="px-3 py-2 font-medium">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoCountries.map((country) => (
                      <tr key={country.countryCode} className="border-b last:border-0">
                        <td className="flex items-center gap-2 px-3 py-2">
                          <span className="text-lg leading-none">{countryFlag(country.countryCode)}</span>
                          {country.countryCode}
                        </td>
                        <td className="px-3 py-2">{country.pageViews.toLocaleString()}</td>
                        <td className="px-3 py-2">{country.uniqueVisitors.toLocaleString()}</td>
                        <td className="px-3 py-2">{country.linkClicks.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="flex h-[320px] flex-col">
              <CardHeader className="shrink-0">
                <CardTitle>Top links</CardTitle>
                <CardDescription>Most clicked links.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 border-b bg-background">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Link</th>
                      <th className="px-3 py-2 font-medium">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoTopLinks.map((link, index) => (
                      <tr key={`${link.linkId}-${index}`} className="border-b last:border-0">
                        <td className="px-3 py-2">
                          <p className="font-medium">{link.linkId}</p>
                          <p className="truncate text-xs text-muted-foreground">{link.linkUrl}</p>
                        </td>
                        <td className="px-3 py-2">{link.clicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <Card className="flex h-[320px] flex-col">
              <CardHeader className="shrink-0">
                <CardTitle>Top referrers</CardTitle>
                <CardDescription>Top sources that sent visitors.</CardDescription>
              </CardHeader>
              <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 border-b bg-background">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Referrer</th>
                      <th className="px-3 py-2 font-medium">Visits</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoReferrers.map((referrer, index) => (
                      <tr key={`${referrer.referrer}-${index}`} className="border-b last:border-0">
                        <td className="truncate px-3 py-2 font-medium" title={referrer.referrer}>
                          {referrer.referrer}
                        </td>
                        <td className="px-3 py-2">{referrer.visits}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-muted-foreground/30 bg-background/80 shadow-lg backdrop-blur-sm">
            <Lock className="h-12 w-12 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-center text-sm font-medium text-foreground">
            Upgrade to Pro or Ultra to unlock analytics.
          </p>
          <Link href="/dashboard/plan">
            <Button size="lg">Upgrade to unlock</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedAppId = params.appId && apps.some((app) => app.id === params.appId)
    ? params.appId
    : apps[0].id;

  const analytics = await getOwnerAppAnalytics({
    ownerId: userId,
    appId: selectedAppId,
    range,
    planTier: session.user.planTier,
  });

  if (!analytics.ok) {
    return (
      <div className="p-8">
        <p className="text-destructive">Unable to load analytics.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            {analytics.app.slug} • {analytics.range} • plan: {session.user.planTier}
          </p>
          {analytics.locks.rangeRestricted ? (
            <p className="text-xs text-amber-600">
              Your current plan is limited to {analytics.range}.{" "}
              <Link href="/dashboard/plan" className="underline underline-offset-2">
                Upgrade
              </Link>{" "}
              for longer ranges and full breakdowns.
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["7d", "30d", "90d"] as const).map((candidate) => (
            <Link
              key={candidate}
              href={`/dashboard/analytics?appId=${selectedAppId}&range=${candidate}`}
            >
              <Button variant={candidate === analytics.range ? "default" : "outline"} size="sm">
                {candidate}
              </Button>
            </Link>
          ))}
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {apps.map((app) => (
          <Link key={app.id} href={`/dashboard/analytics?appId=${app.id}&range=${analytics.range}`}>
            <Badge variant={app.id === selectedAppId ? "default" : "warning"}>{app.slug}</Badge>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Page views" value={analytics.summary.pageViews} />
        <StatCard label="Unique visitors" value={analytics.summary.uniqueVisitors} />
        <StatCard label="Link clicks" value={analytics.summary.linkClicks} />
      </div>

      <Card className="flex h-[320px] flex-col">
        <CardHeader className="shrink-0">
          <CardTitle>Daily trend</CardTitle>
          <CardDescription>Aggregated daily statistics for this app.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
          {analytics.trend.length === 0 ? (
            <p className="text-sm text-muted-foreground">No analytics data in this range.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 border-b bg-background">
                <tr className="text-left text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Day</th>
                  <th className="px-3 py-2 font-medium">Views</th>
                  <th className="px-3 py-2 font-medium">Visitors</th>
                  <th className="px-3 py-2 font-medium">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {analytics.trend.map((point) => (
                  <tr key={point.day} className="border-b last:border-0">
                    <td className="px-3 py-2">{point.day}</td>
                    <td className="px-3 py-2">{point.pageViews.toLocaleString()}</td>
                    <td className="px-3 py-2">{point.uniqueVisitors.toLocaleString()}</td>
                    <td className="px-3 py-2">{point.linkClicks.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="flex h-[320px] flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Country breakdown</CardTitle>
            <CardDescription>
              {analytics.locks.countryBreakdown
                ? "Upgrade to premium/ultra for country analytics."
                : "Traffic by country."}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
            {analytics.locks.countryBreakdown ? (
              <p className="text-sm text-muted-foreground">
                Locked on free plan.{" "}
                <Link href="/dashboard/plan" className="underline underline-offset-2">
                  Upgrade
                </Link>{" "}
                for country breakdown.
              </p>
            ) : analytics.countryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">No country data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b bg-background">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Country</th>
                    <th className="px-3 py-2 font-medium">Views</th>
                    <th className="px-3 py-2 font-medium">Visitors</th>
                    <th className="px-3 py-2 font-medium">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.countryBreakdown.map((country) => (
                    <tr key={country.countryCode} className="border-b last:border-0">
                      <td className="flex items-center gap-2 px-3 py-2">
                        <span className="text-lg leading-none">{countryFlag(country.countryCode)}</span>
                        {country.countryCode}
                      </td>
                      <td className="px-3 py-2">{country.pageViews.toLocaleString()}</td>
                      <td className="px-3 py-2">{country.uniqueVisitors.toLocaleString()}</td>
                      <td className="px-3 py-2">{country.linkClicks.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-[320px] flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Top links</CardTitle>
            <CardDescription>
              {analytics.locks.topLinks
                ? "Upgrade to premium/ultra for link breakdown."
                : "Most clicked links."}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
            {analytics.locks.topLinks ? (
              <p className="text-sm text-muted-foreground">
                Locked on free plan.{" "}
                <Link href="/dashboard/plan" className="underline underline-offset-2">
                  Upgrade
                </Link>{" "}
                for link breakdown.
              </p>
            ) : analytics.topLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tracked link clicks yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b bg-background">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Link</th>
                    <th className="px-3 py-2 font-medium">Clicks</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topLinks.map((link, index) => (
                    <tr key={`${link.linkId}-${index}`} className="border-b last:border-0">
                      <td className="px-3 py-2">
                        <p className="font-medium">{link.linkId ?? "unlabeled link"}</p>
                        <p className="truncate text-xs text-muted-foreground">{link.linkUrl ?? "-"}</p>
                      </td>
                      <td className="px-3 py-2">{link.clicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        <Card className="flex h-[320px] flex-col">
          <CardHeader className="shrink-0">
            <CardTitle>Top referrers</CardTitle>
            <CardDescription>
              {analytics.locks.referrers
                ? "Upgrade to premium/ultra for referrer analytics."
                : "Top sources that sent visitors."}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 overflow-y-auto scrollbar-theme">
            {analytics.locks.referrers ? (
              <p className="text-sm text-muted-foreground">
                Locked on free plan.{" "}
                <Link href="/dashboard/plan" className="underline underline-offset-2">
                  Upgrade
                </Link>{" "}
                for referrer analytics.
              </p>
            ) : analytics.topReferrers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No referrer data yet.</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 border-b bg-background">
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2 font-medium">Referrer</th>
                    <th className="px-3 py-2 font-medium">Visits</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topReferrers.map((referrer, index) => (
                    <tr key={`${referrer.referrer}-${index}`} className="border-b last:border-0">
                      <td className="truncate px-3 py-2 font-medium" title={referrer.referrer}>
                        {referrer.referrer}
                      </td>
                      <td className="px-3 py-2">{referrer.visits.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
