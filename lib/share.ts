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

// Generate share URL with query parameters for OG image
export function generateShareUrl(data: ShareCardData): string {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://repo-gist.vercel.app";

  // Add query parameters for OG image generation
  const params = new URLSearchParams({
    score: data.overallScore.toString(),
    stars: formatNumberShort(data.stars),
    language: data.language || "Unknown",
    description: data.description?.slice(0, 100) || "",
  });

  return `${baseUrl}/share/${data.repoFullName}?${params.toString()}`;
}

// Generate clean URL without query params (for display purposes)
export function generateCleanShareUrl(data: ShareCardData): string {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://repo-gist.vercel.app";
  return `${baseUrl}/share/${data.repoFullName}`;
}

export function generateTwitterShareText(data: ShareCardData): string {
  const scoreEmoji =
    data.overallScore >= 80 ? "🟢" : data.overallScore >= 60 ? "🟡" : "🔴";
  const techList = data.techStack.slice(0, 3).join(", ");

  return `🔍 Just analyzed ${data.repoFullName} with RepoGist!

${scoreEmoji} Score: ${data.overallScore}/100
⭐ ${formatNumberShort(data.stars)} stars
🛠️ ${techList}${
    data.techStack.length > 3 ? ` +${data.techStack.length - 3} more` : ""
  }

Check out the full analysis:`;
}

export function generateTwitterShareUrl(data: ShareCardData): string {
  const text = generateTwitterShareText(data);
  const url = generateShareUrl(data);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;
}

// Fixed LinkedIn sharing - using the correct format
export function generateLinkedInShareUrl(data: ShareCardData): string {
  const url = generateShareUrl(data);
  // LinkedIn requires the URL to be properly encoded
  // Using the share endpoint that works better
  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
    `🔍 Check out this repository analysis for ${data.repoFullName}!\n\n` +
      `📊 Score: ${data.overallScore}/100\n` +
      `⭐ ${formatNumberShort(data.stars)} stars\n\n` +
      `${url}`
  )}`;
}

// Alternative LinkedIn share URL (if the above doesn't work well)
export function generateLinkedInShareUrlAlt(data: ShareCardData): string {
  const url = generateShareUrl(data);
  const title = `${data.repoName} - Repository Analysis`;
  const summary = `AI analysis score: ${data.overallScore}/100. Check out the full analysis on RepoGist.`;

  return `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
    url
  )}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(
    summary
  )}&source=RepoGist`;
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
