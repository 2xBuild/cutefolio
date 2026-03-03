import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";
export const GEIST_PIXEL_FONT_NAME = "Geist Pixel Square";

type OgFont = {
  name: string;
  data: ArrayBuffer;
  style: "normal";
  weight: 500;
};

const EXTENSION_TO_MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const copy = new Uint8Array(buffer.byteLength);
  copy.set(buffer);
  return copy.buffer;
}

function inferMimeType(pathname: string): string {
  const lower = pathname.toLowerCase();
  const known = Object.keys(EXTENSION_TO_MIME).find((extension) =>
    lower.endsWith(extension)
  );
  return known ? EXTENSION_TO_MIME[known] : "image/png";
}

export async function loadGeistPixelFont(): Promise<OgFont[] | undefined> {
  try {
    const fontPath = join(process.cwd(), "assets/fonts/GeistPixel-Square.ttf");
    const fontBuffer = await readFile(fontPath);

    return [
      {
        name: GEIST_PIXEL_FONT_NAME,
        data: toArrayBuffer(fontBuffer),
        style: "normal",
        weight: 500,
      },
    ];
  } catch {
    return undefined;
  }
}

export async function readPublicImageAsDataUrl(
  publicPath: string
): Promise<string | null> {
  if (!publicPath) return null;
  const normalized = publicPath.startsWith("/")
    ? publicPath.slice(1)
    : publicPath;

  try {
    const filePath = join(process.cwd(), "public", normalized);
    const buffer = await readFile(filePath);
    const base64 = buffer.toString("base64");
    const mime = inferMimeType(normalized);
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

export async function fetchImageAsDataUrl(
  url: string | null | undefined
): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return null;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const base64 = buffer.toString("base64");
    const contentType = res.headers.get("content-type") ?? inferMimeType(url);
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

export function truncateText(value: string, maxChars: number): string {
  if (value.length <= maxChars) return value;
  return `${value.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}
