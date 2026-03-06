import { cache } from "react";
import {
  resolvePublishedAppByCustomDomain,
  resolvePublishedAppBySlugAndHost,
} from "@/lib/services/apps-service";
import { normalizeHost } from "@/lib/constants";
import type { FetchProfileResult, Profile, ProfileSource } from "./types";

export function resolveProfileImgUrl(
  _username: string,
  img: string,
  _source: ProfileSource = "kno-li"
): string {
  if (img.startsWith("http://") || img.startsWith("https://")) return img;
  if (img.startsWith("/")) {
    const base = process.env.SITE_URL ?? "https://cutefolio";
    try {
      return new URL(img, base).toString();
    } catch {
      return img;
    }
  }
  return img;
}

function fallbackHostedHost(): string {
  if (process.env.SITE_URL) {
    try {
      return new URL(process.env.SITE_URL).host;
    } catch {
      // fall through
    }
  }
  return "cutefolio";
}

export const fetchProfile = cache(async function fetchProfile(
  username: string,
  options?: { host?: string }
): Promise<FetchProfileResult> {
  const host = normalizeHost(options?.host) ?? fallbackHostedHost();

  const hosted = await resolvePublishedAppBySlugAndHost({ slug: username, host });
  if (!hosted) {
    return { status: "not_found" };
  }

  return {
    status: "ok",
    profile: hosted.content.content as unknown as Profile,
    source: "kno-li",
    appId: hosted.app.id,
    slug: hosted.app.slug,
  };
});

export async function fetchProfileFromCustomDomain(host: string): Promise<FetchProfileResult> {
  const hosted = await resolvePublishedAppByCustomDomain(host);
  if (!hosted) return { status: "not_found" };

  return {
    status: "ok",
    profile: hosted.content.content as unknown as Profile,
    source: "kno-li",
    appId: hosted.app.id,
    slug: hosted.app.slug,
  };
}
