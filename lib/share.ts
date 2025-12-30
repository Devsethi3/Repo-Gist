import { AnalysisResult } from "./types";

export interface ShareCardData {
  repoName: string;
  repoFullName: string;
  ownerAvatar: string;
  ownerLogin: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  license: string | null;
  overallScore: number;
  scores: {
    codeQuality: number;
    documentation: number;
    security: number;
    maintainability: number;
    testCoverage: number;
    dependencies: number;
  };
  techStack: string[];
  topInsights: {
    strengths: number;
    weaknesses: number;
    suggestions: number;
    warnings: number;
  };
  analyzedAt: string;
}

export function createShareData(
  result: Partial<AnalysisResult>
): ShareCardData | null {
  if (!result.metadata) return null;

  const { metadata, scores, techStack, insights } = result;

  return {
    repoName: metadata.name,
    repoFullName: metadata.fullName,
    ownerAvatar: metadata.owner.avatarUrl,
    ownerLogin: metadata.owner.login,
    description: metadata.description,
    stars: metadata.stars,
    forks: metadata.forks,
    watchers: metadata.watchers,
    language: metadata.language,
    license: metadata.license,
    overallScore: scores?.overall || 0,
    scores: {
      codeQuality: scores?.codeQuality || 0,
      documentation: scores?.documentation || 0,
      security: scores?.security || 0,
      maintainability: scores?.maintainability || 0,
      testCoverage: scores?.testCoverage || 0,
      dependencies: scores?.dependencies || 0,
    },
    techStack: techStack || [],
    topInsights: {
      strengths: insights?.filter((i) => i.type === "strength").length || 0,
      weaknesses: insights?.filter((i) => i.type === "weakness").length || 0,
      suggestions: insights?.filter((i) => i.type === "suggestion").length || 0,
      warnings: insights?.filter((i) => i.type === "warning").length || 0,
    },
    analyzedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };
}

function formatNumberShort(num: number): string {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

const BASE_URL = "https://repo-gist.vercel.app";

// Generate CLEAN share URL (no query params - short and clean)
export function generateShareUrl(data: ShareCardData): string {
  return `${BASE_URL}/share/${data.repoFullName}`;
}

// Generate OG image URL with minimal params (used internally)
export function generateOgImageUrl(data: ShareCardData): string {
  const params = new URLSearchParams({
    repo: data.repoName,
    owner: data.ownerLogin,
    score: data.overallScore.toString(),
    stars: formatNumberShort(data.stars),
    lang: data.language || "",
  });

  return `${BASE_URL}/api/og?${params.toString()}`;
}

// Twitter share - clean URL, score in text
export function generateTwitterShareText(data: ShareCardData): string {
  const scoreEmoji =
    data.overallScore >= 80 ? "🟢" : data.overallScore >= 60 ? "🟡" : "🔴";

  return `🔍 Analyzed ${data.repoFullName} with @RepoGist

${scoreEmoji} Score: ${data.overallScore}/100
⭐ ${formatNumberShort(data.stars)} stars
🛠️ ${data.language || "Multiple languages"}

Check it out:`;
}

export function generateTwitterShareUrl(data: ShareCardData): string {
  const text = generateTwitterShareText(data);
  const url = generateShareUrl(data); // Clean URL without params

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;
}

// LinkedIn share - using shareArticle with clean URL
export function generateLinkedInShareUrl(data: ShareCardData): string {
  const url = generateShareUrl(data); // Clean URL

  return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    url
  )}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
}

export async function downloadAsImage(
  element: HTMLElement,
  filename: string
): Promise<boolean> {
  try {
    const { toPng } = await import("html-to-image");

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#09090b",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Failed to download image:", error);
    return false;
  }
}
