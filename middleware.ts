import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { FIRST_PARTY_HOSTS, normalizeHost, X_REQUEST_HOST } from "@/lib/constants";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const requestHeaders = new Headers(req.headers);
    // Use Host header from incoming request - it reflects the domain the user actually visited.
    // req.nextUrl.host can be wrong when Vercel proxies the request.
    const actualHost =
      req.headers.get("host") ?? req.headers.get("x-forwarded-host") ?? req.nextUrl.host ?? "";
    if (actualHost) {
      requestHeaders.set(X_REQUEST_HOST, actualHost);
    }
    if (!requestHeaders.get("x-forwarded-host")) {
      requestHeaders.set("x-forwarded-host", actualHost);
    }
    const host = normalizeHost(requestHeaders.get(X_REQUEST_HOST) ?? requestHeaders.get("x-forwarded-host") ?? actualHost) ?? "";

    if (host && !FIRST_PARTY_HOSTS.has(host)) {
        // For root path, don't rewrite - let the request hit app/page.tsx directly
        // with original headers. Rewrites can corrupt x-forwarded-host in production.
        if (pathname === "/") {
            return NextResponse.next({
                request: { headers: requestHeaders },
            });
        }
        const rewriteUrl = req.nextUrl.clone();
        rewriteUrl.pathname = "/";
        return NextResponse.rewrite(rewriteUrl, {
            request: { headers: requestHeaders },
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
