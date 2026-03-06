"use client";

import "./sleek.css";

import { motion } from "motion/react";
import {
  FileText,
  Send,
  Code,
  Calendar,
  ExternalLink,
} from "lucide-react";
import type { ComponentType } from "react";
import { getIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ProfileTech } from "@/lib/types";
import type { TemplateProps } from "@/templates";
import { SleekNavbar } from "./navbar";
import { OnekoCat } from "./oneko-cat";

const SKILL_ICON_CLASS = "h-4 w-4 shrink-0";
const HEADING_FONT_CLASS = "[font-family:var(--profile-heading-font)]";

function SectionHeading({
  subHeading,
  heading,
}: {
  subHeading: string;
  heading: string;
}) {
  return (
    <div>
      <p className="text-sleek-secondary text-sm">{subHeading}</p>
      <h2
        className={`mt-1 text-2xl font-bold text-foreground ${HEADING_FONT_CLASS}`}
      >
        {heading}
      </h2>
    </div>
  );
}

function resolveGithubUsername(
  profile: TemplateProps["profile"],
): string | null {
  const link = profile.social_links.find((l) => {
    const href = (l.href ?? "").toLowerCase();
    return href.includes("github.com/");
  });
  if (!link) return null;

  const raw = link.href.trim();
  try {
    const url = raw.startsWith("http") ? new URL(raw) : new URL(`https://${raw}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    const match = raw.match(/github\.com\/([A-Za-z0-9-]+)/i);
    return match?.[1] ?? null;
  }
}

/**
 * Portfolio 3 — Sleek
 *
 * Self-contained template from ramxcodes/sleek-portfolio. All styles,
 * components, and assets live in this folder. Includes: navbar, oneko cat,
 * 3D inner shadows, dashed skill tags, CTA pill, View Transitions theme toggle.
 */
export default function SleekTemplate({ profile }: TemplateProps) {
  const hasExperience = profile.experience && profile.experience.length > 0;
  const hasProjects = profile.projects && profile.projects.length > 0;
  const hasBlogs = profile.blogs && profile.blogs.length > 0;
  const hasMeeting = profile.meeting_link?.href;
  const hasQuote = profile.quote?.text;
  const githubUsername = resolveGithubUsername(profile);

  return (
    <motion.div
      id="top"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sleek-p3 relative min-h-screen w-full bg-background pb-24 font-sans"
      style={{ "--radius": "0.625rem" } as React.CSSProperties}
    >
      <SleekNavbar logoUrl={profile.img} logoAlt={profile.img_alt} />
      <OnekoCat />

      <div className="container mx-auto max-w-3xl animate-fade-in-blur px-4">
        {/* Hero */}
        <section id="about" className="pt-12">
          <div
            className="size-24 shrink-0 overflow-hidden rounded-full bg-blue-300 dark:bg-yellow-300"
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.img}
              alt={profile.img_alt}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="mt-8 flex flex-col gap-2">
            <h1
              className={`text-4xl font-bold text-foreground ${HEADING_FONT_CLASS}`}
            >
              Hi, I&apos;m {profile.heading_bold} —{" "}
              <span className="text-sleek-secondary">{profile.heading_light}</span>
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-base text-sleek-secondary md:text-lg">
              {profile.desc_1}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {profile.tech_stack.map((item) => {
              const tech: ProfileTech =
                typeof item === "string"
                  ? { iconName: item, visibleName: item }
                  : item;
              const Icon = getIcon(tech.iconName) ?? Code;
              return (
                <span
                  key={tech.visibleName}
                  className="skill-inner-shadow inline-flex items-center self-end rounded-md border border-dashed border-black/20 bg-black/5 px-2 py-1 text-sm font-bold text-foreground dark:border-white/30 dark:bg-white/15 dark:text-white"
                >
                  <Icon className={`${SKILL_ICON_CLASS} ml-0`} />
                  <span className="ml-1">{tech.visibleName}</span>
                </span>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            {profile.cta_buttons.map((cta, i) => {
              const Icon: ComponentType<{ className?: string }> =
                (cta.icon?.trim() ? getIcon(cta.icon) : undefined) ??
                (cta.type === "primary" ? FileText : Send);
              const isPrimary = cta.type === "primary";
              return (
                <Button
                  key={`${cta.href}-${i}`}
                  variant={isPrimary ? "default" : "outline"}
                  className={`${
                    isPrimary
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border bg-background hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
                  } btn-inner-shadow rounded-md`}
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

        {(profile.desc_2 || profile.desc_3) && (
          <section className="mt-20">
            <SectionHeading subHeading="About" heading="Me" />
            <div className="mt-8 flex flex-col gap-4">
              {profile.desc_2 && (
                <p className="text-sleek-secondary">{profile.desc_2}</p>
              )}
              {profile.desc_3 && (
                <p className="text-sleek-secondary">{profile.desc_3}</p>
              )}
            </div>
          </section>
        )}

        {hasExperience && (
          <section id="experience" className="mt-20">
            <SectionHeading subHeading="Featured" heading="Experience" />
            <div className="mt-8 flex flex-col gap-8">
              {profile.experience!.map((exp, i) => (
                <div key={`${exp.company}-${i}`} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3
                        className={`text-lg font-bold text-foreground ${HEADING_FONT_CLASS}`}
                      >
                        {exp.company}
                      </h3>
                      <p className="text-sleek-secondary">{exp.role}</p>
                    </div>
                    <div className="text-right text-sm text-sleek-secondary">
                      <p>{exp.period}</p>
                      {exp.location && <p>{exp.location}</p>}
                    </div>
                  </div>
                  {exp.tech && exp.tech.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {exp.tech.map((t) => (
                        <span
                          key={t}
                          className="skill-inner-shadow inline-flex items-center rounded-md border border-dashed border-black/20 bg-black/5 px-2 py-0.5 text-xs font-medium text-foreground dark:border-white/30 dark:bg-white/15 dark:text-white"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="text-sleek-secondary list-inside list-disc space-y-1 text-sm">
                      {exp.bullets.map((b, j) => (
                        <li key={j}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {hasProjects && (
          <section id="projects" className="mt-20">
            <SectionHeading subHeading="Featured" heading="Projects" />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {profile.projects!.map((proj, i) => (
                <Card
                  key={`${proj.title}-${i}`}
                  className="h-full w-full overflow-hidden border-gray-100 p-0 shadow-none transition-all dark:border-gray-800"
                >
                  <div className="aspect-video w-full overflow-hidden">
                    {proj.image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={proj.image}
                        alt={`${proj.title} preview`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-muted to-muted/60" />
                    )}
                  </div>
                  <CardContent className="space-y-2 px-6 py-4">
                    <h3
                      className={`text-xl font-semibold leading-tight text-foreground group-hover:text-primary ${HEADING_FONT_CLASS}`}
                    >
                      {proj.title}
                    </h3>
                    <p className="line-clamp-3 text-sleek-secondary text-sm">
                      {proj.description}
                    </p>
                    {proj.tech && proj.tech.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {proj.tech.map((t) => (
                          <span
                            key={t}
                            className="tag-inner-shadow rounded-md border border-dashed border-black/20 bg-black/5 px-2 py-0.5 text-xs text-foreground dark:border-white/30 dark:bg-white/15 dark:text-white"
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
                        className="text-sleek-secondary hover:text-primary mt-2 inline-flex items-center gap-1 text-sm transition-colors hover:underline hover:underline-offset-4"
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
          <section id="blogs" className="mt-20">
            <SectionHeading subHeading="Featured" heading="Blogs" />
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
              {profile.blogs!.map((blog, i) => (
                <a
                  key={`${blog.title}-${i}`}
                  href={blog.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block h-full"
                >
                  <div className="flex h-full flex-col rounded-md border border-dashed border-black/20 bg-black/5 p-4 transition-all dark:border-white/10 dark:bg-white/5">
                    <h3
                      className={`text-lg font-semibold text-foreground group-hover:text-primary group-hover:underline ${HEADING_FONT_CLASS}`}
                    >
                      {blog.title}
                    </h3>
                    <p className="mt-1 text-sleek-secondary text-sm">
                      {blog.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {blog.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="tag-inner-shadow rounded-md border border-dashed border-black/20 bg-black/5 px-2 py-0.5 text-xs text-foreground dark:border-white/30 dark:bg-white/15 dark:text-white"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.date && (
                        <span className="flex items-center gap-1 text-xs text-sleek-secondary">
                          <Calendar className="h-3 w-3" />
                          {blog.date}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {githubUsername && (
              <div className="mt-8">
                <Card className="h-full w-full overflow-hidden border-gray-100 p-0 shadow-none transition-all dark:border-gray-800">
                  <CardContent className="space-y-4 px-6 py-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3
                          className={`text-lg font-semibold text-foreground ${HEADING_FONT_CLASS}`}
                        >
                          GitHub
                        </h3>
                        <p className="text-sleek-secondary text-sm">
                          Recent contributions by{" "}
                          <span className="font-semibold text-foreground">
                            {githubUsername}
                          </span>
                        </p>
                      </div>
                      <a
                        href={`https://github.com/${githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sleek-secondary hover:text-primary inline-flex items-center gap-1 text-sm transition-colors hover:underline hover:underline-offset-4"
                      >
                        View profile
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <div className="overflow-hidden rounded-md">
                      {/* Light mode chart */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://ghchart.rshah.org/16a34a/${githubUsername}`}
                        alt={`GitHub contribution chart for ${githubUsername}`}
                        className="block w-[135%] -translate-x-10 max-w-none dark:hidden"
                      />
                      {/* Dark mode chart */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://ghchart.rshah.org/86efac/${githubUsername}`}
                        alt={`GitHub contribution chart for ${githubUsername}`}
                        className="hidden w-[135%] -translate-x-10 max-w-none dark:block"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </section>
        )}

        {hasMeeting && (
          <section id="contact" className="mt-20">
            <div className="rounded-md border border-dashed border-black/20 py-8 dark:border-white/10">
              <div className="mt-6 flex w-full flex-col px-6 pb-8 sm:flex-row sm:items-center sm:justify-between sm:px-12">
                <p className="text-sleek-secondary mb-4 text-center text-base sm:mb-3 md:text-xl">
                  Let&apos;s connect and discuss opportunities.
                </p>
                <div className="mt-4 flex w-full justify-center sm:mt-0 sm:w-auto sm:justify-end">
                  <a
                    href={profile.meeting_link!.href}
                    className="tag-inner-shadow group inline-flex cursor-pointer items-center self-end rounded-md border border-dashed border-black/20 bg-black/5 px-2 py-1 text-sm text-foreground shadow-[0_0_5px_rgba(0,0,0,0.1)] transition-all hover:border-black/30 dark:border-white/30 dark:bg-white/15 dark:text-white dark:shadow-[0_0_5px_rgba(255,255,255,0.1)]"
                  >
                    <div className="relative z-20 flex items-center gap-2 transition-all duration-300 group-hover:gap-8">
                      <div className="h-5 w-5 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={profile.img}
                          alt={profile.img_alt}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="absolute left-[24px] flex -translate-x-full transform items-center gap-0 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5v14" />
                        </svg>
                        <div className="mr-2 ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[8px] dark:bg-white/10">
                          You
                        </div>
                      </div>
                      <span className="relative ml-0 block whitespace-nowrap text-sm font-bold transition-all duration-300 group-hover:ml-4">
                        {profile.meeting_link!.label}
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        {hasQuote && (
          <section className="mt-20">
            <blockquote className="border-l-2 border-muted-foreground/50 pl-4 text-lg italic text-sleek-secondary">
              &ldquo;{profile.quote!.text}&rdquo;
              {profile.quote!.author && (
                <footer className="mt-2 not-italic text-sm text-foreground">
                  — {profile.quote!.author}
                </footer>
              )}
            </blockquote>
          </section>
        )}

        <footer className="mt-20 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6">
            {profile.social_links.map(({ type, label, href }, i) => {
              const Icon = getIcon(type) ?? Code;
              const isExternal =
                href.startsWith("http") || href.startsWith("https");
              return (
                <a
                  key={`${type}-${href}-${i}`}
                  href={href}
                  target={href.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="text-sleek-secondary transition-colors hover:text-foreground"
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
