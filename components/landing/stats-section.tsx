"use client";

import { motion } from "motion/react";
import { LayoutTemplate, Globe, BarChart3 } from "lucide-react";

interface StatsSectionProps {
    templatesCount: number;
    liveAppsCount: number;
    totalViews: number;
}

export function StatsSection({
    templatesCount,
    liveAppsCount,
    totalViews,
}: StatsSectionProps) {
    const stats = [
        {
            label: "Beautiful Templates",
            value: templatesCount.toString(),
            icon: LayoutTemplate,
            description: "Professionally designed for your profile.",
        },
        {
            label: "Live Apps",
            value: `${liveAppsCount}+`,
            icon: Globe,
            description: "Profiles already hosted on kno.li.",
        },
        {
            label: "Total Views",
            value: totalViews.toLocaleString(),
            icon: BarChart3,
            description: "Page views tracked across the platform.",
        },
    ];

    return (
        <section className="border-t border-border/60 bg-muted/30 px-4 py-20">
            <div className="mx-auto max-w-5xl">
                <div className="grid gap-8 sm:grid-cols-3">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <h3 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                                {stat.value}
                            </h3>
                            <p className="mt-1 font-medium text-foreground">{stat.label}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {stat.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
