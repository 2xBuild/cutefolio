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
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700"
    >
      <SiGithub className="h-4 w-4" aria-hidden />
      <span>Open Source</span>
      {stars != null && (
        <span className="flex items-center gap-1 before:content-['·'] before:text-neutral-400">
          ★ {stars.toLocaleString()}
        </span>
      )}
    </a>
  );
}
