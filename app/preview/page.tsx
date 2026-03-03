import { dummyProfile } from "@/lib/dummy-profile";
import { getProfileThemeStyle } from "@/lib/profile-theme";
import { getTemplateEntry, DEFAULT_TEMPLATE_ID } from "@/templates";

type PreviewPageProps = {
  searchParams: Promise<{ template?: string }>;
};

/**
 * Preview page for testing templates with dummy data.
 * Uses each template's own dummy.json when available, falls back to global dummy.
 */
export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const { template } = await searchParams;
  const templateId = template ?? DEFAULT_TEMPLATE_ID;
  const entry = getTemplateEntry(templateId);
  const { default: Template } = await entry.load();

  let profile;
  try {
    profile = await entry.loadDummy();
  } catch {
    profile = dummyProfile;
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background"
      style={getProfileThemeStyle(profile)}
    >
      <Template profile={{ ...profile, template: entry.meta.id }} />
    </div>
  );
}
