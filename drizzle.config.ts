import { defineConfig } from "drizzle-kit";

const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

function normalizeConnectionString(rawValue: string): string {
  let parsed: URL;
  try {
    parsed = new URL(rawValue);
  } catch {
    return rawValue;
  }

  const sslMode = parsed.searchParams.get("sslmode");
  const useLibpqCompat = parsed.searchParams.get("uselibpqcompat");
  if (!sslMode || useLibpqCompat === "true") {
    return rawValue;
  }

  if (LEGACY_SSL_MODES.has(sslMode)) {
    parsed.searchParams.set("sslmode", "verify-full");
    return parsed.toString();
  }

  return rawValue;
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set.");
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: normalizeConnectionString(databaseUrl),
  },
});
