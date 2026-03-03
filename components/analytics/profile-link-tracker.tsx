"use client";

import { useEffect } from "react";

interface ProfileLinkTrackerProps {
  appId: string;
}

function clip(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

function sendEvent(payload: Record<string, unknown>) {
  const body = JSON.stringify(payload);
  const blob = new Blob([body], { type: "application/json" });

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/collect", blob);
    return;
  }

  void fetch("/api/analytics/collect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}

// Page views are tracked once per request on the server (see [username]/page.tsx).
// We only send link_click from the client to avoid double-counting page views.
export function ProfileLinkTracker({ appId }: ProfileLinkTrackerProps) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      sendEvent({
        appId,
        eventType: "link_click",
        path: window.location.pathname,
        linkId:
          anchor.getAttribute("data-link-id") ||
          clip(anchor.textContent?.trim() || "link", 64),
        linkUrl: clip(anchor.href, 400),
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [appId]);

  return null;
}
