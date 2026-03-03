import { createHash } from "node:crypto";

function firstHeaderValue(value: string | null): string | null {
  if (!value) return null;
  return value.split(",")[0]?.trim() || null;
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("cf-connecting-ip") ||
    firstHeaderValue(headers.get("x-forwarded-for")) ||
    headers.get("x-real-ip") ||
    "0.0.0.0"
  );
}

export function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export function createVisitorHash(input: {
  headers: Headers;
  salt?: string;
}): string {
  const ip = getClientIp(input.headers);
  const userAgent = input.headers.get("user-agent") || "unknown";
  const salt = input.salt || process.env.ANALYTICS_HASH_SALT || "dev-salt";

  return sha256(`${salt}:visitor:${ip}:${userAgent}`);
}

export function createSessionHash(input: {
  headers: Headers;
  salt?: string;
}): string {
  const ip = getClientIp(input.headers);
  const userAgent = input.headers.get("user-agent") || "unknown";
  const salt = input.salt || process.env.ANALYTICS_HASH_SALT || "dev-salt";
  const bucket = new Date().toISOString().slice(0, 13);

  return sha256(`${salt}:session:${ip}:${userAgent}:${bucket}`);
}
