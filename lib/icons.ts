import * as SiIcons from "react-icons/si";
import * as BiIcons from "react-icons/bi";
import type { IconType } from "react-icons";

const SI = SiIcons as Record<string, IconType | undefined>;
const BI = BiIcons as Record<string, IconType | undefined>;

export interface IconEntry {
  /** Spec string to store: "SI Github", "BI Envelope", etc. */
  spec: string;
  /** Human-readable label for search: "Github", "Envelope" */
  label: string;
  /** The component */
  Icon: IconType;
}

let _iconListCache: IconEntry[] | null = null;

/**
 * Returns the full list of available icons (SI + BI).
 * Result is cached after first call.
 */
export function getAllIcons(): IconEntry[] {
  if (_iconListCache) return _iconListCache;

  const list: IconEntry[] = [];

  for (const [key, component] of Object.entries(SI)) {
    if (typeof component !== "function" || !key.startsWith("Si")) continue;
    const name = key.slice(2);
    if (!name) continue;
    list.push({ spec: `SI ${name}`, label: name, Icon: component });
  }

  for (const [key, component] of Object.entries(BI)) {
    if (typeof component !== "function" || !key.startsWith("Bi")) continue;
    const name = key.slice(2);
    if (!name) continue;
    list.push({ spec: `BI ${name}`, label: name, Icon: component });
  }

  _iconListCache = list;
  return list;
}

function toPascalKey(prefix: string, name: string): string {
  const base = name.replace(new RegExp(`^${prefix}`, "i"), "").trim();
  if (!base) return "";
  return prefix + base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

/**
 * Parse an icon spec into set (si/bi) and icon name.
 * Format: "SI IconName" | "SIIconName" | "BI IconName" | "BIIconName" | "IconName" (defaults to SI).
 */
function parseIconSpec(spec: string): { set: "si" | "bi"; name: string } | null {
  const s = spec.trim();
  if (!s) return null;
  const m = s.match(/^(SI|BI)(.+)$/i);
  if (m) {
    const set = m[1].toUpperCase() === "BI" ? "bi" : "si";
    const name = m[2].trim();
    if (!name) return null;
    return { set, name };
  }
  return { set: "si", name: s };
}

/**
 * Resolve a user icon spec to a react-icons component.
 * - "SI Github" / "SIGithub" / "Github" → Simple Icons (SiGithub)
 * - "BI Star" / "BIStar" → Bootstrap Icons (BiStar)
 * Use in tech_stack, social_links[].type, and cta icon fields.
 */
export function getIcon(spec: string): IconType | undefined {
  const parsed = parseIconSpec(spec);
  if (!parsed) return undefined;
  const { set, name } = parsed;
  const prefix = set === "bi" ? "Bi" : "Si";
  const key = toPascalKey(prefix, name);
  const namespace = set === "bi" ? BI : SI;
  const Icon = namespace[key];
  return typeof Icon === "function" ? Icon : undefined;
}
