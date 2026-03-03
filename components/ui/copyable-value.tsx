"use client";

import { useState, useCallback } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyableValueProps {
  value: string;
  label?: string;
  className?: string;
  mono?: boolean;
}

export function CopyableValue({ value, label, className, mono = true }: CopyableValueProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "group inline-flex items-center gap-1.5 rounded-md border bg-muted/50 px-2 py-1 text-sm transition-colors hover:bg-muted",
        copied && "border-foreground/20 bg-muted",
        className,
      )}
      title={copied ? "Copied!" : `Copy ${label ?? "value"}`}
    >
      <span className={cn("max-w-[280px] truncate", mono && "font-mono text-xs")}>
        {value}
      </span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-foreground" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
      )}
    </button>
  );
}
