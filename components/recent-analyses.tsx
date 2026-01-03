"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { analysisStorage } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Delete01Icon,
  StarIcon,
  ArrowRight01Icon,
  AlertCircleIcon,
  Delete02Icon,
  GitBranchIcon,
} from "@hugeicons/core-free-icons";
import { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RecentAnalysis {
  repoFullName: string;
  branch?: string;
  data: AnalysisResult;
  timestamp: number;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
}

interface RecentAnalysesProps {
  onSelect: (url: string, branch?: string) => void;
  className?: string;
}

const EXPIRY_DAYS = 7;

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
    branch?: string;
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
  cachedHistory = null;
  listeners.forEach((listener) => listener());
}

function removeFromHistory(repoFullName: string, branch?: string) {
  analysisStorage.remove(repoFullName, branch);
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
    (repoFullName: string, branch: string | undefined, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      removeFromHistory(repoFullName, branch);
    },
    []
  );

  const handleClearAll = useCallback(() => {
    clearAllHistory();
  }, []);

  const handleSelect = useCallback(
    (repoFullName: string, branch?: string) => {
      onSelect(`https://github.com/${repoFullName}`, branch);
    },
    [onSelect]
  );

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
      <div className="relative rounded-xl p-px overflow-hidden bg-linear-to-r from-border via-primary/20 to-border">
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
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-primary text-xs font-medium">
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
            {/* Grid Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <AnimatePresence mode="popLayout">
                {history.map(
                  (
                    {
                      repoFullName,
                      branch,
                      data,
                      timestamp,
                      daysUntilExpiry,
                      isExpiringSoon,
                    },
                    index
                  ) => (
                    <motion.div
                      key={`${repoFullName}${branch ? `:${branch}` : ""}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                    >
                      <div
                        onClick={() => handleSelect(repoFullName, branch)}
                        className={cn(
                          "group relative p-3 rounded-lg text-left cursor-pointer",
                          "border bg-background/50",
                          "hover:bg-muted/50 hover:border-primary/40",
                          "transition-all duration-200",
                          "h-full", // Ensure consistent height in grid
                          isExpiringSoon
                            ? "border-amber-500/30"
                            : "border-border/50"
                        )}
                      >
                        {/* Expiry Badge */}
                        {isExpiringSoon && (
                          <div className="absolute -top-2 left-3 z-10">
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

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleRemove(repoFullName, branch, e)}
                          className={cn(
                            "absolute top-2 right-2 p-1.5 rounded-md z-10",
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

                        {/* Repo Info */}
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
                              className="rounded-lg border border-border/50 shrink-0"
                              unoptimized
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
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

                        {/* Badges */}
                        <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
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
                          {branch && (
                            <Badge
                              variant="outline"
                              className="text-[10px] gap-1 px-1.5 h-5"
                            >
                              <HugeiconsIcon
                                icon={GitBranchIcon}
                                className="w-2.5 h-2.5"
                              />
                              {branch}
                            </Badge>
                          )}
                          {!branch && data.metadata?.language && (
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
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
