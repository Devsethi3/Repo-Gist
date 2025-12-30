// app/share/[...repo]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharePageClient } from "./share-page-client";

interface SharePageProps {
  params: Promise<{
    repo: string[];
  }>;
  searchParams: Promise<{
    score?: string;
    stars?: string;
    language?: string;
    description?: string;
  }>;
}

const BASE_URL = "https://repo-gist.vercel.app";

// Generate metadata for social sharing (Open Graph)
export async function generateMetadata({
  params,
  searchParams,
}: SharePageProps): Promise<Metadata> {
  const { repo } = await params;
  const search = await searchParams;

  const repoFullName = repo.join("/");
  const [owner, repoName] = repoFullName.split("/");

  // Build OG image URL with parameters
  const ogImageParams = new URLSearchParams({
    repo: repoName || repoFullName,
    owner: owner || "",
    score: search.score || "0",
    stars: search.stars || "0",
    language: search.language || "Unknown",
    description: search.description || "",
  });

  const ogImageUrl = `${BASE_URL}/api/og?${ogImageParams.toString()}`;
  const shareUrl = `${BASE_URL}/share/${repoFullName}`;

  return {
    title: `${repoFullName} - Repository Analysis | RepoGist`,
    description: `AI-powered analysis of ${repoFullName}. Score: ${
      search.score || "N/A"
    }/100. View detailed insights, code quality metrics, and recommendations.`,
    openGraph: {
      title: `${repoFullName} Analysis - Score: ${search.score || "N/A"}/100`,
      description: `Check out the AI-powered analysis of ${repoFullName} on RepoGist. Get insights on code quality, security, and more.`,
      type: "website",
      siteName: "RepoGist",
      url: shareUrl,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${repoFullName} Repository Analysis Score Card`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${repoFullName} - Score: ${search.score || "N/A"}/100`,
      description: `AI-powered repository analysis for ${repoFullName}`,
      images: [ogImageUrl],
      creator: "@repogist",
    },
    alternates: {
      canonical: shareUrl,
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
