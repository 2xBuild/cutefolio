"use client";

import { useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Session } from "next-auth";
import { NAV_ITEMS } from "@/components/dashboard/sidebar";
import { SunIcon, MoonIcon, MonitorIcon } from "@/components/icons";
import { useTheme } from "@/components/theme-provider";

type User = Session["user"];

function MobileThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: "light" as const, icon: SunIcon, label: "Light" },
        { value: "dark" as const, icon: MoonIcon, label: "Dark" },
        { value: "system" as const, icon: MonitorIcon, label: "System" },
    ];

    return (
        <div className="mt-3 flex items-center rounded-xl border border-border bg-card p-1">
            {options.map(({ value, icon: Icon, label }) => (
                <button
                    key={value}
                    type="button"
                    aria-label={label}
                    onClick={() => setTheme(value)}
                    className={`flex flex-1 items-center justify-center rounded-lg py-1.5 transition-colors ${
                        theme === value
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/20"
                    }`}
                >
                    <Icon className="h-3.5 w-3.5" />
                </button>
            ))}
        </div>
    );
}

export function DashboardHeader({ user }: { user: User }) {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const currentSection = useMemo(() => {
        const match = [...NAV_ITEMS]
            .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
            .sort((a, b) => b.href.length - a.href.length)[0];
        return match?.label ?? "Dashboard";
    }, [pathname]);

    const isItemActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="relative flex items-center justify-between gap-4 px-4 py-3 md:px-6">
                <p className="truncate text-sm font-semibold text-foreground">
                    {currentSection}
                </p>

                <div className="relative md:hidden">
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                        aria-expanded={isMenuOpen}
                        aria-controls="dashboard-mobile-menu"
                        aria-label="Toggle navigation"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                            <line x1="4" y1="7" x2="20" y2="7" />
                            <line x1="4" y1="12" x2="20" y2="12" />
                            <line x1="4" y1="17" x2="20" y2="17" />
                        </svg>
                    </button>

                    {isMenuOpen && (
                        <div
                            id="dashboard-mobile-menu"
                            className="absolute right-0 top-12 z-30 w-72 rounded-2xl border border-border bg-background p-3 shadow-xl"
                        >
                            <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                                {user?.image ? (
                                    <Image
                                        src={user.image}
                                        alt={user.name ?? "User"}
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-sm font-semibold text-foreground">
                                        {(user?.name ?? "U")[0].toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-foreground">
                                        {user?.name ?? "Account"}
                                    </p>
                                    <p className="truncate text-xs text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            <nav className="flex flex-col gap-1">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = isItemActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                                ? "bg-foreground text-background"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                                }`}
                                        >
                                            {item.icon}
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <MobileThemeToggle />

                            <button
                                type="button"
                                onClick={() => signOut({ callbackUrl: "/" })}
                                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden>
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                    <polyline points="16 17 21 12 16 7" />
                                    <line x1="21" y1="12" x2="9" y2="12" />
                                </svg>
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
