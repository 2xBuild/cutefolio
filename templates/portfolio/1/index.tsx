"use client";

import { motion } from "motion/react";
import { FileText, Send, Code, Calendar, ExternalLink } from "lucide-react";
import type { ComponentType } from "react";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import type { ProfileTech } from "@/lib/types";
import type { TemplateProps } from "@/templates";
import { ThemeToggle } from "@/components/landing/theme-toggle";

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

/**
 * Portfolio 1 — Full Page
 *
 * Single column: dark/light toggle, intro + tech details, experience,
 * projects, blogs, meeting link, quote, footer.
 */
export default function FullPageTemplate({ profile }: TemplateProps) {
  const hasExperience = profile.experience && profile.experience.length > 0;
  const hasProjects = profile.projects && profile.projects.length > 0;
  const hasBlogs = profile.blogs && profile.blogs.length > 0;
  const hasMeeting = profile.meeting_link?.href;
  const hasQuote = profile.quote?.text;
  const hasAvatar = Boolean(profile.img);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative min-h-screen w-full bg-background pb-24 font-sans"
    >
      <div className="fixed right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl px-4 pt-16">
        <section className="border-b border-border pb-12 pt-4">
          <div className="flex items-start gap-4">
            {hasAvatar && (
              <div className="mt-1 h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted sm:h-16 sm:w-16">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.img}
                  alt={profile.img_alt}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <h1
              className={`text-3xl font-bold tracking-tight text-foreground sm:text-4xl ${HEADING_FONT_CLASS}`}
            >
              {profile.heading_bold}{" "}
              <span className="font-normal text-muted-foreground">
                {profile.heading_light}
              </span>
            </h1>
          </div>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            {profile.desc_1}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {profile.tech_stack.map((item) => {
              const tech: ProfileTech =
                typeof item === "string"
                  ? { iconName: item, visibleName: item }
                  : item;
              const Icon = getIcon(tech.iconName) ?? Code;
              return (
                <span
                  key={tech.visibleName}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 py-1 text-sm font-medium text-foreground"
                >
                  <Icon className={SKILL_ICON_CLASS} />
                  {tech.visibleName}
                </span>
              );
            })}
          </div>
          <p className="mt-4 text-base leading-relaxed text-foreground">
            {profile.desc_2}
          </p>
          <p className="mt-2 text-base text-muted-foreground">{profile.desc_3}</p>
          <div className="mt-6 flex flex-wrap gap-3">
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
        </section>

        {hasExperience && (
          <section className="border-b border-border py-12">
            <SectionHeading>Experience</SectionHeading>
            <ul className="space-y-10">
              {profile.experience!.map((exp, i) => (
                <li key={`${exp.company}-${i}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3
                      className={`text-lg font-semibold text-foreground ${HEADING_FONT_CLASS}`}
                    >
                      {exp.company}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {exp.period}
                    </span>
                  </div>
                  <p className="mt-0.5 font-medium text-muted-foreground">
                    {exp.role}
                    {exp.location && ` · ${exp.location}`}
                  </p>
                  {exp.tech && exp.tech.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {exp.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-foreground">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasProjects && (
          <section className="border-b border-border py-12">
            <SectionHeading>Projects</SectionHeading>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.projects!.map((proj, i) => (
                <div
                  key={`${proj.title}-${i}`}
                  className="rounded-lg border border-border p-4"
                >
                  <h3
                    className={`text-lg font-semibold text-foreground ${HEADING_FONT_CLASS}`}
                  >
                    {proj.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {proj.description}
                  </p>
                  {proj.tech && proj.tech.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {proj.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground"
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
                      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      View details
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {hasBlogs && (
          <section className="border-b border-border py-12">
            <SectionHeading>Blogs</SectionHeading>
            <ul className="space-y-6">
              {profile.blogs!.map((blog, i) => (
                <li key={`${blog.title}-${i}`}>
                  <a
                    href={blog.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <h3
                      className={`text-lg font-semibold text-foreground group-hover:underline ${HEADING_FONT_CLASS}`}
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
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasMeeting && (
          <section className="flex flex-col items-center border-b border-border py-12">
            <SectionHeading>Let&apos;s talk</SectionHeading>
            <Button
              size="lg"
              className="rounded-full bg-foreground text-background hover:bg-foreground/90"
              asChild
            >
              <a href={profile.meeting_link!.href}>
                {profile.meeting_link!.label}
              </a>
            </Button>
          </section>
        )}

        {hasQuote && (
          <section className="border-b border-border py-12">
            <blockquote className="border-l-2 border-muted-foreground/50 pl-4 text-lg italic text-muted-foreground">
              &ldquo;{profile.quote!.text}&rdquo;
              {profile.quote!.author && (
                <footer className="mt-2 not-italic text-sm text-foreground">
                  — {profile.quote!.author}
                </footer>
              )}
            </blockquote>
          </section>
        )}

        <footer className="flex flex-col items-center gap-4 py-12">
          <div className="flex items-center gap-6">
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
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={label}
                >
                  <Icon className="size-5" aria-hidden />
                </a>
              );
            })}
          </div>
        </footer>
      </div>
    </motion.div>
  );
}
