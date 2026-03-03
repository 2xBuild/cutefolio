import Link from "next/link";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4">
      <h1 className="text-2xl font-semibold text-foreground">
        Profile not found
      </h1>
      <p className="text-center text-muted-foreground">
        Set up your hosted profile and claim a username in{" "}
        <Link
          href="/dashboard/create-app"
          className="text-foreground underline underline-offset-2 hover:text-muted-foreground"
        >
          dashboard
        </Link>
      </p>
    </div>
  );
}
