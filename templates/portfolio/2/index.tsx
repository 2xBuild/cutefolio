"use client";

import { motion } from "motion/react";
import {
  FileText,
  Send,
  Code,
  Calendar,
  ExternalLink,
  ArrowUpRight,
} from "lucide-react";
import type { ComponentType } from "react";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import type { ProfileTech } from "@/lib/types";
import type { TemplateProps } from "@/templates";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";

const SKILL_ICON_CLASS = "h-4 w-4 shrink-0";
const HEADING_FONT_CLASS = "[font-family:var(--profile-heading-font)]";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className={`mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground ${HEADING_FONT_CLASS}`}
    >
      {children}
    </h2>
  );
}

function normalizeSocialHref(rawHref: string): string {
  const href = rawHref.trim();
  if (!href) return "#";
  if (
    href.startsWith("/") ||
    href.startsWith("#") ||
    /^https?:\/\//i.test(href) ||
    /^mailto:/i.test(href) ||
    /^tel:/i.test(href)
  ) {
    return href;
  }
  return `https://${href.replace(/^\/+/, "")}`;
}

function shouldOpenInNewTab(href: string): boolean {
  const lowerHref = href.toLowerCase();
  return lowerHref.startsWith("http://") || lowerHref.startsWith("https://");
}

function resolveSocialIcon(type: string, label: string, href: string) {
  const directIcon = type.trim() ? getIcon(type.trim()) : undefined;
  if (directIcon) return directIcon;

  const probe = `${label} ${href}`.toLowerCase();
  if (probe.includes("github")) return getIcon("SI Github");
  if (probe.includes("linkedin")) return getIcon("SI Linkedin");
  if (probe.includes("x.com") || probe.includes("twitter")) return getIcon("SI X");
  if (probe.includes("instagram")) return getIcon("SI Instagram");
  if (probe.includes("youtube")) return getIcon("SI Youtube");
  if (probe.includes("facebook")) return getIcon("SI Facebook");
  if (probe.includes("dribbble")) return getIcon("SI Dribbble");
  if (probe.includes("behance")) return getIcon("SI Behance");
  if (probe.includes("mailto:") || probe.includes("email") || probe.includes("mail")) {
    return getIcon("BI Envelope");
  }
  return undefined;
}

function normalizeSocialLink(link: TemplateProps["profile"]["social_links"][number]) {
  const type = typeof link.type === "string" ? link.type : "";
  const label =
    typeof link.label === "string" && link.label.trim().length > 0
      ? link.label.trim()
      : "Social link";
  const href = normalizeSocialHref(
    typeof link.href === "string" ? link.href : "",
  );
  return {
    type,
    label,
    href,
    Icon: resolveSocialIcon(type, label, href) ?? Code,
    openInNewTab: shouldOpenInNewTab(href),
  };
}

function resolveGithubUsername(profile: TemplateProps["profile"]): string | null {
  const githubLink = profile.social_links.find((link) => {
    const href = normalizeSocialHref(
      typeof link.href === "string" ? link.href : "",
    );
    return href.toLowerCase().includes("github.com/");
  });
  if (!githubLink) return null;
  const href = normalizeSocialHref(
    typeof githubLink.href === "string" ? githubLink.href : "",
  );
  const match = href.match(/github\.com\/([A-Za-z0-9-]+)/i);
  return match?.[1] ?? null;
}

export default function ExtendedTemplate({ profile }: TemplateProps) {
  const hasExperience = profile.experience && profile.experience.length > 0;
  const hasProjects = profile.projects && profile.projects.length > 0;
  const hasBlogs = profile.blogs && profile.blogs.length > 0;
  const hasMeeting = profile.meeting_link?.href;
  const githubUsername = resolveGithubUsername(profile);
  const hasGithubGraph = Boolean(githubUsername);
  const githubChartLightSrc = hasGithubGraph
    ? `https://ghchart.rshah.org/16a34a/${githubUsername}`
    : null;
  const githubChartDarkSrc = hasGithubGraph
    ? `https://ghchart.rshah.org/86efac/${githubUsername}`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen w-full bg-background px-4 py-12 font-sans"
    >
      <div className="fixed right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-4xl">
        <section className="overflow-hidden rounded-2xl border border-border bg-card/90 shadow-sm">
          <div className="relative h-48 w-full overflow-hidden border-b border-border sm:h-56">
            {profile.banner_image ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.banner_image}
                  alt="Portfolio banner"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </>
            ) : (
              <div className="h-full w-full bg-gradient-to-r from-muted via-muted/60 to-muted" />
            )}
          </div>

          <div className="px-5 pb-10 pt-6 sm:px-8">
            <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 size-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={profile.img}
                    alt={profile.img_alt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h1
                    className={`text-2xl font-semibold tracking-tight text-foreground sm:text-3xl ${HEADING_FONT_CLASS}`}
                  >
                    {profile.heading_bold}{" "}
                    <span className="font-normal text-muted-foreground">
                      {profile.heading_light}
                    </span>
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {profile.desc_1}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {profile.social_links.map((link, i) => {
                  const { type, label, href, Icon, openInNewTab } =
                    normalizeSocialLink(link);
                  return (
                    <a
                      key={`${type}-${href}-${i}`}
                      href={href}
                      target={openInNewTab ? "_blank" : undefined}
                      rel={openInNewTab ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center justify-center rounded-full border border-border bg-muted/60 p-2 text-foreground transition-colors hover:bg-accent"
                      aria-label={label}
                    >
                      <Icon className="size-4" aria-hidden />
                    </a>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2">
              {profile.tech_stack.map((item) => {
                const tech: ProfileTech =
                  typeof item === "string"
                    ? { iconName: item, visibleName: item }
                    : item;
                const Icon = getIcon(tech.iconName) ?? Code;
                return (
                  <span
                    key={tech.visibleName}
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    <Icon className={SKILL_ICON_CLASS} />
                    {tech.visibleName}
                  </span>
                );
              })}
            </div>

            {(profile.desc_2 || profile.desc_3) && (
              <div className="mt-5 space-y-2">
                {profile.desc_2 && (
                  <p className="text-sm leading-relaxed text-foreground">
                    {profile.desc_2}
                  </p>
                )}
                {profile.desc_3 && (
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {profile.desc_3}
                  </p>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {profile.cta_buttons.map((cta, i) => {
                const Icon: ComponentType<{ className?: string }> =
                  (cta.icon?.trim() ? getIcon(cta.icon) : undefined) ??
                  (cta.type === "primary" ? FileText : Send);
                const isPrimary = cta.type === "primary";
                return (
                  <Button
                    key={`${cta.href}-${i}`}
                    size="sm"
                    variant={isPrimary ? "default" : "outline"}
                    className={
                      isPrimary
                        ? "rounded-full bg-foreground text-background hover:bg-foreground/90"
                        : "rounded-full border-border bg-background text-foreground hover:bg-accent"
                    }
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
        </section>

        {hasExperience && (
          <section className="mt-8">
            <SectionHeading>Experience</SectionHeading>
            <div className="space-y-3">
              {profile.experience!.map((exp, i) => (
                <div
                  key={`${exp.company}-${i}`}
                  className="rounded-xl border border-border bg-card/70 p-4"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3
                      className={`text-base font-semibold text-foreground ${HEADING_FONT_CLASS}`}
                    >
                      {exp.company}
                    </h3>
                    <span className="text-xs text-muted-foreground">{exp.period}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {exp.role}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {hasProjects && (
          <section className="mt-8">
            <SectionHeading>Projects</SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              {profile.projects!.map((proj, i) => (
                <Card
                  key={`${proj.title}-${i}`}
                  className="gap-0 overflow-hidden border-border/80 py-0"
                >
                  <div className="h-36 w-full overflow-hidden bg-muted">
                    {proj.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proj.image}
                        alt={`${proj.title} preview`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-primary/30 via-muted to-background" />
                    )}
                  </div>
                  <CardContent className="space-y-2 p-4">
                    <h3
                      className={`text-base font-semibold text-foreground ${HEADING_FONT_CLASS}`}
                    >
                      {proj.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {proj.description}
                    </p>
                    {proj.tech && proj.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="rounded border border-border bg-muted/70 px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {proj.href && (
                      <a
                        href={proj.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-foreground/90 transition-colors hover:text-foreground"
                      >
                        View project
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {hasBlogs && (
          <section className="mt-8 border-t border-border pt-8">
            <SectionHeading>Blogs</SectionHeading>
            <ul className="space-y-6">
              {profile.blogs!.map((blog, i) => (
                <li
                  key={`${blog.title}-${i}`}
                  className="rounded-xl border border-border bg-card/70 p-4"
                >
                  <a
                    href={blog.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <h3
                      className={`text-base font-semibold text-foreground group-hover:underline ${HEADING_FONT_CLASS}`}
                    >
                      {blog.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {blog.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {blog.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.date && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {blog.date}
                        </span>
                      )}
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-foreground/80">
                        Read
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasGithubGraph && githubChartLightSrc && githubChartDarkSrc && (
          <section className="mt-8 border-t border-border pt-8">
            <div className="rounded-xl border border-border bg-card/70 p-3 sm:p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={githubChartLightSrc}
                alt={`GitHub contribution chart for ${githubUsername}`}
                className="block w-full rounded-md dark:hidden"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={githubChartDarkSrc}
                alt={`GitHub contribution chart for ${githubUsername}`}
                className="hidden w-full rounded-md dark:block"
              />
            </div>
          </section>
        )}

        <section className="mt-8 border-t border-border pt-8">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {profile.social_links.map((link, i) => {
                const { type, label, href, Icon, openInNewTab } =
                  normalizeSocialLink(link);
                return (
                  <a
                    key={`${type}-${href}-${i}`}
                    href={href}
                    target={openInNewTab ? "_blank" : undefined}
                    rel={openInNewTab ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={label}
                  >
                    <Icon className="size-3.5" aria-hidden />
                    <span>{label}</span>
                  </a>
                );
              })}
            </div>
            {hasMeeting && (
              <Button
                size="lg"
                className="rounded-full bg-foreground text-background hover:bg-foreground/90"
                asChild
              >
                <a href={profile.meeting_link!.href}>
                  <Calendar className="size-4" />
                  {profile.meeting_link!.label}
                </a>
              </Button>
            )}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
