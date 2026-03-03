import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@/lib/auth";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: "production",
  getExternalCustomerId: async () => {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
  },
});
