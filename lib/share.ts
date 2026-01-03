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
  branch?: string;
}

export function createShareData(
  result: Partial<AnalysisResult>
): ShareCardData | null {
  if (!result.metadata) return null;

  const { metadata, scores, techStack, insights, branch } = result;

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
    branch,
  };
}

function formatNumberShort(num: number): string {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

const SITE_URL = "https://repo-gist.vercel.app";

export function generateShareUrl(data: ShareCardData): string {
  const branchParam = data.branch
    ? `?branch=${encodeURIComponent(data.branch)}`
    : "";
  return `${SITE_URL}/share/${data.repoFullName}${branchParam}`;
}

export function generateTwitterShareUrl(data: ShareCardData): string {
  const scoreEmoji =
    data.overallScore >= 80 ? "🟢" : data.overallScore >= 60 ? "🟡" : "🔴";

  const branchInfo = data.branch ? ` (${data.branch} branch)` : "";

  const text = `🔍 Just analyzed ${
    data.repoFullName
  }${branchInfo} using RepoGist!

${scoreEmoji} Score: ${data.overallScore}/100
⭐ Stars: ${formatNumberShort(data.stars)}
💻 Language: ${data.language || "Multiple"}
🛠️ Tech: ${data.techStack.slice(0, 3).join(", ") || "Various"}

Analyze any GitHub repo instantly 👇`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(SITE_URL)}`;
}

export function generateLinkedInShareUrl(data: ShareCardData): string {
  const branchInfo = data.branch ? ` (${data.branch} branch)` : "";

  const text = `🔍 Just analyzed ${
    data.repoFullName
  }${branchInfo} using RepoGist!

📊 Score: ${data.overallScore}/100
⭐ Stars: ${formatNumberShort(data.stars)}
💻 Language: ${data.language || "Multiple"}

RepoGist is an AI-powered tool that analyzes any GitHub repository instantly. Try it out!

${SITE_URL}`;

  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
    text
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
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }
}

function getScoreRating(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "needs improvement";
}

/**
 * Generate simple English summary text for copying
 */
export function generateSummaryText(result: Partial<AnalysisResult>): string {
  if (!result.metadata) return "";

  const parts: string[] = [];

  // Title
  parts.push(`Repository Analysis: ${result.metadata.fullName}`);
  if (result.branch) {
    parts.push(`Branch: ${result.branch}`);
  }
  parts.push(`Analyzed on ${new Date().toLocaleDateString()}`);
  parts.push("");

  // Basic Info
  parts.push("About This Repository");
  parts.push("---------------------");
  if (result.metadata.description) {
    parts.push(result.metadata.description);
    parts.push("");
  }

  const stats = [];
  stats.push(`${result.metadata.stars.toLocaleString()} stars`);
  stats.push(`${result.metadata.forks.toLocaleString()} forks`);
  if (result.metadata.language) {
    stats.push(`written in ${result.metadata.language}`);
  }
  if (result.metadata.license) {
    stats.push(`${result.metadata.license} license`);
  }
  parts.push(`This repository has ${stats.join(", ")}.`);
  parts.push("");

  // Summary
  if (result.summary) {
    parts.push("Summary");
    parts.push("-------");
    parts.push(result.summary);
    parts.push("");
  }

  // What It Does
  if (result.whatItDoes) {
    parts.push("What It Does");
    parts.push("------------");
    parts.push(result.whatItDoes);
    parts.push("");
  }

  // Target Audience
  if (result.targetAudience) {
    parts.push("Who It's For");
    parts.push("------------");
    parts.push(result.targetAudience);
    parts.push("");
  }

  // Scores
  if (result.scores) {
    parts.push("Quality Assessment");
    parts.push("------------------");
    parts.push(
      `Overall Score: ${result.scores.overall}/100 (${getScoreRating(
        result.scores.overall
      )})`
    );
    parts.push("");
    parts.push("Breakdown:");
    parts.push(
      `• Code Quality: ${result.scores.codeQuality}/100 - ${getScoreRating(
        result.scores.codeQuality
      )}`
    );
    parts.push(
      `• Documentation: ${result.scores.documentation}/100 - ${getScoreRating(
        result.scores.documentation
      )}`
    );
    parts.push(
      `• Security: ${result.scores.security}/100 - ${getScoreRating(
        result.scores.security
      )}`
    );
    parts.push(
      `• Maintainability: ${
        result.scores.maintainability
      }/100 - ${getScoreRating(result.scores.maintainability)}`
    );
    parts.push(
      `• Test Coverage: ${result.scores.testCoverage}/100 - ${getScoreRating(
        result.scores.testCoverage
      )}`
    );
    parts.push(
      `• Dependencies: ${result.scores.dependencies}/100 - ${getScoreRating(
        result.scores.dependencies
      )}`
    );
    parts.push("");
  }

  // Tech Stack
  if (result.techStack && result.techStack.length > 0) {
    parts.push("Technologies Used");
    parts.push("-----------------");
    parts.push(result.techStack.join(", "));
    parts.push("");
  }

  // How to Run
  if (result.howToRun && result.howToRun.length > 0) {
    parts.push("Getting Started");
    parts.push("---------------");
    parts.push("To run this project locally:");
    parts.push("");
    result.howToRun.forEach((cmd, i) => {
      parts.push(`${i + 1}. ${cmd}`);
    });
    parts.push("");
  }

  // Key Folders
  if (result.keyFolders && result.keyFolders.length > 0) {
    parts.push("Project Structure");
    parts.push("-----------------");
    parts.push("Key folders in this repository:");
    parts.push("");
    for (const folder of result.keyFolders) {
      parts.push(`• ${folder.name}: ${folder.description}`);
    }
    parts.push("");
  }

  // Insights
  if (result.insights && result.insights.length > 0) {
    parts.push("Key Findings");
    parts.push("------------");

    const strengths = result.insights.filter((i) => i.type === "strength");
    const weaknesses = result.insights.filter((i) => i.type === "weakness");
    const suggestions = result.insights.filter((i) => i.type === "suggestion");
    const warnings = result.insights.filter((i) => i.type === "warning");

    if (strengths.length > 0) {
      parts.push("");
      parts.push("Strengths:");
      for (const insight of strengths.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }

    if (weaknesses.length > 0) {
      parts.push("");
      parts.push("Areas for Improvement:");
      for (const insight of weaknesses.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }

    if (suggestions.length > 0) {
      parts.push("");
      parts.push("Suggestions:");
      for (const insight of suggestions.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }

    if (warnings.length > 0) {
      parts.push("");
      parts.push("Warnings:");
      for (const insight of warnings.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }
    parts.push("");
  }

  // Refactors
  if (result.refactors && result.refactors.length > 0) {
    parts.push("Refactoring Opportunities");
    parts.push("-------------------------");
    for (const refactor of result.refactors.slice(0, 3)) {
      parts.push(
        `• ${refactor.title} (${refactor.impact} impact, ${refactor.effort} effort)`
      );
      parts.push(`  ${refactor.description}`);
      if (refactor.files && refactor.files.length > 0) {
        parts.push(`  Files: ${refactor.files.join(", ")}`);
      }
      parts.push("");
    }
  }

  // Footer
  parts.push("---");
  parts.push(`Generated by RepoGist (${SITE_URL})`);

  return parts.join("\n");
}

/**
 * Generate markdown summary for copying
 */
export function generateMarkdownSummary(
  result: Partial<AnalysisResult>
): string {
  if (!result.metadata) return "";

  const lines: string[] = [];

  // Header
  lines.push(`# Repository Analysis: ${result.metadata.fullName}`);
  if (result.branch) {
    lines.push(`**Branch:** \`${result.branch}\``);
  }
  lines.push("");

  // Badges
  const badgeParts: string[] = [];
  badgeParts.push(
    `![Stars](https://img.shields.io/github/stars/${result.metadata.fullName}?style=flat-square)`
  );
  badgeParts.push(
    `![Forks](https://img.shields.io/github/forks/${result.metadata.fullName}?style=flat-square)`
  );
  if (result.metadata.language) {
    badgeParts.push(
      `![Language](https://img.shields.io/github/languages/top/${result.metadata.fullName}?style=flat-square)`
    );
  }
  lines.push(badgeParts.join(" "));
  lines.push("");

  // Summary
  if (result.summary) {
    lines.push("## Summary");
    lines.push(result.summary);
    lines.push("");
  }

  // What It Does
  if (result.whatItDoes) {
    lines.push("## What It Does");
    lines.push(result.whatItDoes);
    lines.push("");
  }

  // Target Audience
  if (result.targetAudience) {
    lines.push("## Target Audience");
    lines.push(result.targetAudience);
    lines.push("");
  }

  // Scores
  if (result.scores) {
    lines.push("## Quality Scores");
    lines.push("");
    lines.push("| Metric | Score | Rating |");
    lines.push("|--------|-------|--------|");
    lines.push(
      `| **Overall** | ${result.scores.overall}/100 | ${getScoreRating(
        result.scores.overall
      )} |`
    );
    lines.push(
      `| Code Quality | ${result.scores.codeQuality}/100 | ${getScoreRating(
        result.scores.codeQuality
      )} |`
    );
    lines.push(
      `| Documentation | ${result.scores.documentation}/100 | ${getScoreRating(
        result.scores.documentation
      )} |`
    );
    lines.push(
      `| Security | ${result.scores.security}/100 | ${getScoreRating(
        result.scores.security
      )} |`
    );
    lines.push(
      `| Maintainability | ${
        result.scores.maintainability
      }/100 | ${getScoreRating(result.scores.maintainability)} |`
    );
    lines.push(
      `| Test Coverage | ${result.scores.testCoverage}/100 | ${getScoreRating(
        result.scores.testCoverage
      )} |`
    );
    lines.push(
      `| Dependencies | ${result.scores.dependencies}/100 | ${getScoreRating(
        result.scores.dependencies
      )} |`
    );
    lines.push("");
  }

  // Tech Stack
  if (result.techStack && result.techStack.length > 0) {
    lines.push("## Tech Stack");
    lines.push("");
    lines.push(result.techStack.map((t) => `\`${t}\``).join(" • "));
    lines.push("");
  }

  // How to Run
  if (result.howToRun && result.howToRun.length > 0) {
    lines.push("## Getting Started");
    lines.push("");
    lines.push("```bash");
    for (const cmd of result.howToRun) {
      lines.push(cmd);
    }
    lines.push("```");
    lines.push("");
  }

  // Key Folders
  if (result.keyFolders && result.keyFolders.length > 0) {
    lines.push("## Project Structure");
    lines.push("");
    for (const folder of result.keyFolders) {
      lines.push(`- **\`${folder.name}\`**: ${folder.description}`);
    }
    lines.push("");
  }

  // Insights
  if (result.insights && result.insights.length > 0) {
    lines.push("## Key Findings");
    lines.push("");

    const grouped = {
      strength: {
        title: "Strengths",
        items: result.insights.filter((i) => i.type === "strength"),
      },
      weakness: {
        title: "Areas for Improvement",
        items: result.insights.filter((i) => i.type === "weakness"),
      },
      suggestion: {
        title: "Suggestions",
        items: result.insights.filter((i) => i.type === "suggestion"),
      },
      warning: {
        title: "Warnings",
        items: result.insights.filter((i) => i.type === "warning"),
      },
    };

    for (const [, group] of Object.entries(grouped)) {
      if (group.items.length > 0) {
        lines.push(`### ${group.title}`);
        lines.push("");
        for (const insight of group.items) {
          lines.push(`- **${insight.title}**: ${insight.description}`);
        }
        lines.push("");
      }
    }
  }

  // Footer
  lines.push("---");
  lines.push(
    `*Generated by [RepoGist](${SITE_URL}) on ${new Date().toLocaleDateString()}*`
  );

  return lines.join("\n");
}

/**
 * Copy summary to clipboard
 */
export async function copySummary(
  result: Partial<AnalysisResult>,
  format: "text" | "markdown" = "text"
): Promise<boolean> {
  const text =
    format === "markdown"
      ? generateMarkdownSummary(result)
      : generateSummaryText(result);

  return copyToClipboard(text);
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

export function redirectToTwitter(data: ShareCardData): void {
  window.open(generateTwitterShareUrl(data), "_blank", "noopener,noreferrer");
}

export function redirectToLinkedIn(data: ShareCardData): void {
  window.open(generateLinkedInShareUrl(data), "_blank", "noopener,noreferrer");
}
