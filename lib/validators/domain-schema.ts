import { isRecord } from "@/lib/utils/validation";

const DOMAIN_RE =
  /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

export interface AddDomainInput {
  domain: string;
  isPrimary?: boolean;
}

export function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.$/, "");
}

export function isValidDomain(domain: string): boolean {
  return DOMAIN_RE.test(domain);
}

export function parseAddDomainInput(payload: unknown):
  | { ok: true; data: AddDomainInput }
  | { ok: false; error: string } {
  if (!isRecord(payload)) {
    return { ok: false, error: "Invalid request body." };
  }

  const domain = normalizeDomain(String(payload.domain ?? ""));
  if (!isValidDomain(domain)) {
    return { ok: false, error: "Invalid domain." };
  }

  return {
    ok: true,
    data: {
      domain,
      isPrimary: Boolean(payload.isPrimary),
    },
  };
}
