"use client";

import Script from "next/script";
import { useMemo } from "react";

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  // Generate a stable ID based on data type
  const id = useMemo(() => {
    const type = (data["@type"] as string) || "structured-data";
    return `structured-data-${type.toLowerCase()}`;
  }, [data]);

  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface SEOProps {
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export function SEO({ structuredData }: SEOProps) {
  if (!structuredData) return null;

  return (
    <>
      {Array.isArray(structuredData) ? (
        structuredData.map((data, index) => (
          <StructuredData key={index} data={data} />
        ))
      ) : (
        <StructuredData data={structuredData} />
      )}
    </>
  );
}
