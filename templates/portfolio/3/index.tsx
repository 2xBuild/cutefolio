"use client";

import { useMemo, useState } from "react";
import type { TemplateProps } from "@/templates";
import type { ProfileExperience, ProfileProject, ProfileBlog } from "@/lib/types";

function SocialLinks({ links }: { links: TemplateProps["profile"]["social_links"] }) {
  if (!links.length) return null;

  return (
    <section>
      <h2>Social links</h2>
      <ul>
        {links.map((link, index) => (
          <li key={`${link.href}-${index}`}>
            <a href={link.href}>{link.label || link.href}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ExperienceList({ items }: { items: ProfileExperience[] }) {
  if (!items.length) return null;

  return (
    <section>
      <h2>Experience</h2>
      {items.map((exp, index) => (
        <article key={`${exp.company}-${index}`}>
          <h3>{exp.role}</h3>
          <p>
            {exp.company} {exp.location ? `(${exp.location})` : ""}
          </p>
          <p>{exp.period}</p>
          {exp.bullets && exp.bullets.length > 0 ? (
            <ul>
              {exp.bullets.map((bullet, bulletIndex) => (
                <li key={`${exp.company}-bullet-${bulletIndex}`}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function ProjectsList({ items }: { items: ProfileProject[] }) {
  if (!items.length) return null;

  return (
    <section>
      <h2>Projects</h2>
      {items.map((project, index) => (
        <article key={`${project.title}-${index}`}>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          {project.href ? <a href={project.href}>View project</a> : null}
          {project.tech && project.tech.length > 0 ? (
            <p>Tech: {project.tech.join(", ")}</p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function BlogList({ items }: { items: ProfileBlog[] }) {
  if (!items.length) return null;

  return (
    <section>
      <h2>Blogs</h2>
      <ul>
        {items.map((blog, index) => (
          <li key={`${blog.href}-${index}`}>
            <a href={blog.href}>{blog.title}</a>
            {blog.date ? ` (${blog.date})` : ""}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BareHtmlPortfolioTemplate({ profile }: TemplateProps) {
  const [showOptionalSections, setShowOptionalSections] = useState(false);

  const normalized = useMemo(() => {
    return {
      experience: profile.experience ?? [],
      projects: profile.projects ?? [],
      blogs: profile.blogs ?? [],
      hasOptional:
        Boolean(profile.experience?.length) ||
        Boolean(profile.projects?.length) ||
        Boolean(profile.blogs?.length),
    };
  }, [profile.experience, profile.projects, profile.blogs]);

  return (
    <main>
      <header>
        <img src={profile.img} alt={profile.img_alt || "Profile image"} />
        <h1>
          {profile.heading_bold} {profile.heading_light}
        </h1>
        <p>{profile.desc_1}</p>
      </header>

      <section>
        <h2>About</h2>
        <p>{profile.desc_2}</p>
        <p>{profile.desc_3}</p>
      </section>

      <section>
        <h2>Tech stack</h2>
        <ul>
          {profile.tech_stack.map((item, index) => {
            const label = typeof item === "string" ? item : item.visibleName;
            return <li key={`${label}-${index}`}>{label}</li>;
          })}
        </ul>
      </section>

      <section>
        <h2>Call to action</h2>
        <ul>
          {profile.cta_buttons.map((button, index) => (
            <li key={`${button.href}-${index}`}>
              <a href={button.href}>{button.label}</a>
            </li>
          ))}
        </ul>
      </section>

      <SocialLinks links={profile.social_links} />

      {normalized.hasOptional ? (
        <section>
          <h2>More</h2>
          <button type="button" onClick={() => setShowOptionalSections((prev) => !prev)}>
            {showOptionalSections ? "Hide details" : "Show details"}
          </button>
          {showOptionalSections ? (
            <>
              <ExperienceList items={normalized.experience} />
              <ProjectsList items={normalized.projects} />
              <BlogList items={normalized.blogs} />
            </>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
