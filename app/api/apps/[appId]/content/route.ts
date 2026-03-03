import { getCurrentUser } from "@/lib/current-user";
import { jsonNoStore, parseJsonBody } from "@/lib/api/response";
import { readUserAppContent, saveUserAppContent } from "@/lib/services/apps-service";
import { parseUpsertContentInput } from "@/lib/validators/app-schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ appId: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const { appId } = await context.params;
  const { searchParams } = new URL(request.url);
  const versionRaw = searchParams.get("version");

  const parsedVersion =
    versionRaw && versionRaw !== "current"
      ? Number.parseInt(versionRaw, 10)
      : undefined;

  const version =
    parsedVersion !== undefined && Number.isInteger(parsedVersion) && parsedVersion > 0
      ? parsedVersion
      : undefined;

  const content = await readUserAppContent({
    ownerId: user.id,
    appId,
    version,
  });

  if (!content.ok) {
    return jsonNoStore({ error: "Content not found." }, { status: 404 });
  }

  return jsonNoStore(content);
}

export async function PUT(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return jsonNoStore({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await parseJsonBody(request);
  if (!body.ok) return body.response;

  const parsed = parseUpsertContentInput(body.data);
  if (!parsed.ok) {
    return jsonNoStore({ error: parsed.error }, { status: 400 });
  }

  const { appId } = await context.params;
  const saved = await saveUserAppContent({
    ownerId: user.id,
    appId,
    content: parsed.data.content,
    schemaVersion: parsed.data.schemaVersion ?? 1,
  });

  if (!saved.ok) {
    return jsonNoStore({ error: "App not found." }, { status: 404 });
  }

  return jsonNoStore(saved);
}
