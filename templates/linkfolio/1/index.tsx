"use client";

import { motion } from "motion/react";
import { FileText, Send, Code } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { ComponentType } from "react";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import type { ProfileTech } from "@/lib/types";
import type { TemplateProps } from "@/templates";

const SKILL_ICON_CLASS = "h-4 w-4 shrink-0";
const HEADING_FONT_CLASS = "[font-family:var(--profile-heading-font)]";

/**
 * Linkfolio 1 — Minimal Intro
 *
 * Clean lines, generous whitespace, system fonts, fade-in animation.
 */
export default function MinimalTemplate({ profile }: TemplateProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => setTheme(resolvedTheme === "dark" ? "light" : "dark");

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative flex w-full max-w-2xl flex-col bg-background py-20 font-sans text-left text-foreground"
    >
      <div className="w-full px-4">
        <div className="mb-8 flex w-full items-start">
          <button
            type="button"
            onClick={toggleTheme}
            className="relative shrink-0 rounded-full outline-none ring-offset-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Toggle dark or light mode"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={profile.img}
                alt={profile.img_alt}
                width={80}
                height={80}
                className="h-full w-full object-cover"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.display = "none";
                  const parent = t.parentElement;
                  if (parent && !parent.querySelector(".avatar-fallback")) {
                    const fallback = document.createElement("div");
                    fallback.className = "avatar-fallback h-full w-full bg-muted";
                    fallback.setAttribute("aria-hidden", "true");
                    parent.appendChild(fallback);
                  }
                }}
              />
            </div>
            <span
              className="absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-background bg-muted-foreground"
              aria-hidden
            />
          </button>
        </div>

        <h1
          className={`text-3xl font-bold tracking-tight text-foreground sm:text-4xl ${HEADING_FONT_CLASS}`}
        >
          {profile.heading_bold}{" "}
          <span className="font-normal text-muted-foreground">
            {profile.heading_light}
          </span>
        </h1>

        <div className="mt-4 text-base leading-relaxed text-muted-foreground">
          <p className="mb-2">{profile.desc_1}</p>
          <span className="inline-flex flex-wrap items-center gap-2">
            {profile.tech_stack.map((item) => {
              const tech: ProfileTech =
                typeof item === "string"
                  ? { iconName: item, visibleName: item }
                  : item;
              const Icon = getIcon(tech.iconName) ?? Code;
              return (
                <span
                  key={tech.visibleName}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-[14px] font-medium text-foreground"
                >
                  <Icon className={SKILL_ICON_CLASS} />
                  {tech.visibleName}
                </span>
              );
            })}
          </span>
          <p className="mt-2 text-muted-foreground">
            {profile.desc_2}
          </p>
        </div>

        <div className="mt-5 border-t border-border">
          <p className="mt-4 text-muted-foreground">
            {profile.desc_3}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            {profile.cta_buttons.map((cta, i) => {
              const Icon: ComponentType<{ className?: string }> =
                (cta.icon?.trim() ? getIcon(cta.icon) : undefined) ??
                (cta.type === "primary" ? FileText : Send);
              const isPrimary = cta.type === "primary";
              return (
                <Button
                  key={`${cta.href}-${i}`}
                  size="lg"
                  variant={isPrimary ? "default" : "outline"}
                  className="rounded-full font-medium"
                  asChild
                >
                  <a href={cta.href}>
                    <Icon className="size-4" />
                    {cta.label}
                  </a>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="m-1.5 mt-10 flex items-center gap-6 text-foreground">
          {profile.social_links.map(({ type, label, href }) => {
            const Icon = getIcon(type) ?? Code;
            return (
              <a
                key={`${type}-${href}`}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  href.startsWith("mailto:") ? undefined : "noopener noreferrer"
                }
                className="transition-opacity hover:opacity-70"
                aria-label={label}
              >
                <Icon className="size-5" aria-hidden />
              </a>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
