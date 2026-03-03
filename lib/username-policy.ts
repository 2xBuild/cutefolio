import type { PlanTier } from "@/db/schema";

const USERNAME_RE = /^[a-z0-9](?:[a-z0-9-]{1,38})$/;

const RESERVED_USERNAMES = new Set([
  "about",
  "admin",
  "analytics",
  "api",
  "app",
  "auth",
  "billing",
  "blog",
  "compare",
  "contact",
  "dashboard",
  "docs",
  "faq",
  "help",
  "home",
  "legal",
  "login",
  "logout",
  "new",
  "preview",
  "pricing",
  "templates",
  "privacy",
  "profile",
  "settings",
  "signup",
  "signin",
  "studio",
  "support",
  "terms",
  "tnc",
  "www",
  "kno",
  "void",
]);

const BLACKLISTED_TERMS = [
  "abuse",
  "admin",
  "asshole",
  "bitch",
  "cunt",
  "fuck",
  "nazi",
  "nigger",
  "porn",
  "shit",
];

export type UsernamePolicyErrorCode =
  | "invalid_format"
  | "reserved"
  | "blacklisted"
  | "too_short_for_plan"
  | "consent_required";

export type UsernamePolicyResult =
  | { ok: true; username: string }
  | { ok: false; code: UsernamePolicyErrorCode; message: string };

export interface ValidateUsernamePolicyInput {
  username: string;
  planTier?: PlanTier;
  requireConsent?: boolean;
  hasConsent?: boolean;
}

export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase();
}

function findBlacklistedTerm(username: string): string | null {
  const flattened = username.replace(/-/g, "");
  return BLACKLISTED_TERMS.find((term) => flattened.includes(term)) ?? null;
}

export function validateUsernamePolicy(
  input: ValidateUsernamePolicyInput
): UsernamePolicyResult {
  const username = normalizeUsername(input.username);

  if (!USERNAME_RE.test(username)) {
    return {
      ok: false,
      code: "invalid_format",
      message:
        "Invalid username. Use lowercase letters, numbers, and hyphens (2-39 chars).",
    };
  }

  if (input.planTier === "free" && username.length < 4) {
    return {
      ok: false,
      code: "too_short_for_plan",
      message: "Free plan usernames must be at least 4 characters long.",
    };
  }

  if (RESERVED_USERNAMES.has(username)) {
    return {
      ok: false,
      code: "reserved",
      message: "That username is reserved by kno.li.",
    };
  }

  const blacklistedTerm = findBlacklistedTerm(username);
  if (blacklistedTerm) {
    return {
      ok: false,
      code: "blacklisted",
      message: "That username is unavailable due to policy restrictions.",
    };
  }

  if (input.requireConsent && !input.hasConsent) {
    return {
      ok: false,
      code: "consent_required",
      message: "Accept the username policy terms before claiming a username.",
    };
  }

  return { ok: true, username };
}

export function isValidPublicUsername(username: string): boolean {
  return validateUsernamePolicy({ username }).ok;
}

