import { fetchProfile } from "@/lib/profile";
import {
  buildProfileOgNotFound,
  buildTemplateProfileOgImage,
} from "@/lib/og/profile-template-image";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const headerList = await headers();
    const host =
      headerList.get("x-forwarded-host") ?? headerList.get("host") ?? undefined;
    const result = await fetchProfile(username, { host });

    if (result.status !== "ok") return buildProfileOgNotFound();

    return await buildTemplateProfileOgImage(
      result.profile,
      username,
      result.source
    );
  } catch {
    return buildProfileOgNotFound();
  }
}
