# SEO Implementation Guide for RepoGist

## Overview

This guide explains how to use the SEO utilities and configurations in your RepoGist project.

## Files Added/Modified

### New Files:
- `lib/seo.ts` - SEO utility functions and structured data generators
- `components/seo.tsx` - React component for injecting structured data
- `public/browserconfig.xml` - Windows tile configuration
- `SEO-CHECKLIST.md` - Comprehensive SEO checklist

### Enhanced Files:
- `app/layout.tsx` - Added enhanced metadata and JSON-LD
- `public/site.webmanifest` - Enhanced PWA configuration
- `public/robots.txt` - Already optimized
- `app/sitemap.ts` - Already implemented

## Using SEO Utilities

### 1. Constructing Page Metadata

```typescript
import { constructMetadata } from "@/lib/seo";

export const metadata = constructMetadata({
  title: "Custom Page Title",
  description: "Custom page description",
  image: "/custom-og-image.png",
  noIndex: false, // Set to true to prevent indexing
});
```

### 2. Adding Structured Data to Pages

```typescript
import { SEO } from "@/components/seo";
import { generateFAQStructuredData } from "@/lib/seo";

export default function Page() {
  const faqData = generateFAQStructuredData();
  
  return (
    <>
      <SEO structuredData={faqData} />
      {/* Your page content */}
    </>
  );
}
```

### 3. Multiple Structured Data Types

```typescript
import { SEO } from "@/components/seo";
import {
  generateFAQStructuredData,
  generateBreadcrumbStructuredData,
} from "@/lib/seo";

export default function Page() {
  const breadcrumbs = generateBreadcrumbStructuredData([
    { name: "Home", url: "https://repo-gist.vercel.app" },
    { name: "Analysis", url: "https://repo-gist.vercel.app/analysis" },
  ]);
  
  const faq = generateFAQStructuredData();
  
  return (
    <>
      <SEO structuredData={[breadcrumbs, faq]} />
      {/* Your page content */}
    </>
  );
}
```

### 4. Generating Canonical URLs

```typescript
import { generateCanonicalUrl } from "@/lib/seo";

const canonicalUrl = generateCanonicalUrl("/share/owner/repo");
// Returns: "https://repo-gist.vercel.app/share/owner/repo"
```

### 5. Truncating Descriptions

```typescript
import { truncateDescription } from "@/lib/seo";

const longDescription = "This is a very long description...";
const shortDescription = truncateDescription(longDescription, 160);
// Truncates to 160 characters with "..."
```

### 6. Dynamic OG Images

```typescript
import { generateOgImageUrl } from "@/lib/seo";

const ogImage = generateOgImageUrl({
  repo: "Repo-Gist",
  owner: "Devsethi3",
  title: "Repository Analysis",
});
// Returns URL with query parameters for dynamic OG image generation
```

### 7. Format Star Counts

```typescript
import { formatStarsForSEO } from "@/lib/seo";

const starsText = formatStarsForSEO(15420);
// Returns: "15.4K"
```

## Dynamic Metadata for Share Pages

The share pages already have dynamic metadata. Here's how it works:

```typescript
// app/share/[...repo]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { repo } = await params;
  const owner = repo[0];
  const repoName = repo[1];
  
  // Fetch GitHub data
  const github = await getGitHubData(owner, repoName);
  
  return {
    title: `${owner}/${repoName} - Analysis | RepoGist`,
    description: github.description,
    openGraph: {
      // ... OG tags
    },
    twitter: {
      // ... Twitter cards
    },
  };
}
```

## Structured Data Types Available

### 1. WebApplication (Main)
Already implemented in `app/layout.tsx`

### 2. FAQ Page
```typescript
import { generateFAQStructuredData } from "@/lib/seo";
const faqData = generateFAQStructuredData();
```

### 3. Breadcrumbs
```typescript
import { generateBreadcrumbStructuredData } from "@/lib/seo";
const breadcrumbs = generateBreadcrumbStructuredData([
  { name: "Home", url: "/" },
  { name: "Page", url: "/page" },
]);
```

### 4. Organization
```typescript
import { generateOrganizationStructuredData } from "@/lib/seo";
const orgData = generateOrganizationStructuredData();
```

### 5. Software Application
```typescript
import { generateSoftwareApplicationStructuredData } from "@/lib/seo";
const appData = generateSoftwareApplicationStructuredData();
```

## Best Practices

### 1. Page Titles
- Keep under 60 characters
- Include primary keyword
- Make it unique per page
- Format: "Page Name | RepoGist"

### 2. Meta Descriptions
- Keep between 150-160 characters
- Include call-to-action
- Make it compelling and unique
- Include primary keyword naturally

### 3. OG Images
- Dimensions: 1200x630px
- File size: < 1MB
- Format: PNG or JPG
- Include text/branding

### 4. Structured Data
- Validate with Google Rich Results Test
- Keep data accurate and up-to-date
- Don't add unnecessary markup
- Test regularly

## Testing Your SEO

### 1. Local Testing
```bash
# Run development server
pnpm dev

# Check metadata in browser DevTools
# View page source (Ctrl+U)
# Look for <head> tags
```

### 2. Production Testing
After deployment, test with:

1. **Google Rich Results Test**
   https://search.google.com/test/rich-results
   
2. **Open Graph Debugger**
   https://www.opengraph.xyz/
   
3. **Twitter Card Validator**
   https://cards-dev.twitter.com/validator
   
4. **Schema Markup Validator**
   https://validator.schema.org/

### 3. Lighthouse Audit
```bash
# Open Chrome DevTools
# Go to Lighthouse tab
# Run audit for SEO category
```

## Common Issues & Solutions

### Issue: OG images not updating
**Solution:** Clear cache or use Facebook Debugger to force refresh
- https://developers.facebook.com/tools/debug/

### Issue: Structured data errors
**Solution:** Validate with Schema.org validator
- Check for missing required fields
- Ensure proper nesting
- Validate JSON syntax

### Issue: Duplicate meta tags
**Solution:** 
- Check that metadata is only defined once per route
- Don't mix metadata export with Head component
- Use layout.tsx for site-wide metadata

### Issue: Wrong canonical URL
**Solution:**
- Ensure NEXT_PUBLIC_SITE_URL is set correctly
- Use absolute URLs for canonical tags
- Check for trailing slashes

## Environment Variables

Make sure these are set:

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://repo-gist.vercel.app
GITHUB_TOKEN=your_github_token
OPENROUTER_API_KEY=your_openrouter_key
```

## Monitoring SEO Performance

### 1. Google Search Console
- Submit sitemap: `https://repo-gist.vercel.app/sitemap.xml`
- Monitor clicks, impressions, CTR
- Fix crawl errors
- Check Core Web Vitals

### 2. Analytics
Add Google Analytics to track:
- Organic traffic
- Bounce rate
- Time on page
- Conversion rate

### 3. Regular Checks
- Monthly: Review search console data
- Weekly: Check for broken links
- Daily: Monitor site uptime
- Quarterly: Full SEO audit

## Next Steps

1. ✅ Verify site ownership in Google Search Console
2. ✅ Submit sitemap
3. ✅ Create quality content (blog posts)
4. ✅ Build backlinks
5. ✅ Monitor performance
6. ✅ Test with real users
7. ✅ Iterate based on data

## Resources

- Next.js SEO: https://nextjs.org/learn/seo
- Schema.org: https://schema.org/docs/gs.html
- Google SEO Guide: https://developers.google.com/search/docs
- Web.dev SEO: https://web.dev/lighthouse-seo/

---

Your SEO implementation is now complete and ready for production! 🚀
