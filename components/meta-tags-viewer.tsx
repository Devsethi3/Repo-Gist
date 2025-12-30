"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

export function MetaTagsViewer() {
  const [metaTags, setMetaTags] = useState<MetaTag[]>([]);

  useEffect(() => {
    const tags: MetaTag[] = [];
    const metaElements = document.querySelectorAll("meta");

    metaElements.forEach((meta) => {
      const name = meta.getAttribute("name");
      const property = meta.getAttribute("property");
      const content = meta.getAttribute("content");

      if ((name || property) && content) {
        tags.push({
          name: name || undefined,
          property: property || undefined,
          content,
        });
      }
    });

    setMetaTags(tags);
  }, []);

  const ogTags = metaTags.filter((tag) => tag.property?.startsWith("og:"));
  const twitterTags = metaTags.filter((tag) =>
    tag.name?.startsWith("twitter:")
  );

  const requiredOgTags = ["og:title", "og:description", "og:image", "og:url"];
  const requiredTwitterTags = [
    "twitter:card",
    "twitter:title",
    "twitter:image",
  ];

  const checkRequired = (
    tags: MetaTag[],
    required: string[],
    type: "property" | "name"
  ) => {
    return required.map((req) => ({
      tag: req,
      found: tags.some(
        (t) => (type === "property" ? t.property : t.name) === req
      ),
    }));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[80vh] overflow-auto">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            Meta Tags Viewer
            <Badge variant="outline" className="text-xs">
              Dev Only
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          {/* Open Graph */}
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Open Graph</p>
            <div className="space-y-1">
              {checkRequired(ogTags, requiredOgTags, "property").map(
                ({ tag, found }) => (
                  <div key={tag} className="flex items-center gap-2">
                    {found ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <code className="text-muted-foreground">{tag}</code>
                  </div>
                )
              )}
            </div>
            {ogTags.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  View all ({ogTags.length})
                </summary>
                <div className="mt-2 space-y-1 pl-2 border-l-2">
                  {ogTags.map((tag, i) => (
                    <div key={i} className="break-all">
                      <code className="text-primary">{tag.property}</code>
                      <p className="text-muted-foreground truncate">
                        {tag.content}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {/* Twitter */}
          <div className="space-y-2">
            <p className="font-semibold text-foreground">Twitter Cards</p>
            <div className="space-y-1">
              {checkRequired(twitterTags, requiredTwitterTags, "name").map(
                ({ tag, found }) => (
                  <div key={tag} className="flex items-center gap-2">
                    {found ? (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    ) : (
                      <XCircle className="w-3 h-3 text-red-500" />
                    )}
                    <code className="text-muted-foreground">{tag}</code>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="pt-2 border-t space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Testing Tips
            </p>
            <ul className="text-muted-foreground space-y-1 list-disc list-inside">
              <li>Use ngrok for external testing</li>
              <li>Clear cache on social validators</li>
              <li>Image must be publicly accessible</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
