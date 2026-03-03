import { SiGithub } from "react-icons/si";

const GITHUB_REPO = "2xBuild/it-iz.me";

async function getGitHubStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return data.stargazers_count ?? null;
  } catch {
    return null;
  }
}

export async function GitHubPill() {
  const stars = await getGitHubStars();
  return (
    <a
      href={`https://github.com/${GITHUB_REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
    >
      <SiGithub className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden />
      <span>Open Source</span>
      {stars != null && (
        <span className="flex items-center gap-1 before:text-neutral-400 before:content-['·']">
          ★ {stars.toLocaleString()}
        </span>
      )}
    </a>
  );
}
