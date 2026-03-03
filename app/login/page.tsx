import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { APP_LOGO_PATH } from "@/lib/constants";
import { LoginProviders } from "./login-providers";

export const metadata: Metadata = {
    title: "Sign in · kno.li",
    description: "Sign in to host your portfolio at kno.li",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ callbackUrl?: string }>;
}) {
    const session = await auth();
    const { callbackUrl } = await searchParams;
    const safeCallback =
        callbackUrl?.startsWith("/") ? callbackUrl : "/dashboard";

    if (session?.user) {
        redirect(safeCallback);
    }

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background font-landing">
            {/* Subtle radial glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in srgb, var(--foreground) 7%, transparent), transparent)",
                }}
            />

            <div className="relative z-10 flex w-full max-w-sm flex-col items-center px-6 py-12 text-center">
                <Link
                    href="/"
                    className="mb-8 flex items-center gap-3 transition-opacity hover:opacity-90"
                    aria-label="Home"
                >
                    <Image
                        src={APP_LOGO_PATH}
                        alt=""
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-full object-contain"
                        priority
                    />
                    <span className="text-2xl font-bold tracking-tight text-foreground">
                        kno.li
                    </span>
                </Link>

                <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">
                    Sign in
                </h1>

                <LoginProviders callbackUrl={safeCallback} />

                <p className="mt-6 text-xs text-muted-foreground/60">
                    By continuing you agree to our{" "}
                    <Link href="/tnc" className="underline underline-offset-2">
                        privacy policy and terms
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}
