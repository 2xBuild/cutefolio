import { redirect } from "next/navigation";

interface LegacyProfilePageProps {
  searchParams: Promise<{ appId?: string }>;
}

export default async function LegacyProfilePage({ searchParams }: LegacyProfilePageProps) {
  const params = await searchParams;

  if (params.appId) {
    redirect(`/dashboard/manage-apps/${params.appId}/edit`);
  }

  redirect("/dashboard/manage-apps");
}
