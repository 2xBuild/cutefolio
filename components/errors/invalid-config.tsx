import Link from "next/link";

export function InvalidConfig() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <h1 className="text-2xl font-semibold text-foreground">
        Invalid profile configuration
      </h1>
      <p className="text-center text-muted-foreground">
        This app is missing required profile content. Open the editor and save a valid profile
        to publish. See{" "}
        <Link
          href="/tnc"
          className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
        >
          privacy &amp; terms
        </Link>{" "}
        for field requirements.
      </p>
    </div>
  );
}
