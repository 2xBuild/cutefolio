import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLatestActiveSubscription } from "@/lib/repositories/billing-repo";
import { PlanClient } from "./plan-client";

export default async function PlanPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const subscription = await getLatestActiveSubscription(session.user.id);

  return (
    <PlanClient
      userId={session.user.id}
      userEmail={session.user.email ?? null}
      planTier={session.user.planTier}
      subscription={
        subscription
          ? {
              status: subscription.status,
              currentPeriodEnd:
                subscription.currentPeriodEnd?.toISOString() ?? null,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null
      }
    />
  );
}
