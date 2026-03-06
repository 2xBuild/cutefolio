"use client";

import Link from "next/link";
import { SleekThemeToggle } from "./theme-toggle";

const NAV_ITEMS = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Projects", href: "#projects" },
  { label: "Blogs", href: "#blogs" },
  { label: "Contact", href: "#contact" },
];

interface SleekNavbarProps {
  logoUrl?: string;
  logoAlt?: string;
}

/**
 * Sleek-style navbar: logo, section links, theme toggle.
 * Scoped to portfolio-3 template.
 */
export function SleekNavbar({
  logoUrl = "/logo.png",
  logoAlt = "Home",
}: SleekNavbarProps) {
  return (
    <nav className="sleek-p3 sticky top-0 z-20 rounded-md py-4 backdrop-blur-sm">
      <div className="container mx-auto flex max-w-3xl items-center justify-between px-6">
        <div className="flex flex-wrap items-baseline gap-2 sm:gap-4">
          <Link href="#top" className="flex items-center shrink-0">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-blue-300 transition-all duration-300 ease-in-out hover:scale-90 dark:border-gray-700 dark:bg-yellow-300 sm:h-12 sm:w-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt={logoAlt}
                className="h-full w-full object-cover"
              />
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sleek-secondary transition-all duration-300 ease-in-out hover:underline hover:decoration-2 hover:underline-offset-4 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <SleekThemeToggle />
      </div>
    </nav>
  );
}
