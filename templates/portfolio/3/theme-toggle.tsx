"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

/**
 * Sleek-style theme toggle with View Transitions API.
 * Scoped to portfolio-3 template only.
 */
export function SleekThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  const toggleTheme = () => {
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document
    ) {
      (
        document as Document & {
          startViewTransition: (cb: () => void | Promise<void>) => {
            finished: Promise<void>;
          };
        }
      ).startViewTransition(() => {
        setTheme(next);
        return new Promise<void>((resolve) => setTimeout(resolve, 0));
      });
    } else {
      setTheme(next);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      className="size-10 cursor-pointer rounded-full p-0 transition-all duration-300 active:scale-95 [&_svg]:size-4"
    >
      <span className="sr-only">Toggle theme</span>
      {resolvedTheme === "dark" ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}
    </button>
  );
}
