"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { type ReactNode, useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, LayoutTemplate } from "lucide-react";
import ExpandableGallery from "@/components/expandable-gallery";
import { Button } from "@/components/ui/button";
import { templates } from "@/templates";

const TYPING_WORDS = ["you", "your company", "your SaaS"];
const TYPE_MS = 80;
const DELETE_MS = 50;
const PAUSE_AFTER_TYPE_MS = 1500;
const PAUSE_AFTER_DELETE_MS = 400;

function SwipeText() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWord = TYPING_WORDS[wordIndex];
  const displayText = currentWord.slice(0, charIndex);

  useEffect(() => {
    if (!isDeleting) {
      if (charIndex < currentWord.length) {
        const t = setTimeout(() => setCharIndex((c) => c + 1), TYPE_MS);
        return () => clearTimeout(t);
      }
      const pause = setTimeout(() => setIsDeleting(true), PAUSE_AFTER_TYPE_MS);
      return () => clearTimeout(pause);
    }
    if (charIndex > 0) {
      const t = setTimeout(() => setCharIndex((c) => c - 1), DELETE_MS);
      return () => clearTimeout(t);
    }
    const nextWord = (wordIndex + 1) % TYPING_WORDS.length;
    const pause = setTimeout(() => {
      setWordIndex(nextWord);
      setIsDeleting(false);
    }, PAUSE_AFTER_DELETE_MS);
    return () => clearTimeout(pause);
  }, [charIndex, isDeleting, currentWord.length, wordIndex]);

  return (
    <span className="inline-block border-r-2 border-foreground/70 align-bottom animate-pulse">
      {displayText}
    </span>
  );
}

export function HeroSection({ githubPill }: { githubPill: ReactNode }) {
  const { data: session } = useSession();

  const templateCount = templates.length;
  const galleryPhotos = templates.map(({ meta: template }) => ({
    id: `template-${template.id}`,
    src: template.previewImage,
    alt: `${template.name} template screenshot`,
    href: `/preview?template=${template.id}`,
    label: template.name,
  }));

  return (
    <section className="px-4 pb-20 pt-16 sm:pt-20">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <div className="w-full">
          <ExpandableGallery
            photos={galleryPhotos}
            collapsedCount={Math.min(3, templateCount)}
            className="mt-1"
            expandable={false}
          />
        </div>

        <div className="mt-10">{githubPill}</div>

        <div className="mt-6 flex min-h-[6.5rem] items-center sm:min-h-[7.5rem]">
          <h1 className="w-full text-5xl font-light tracking-tight text-foreground sm:text-6xl">
            <span className="dark:text-muted-foreground">
              Let the world <span className="font-bold text-foreground">kno</span>w{" "}
              <SwipeText /> better.
            </span>
          </h1>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            asChild
            className="landing-cta-button group h-11 min-w-[11.5rem] px-6 text-sm font-semibold"
          >
            <Link href="/dashboard/create-app">
              <span>Create app</span>
              <span className="relative ml-1.5 inline-flex h-4 w-4 items-center justify-center overflow-hidden">
                <ArrowUpRight className="size-4 -translate-y-px transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opacity-0" />
                <ArrowRight className="size-4 absolute translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
              </span>
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="landing-cta-button h-11 min-w-[11.5rem] px-6 text-sm font-semibold"
          >
            <Link href="/templates">
              <span>Templates</span>
              <LayoutTemplate className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
