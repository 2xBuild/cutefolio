"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AppWithCurrentContent } from "@/lib/repositories/apps-repo";

interface PortfoliosSectionProps {
    portfolios: AppWithCurrentContent[];
}

export function PortfoliosSection({ portfolios }: PortfoliosSectionProps) {
    if (portfolios.length === 0) return null;

    return (
        <section className="px-4 py-20">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col items-center gap-3">
                    <motion.h2
                        className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Featured Portfolios
                    </motion.h2>

                    <motion.p
                        className="mx-auto max-w-xl text-center text-muted-foreground"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Explore some of the amazing profiles built and hosted on cutefolio.
                    </motion.p>
                </div>

                <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {portfolios.map((portfolio, i) => {
                        const content = portfolio.currentContent?.content as any;
                        const name = content?.name ?? portfolio.app.slug;
                        const bio = content?.bio ?? "A beautiful cutefolio profile.";
                        const url = `https://${portfolio.app.slug}.cutefolio`;

                        return (
                            <motion.div
                                key={portfolio.app.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:border-border hover:shadow-md"
                            >
                                <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                                    {/* We don't have screenshots for all, using a placeholder/pattern if missing */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                                        <span className="text-4xl font-bold text-primary/20">
                                            {portfolio.app.slug[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                                </div>

                                <div className="flex flex-1 flex-col p-5">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-foreground">{name}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                cutefolio/{portfolio.app.slug}
                                            </p>
                                        </div>
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                        >
                                            <a
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={`Visit ${name}`}
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                                        {bio}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <motion.div
                    className="mt-12 flex justify-center"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Button
                        asChild
                        variant="outline"
                        className="landing-cta-button group gap-2 px-8"
                    >
                        <Link href="/preview">
                            <span>View all portfolios</span>
                            <span className="relative ml-1 inline-flex h-4 w-4 items-center justify-center overflow-hidden">
                                <ArrowUpRight className="size-4 -translate-y-px transition-all duration-200 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:opacity-0" />
                                <ArrowRight className="size-4 absolute translate-x-1 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100" />
                            </span>
                        </Link>
                    </Button>
                </motion.div>
            </div>
        </section>
    );
}
