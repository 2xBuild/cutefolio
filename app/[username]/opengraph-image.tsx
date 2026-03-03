import { headers } from "next/headers";
import { fetchProfile } from "@/lib/profile";
import {
  buildProfileOgNotFound,
  buildTemplateProfileOgImage,
} from "@/lib/og/profile-template-image";
import { OG_IMAGE_CONTENT_TYPE, OG_IMAGE_SIZE } from "@/lib/og/shared";

type OgImageProps = {
  params: Promise<{ username: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "kno.li profile";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default async function Image({ params }: OgImageProps) {
  const { username } = await params;
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    undefined;

  const result = await fetchProfile(username, { host });
  if (result.status !== "ok") {
    return buildProfileOgNotFound();
  }

  return buildTemplateProfileOgImage(result.profile, username, result.source);
}
