// components/analysis-header/summary-actions.tsx

"use client";

import { useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Tick01Icon,
  FileDownloadIcon,
  MoreHorizontalIcon,
  TextIcon,
  DocumentCodeIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnalysisResult } from "@/lib/types";
import { copySummary } from "@/lib/share";
import { downloadPDFReport } from "@/lib/pdf-export";

interface SummaryActionsProps {
  result: Partial<AnalysisResult>;
  className?: string;
}

export function SummaryActions({ result, className }: SummaryActionsProps) {
  const [copied, setCopied] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<"text" | "markdown" | null>(
    null
  );
  const [downloading, setDownloading] = useState(false);

  const handleCopyText = useCallback(async () => {
    const success = await copySummary(result, "text");
    if (success) {
      setCopied(true);
      setCopiedFormat("text");
      setTimeout(() => {
        setCopied(false);
        setCopiedFormat(null);
      }, 2000);
    }
  }, [result]);

  const handleCopyMarkdown = useCallback(async () => {
    const success = await copySummary(result, "markdown");
    if (success) {
      setCopied(true);
      setCopiedFormat("markdown");
      setTimeout(() => {
        setCopied(false);
        setCopiedFormat(null);
      }, 2000);
    }
  }, [result]);

  const handleDownloadPDF = useCallback(async () => {
    if (!result.metadata) return;

    setDownloading(true);
    try {
      await downloadPDFReport(result as AnalysisResult);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setDownloading(false);
    }
  }, [result]);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Quick Copy Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyText}
              className={cn(
                "h-7 w-7",
                copied && copiedFormat === "text" && "text-primary"
              )}
            >
              {copied && copiedFormat === "text" ? (
                <HugeiconsIcon icon={Tick01Icon} className="w-3.5 h-3.5" />
              ) : (
                <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {copied && copiedFormat === "text" ? "Copied!" : "Copy summary"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* More Options Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <HugeiconsIcon icon={MoreHorizontalIcon} className="w-3.5 h-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCopyText} className="gap-2">
            <HugeiconsIcon icon={TextIcon} className="w-4 h-4" />
            <span>Copy as Plain Text</span>
            {copied && copiedFormat === "text" && (
              <HugeiconsIcon
                icon={Tick01Icon}
                className="w-3.5 h-3.5 ml-auto text-primary"
              />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyMarkdown} className="gap-2">
            <HugeiconsIcon icon={DocumentCodeIcon} className="w-4 h-4" />
            <span>Copy as Markdown</span>
            {copied && copiedFormat === "markdown" && (
              <HugeiconsIcon
                icon={Tick01Icon}
                className="w-3.5 h-3.5 ml-auto text-primary"
              />
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="gap-2"
          >
            <HugeiconsIcon
              icon={FileDownloadIcon}
              className={cn("w-4 h-4", downloading && "animate-pulse")}
            />
            <span>{downloading ? "Generating PDF..." : "Download as PDF"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
