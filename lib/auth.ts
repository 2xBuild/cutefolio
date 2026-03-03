import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { authConfig } from "./auth.config";
import { users, accounts, sessions, verificationTokens, type PlanTier } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "jwt" },
  ...authConfig,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.planTier = (user.planTier as PlanTier | undefined) ?? "free";
      }

      if (!token.planTier && token.sub) {
        const [dbUser] = await db
          .select({ planTier: users.planTier })
          .from(users)
          .where(eq(users.id, token.sub))
          .limit(1);
        token.planTier = dbUser?.planTier ?? "free";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.planTier = (token.planTier as PlanTier | undefined) ?? "free";
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (!user.id) return;
      try {
        await db
          .update(users)
          .set({
            displayName: user.name ?? null,
            avatarUrl: user.image ?? null,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));
      } catch (error) {
        console.error("Failed to sync user profile fields on sign-in", error);
      }
    },
  },
});
