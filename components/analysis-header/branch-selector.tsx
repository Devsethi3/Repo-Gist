"use client";

import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GitBranchIcon,
  ArrowDown01Icon,
  Tick01Icon,
  Search01Icon,
  ShieldEnergyIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BranchSelectorProps } from "./types";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(query);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Branch item component for better reusability
function BranchItem({
  branch,
  isSelected,
  onSelect,
  isMobile = false,
}: {
  branch: BranchSelectorProps["branches"][0];
  isSelected: boolean;
  onSelect: () => void;
  isMobile?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-2 rounded-lg text-left",
        "transition-colors touch-manipulation",
        "active:scale-[0.98]",
        isMobile ? "px-4 py-3.5 text-sm" : "px-3 py-2 text-xs",
        isSelected
          ? "bg-primary/10 text-primary"
          : "hover:bg-muted/50 active:bg-muted text-foreground"
      )}
    >
      <HugeiconsIcon
        icon={GitBranchIcon}
        className={cn(
          "shrink-0",
          isMobile ? "w-5 h-5" : "w-3.5 h-3.5",
          isSelected ? "text-primary" : "text-muted-foreground"
        )}
      />

      {/* Branch name with horizontal scroll for long names */}
      <div className="flex-1 min-w-0 overflow-x-auto scrollbar-none">
        <span className="whitespace-nowrap font-medium">{branch.name}</span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {branch.isDefault && (
          <Badge
            variant="secondary"
            className={cn(
              "bg-primary/10 text-primary border-0 font-medium",
              isMobile ? "h-6 px-2 text-xs" : "h-4 px-1 text-[9px]"
            )}
          >
            default
          </Badge>
        )}
        {branch.protected && (
          <HugeiconsIcon
            icon={ShieldEnergyIcon}
            className={cn("text-amber-500", isMobile ? "w-5 h-5" : "w-3 h-3")}
          />
        )}
        {isSelected && (
          <HugeiconsIcon
            icon={Tick01Icon}
            className={cn("text-primary", isMobile ? "w-5 h-5" : "w-3.5 h-3.5")}
          />
        )}
      </div>
    </button>
  );
}

// Trigger button component
function BranchTrigger({
  currentBranch,
  disabled,
  open,
  fullWidth = false,
}: {
  currentBranch: string;
  disabled: boolean;
  open: boolean;
  fullWidth?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled}
      className={cn(
        "h-8 sm:h-7 gap-1.5 px-3 text-xs font-normal",
        "border-border/60 hover:border-primary/40",
        "hover:bg-primary/5 hover:text-primary",
        "transition-all duration-200",
        fullWidth ? "w-full justify-between" : "max-w-35 sm:max-w-45",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0 flex-1">
        <HugeiconsIcon icon={GitBranchIcon} className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{currentBranch}</span>
      </div>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        className={cn(
          "w-3 h-3 shrink-0 text-muted-foreground transition-transform duration-200",
          open && "rotate-180"
        )}
      />
    </Button>
  );
}

export function BranchSelector({
  currentBranch,
  branches,
  onBranchChange,
  disabled = false,
  fullWidth = false,
}: BranchSelectorProps & { fullWidth?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const isMobile = useMediaQuery("(max-width: 640px)");

  const filteredBranches = branches.filter((branch) =>
    branch.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (branchName: string) => {
    if (branchName !== currentBranch) {
      onBranchChange(branchName);
    }
    setOpen(false);
    setSearch("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
    }
  };

  // Single branch - show as badge
  if (!branches || branches.length <= 1) {
    return (
      <Badge
        variant="secondary"
        className={cn(
          "text-[10px] sm:text-xs shrink-0 gap-1",
          fullWidth ? "w-full justify-center py-2" : "max-w-30 sm:max-w-40",
          "overflow-hidden"
        )}
      >
        <HugeiconsIcon icon={GitBranchIcon} className="w-3 h-3 shrink-0" />
        <span className="truncate">{currentBranch}</span>
      </Badge>
    );
  }

  // Mobile: Use Drawer with proper scrolling
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <div className={cn(fullWidth && "w-full")}>
            <BranchTrigger
              currentBranch={currentBranch}
              disabled={disabled}
              open={open}
              fullWidth={fullWidth}
            />
          </div>
        </DrawerTrigger>
        <DrawerContent className="max-h-[85dvh] flex flex-col">
          {/* Fixed Header */}
          <DrawerHeader className="shrink-0 border-b border-border/50 px-4 pb-4">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold flex items-center gap-2">
                <HugeiconsIcon
                  icon={GitBranchIcon}
                  className="w-5 h-5 text-primary"
                />
                Switch Branch
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 -mr-2">
                  <HugeiconsIcon icon={Cancel01Icon} className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>

            {/* Search input - fixed in header */}
            <div className="relative mt-4">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="Search branches..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-10 text-base rounded-xl bg-muted/50 border-0 focus-visible:ring-1"
              />
            </div>
          </DrawerHeader>

          {/* Scrollable Branch List */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain px-2 py-2"
            style={{
              WebkitOverflowScrolling: "touch",
              minHeight: 0, // Important for flex scrolling
            }}
          >
            {filteredBranches.length === 0 ? (
              <div className="py-12 text-center">
                <HugeiconsIcon
                  icon={GitBranchIcon}
                  className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3"
                />
                <p className="text-sm text-muted-foreground">
                  No branches found
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredBranches.map((branch) => (
                  <BranchItem
                    key={branch.name}
                    branch={branch}
                    isSelected={branch.name === currentBranch}
                    onSelect={() => handleSelect(branch.name)}
                    isMobile={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Fixed Footer */}
          {branches.length > 5 && (
            <div className="shrink-0 p-3 border-t border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                Showing {filteredBranches.length} of {branches.length} branches
              </p>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className={cn(fullWidth && "w-full")}>
          <BranchTrigger
            currentBranch={currentBranch}
            disabled={disabled}
            open={open}
            fullWidth={fullWidth}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Search header */}
        <div className="p-2 border-b border-border/50">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="Search branches..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
        </div>

        {/* Scrollable Branch list */}
        <div className="max-h-64 overflow-y-auto overscroll-contain p-1">
          {filteredBranches.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-muted-foreground">No branches found</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredBranches.map((branch) => (
                <BranchItem
                  key={branch.name}
                  branch={branch}
                  isSelected={branch.name === currentBranch}
                  onSelect={() => handleSelect(branch.name)}
                  isMobile={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer with count */}
        {branches.length > 10 && (
          <div className="p-2 border-t border-border/50 text-center">
            <span className="text-[10px] text-muted-foreground">
              Showing {filteredBranches.length} of {branches.length} branches
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
