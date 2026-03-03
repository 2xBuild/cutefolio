import Link from "next/link";
import { AlertTriangle, GalleryVerticalEnd, Link2, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { listUserApps } from "@/lib/services/apps-service";
import { getDatabaseErrorHint } from "@/lib/db-errors";
import { getPlanFeatures } from "@/lib/gating/plan-features";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppActionsMenu } from "@/components/dashboard/app-actions-menu";

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;

  let apps: Awaited<ReturnType<typeof listUserApps>> = [];
  let loadError: string | null = null;

  try {
    apps = await listUserApps(user.id);
  } catch (error) {
    console.error("Failed to load dashboard apps", error);
    loadError = getDatabaseErrorHint(error);
  }

  const features = getPlanFeatures(user.planTier);
  const maxApps = features.maxApps;
  const appUsageLabel = `${apps.length}/${maxApps}`;

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, {user.name?.split(" ")[0] ?? "there"}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>
            Subscription:{" "}
            <span className="font-medium capitalize text-foreground">{user.planTier}</span>
          </span>
          <span className="hidden sm:inline">&middot;</span>
          <span>Apps: {appUsageLabel}</span>
          {user.planTier === "free" && (
            <Button asChild variant="outline" size="sm" className="ml-1 h-6 rounded-full px-3 text-xs">
              <Link href="/dashboard/plan">Upgrade</Link>
            </Button>
          )}
        </div>
        {loadError && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700 shadow-sm ring-1 ring-amber-500/30 dark:text-amber-200">
            <AlertTriangle className="h-3 w-3" />
            <span>{loadError}</span>
          </div>
        )}
      </header>

      <hr className="border-border" />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your apps</h2>
          <Button asChild variant="flat" size="sm" className="gap-1.5 rounded-none">
            <Link href="/dashboard/create-app">
              <Plus className="h-3.5 w-3.5" />
              Create App
            </Link>
          </Button>
        </div>

        {apps.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex h-40 flex-col items-center justify-center gap-2">
              <Link
                href="/dashboard/create-app"
                className="flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border">
                  <Plus className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium">Create your first app</span>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {apps.map((app) => {
              return (
                <Card key={app.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary/60">
                          {app.type === "link-organiser" ? (
                            <Link2 className="h-4 w-4 text-foreground" />
                          ) : (
                            <GalleryVerticalEnd className="h-4 w-4 text-foreground" />
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{app.slug}</CardTitle>
                          <span
                            className={`inline-flex h-2.5 w-2.5 rounded-full ${
                              app.status === "published" ? "bg-emerald-500" : "bg-amber-400"
                            }`}
                            aria-label={app.status === "published" ? "Published" : "Draft"}
                            title={app.status === "published" ? "Published" : "Draft"}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/dashboard/manage-apps/${app.id}`}>Manage</Link>
                        </Button>
                        <AppActionsMenu appId={app.id} slug={app.slug} />
                      </div>
                    </div>
                    <CardDescription>
                      Template {app.templateId} &middot; Updated{" "}
                      {app.updatedAt.toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
