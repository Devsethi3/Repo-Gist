// components/analysis-header/copy-button.tsx

"use client";

import { useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Copy01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/share";

interface CopyButtonProps {
  text: string;
  label?: string;
  tooltip?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
  className?: string;
  iconClassName?: string;
  showLabel?: boolean;
}

export function CopyButton({
  text,
  label = "Copy",
  tooltip = "Copy to clipboard",
  variant = "outline",
  size = "icon",
  className,
  iconClassName,
  showLabel = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn(
        "transition-all",
        copied && "text-primary border-primary/30",
        className
      )}
    >
      {copied ? (
        <HugeiconsIcon
          icon={Tick01Icon}
          className={cn("w-4 h-4 text-primary", iconClassName)}
        />
      ) : (
        <HugeiconsIcon
          icon={Copy01Icon}
          className={cn("w-4 h-4", iconClassName)}
        />
      )}
      {showLabel && (
        <span className="ml-1.5">{copied ? "Copied!" : label}</span>
      )}
    </Button>
  );

  if (size === "icon" && !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {copied ? "Copied!" : tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
