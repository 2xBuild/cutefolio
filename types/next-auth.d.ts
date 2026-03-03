import type { DefaultSession } from "next-auth";
import type { PlanTier } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      planTier: PlanTier;
    };
  }

  interface User {
    planTier?: PlanTier;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    planTier?: PlanTier;
  }
}
