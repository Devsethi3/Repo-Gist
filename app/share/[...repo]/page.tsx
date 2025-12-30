import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharePageClient } from "./share-page-client";

interface SharePageProps {
  params: Promise<{
    repo: string[];
  }>;
}

const BASE_URL = "https://repo-gist.vercel.app";

// Fetch GitHub data for metadata
async function getGitHubData(owner: string, repo: string) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      name: data.name,
      description: data.description || "",
      stars: data.stargazers_count,
      language: data.language || "Unknown",
    };
  } catch {
    return null;
  }
}

function formatStars(num: number): string {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { repo } = await params;

  if (!repo || repo.length < 2) {
    return { title: "Repository Not Found | RepoGist" };
  }

  const [owner, repoName] = repo;
  const repoFullName = repo.join("/");

  // Fetch real GitHub data
  const githubData = await getGitHubData(owner, repoName);

  // Build OG image URL with real data
  const ogParams = new URLSearchParams({
    repo: repoName,
    owner: owner,
    score: "85", // Default score - will show actual after analysis
    stars: githubData ? formatStars(githubData.stars) : "0",
    language: githubData?.language || "Unknown",
  });

  const ogImageUrl = `${BASE_URL}/api/og?${ogParams.toString()}`;
  const shareUrl = `${BASE_URL}/share/${repoFullName}`;
  const description =
    githubData?.description || `AI-powered analysis of ${repoFullName}`;

  return {
    title: `${repoFullName} Analysis | RepoGist`,
    description: description,
    openGraph: {
      title: `${repoFullName} - Repository Analysis`,
      description: description,
      type: "website",
      siteName: "RepoGist",
      url: shareUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${repoFullName} Analysis`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${repoFullName} Analysis`,
      description: description,
      images: [ogImageUrl],
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { repo } = await params;

  if (!repo || repo.length < 2) {
    notFound();
  }

  const repoFullName = repo.join("/");

  return <SharePageClient repoFullName={repoFullName} />;
}
