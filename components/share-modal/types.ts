// components/share-modal/types.ts

import { AnalysisResult } from "@/lib/types";
import { ShareCardData } from "@/lib/share";
import { IconSvgElement } from "@hugeicons/react";

export interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: Partial<AnalysisResult>;
}

export type CardVariant = "compact" | "default" | "detailed";

export interface VariantConfig {
  id: CardVariant;
  label: string;
  desc: string;
  size: string;
}

export interface ActionSectionProps {
  icon: IconSvgElement;
  title: string;
  children: React.ReactNode;
}

export interface TipItemProps {
  text: string;
}

export interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: ShareCardData;
  variant: CardVariant;
  setVariant: (variant: CardVariant) => void;
  currentVariant: VariantConfig | undefined;
  copied: boolean;
  copySummaryState: "idle" | "text" | "markdown";
  downloading: boolean;
  downloadingPDF: boolean;
  downloadSuccess: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  handleCopyLink: () => Promise<void>;
  handleCopySummary: (format: "text" | "markdown") => Promise<void>;
  handleDownload: () => Promise<void>;
  handleDownloadPDF: () => Promise<void>;
  handleTwitterShare: () => void;
  handleLinkedInShare: () => void;
}

export interface DesktopDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareData: ShareCardData;
  variant: CardVariant;
  setVariant: (variant: CardVariant) => void;
  currentVariant: VariantConfig | undefined;
  copied: boolean;
  copySummaryState: "idle" | "text" | "markdown";
  downloading: boolean;
  downloadingPDF: boolean;
  downloadSuccess: boolean;
  cardRef: React.RefObject<HTMLDivElement | null>;
  handleCopyLink: () => Promise<void>;
  handleCopySummary: (format: "text" | "markdown") => Promise<void>;
  handleDownload: () => Promise<void>;
  handleDownloadPDF: () => Promise<void>;
  handleTwitterShare: () => void;
  handleLinkedInShare: () => void;
}