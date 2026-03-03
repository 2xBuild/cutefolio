interface ErrorLike {
  code?: string;
  message?: string;
  cause?: unknown;
}

function asErrorLike(value: unknown): ErrorLike | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as ErrorLike;
}

function collectErrorData(input: unknown): { codes: string[]; message: string } {
  const codes: string[] = [];
  const messages: string[] = [];
  let current: unknown = input;

  while (current) {
    const next = asErrorLike(current);
    if (!next) {
      break;
    }

    if (typeof next.code === "string") {
      codes.push(next.code);
    }

    if (typeof next.message === "string") {
      messages.push(next.message);
    }

    current = next.cause;
  }

  return {
    codes,
    message: messages.join(" ").toLowerCase(),
  };
}

export function getDatabaseErrorHint(error: unknown): string {
  const data = collectErrorData(error);

  if (data.codes.includes("42P01")) {
    return "Database schema is missing expected tables. Run migrations (npx drizzle-kit migrate) and restart the server.";
  }

  if (data.codes.includes("42703")) {
    return "Database schema is missing expected columns. Run migrations (npx drizzle-kit migrate) and restart the server.";
  }

  if (data.codes.includes("ENOTFOUND") || data.message.includes("enotfound")) {
    return "Database host could not be resolved. Verify your DATABASE_URL host and DNS/network access.";
  }

  if (data.codes.includes("ECONNREFUSED") || data.message.includes("econnrefused")) {
    return "Database connection was refused. Verify that the database is reachable from this environment.";
  }

  if (
    data.codes.includes("28P01") ||
    data.message.includes("password authentication failed") ||
    data.message.includes("authentication failed")
  ) {
    return "Database credentials were rejected. Verify DATABASE_URL username/password.";
  }

  return "Database query failed. Verify DATABASE_URL and ensure the latest migrations are applied.";
}
