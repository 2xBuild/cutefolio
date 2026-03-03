import type { CSSProperties } from "react";
import { PROFILE_FONT_VALUES } from "./constants";
import type { Profile } from "./types";

type ThemeStyle = CSSProperties & Partial<Record<`--${string}`, string>>;

/**
 * Builds runtime CSS variables from optional profile theme config.
 * Only font overrides are applied here. Color overrides are intentionally
 * omitted so that the dark/light toggle (`.dark` class on <html>) works
 * correctly -- inline color vars would permanently override the
 * class-based light/dark tokens from globals.css.
 */
export function getProfileThemeStyle(profile: Profile): ThemeStyle {
  const style: ThemeStyle = {};
  const fonts = profile.theme?.fonts;

  const bodyFont = fonts?.body?.trim();
  const headingFont = fonts?.heading?.trim() || bodyFont;

  if (bodyFont && PROFILE_FONT_VALUES.has(bodyFont)) {
    style["--font-sans"] = bodyFont;
    style.fontFamily = bodyFont;
  }
  if (headingFont && PROFILE_FONT_VALUES.has(headingFont)) {
    style["--profile-heading-font"] = headingFont;
  }

  return style;
}
