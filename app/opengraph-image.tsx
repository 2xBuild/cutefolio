import { headers } from "next/headers";
import { buildMainSiteOgImage } from "@/lib/og/main-site-image";
import { buildTemplateProfileOgImage } from "@/lib/og/profile-template-image";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og/shared";
import { isFirstPartyHost, normalizeHost, X_REQUEST_HOST } from "@/lib/constants";
import { fetchProfileFromCustomDomain } from "@/lib/profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "cutefolio | Build and host your cute folio.";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image() {
  const requestHeaders = await headers();
  const rawHost =
    requestHeaders.get(X_REQUEST_HOST) ??
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host");
  const host = normalizeHost(rawHost);

  if (host && !isFirstPartyHost(host)) {
    const result = await fetchProfileFromCustomDomain(host);
    if (result.status === "ok") {
      const username = result.slug ?? host;
      return buildTemplateProfileOgImage(result.profile, username, result.source);
    }
  }

  return buildMainSiteOgImage();
}
