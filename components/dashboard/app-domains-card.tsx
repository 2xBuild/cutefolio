"use client";

import { useState } from "react";
import { Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DomainRecord {
  id: string;
  domain: string;
  status: string;
  verificationToken: string;
  dnsTarget: string;
  isPrimary: boolean;
}

interface AppDomainsCardProps {
  appId: string;
  appSlug: string;
  firstPartyDomains: string[];
  initialDomains: DomainRecord[];
  canConnectCustomDomain: boolean;
}

export function AppDomainsCard({
  appId,
  appSlug,
  firstPartyDomains,
  initialDomains,
  canConnectCustomDomain,
}: AppDomainsCardProps) {
  const [domains, setDomains] = useState<DomainRecord[]>(initialDomains);
  const [domainInput, setDomainInput] = useState("");
  const [isLoadingDomains, setIsLoadingDomains] = useState(false);
  const [isMutatingDomain, setIsMutatingDomain] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadDomains = async () => {
    setIsLoadingDomains(true);
    setError(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains`, { cache: "no-store" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to load domains.");
      }
      const data = (await res.json()) as { domains?: DomainRecord[] };
      setDomains(data.domains ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains.");
      setDomains([]);
    } finally {
      setIsLoadingDomains(false);
    }
  };

  const handleAddDomain = async () => {
    setIsMutatingDomain(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domainInput.trim().toLowerCase(), isPrimary: false }),
      });
      const data = (await res.json()) as {
        error?: string;
        code?: string;
        instructions?: { name?: string; value?: string; cnameTarget?: string };
      };
      if (!res.ok) {
        const msg =
          res.status === 403 && data.code === "premium_required"
            ? (data.error ?? "Custom domains require Premium or Ultra.") + " Upgrade plan first."
            : data.error ?? "Failed to add domain.";
        throw new Error(msg);
      }

      setDomainInput("");
      await loadDomains();
      setMessage(
        data.instructions
          ? `Add TXT ${data.instructions.name}=${data.instructions.value} and CNAME -> ${data.instructions.cnameTarget}.`
          : "Domain added."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain.");
    } finally {
      setIsMutatingDomain(false);
    }
  };

  const handleVerify = async (domainId: string) => {
    setIsMutatingDomain(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains/${domainId}/verify`, {
        method: "POST",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to verify domain.");
      await loadDomains();
      setMessage("Domain verified and activated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify domain.");
    } finally {
      setIsMutatingDomain(false);
    }
  };

  const handleDelete = async (domainId: string) => {
    setIsMutatingDomain(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/apps/${appId}/domains/${domainId}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to remove domain.");
      await loadDomains();
      setMessage("Domain removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove domain.");
    } finally {
      setIsMutatingDomain(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domains</CardTitle>
        <CardDescription>
          Connect domains for {appSlug} and get DNS setup details here.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">First-party domains</p>
          <div className="flex flex-wrap gap-2">
            {firstPartyDomains.map((domain) => (
              <Badge key={domain} variant="warning">
                {domain}/{appSlug}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Custom domains</p>
          {!canConnectCustomDomain && (
            <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
              Custom domains require Premium or Ultra. Upgrade your plan to continue.
            </p>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="example.com"
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              disabled={!canConnectCustomDomain || isMutatingDomain}
            />
            <Button
              onClick={handleAddDomain}
              disabled={!canConnectCustomDomain || !domainInput.trim() || isMutatingDomain}
            >
              Add domain
            </Button>
          </div>

          {isLoadingDomains ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading domains...
            </div>
          ) : domains.length === 0 ? (
            <p className="text-sm text-muted-foreground">No custom domains configured.</p>
          ) : (
            <div className="space-y-2">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{domain.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      status: {domain.status} • CNAME target: {domain.dnsTarget}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={domain.status === "active" ? "success" : "warning"}>
                      {domain.status}
                    </Badge>
                    {domain.status !== "active" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        disabled={isMutatingDomain}
                        onClick={() => handleVerify(domain.id)}
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={isMutatingDomain}
                      onClick={() => handleDelete(domain.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
