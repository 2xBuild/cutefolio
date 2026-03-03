"use client";

import { useRouter } from "next/navigation";
import type { AppStatus, AppType } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface AnalyticsApp {
  id: string;
  slug: string;
  type: AppType;
  status: AppStatus;
}

interface AnalyticsAppSelectorProps {
  apps: AnalyticsApp[];
  selectedAppId: string;
  range: string;
}

const TYPE_LABELS: Record<AppType, string> = {
  portfolio: "Portfolio",
  "link-organiser": "Linkfolio",
};

export function AnalyticsAppSelector({
  apps,
  selectedAppId,
  range,
}: AnalyticsAppSelectorProps) {
  const router = useRouter();

  return (
    <Select
      value={selectedAppId}
      onValueChange={(appId) => {
        router.push(`/dashboard/analytics?appId=${appId}&range=${range}`);
      }}
    >
      <SelectTrigger className="min-w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {apps.map((app) => (
          <SelectItem key={app.id} value={app.id}>
            <span className="flex items-center gap-2">
              <span className="font-medium">{app.slug}</span>
              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                {TYPE_LABELS[app.type]}
              </Badge>
              {app.status === "draft" && (
                <Badge variant="warning" className="text-[10px] px-1.5 py-0">
                  Draft
                </Badge>
              )}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
