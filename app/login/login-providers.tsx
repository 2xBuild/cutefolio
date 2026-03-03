"use client";

import { GoogleIcon } from "@/components/icons";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginProviders({ callbackUrl = "/dashboard" }: { callbackUrl?: string }) {
  const [loadingProvider, setLoadingProvider] = useState<"google" | null>(null);

  const handleSignIn = async (provider: "google") => {
    setLoadingProvider(provider);
    await signIn(provider, { callbackUrl });
  };

  return (
    <div className="flex w-full flex-col gap-3">
      <button
        onClick={() => handleSignIn("google")}
        disabled={!!loadingProvider}
        className="landing-cta-button group flex h-11 w-full items-center justify-center gap-3 rounded-full bg-foreground px-6 text-sm font-semibold text-background transition-all hover:bg-foreground/90 disabled:opacity-60"
      >
        <GoogleIcon />
        {loadingProvider === "google" ? "Redirecting…" : "Continue with Google"}
      </button>
    </div>
  );
}
