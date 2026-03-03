"use client";

import { motion } from "motion/react";
import { Code } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { getIcon } from "@/lib/icons";
import type { TemplateProps } from "@/templates";

const HEADING_FONT_CLASS = "[font-family:var(--profile-heading-font)]";

/**
 * Linkfolio 2 — Link Card
 *
 * Centered card layout: avatar, name, short description,
 * and a list of social / platform links displayed as full-width
 * buttons with icon + platform name.
 */
export default function LinkCardTemplate({ profile }: TemplateProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () =>
    setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-16 font-sans text-foreground"
    >
      <div className="flex w-full max-w-sm flex-col items-center">
        <button
          type="button"
          onClick={toggleTheme}
          className="relative mb-5 shrink-0 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Toggle dark or light mode"
        >
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-muted shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.img}
              alt={profile.img_alt}
              width={96}
              height={96}
              className="h-full w-full object-cover"
              onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.style.display = "none";
                const parent = t.parentElement;
                if (parent && !parent.querySelector(".avatar-fallback")) {
                  const fallback = document.createElement("div");
                  fallback.className =
                    "avatar-fallback h-full w-full bg-muted";
                  fallback.setAttribute("aria-hidden", "true");
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
        </button>

        <h1
          className={`text-2xl font-bold tracking-tight text-foreground ${HEADING_FONT_CLASS}`}
        >
          {profile.heading_bold}
          {profile.heading_light && (
            <span className="font-normal text-muted-foreground">
              {" "}
              {profile.heading_light}
            </span>
          )}
        </h1>

        {profile.desc_1 && (
          <p className="mt-2 text-center text-sm leading-relaxed text-muted-foreground">
            {profile.desc_1}
          </p>
        )}

        {profile.social_links.length > 0 && (
          <div className="mt-8 flex w-full flex-col gap-3">
            {profile.social_links.map(({ type, label, href }) => {
              const Icon = getIcon(type) ?? Code;
              return (
                <a
                  key={`${type}-${href}`}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Icon className="size-5 shrink-0" aria-hidden />
                  <span>{label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </motion.section>
  );
}
