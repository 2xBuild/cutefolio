import { appStatusEnum, appTypeEnum } from "@/db/schema";
import { PROFILE_FONT_VALUES } from "@/lib/constants";
import { isRecord } from "@/lib/utils/validation";

export const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,37}[a-z0-9])$/;

export interface CreateAppInput {
  slug: string;
  type: (typeof appTypeEnum.enumValues)[number];
  templateId: string;
  status?: (typeof appStatusEnum.enumValues)[number];
  isPublic?: boolean;
  content: Record<string, unknown>;
}

export interface UpdateAppInput {
  slug?: string;
  type?: (typeof appTypeEnum.enumValues)[number];
  templateId?: string;
  status?: (typeof appStatusEnum.enumValues)[number];
  isPublic?: boolean;
  publishedAt?: Date | null;
}

export interface UpsertContentInput {
  content: Record<string, unknown>;
  schemaVersion?: number;
}

function normalizeSlug(raw: string): string {
  return raw.trim().toLowerCase();
}

function isEnumValue<T extends readonly string[]>(
  value: unknown,
  options: T
): value is T[number] {
  return typeof value === "string" && options.includes(value as T[number]);
}

function validateThemeFonts(content: Record<string, unknown>): string | null {
  const theme = content.theme;
  if (theme === undefined) return null;
  if (!isRecord(theme)) return "theme must be a JSON object.";

  const fonts = theme.fonts;
  if (fonts === undefined) return null;
  if (!isRecord(fonts)) return "theme.fonts must be a JSON object.";

  for (const key of ["heading", "body"] as const) {
    const value = fonts[key];
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (typeof value !== "string" || !PROFILE_FONT_VALUES.has(value.trim())) {
      return `theme.fonts.${key} must use a supported font.`;
    }
  }

  return null;
}

export function parseCreateAppInput(payload: unknown):
  | { ok: true; data: CreateAppInput }
  | { ok: false; error: string } {
  if (!isRecord(payload)) {
    return { ok: false, error: "Invalid request body." };
  }

  const slug = normalizeSlug(String(payload.slug ?? ""));
  if (!SLUG_RE.test(slug)) {
    return {
      ok: false,
      error: "Invalid slug. Use lowercase letters, numbers, and hyphens.",
    };
  }

  if (!isEnumValue(payload.type, appTypeEnum.enumValues)) {
    return { ok: false, error: "Invalid app type." };
  }

  const templateId = String(payload.templateId ?? "").trim();
  if (!templateId) {
    return { ok: false, error: "templateId is required." };
  }

  if (!isRecord(payload.content)) {
    return { ok: false, error: "content must be a JSON object." };
  }

  const fontError = validateThemeFonts(payload.content);
  if (fontError) {
    return { ok: false, error: fontError };
  }

  if (
    payload.status !== undefined &&
    !isEnumValue(payload.status, appStatusEnum.enumValues)
  ) {
    return { ok: false, error: "Invalid status value." };
  }

  const data: CreateAppInput = {
    slug,
    type: payload.type,
    templateId,
    content: payload.content,
    status: payload.status,
    isPublic:
      typeof payload.isPublic === "boolean" ? payload.isPublic : true,
  };

  return { ok: true, data };
}

export function parseUpdateAppInput(payload: unknown):
  | { ok: true; data: UpdateAppInput }
  | { ok: false; error: string } {
  if (!isRecord(payload)) {
    return { ok: false, error: "Invalid request body." };
  }

  const next: UpdateAppInput = {};

  if (payload.slug !== undefined) {
    const slug = normalizeSlug(String(payload.slug));
    if (!SLUG_RE.test(slug)) {
      return { ok: false, error: "Invalid slug." };
    }
    next.slug = slug;
  }

  if (payload.type !== undefined) {
    if (!isEnumValue(payload.type, appTypeEnum.enumValues)) {
      return { ok: false, error: "Invalid app type." };
    }
    next.type = payload.type;
  }

  if (payload.templateId !== undefined) {
    const templateId = String(payload.templateId).trim();
    if (!templateId) {
      return { ok: false, error: "templateId cannot be empty." };
    }
    next.templateId = templateId;
  }

  if (payload.status !== undefined) {
    if (!isEnumValue(payload.status, appStatusEnum.enumValues)) {
      return { ok: false, error: "Invalid status value." };
    }
    next.status = payload.status;
  }

  if (payload.isPublic !== undefined) {
    if (typeof payload.isPublic !== "boolean") {
      return { ok: false, error: "isPublic must be boolean." };
    }
    next.isPublic = payload.isPublic;
  }

  return { ok: true, data: next };
}

export function parseUpsertContentInput(payload: unknown):
  | { ok: true; data: UpsertContentInput }
  | { ok: false; error: string } {
  if (!isRecord(payload)) {
    return { ok: false, error: "Invalid request body." };
  }

  if (!isRecord(payload.content)) {
    return { ok: false, error: "content must be a JSON object." };
  }

  const fontError = validateThemeFonts(payload.content);
  if (fontError) {
    return { ok: false, error: fontError };
  }

  const schemaVersionRaw = payload.schemaVersion;
  const schemaVersion =
    typeof schemaVersionRaw === "number" && Number.isInteger(schemaVersionRaw) && schemaVersionRaw > 0
      ? schemaVersionRaw
      : 1;

  return {
    ok: true,
    data: {
      content: payload.content,
      schemaVersion,
    },
  };
}

export function normalizeAppSlug(raw: string): string {
  return normalizeSlug(raw);
}
