// share-card.tsx
"use client";

import { forwardRef } from "react";
import {
  Star,
  GitFork,
  Code,
  Shield,
  FileText,
  Wrench,
  Activity,
  Terminal,
} from "lucide-react";
import { ShareCardData } from "@/lib/share";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  data: ShareCardData;
  variant?: "default" | "compact" | "detailed";
  showWatermark?: boolean;
  className?: string;
}

// --- Score Configuration ---
function getScoreConfig(score: number) {
  if (score >= 90)
    return { label: "EXCELLENT", tier: "excellent" as const, hex: "#34d399" };
  if (score >= 70)
    return { label: "GOOD", tier: "good" as const, hex: "#38bdf8" };
  if (score >= 50)
    return { label: "FAIR", tier: "fair" as const, hex: "#fbbf24" };
  return { label: "POOR", tier: "poor" as const, hex: "#f43f5e" };
}

// Tier-based styling
// Updated tierStyles with separate solid background classes
const tierStyles = {
  excellent: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    bgSolid: "bg-emerald-500", // Add solid version
    border: "border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-400",
  },
  good: {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    bgSolid: "bg-sky-500", // Add solid version
    border: "border-sky-500/20",
    gradient: "from-sky-500 to-blue-400",
  },
  fair: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    bgSolid: "bg-amber-500", // Add solid version
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-400",
  },
  poor: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    bgSolid: "bg-rose-500", // Add solid version
    border: "border-rose-500/20",
    gradient: "from-rose-500 to-red-400",
  },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

// --- Sub-Components ---

const TechPill = ({
  tech,
  isPrimary = false,
}: {
  tech: string;
  isPrimary?: boolean;
}) => (
  <span
    className={cn(
      "px-1.5 py-0.5 sm:px-2 text-[8px] sm:text-[10px] jetbrains-mono font-medium uppercase tracking-wide border rounded",
      isPrimary
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-zinc-900/50 text-zinc-400 border-white/5"
    )}
  >
    {tech}
  </span>
);

// --- The Industrial Frame Wrapper ---
const TechnicalFrame = ({
  children,
  config,
  className,
}: {
  children: React.ReactNode;
  config: ReturnType<typeof getScoreConfig>;
  className?: string;
}) => {
  const styles = tierStyles[config.tier];

  return (
    <div className={cn("relative bg-[#050505] p-4 sm:p-6 md:p-8", className)}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[16px_16px] sm:bg-size-[24px_24px] pointer-events-none opacity-60" />

      {/* Main Border Box (No Radius) */}
      <div className="relative h-full border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        {/* Corner Brackets (Based on score color) */}
        <div
          className={cn(
            "absolute -top-px -left-px w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2",
            styles.text,
            "border-current"
          )}
        />
        <div
          className={cn(
            "absolute -top-px -right-px w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2",
            styles.text,
            "border-current"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-px -left-px w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2",
            styles.text,
            "border-current"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-px -right-px w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2",
            styles.text,
            "border-current"
          )}
        />

        {/* Top Label */}
        <div className="absolute -top-2.5 sm:-top-3 left-3 sm:left-6 px-1.5 sm:px-2 bg-[#050505] text-[7px] sm:text-[9px] jetbrains-mono text-zinc-500 uppercase tracking-widest border-x border-zinc-900">
          <span className="hidden sm:inline">SYS.ANALYSIS // </span>
          <span className={styles.text}>{config.label}</span>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute -bottom-2.5 sm:-bottom-3 right-3 sm:right-6 px-1.5 sm:px-2 bg-[#050505] text-[7px] sm:text-[9px] jetbrains-mono text-zinc-600 uppercase tracking-widest border-x border-zinc-900 flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline">REPOGIST_IO</span>
          <span className="sm:hidden">REPOGIST</span>
          <span className="text-zinc-700">|</span>
          <span>V.2.0</span>
        </div>

        {/* Inner Content Padding */}
        <div className="p-0.5 sm:p-1">{children}</div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ data, variant = "default", showWatermark = true, className }, ref) => {
    const config = getScoreConfig(data.overallScore);
    const styles = tierStyles[config.tier];

    // Inner Card Base (The floating element inside the frame)
    const cardBase = cn(
      "relative overflow-hidden text-zinc-200 select-none bg-black",
      "antialiased",
      "border",
      // // The Noise Texture (blended softly)
      // "before:absolute before:inset-0 before:bg-[url('https://grainy-gradients.vercel.app/noise.svg')] before:opacity-[0.15] before:pointer-events-none before:mix-blend-overlay",
      // // Subtle gradient overlay for depth
      // "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/5 after:to-transparent after:pointer-events-none",
      className
    );

    // ==========================================
    // COMPACT VARIANT
    // ==========================================
    if (variant === "compact") {
      return (
        <div
          ref={ref}
          className="w-full max-w-[320px] sm:max-w-95 md:max-w-110"
        >
          <TechnicalFrame config={config}>
            <div className={cn(cardBase, "flex flex-col")}>

              <div className="p-3 sm:p-4 md:p-5 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-5">
                  {/* Avatar Box */}
                  <div className="relative shrink-0">
                    <img
                      src={data.ownerAvatar}
                      alt={data.ownerLogin}
                      className="relative w-9 h-9 sm:w-10 md:w-12 sm:h-10 md:h-12 rounded bg-zinc-800 object-cover border border-white/10"
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-medium text-white truncate tracking-wide jetbrains-mono">
                      {data.repoName}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-zinc-500 truncate jetbrains-mono">
                      @{data.ownerLogin}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right shrink-0">
                    <span
                      className={cn(
                        "text-2xl sm:text-3xl jetbrains-mono leading-none",
                        styles.text
                      )}
                    >
                      {data.overallScore}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-px bg-zinc-800/50 border border-zinc-800 mb-3 sm:mb-4 jetbrains-mono">
                  <div className="bg-zinc-900/80 p-1.5 sm:p-2 text-center">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 mx-auto mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-300">
                      {formatNumber(data.stars)}
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-1.5 sm:p-2 text-center">
                    <GitFork className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 mx-auto mb-0.5 sm:mb-1" />
                    <span className="text-[10px] sm:text-xs font-bold text-zinc-300">
                      {formatNumber(data.forks)}
                    </span>
                  </div>
                  <div className="bg-zinc-900/80 p-1.5 sm:p-2 text-center">
                    <Code className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-400 mx-auto mb-0.5 sm:mb-1" />
                    <span className="text-[8px]  sm:text-[10px] font-bold text-zinc-300 truncate block px-0.5">
                      {data.language || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                  {data.techStack.slice(0, 3).map((tech) => (
                    <TechPill key={tech} tech={tech} />
                  ))}
                  {data.techStack.length > 3 && (
                    <span className="text-[8px] sm:text-[10px] text-zinc-600 jetbrains-mono self-center">
                      +{data.techStack.length - 3}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </TechnicalFrame>
        </div>
      );
    }

    // ==========================================
    // DETAILED VARIANT
    // ==========================================
    if (variant === "detailed") {
      const breakdown = [
        {
          label: "Code_Quality",
          shortLabel: "Quality",
          value: data.scores.codeQuality,
          icon: Code,
        },
        {
          label: "Security",
          shortLabel: "Security",
          value: data.scores.security,
          icon: Shield,
        },
        {
          label: "Docs",
          shortLabel: "Docs",
          value: data.scores.documentation,
          icon: FileText,
        },
        {
          label: "Maintenance",
          shortLabel: "Maintain",
          value: data.scores.maintainability,
          icon: Wrench,
        },
      ];

      return (
        <div ref={ref} className="w-full max-w-85 sm:max-w-120 md:max-w-150">
          <TechnicalFrame config={config}>
            <div className={cardBase}>
              <div className="p-3 sm:p-5 md:p-6 relative z-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
                  <div className="flex gap-2.5 sm:gap-3 md:gap-4">
                    <div className="relative shrink-0">
                      <img
                        src={data.ownerAvatar}
                        alt={data.ownerLogin}
                        className="w-11 h-11 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded bg-zinc-950"
                        crossOrigin="anonymous"
                      />
                      <div className="absolute inset-0 rounded" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                        <h2 className="text-base sm:text-lg md:text-xl font-medium text-white tracking-wide jetbrains-mono truncate">
                          {data.repoName}
                        </h2>
                        <span
                          className={cn(
                            "px-1 sm:px-1.5 py-0.5 rounded-[2px] text-[7px] sm:text-[9px] uppercase font-bold text-primary shrink-0",
                            styles.bg.replace("/10", "")
                          )}
                        >
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-400 jetbrains-mono mb-1 sm:mb-2 truncate">
                        @{data.ownerLogin}
                      </p>
                      {data.description && (
                        <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-1 sm:line-clamp-2 jetbrains-mono max-w-full sm:max-w-70 md:max-w-75">
                          {data.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Big Score Box */}
                  <div className="text-left sm:text-right shrink-0">
                    <div
                      className={cn(
                        "text-4xl sm:text-5xl md:text-6xl jetbrains-mono tracking-tighter leading-none",
                        styles.text
                      )}
                    >
                      {data.overallScore}
                    </div>
                    <span className="text-[8px] sm:text-[9px] jetbrains-mono text-zinc-600 uppercase tracking-widest">
                      /100
                    </span>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-5 sm:mb-6 md:mb-8">
                  {breakdown.map((item) => {
                    const itemConfig = getScoreConfig(item.value);
                    const itemStyle = tierStyles[itemConfig.tier];
                    return (
                      <div key={item.label} className="group">
                        <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1 sm:mb-1.5 jetbrains-mono">
                          <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors truncate">
                            <span className="hidden sm:inline uppercase jetbrains-mono">
                              {item.label}
                            </span>
                            <span className="sm:hidden jetbrains-mono">{item.shortLabel}</span>
                          </span>
                          <span
                            className={cn(
                              "font-bold jetbrains-mono shrink-0 ml-1",
                              itemStyle.text
                            )}
                          >
                            {item.value}
                          </span>
                        </div>
                        <div className="h-1 sm:h-1.5 w-full bg-zinc-950 border border-zinc-800">
                          <div
                            className={cn(
                              "h-full transition-all duration-500",
                              itemStyle.bg.replace("/10", "")
                            )}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-dashed border-zinc-800">
                  <div className="flex gap-4 sm:gap-6 jetbrains-mono text-[10px] sm:text-xs">
                    <div className="flex items-center gap-1.5 sm:gap-2 jetbrains-mono">
                      <span className="text-zinc-600">STARS</span>
                      <span className="text-zinc-300">
                        {formatNumber(data.stars)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 jetbrains-mono">
                      <span className="text-zinc-600">FORKS</span>
                      <span className="text-zinc-300">
                        {formatNumber(data.forks)}
                      </span>
                    </div>
                  </div>

                  {showWatermark && (
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Terminal className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-600" />
                      <span className="text-[8px] sm:text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                        <span className="hidden sm:inline jetbrains-mono">GENERATED BY </span>
                        <span className="jetbrains-mono">REPOGIST</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TechnicalFrame>
        </div>
      );
    }

    // ==========================================
    // DEFAULT VARIANT
    // ==========================================
    return (
      <div ref={ref} className="w-full max-w-[320px] sm:max-w-105 md:max-w-125">
        <TechnicalFrame config={config}>
          <div className={cardBase}>
            <div className="p-3 sm:p-5 md:p-6 relative z-10">
              {/* Top Row */}
              <div className="flex justify-between items-start gap-2 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                  <img
                    src={data.ownerAvatar}
                    alt={data.ownerLogin}
                    className="w-10 h-10 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-sm border border-white/10 bg-zinc-950 shrink-0"
                    crossOrigin="anonymous"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-white tracking-wide jetbrains-mono truncate">
                      {data.repoName}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                      <span className="text-[10px] sm:text-xs text-zinc-500 jetbrains-mono truncate">
                        @{data.ownerLogin}
                      </span>
                      {data.language && (
                        <>
                          <span className="text-zinc-700 hidden sm:inline">
                            /
                          </span>
                          <span className="text-[10px] sm:text-xs text-zinc-400 jetbrains-mono hidden sm:inline">
                            {data.language}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={cn(
                      "text-3xl sm:text-4xl md:text-5xl jetbrains-mono tracking-tighter leading-none",
                      styles.text
                    )}
                  >
                    {data.overallScore}
                  </span>
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5 sm:mt-1">
                    Total Score
                  </span>
                </div>
              </div>

              {/* Metrics with "Technical" bars */}
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-4 sm:mb-5 md:mb-6">
                {[
                  {
                    l: "CODE_QUALITY",
                    short: "QUALITY",
                    v: data.scores.codeQuality,
                  },
                  { l: "SECURITY", short: "SECURITY", v: data.scores.security },
                  {
                    l: "MAINTAINABILITY",
                    short: "MAINTAIN",
                    v: data.scores.maintainability,
                  },
                ].map((m) => {
                  const mConfig = getScoreConfig(m.v);
                  const mStyle = tierStyles[mConfig.tier];
                  // Ensure value is between 0-100
                  const progressValue = Math.min(100, Math.max(0, m.v));

                  return (
                    <div key={m.l} className="flex items-center gap-2 sm:gap-3">
                      {/* Label */}
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] jetbrains-mono text-zinc-500 w-14 sm:w-20 md:w-24 shrink-0 truncate">
                        <span className="hidden md:inline">{m.l}</span>
                        <span className="md:hidden">{m.short}</span>
                      </span>

                      {/* Progress Bar Container */}
                      <div className="flex-1 h-1.5 sm:h-2 bg-zinc-950 border border-zinc-800 relative overflow-hidden">
                        {/* Diagonal stripe pattern */}
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                -45deg,
                transparent,
                transparent 2px,
                rgba(63, 63, 70, 0.4) 2px,
                rgba(63, 63, 70, 0.4) 4px
              )`,
                          }}
                        />

                        {/* Progress Fill - Using inline style for reliability */}
                        <div
                          className="h-full relative z-10 transition-all duration-500"
                          style={{
                            width: `${progressValue}%`,
                            backgroundColor: mConfig.hex,
                          }}
                        />
                      </div>

                      {/* Value */}
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs jetbrains-mono font-bold w-6 sm:w-8 text-right shrink-0",
                          mStyle.text
                        )}
                      >
                        {m.v}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-dashed border-zinc-800">
                <div className="flex flex-wrap gap-1 sm:gap-1.5 max-w-full sm:max-w-[65%]">
                  {data.techStack.slice(0, 3).map((t) => (
                    <TechPill key={t} tech={t} />
                  ))}
                  {data.techStack.length > 3 && (
                    <span className="text-[8px] sm:text-[10px] text-zinc-600 jetbrains-mono self-center">
                      +{data.techStack.length - 3}
                    </span>
                  )}
                </div>

                {showWatermark && (
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-1 sm:gap-1.5 mb-0.5 opacity-60">
                      <Terminal className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-600" />
                      <span className="text-[8px] jetbrains-mono sm:text-[9px] tracking-widest text-zinc-300">
                        REPOGIST
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-zinc-600 jetbrains-mono">
                      {data.analyzedAt.split(",")[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TechnicalFrame>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
