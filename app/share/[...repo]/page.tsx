import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharePageClient } from "./share-page-client";

interface SharePageProps {
  params: Promise<{
    repo: string[];
  }>;
}

// Generate metadata for social sharing (Open Graph)
export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { repo } = await params;
  const repoFullName = repo.join("/");

  return {
    title: `${repoFullName} - Repository Analysis | RepoGist`,
    description: `View the AI-powered analysis of ${repoFullName} on RepoGist`,
    openGraph: {
      title: `${repoFullName} Analysis`,
      description: `Check out the repository analysis for ${repoFullName}`,
      type: "website",
      siteName: "RepoGist",
    },
    twitter: {
      card: "summary_large_image",
      title: `${repoFullName} Analysis`,
      description: `Check out the repository analysis for ${repoFullName}`,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { repo } = await params;

  // Expecting format: /share/owner/repo
  if (!repo || repo.length < 2) {
    notFound();
  }

  const repoFullName = repo.join("/");

  return <SharePageClient repoFullName={repoFullName} />;
}
