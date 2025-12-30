// components/share-modal/index.tsx

"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  ShareCardData,
  createShareData,
  generateShareUrl,
  generateCleanShareUrl,
  generateTwitterShareUrl,
  generateLinkedInShareUrlAlt, // Use the alternative that works better
  copyToClipboard,
  downloadAsImage,
} from "@/lib/share";
import { useIsMobile } from "@/hooks/use-media-query";
import { ShareModalProps, CardVariant } from "./types";
import { VARIANTS } from "./constants";
import { MobileDrawer } from "./mobile-drawer";
import { DesktopDialog } from "./desktop-dialog";

export function ShareModal({ open, onOpenChange, result }: ShareModalProps) {
  const isMobile = useIsMobile();
  const [variant, setVariant] = useState<CardVariant>("detailed");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareData: ShareCardData | null = useMemo(
    () => createShareData(result),
    [result]
  );

  const currentVariant = VARIANTS.find((v) => v.id === variant);

  const handleCopyLink = useCallback(async () => {
    if (!shareData) return;
    // Copy the full URL with parameters for proper OG image
    const url = generateShareUrl(shareData);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareData]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !shareData) return;
    setDownloading(true);

    try {
      const success = await downloadAsImage(
        cardRef.current,
        `repogist-${shareData.repoName.toLowerCase().replace(/\s+/g, "-")}`
      );

      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } finally {
      setDownloading(false);
    }
  }, [shareData]);

  const handleTwitterShare = useCallback(() => {
    if (!shareData) return;
    window.open(
      generateTwitterShareUrl(shareData),
      "_blank",
      "noopener,noreferrer,width=600,height=400"
    );
  }, [shareData]);

  const handleLinkedInShare = useCallback(() => {
    if (!shareData) return;
    window.open(
      generateLinkedInShareUrlAlt(shareData),
      "_blank",
      "noopener,noreferrer,width=600,height=600"
    );
  }, [shareData]);

  if (!shareData) return null;

  const sharedProps = {
    open,
    onOpenChange,
    shareData,
    variant,
    setVariant,
    currentVariant,
    copied,
    downloading,
    downloadSuccess,
    cardRef,
    handleCopyLink,
    handleDownload,
    handleTwitterShare,
    handleLinkedInShare,
  };

  if (isMobile) {
    return <MobileDrawer {...sharedProps} />;
  }

  return <DesktopDialog {...sharedProps} />;
}
