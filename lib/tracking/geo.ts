import { getClientIp } from "@/lib/tracking/visitor-fingerprint";

const COUNTRY_HEADER_KEYS = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "x-country-code",
  "x-geo-country",
] as const;

export function resolveCountryCode(headers: Headers): string | null {
  for (const key of COUNTRY_HEADER_KEYS) {
    const value = headers.get(key);
    if (!value) continue;
    const normalized = value.trim().toUpperCase();
    if (normalized !== "XX" && /^[A-Z]{2}$/.test(normalized)) {
      return normalized;
    }
  }

  const ip = getClientIp(headers);
  if (ip && ip !== "0.0.0.0") {
    try {
      const geoip = require("geoip-lite") as { lookup: (ip: string) => { country: string } | null };
      const geo = geoip.lookup(ip);
      const code = geo?.country;
      if (typeof code === "string" && /^[A-Z]{2}$/.test(code)) return code;
    } catch {
      // ignore lookup errors
    }
  }

  return null;
}
