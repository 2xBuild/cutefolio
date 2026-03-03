"use client";

import { motion, AnimatePresence, LayoutGroup } from "motion/react";
import { useState, useId, useRef } from "react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import Image, { type ImageProps } from "next/image";
import Link from "next/link";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";

export interface ExpandableGalleryPhoto {
  id: string;
  src: ImageProps["src"];
  alt: string;
  href?: string;
  label?: string;
  rotation?: number;
  x?: number;
  y?: number;
  zIndex?: number;
}

interface ExpandableGalleryProps {
  photos: ExpandableGalleryPhoto[];
  collapsedCount?: number;
  className?: string;
  /** When false, cards stay in gallery style and link to href (no expand). */
  expandable?: boolean;
}

const transition = {
  type: "spring",
  stiffness: 160,
  damping: 18,
  mass: 1,
} as const;

export default function ExpandableGallery({
  photos,
  collapsedCount = 3,
  className,
  expandable = true,
}: ExpandableGalleryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const effectiveExpanded = expandable && isExpanded;
  const layoutGroupId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const visibleCollapsedCount = Math.min(Math.max(collapsedCount, 1), photos.length);
  const midpoint = (visibleCollapsedCount - 1) / 2;
  const spread =
    visibleCollapsedCount > 1 ? Math.min(120, 260 / (visibleCollapsedCount - 1)) : 0;

  useOutsideClick(containerRef, () => {
    if (expandable && isExpanded) {
      setIsExpanded(false);
    }
  });

  if (photos.length === 0) {
    return null;
  }

  return (
    <section className={cn("relative w-full", className)}>
      <LayoutGroup id={layoutGroupId}>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center">
          <div className="mb-1 flex h-11 w-full items-center justify-start px-1 sm:px-2">
            <AnimatePresence>
              {effectiveExpanded && (
                <motion.button
                  key="back-button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onClick={() => setIsExpanded(false)}
                  className="group z-50 flex items-center gap-2 text-muted-foreground transition-all hover:text-foreground"
                >
                  <div className="rounded-full bg-muted p-2 text-foreground transition-colors group-hover:bg-accent">
                    <HugeiconsIcon
                      icon={ArrowLeft01Icon}
                      width={20}
                      height={20}
                    />
                  </div>
                  <span className="font-medium">Go back</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            ref={containerRef}
            layout
            className={cn(
              "relative w-full",
              effectiveExpanded
                ? "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
                : "hero-template-album overflow-hidden rounded-[2rem]"
            )}
            transition={transition}
          >
            <div
              className={cn(
                "relative",
                effectiveExpanded
                  ? "contents"
                  : "h-full w-full"
              )}
            >
              {photos.map((photo, index) => {
                const isPrimary = index < visibleCollapsedCount;
                if (!isPrimary && !effectiveExpanded) return null;
                const offset = index - midpoint;
                const defaultX = offset * spread;
                const defaultY = Math.abs(offset) * 16 + 6;
                const defaultRotation = offset * 7;
                const defaultZIndex = Math.round(40 - Math.abs(offset));

                return (
                  <motion.div
                    key={`card-${photo.id}`}
                    layoutId={`card-container-${photo.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: !effectiveExpanded ? photo.rotation ?? defaultRotation : 0,
                      x: !effectiveExpanded ? photo.x ?? defaultX : 0,
                      y: !effectiveExpanded ? photo.y ?? defaultY : 0,
                      zIndex: !effectiveExpanded ? photo.zIndex ?? defaultZIndex : 10,
                    }}
                    transition={transition}
                    whileHover={
                      !effectiveExpanded
                        ? {
                            scale: 1.05,
                            y: (photo.y ?? defaultY) - 15,
                            rotate: (photo.rotation ?? defaultRotation) * 0.8,
                            zIndex: 50,
                            transition: {
                              type: "spring",
                              stiffness: 400,
                              damping: 25,
                            },
                          }
                        : { scale: 1.02 }
                    }
                    className={cn(
                      "overflow-hidden bg-card",
                      effectiveExpanded
                        ? "relative aspect-[4/3] rounded-2xl border border-border/70 shadow-sm"
                        : "absolute left-1/2 top-1/2 aspect-[4/3] w-[190px] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-2xl border border-border/70 shadow-[0_20px_50px_rgba(0,0,0,0.15)] sm:w-[220px] md:w-[250px]"
                    )}
                    onClick={
                      expandable && !effectiveExpanded
                        ? () => setIsExpanded(true)
                        : undefined
                    }
                  >
                    <motion.div
                      layoutId={`image-inner-${photo.id}`}
                      layout="position"
                      className="w-full h-full relative"
                      transition={transition}
                    >
                      <Image
                        src={photo.src}
                        alt={photo.alt}
                        fill
                        className="object-cover select-none pointer-events-none"
                        sizes={
                          effectiveExpanded
                            ? "(min-width: 1024px) 33vw, 50vw"
                            : "(min-width: 1024px) 250px, (min-width: 640px) 220px, 190px"
                        }
                        priority={isPrimary}
                      />
                    </motion.div>

                    {effectiveExpanded && (photo.label || photo.href) && (
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-8 text-left">
                        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-white sm:text-xs">
                          {photo.label ?? "Open preview"}
                        </p>
                      </div>
                    )}

                    {(effectiveExpanded || !expandable) && photo.href && (
                      <Link
                        href={photo.href}
                        aria-label={`Open ${photo.label ?? "template"} live preview`}
                        className="absolute inset-0 z-30 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <AnimatePresence>
            {expandable && !effectiveExpanded && photos.length > visibleCollapsedCount && (
              <motion.p
                key="expand-hint"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mt-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-xs"
              >
                Click any card to expand
                <HugeiconsIcon icon={ArrowRight01Icon} width={14} height={14} />
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </section>
  );
}
