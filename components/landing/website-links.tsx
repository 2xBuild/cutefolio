const DOMAINS = [
  "kno.li",
  "wanna-hire.me",
  "it-iz.me",
] as const;

export function WebsiteLinks() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {DOMAINS.map((domain) => (
        <span
          key={domain}
          className="rounded-full border border-border bg-card/90 px-3.5 py-1.5 font-mono text-sm text-muted-foreground"
        >
          {domain}
        </span>
      ))}
    </div>
  );
}
