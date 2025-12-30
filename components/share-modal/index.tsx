"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  ShareCardData,
  createShareData,
  generateCopyLink,
  redirectToTwitter,
  redirectToLinkedIn,
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
    const success = await copyToClipboard(generateCopyLink());
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

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
    redirectToTwitter(shareData);
  }, [shareData]);

  const handleLinkedInShare = useCallback(() => {
    if (!shareData) return;
    redirectToLinkedIn(shareData);
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

  return isMobile ? (
    <MobileDrawer {...sharedProps} />
  ) : (
    <DesktopDialog {...sharedProps} />
  );
}
