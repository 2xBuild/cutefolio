"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { APP_LOGO_PATH } from "@/lib/constants";
import { SunIcon, MoonIcon, MonitorIcon } from "@/components/icons";
import { useTheme } from "@/components/theme-provider";

export const NAV_ITEMS = [
    {
        label: "Home",
        href: "/dashboard",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
            </svg>
        )
    },
    {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
        ),
    },
    {
        label: "Plan",
        href: "/dashboard/plan",
        icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
        ),
    },
];

function SidebarThemeToggle() {
    const { theme, setTheme } = useTheme();

    const options = [
        { value: "light" as const, icon: SunIcon, label: "Light" },
        { value: "dark" as const, icon: MoonIcon, label: "Dark" },
        { value: "system" as const, icon: MonitorIcon, label: "System" },
    ];

    return (
        <div className="flex items-center rounded-xl border border-border bg-card p-1">
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

export function DashboardSidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <aside className="flex h-full flex-col justify-between bg-sidebar px-4 py-6">
            {/* Top: logo + user */}
            <div className="flex flex-col gap-6">
                {/* Logo + brand */}
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
                    aria-label="Dashboard home"
                >
                    <Image
                        src={APP_LOGO_PATH}
                        alt=""
                        width={28}
                        height={28}
                        className="h-7 w-7 shrink-0 rounded-full object-contain"
                    />
                    <span className="text-base font-bold tracking-tight text-foreground">
                        kno.li
                    </span>
                </Link>

                {/* User mini-profile */}
                {session?.user && (
                    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5">
                        {session.user.image ? (
                            <Image
                                src={session.user.image}
                                alt={session.user.name ?? "User"}
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-sm font-bold text-foreground">
                                {(session.user.name ?? "U")[0].toUpperCase()}
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold leading-none text-foreground">
                                {session.user.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                {session.user.email}
                            </p>
                        </div>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex flex-col gap-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
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
            </div>

            {/* Bottom: theme + logout */}
            <div className="flex flex-col gap-3">
                <SidebarThemeToggle />
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4 shrink-0" aria-hidden>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log out
                </button>
            </div>
        </aside>
    );
}
