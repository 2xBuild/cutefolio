import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BarChart2, ExternalLink, Pencil } from "lucide-react";
import { auth } from "@/lib/auth";
import { getUserApp } from "@/lib/services/apps-service";
import { listAppDomains } from "@/lib/repositories/domains-repo";
import { getPlanFeatures } from "@/lib/gating/plan-features";
import { FIRST_PARTY_HOSTS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AppDomainsCard } from "@/components/dashboard/app-domains-card";

interface PageProps {
  params: Promise<{ appId: string }>;
}

function formatDate(value: Date | null) {
  if (!value) return "—";
  return value.toLocaleString();
}

export default async function ManageAppDetailsPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { appId } = await params;
  const record = await getUserApp(session.user.id, appId);
  if (!record) {
    notFound();
  }

  const app = record.app;
  const currentContent = record.currentContent;
  const domains = await listAppDomains(app.id);
  const canConnectCustomDomain = getPlanFeatures(session.user.planTier).canAttachCustomDomain;
  const firstPartyDomains = [...FIRST_PARTY_HOSTS].filter(
    (host) => host !== "localhost" && host !== "127.0.0.1"
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6 md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{app.slug}</h1>
          <p className="text-sm text-muted-foreground">Everything about this app in one place.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="flat" size="icon-sm" aria-label="Back to apps">
            <Link href="/dashboard/manage-apps">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-2">
            <Link href={`/dashboard/analytics?appId=${app.id}`}>
              <BarChart2 className="h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild variant="flat" size="icon-sm" aria-label={`View ${app.slug}`}>
            <a href={`/${app.slug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="sm" className="gap-2">
            <Link href={`/dashboard/manage-apps/${app.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>App details</CardTitle>
          <CardDescription>Core configuration and publish state.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Username</p>
            <p className="text-sm font-medium">{app.slug}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <Badge variant={app.status === "published" ? "success" : "warning"}>{app.status}</Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Type</p>
            <p className="text-sm font-medium">{app.type}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Template</p>
            <p className="text-sm font-medium">{app.templateId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Visibility</p>
            <p className="text-sm font-medium">{app.isPublic ? "Public" : "Private"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Created</p>
            <p className="text-sm font-medium">{formatDate(app.createdAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Updated</p>
            <p className="text-sm font-medium">{formatDate(app.updatedAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Published at</p>
            <p className="text-sm font-medium">{formatDate(app.publishedAt)}</p>
          </div>
          <div className="space-y-1 sm:col-span-2 lg:col-span-2">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">App ID</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{app.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content details</CardTitle>
          <CardDescription>Current stored profile content metadata.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Current version</p>
            <p className="text-sm font-medium">{currentContent?.version ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Schema version</p>
            <p className="text-sm font-medium">{currentContent?.schemaVersion ?? "—"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Content fields</p>
            <p className="text-sm font-medium">
              {currentContent ? Object.keys(currentContent.content).length : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <AppDomainsCard
        appId={app.id}
        appSlug={app.slug}
        firstPartyDomains={firstPartyDomains}
        initialDomains={domains}
        canConnectCustomDomain={canConnectCustomDomain}
      />
    </div>
  );
}
