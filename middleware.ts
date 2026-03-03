import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { FIRST_PARTY_HOSTS, normalizeHost, X_REQUEST_HOST } from "@/lib/constants";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const requestHeaders = new Headers(req.headers);
    // Always set x-request-host from the actual request URL - Next.js rewrites
    // can overwrite x-forwarded-host in production, breaking custom domain routing.
    const actualHost = req.nextUrl.host;
    if (actualHost) {
        requestHeaders.set(X_REQUEST_HOST, actualHost);
    }
    if (!requestHeaders.get("x-forwarded-host")) {
        requestHeaders.set("x-forwarded-host", actualHost);
    }
    const host = normalizeHost(requestHeaders.get(X_REQUEST_HOST) ?? requestHeaders.get("x-forwarded-host") ?? actualHost) ?? "";

    if (host && !FIRST_PARTY_HOSTS.has(host)) {
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = "/";
        return NextResponse.rewrite(rewriteUrl, {
            request: {
                headers: requestHeaders,
            },
        });
    }

    // If accessing dashboard without a session, redirect to /login
    if (pathname.startsWith("/dashboard") && !req.auth) {
        const loginUrl = new URL("/login", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If already logged in and visiting /login, redirect to /dashboard
    if (pathname === "/login" && req.auth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|api).*)"],
};
