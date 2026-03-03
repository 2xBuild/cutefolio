import Link from "next/link";
import { redirect } from "next/navigation";
import { GalleryVerticalEnd, Link2, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { listUserApps } from "@/lib/services/apps-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppActionsMenu } from "@/components/dashboard/app-actions-menu";

export default async function ManageAppsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let apps: Awaited<ReturnType<typeof listUserApps>> = [];

  try {
    apps = await listUserApps(session.user.id);
  } catch (error) {
    console.error("Failed to load apps for ManageAppsPage", error);
  }

  return (
    <div className="flex flex-col gap-8 p-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage apps</h1>
          <p className="text-muted-foreground">
            Configure the apps connected to your profile.
          </p>
        </div>
        <Button asChild size="icon" variant="outline" className="rounded-full">
          <Link href="/dashboard/create-app">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </header>

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
                    Template {app.templateId} • Updated {app.updatedAt.toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
