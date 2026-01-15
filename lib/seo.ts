import { Metadata } from "next";

export const siteConfig = {
  name: "RepoGist",
  description:
    "AI-powered GitHub repository analysis tool. Get instant insights on code quality, architecture, security vulnerabilities, and actionable improvement suggestions.",
  url: "https://repo-gist.vercel.app",
  ogImage: "https://repo-gist.vercel.app/og-image.png",
  links: {
    twitter: "https://x.com/imsethidev",
    github: "https://github.com/Devsethi3/Repo-Gist",
  },
};

/**
 * Construct metadata for pages with proper SEO defaults
 */

export function constructMetadata({
  title = siteConfig.name,
  description = siteConfig.description,
  image = siteConfig.ogImage,
  icons = "/favicon.ico",
  noIndex = false,
  ...props
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} & Partial<Metadata> = {}): Metadata {
  return {
    title,
    description,
    keywords: [
      "GitHub",
      "repository analysis",
      "code quality",
      "AI analysis",
      "code review",
      "developer tools",
      "open source",
      "software architecture",
      "dependency analysis",
      "security scanning",
      "code metrics",
      "technical debt",
      "repository insights",
      "GitHub automation",
      "code health",
    ],
    authors: [
      {
        name: "Dev Prasad Sethi",
        url: "https://x.com/imsethidev",
      },
    ],
    creator: "Dev Prasad Sethi",
    openGraph: {
      title,
      description,
      type: "website",
      url: siteConfig.url,
      siteName: siteConfig.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@imsethidev",
    },
    icons,
    metadataBase: new URL(siteConfig.url),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
    ...props,
  };
}

// Generate FAQ structured data
export function generateFAQStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is RepoGist?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "RepoGist is an AI-powered tool that analyzes GitHub repositories to provide instant insights on code quality, architecture, security vulnerabilities, and improvement suggestions. It helps developers understand any codebase in seconds.",
        },
      },
      {
        "@type": "Question",
        name: "Is RepoGist free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, RepoGist is completely free and open-source. You can analyze any public GitHub repository without any cost or registration.",
        },
      },
      {
        "@type": "Question",
        name: "How does RepoGist analyze repositories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "RepoGist fetches repository data from GitHub, analyzes the code structure, dependencies, and file organization, then uses AI to generate comprehensive insights about code quality, architecture patterns, security issues, and improvement opportunities.",
        },
      },
      {
        "@type": "Question",
        name: "Can I analyze private repositories?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Currently, RepoGist supports analysis of public GitHub repositories only. Private repository support may be added in future updates.",
        },
      },
      {
        "@type": "Question",
        name: "What information does RepoGist provide?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "RepoGist provides code quality scores, architecture diagrams, security insights, dependency analysis, refactoring suggestions, automation recommendations, and detailed file tree visualization with statistics.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export the analysis results?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can export analysis results in multiple formats including PDF reports, Markdown, plain text, and shareable social media cards. You can also share results via a public link.",
        },
      },
      {
        "@type": "Question",
        name: "Does RepoGist support branch analysis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, RepoGist allows you to analyze any branch in a repository, not just the default branch. You can switch between branches to compare different versions of the codebase.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is the AI analysis?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "RepoGist uses advanced AI models to analyze code patterns and best practices. While highly accurate, the analysis should be used as a helpful guide alongside human code review and expertise.",
        },
      },
    ],
  };
}

// Generate BreadcrumbList structured data
export function generateBreadcrumbStructuredData(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Generate Organization structured data
export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RepoGist",
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    sameAs: [siteConfig.links.twitter, siteConfig.links.github],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      url: `${siteConfig.links.github}/issues`,
    },
  };
}

// Generate SoftwareApplication structured data
export function generateSoftwareApplicationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RepoGist",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      ratingCount: "1",
    },
  };
}

/**
 * Generate canonical URL for a path
 */
export function generateCanonicalUrl(path: string = ""): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${cleanPath}`;
}

/**
 * Truncate text to a specific length for meta descriptions
 */
export function truncateDescription(text: string, maxLength: number = 160): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3).trim() + "...";
}

/**
 * Generate dynamic OG image URL
 */
export function generateOgImageUrl(params: {
  title?: string;
  description?: string;
  repo?: string;
  owner?: string;
}): string {
  const searchParams = new URLSearchParams();
  
  if (params.repo) searchParams.set("repo", params.repo);
  if (params.owner) searchParams.set("owner", params.owner);
  if (params.title) searchParams.set("title", params.title);
  if (params.description) searchParams.set("description", params.description);
  
  return `${siteConfig.url}/api/og?${searchParams.toString()}`;
}

/**
 * Format stars count for display
 */
export function formatStarsForSEO(stars: number): string {
  if (stars >= 1000000) return `${(stars / 1000000).toFixed(1)}M`;
  if (stars >= 1000) return `${(stars / 1000).toFixed(1)}K`;
  return stars.toString();
}
