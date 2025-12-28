// components/recent-analyses.tsx
"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { analysisStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Delete01Icon,
  StarIcon,
  ArrowRight01Icon,
  AlertCircleIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecentAnalysis {
  repoFullName: string;
  data: AnalysisResult;
  timestamp: number;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
}

interface RecentAnalysesProps {
  onSelect: (url: string) => void;
  className?: string;
}

const EXPIRY_DAYS = 7;

// Pure helper functions - computed outside component
function calculateDaysUntilExpiry(timestamp: number, now: number): number {
  const expiryDate = timestamp + EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, differenceInDays(expiryDate, now));
}

function calculateIsExpiringSoon(timestamp: number, now: number): boolean {
  return calculateDaysUntilExpiry(timestamp, now) <= 2;
}

function processHistory(
  rawHistory: {
    repoFullName: string;
    data: AnalysisResult;
    timestamp: number;
  }[],
  now: number
): RecentAnalysis[] {
  return rawHistory.map((item) => ({
    ...item,
    daysUntilExpiry: calculateDaysUntilExpiry(item.timestamp, now),
    isExpiringSoon: calculateIsExpiringSoon(item.timestamp, now),
  }));
}

// Create a simple store for analysis history
let listeners: Array<() => void> = [];
let cachedHistory: RecentAnalysis[] | null = null;

function getSnapshot(): RecentAnalysis[] {
  if (cachedHistory === null) {
    const now = Date.now();
    const recent = analysisStorage.getRecent(10);
    cachedHistory = processHistory(recent, now);
  }
  return cachedHistory;
}

function getServerSnapshot(): RecentAnalysis[] {
  return [];
}

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notifyListeners() {
  cachedHistory = null; // Invalidate cache
  listeners.forEach((listener) => listener());
}

function removeFromHistory(repoFullName: string) {
  analysisStorage.remove(repoFullName);
  notifyListeners();
}

function clearAllHistory() {
  analysisStorage.clearAll();
  notifyListeners();
}

export function RecentAnalyses({ onSelect, className }: RecentAnalysesProps) {
  const history = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const handleRemove = useCallback(
    (repoFullName: string, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      removeFromHistory(repoFullName);
    },
    []
  );

  const handleClearAll = useCallback(() => {
    clearAllHistory();
  }, []);

  const handleSelect = useCallback(
    (repoFullName: string) => {
      onSelect(`https://github.com/${repoFullName}`);
    },
    [onSelect]
  );

  // Don't render when empty
  if (history.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className={cn("w-full", className)}
    >
      {/* Shiny border wrapper */}
      <div className="relative rounded-xl p-px overflow-hidden bg-linear-to-r from-border via-primary/20 to-border">
        {/* Animated shimmer overlay */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/30 to-transparent -translate-x-full animate-shimmer" />

        <Card className="relative border-0 bg-card rounded-[11px]">
          <CardHeader className="pb-2 px-4 sm:px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg instrument-serif tracking-wider font-normal flex items-center gap-2 text-foreground">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  className="w-4 h-4 text-primary"
                />
                Recently Analyzed
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-primary text-xs">
                  {history.length}
                </div>
              </CardTitle>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <HugeiconsIcon
                  icon={Delete02Icon}
                  className="w-3.5 h-3.5 mr-1"
                />
                Clear all
              </Button>
            </div>

            {/* Expiry notice */}
            <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-muted/50 border border-border/50">
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="w-3.5 h-3.5 text-muted-foreground shrink-0"
              />
              <p className="text-[11px] text-muted-foreground">
                Cache expires after{" "}
                <span className="text-foreground font-medium">
                  {EXPIRY_DAYS} days
                </span>
                . Click refresh on any analysis to update.
              </p>
            </div>
          </CardHeader>

          <CardContent className="pt-3 px-4 sm:px-5 pb-4">
            <ScrollArea className="w-full">
              <div className="flex gap-3 pb-2">
                <AnimatePresence mode="popLayout">
                  {history.map(
                    (
                      {
                        repoFullName,
                        data,
                        timestamp,
                        daysUntilExpiry,
                        isExpiringSoon,
                      },
                      index
                    ) => (
                      <motion.div
                        key={repoFullName}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: index * 0.03 }}
                        className="shrink-0"
                      >
                        <div
                          onClick={() => handleSelect(repoFullName)}
                          className={cn(
                            "group relative w-52 p-3 rounded-lg text-left cursor-pointer",
                            "border bg-background/50",
                            "hover:bg-muted/50 hover:border-primary/40",
                            "transition-all duration-200",
                            isExpiringSoon
                              ? "border-amber-500/30"
                              : "border-border/50"
                          )}
                        >
                          {/* Expiry badge */}
                          {isExpiringSoon && (
                            <div className="absolute -top-2 left-3">
                              <Badge
                                variant="outline"
                                className="text-[9px] h-4 px-1.5 bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
                              >
                                {daysUntilExpiry === 0
                                  ? "Expires today"
                                  : `${daysUntilExpiry}d left`}
                              </Badge>
                            </div>
                          )}

                          {/* Remove button */}
                          <button
                            onClick={(e) => handleRemove(repoFullName, e)}
                            className={cn(
                              "absolute top-2 right-2 p-1.5 rounded-md",
                              "opacity-0 group-hover:opacity-100",
                              "hover:bg-destructive/10 transition-all"
                            )}
                            aria-label={`Remove ${repoFullName}`}
                          >
                            <HugeiconsIcon
                              icon={Delete01Icon}
                              className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive"
                            />
                          </button>

                          {/* Content */}
                          <div
                            className={cn(
                              "flex items-start gap-2.5 pr-6",
                              isExpiringSoon && "mt-1"
                            )}
                          >
                            {data.metadata?.owner?.avatarUrl ? (
                              <Image
                                src={data.metadata.owner.avatarUrl}
                                alt={data.metadata.owner.login}
                                width={36}
                                height={36}
                                className="rounded-lg border border-border/50"
                                unoptimized
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {repoFullName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">
                                {data.metadata?.name ||
                                  repoFullName.split("/")[1]}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                @{repoFullName.split("/")[0]}
                              </p>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-1.5 mt-2.5">
                            {data.metadata?.stars !== undefined && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] gap-1 px-1.5 h-5"
                              >
                                <HugeiconsIcon
                                  icon={StarIcon}
                                  className="w-2.5 h-2.5"
                                />
                                {data.metadata.stars.toLocaleString()}
                              </Badge>
                            )}
                            {data.metadata?.language && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 h-5"
                              >
                                {data.metadata.language}
                              </Badge>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-border/30">
                            <p className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(timestamp, {
                                addSuffix: true,
                              })}
                            </p>
                            <HugeiconsIcon
                              icon={ArrowRight01Icon}
                              className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )
                  )}
                </AnimatePresence>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
