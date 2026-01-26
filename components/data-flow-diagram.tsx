"use client";

import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Circle,
  Square,
  Database,
  ArrowRightCircle,
  Workflow,
  Link as LinkIcon,
  Code,
  Check,
  Maximize2,
  Download,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataFlowNode, DataFlowEdge, MermaidDiagram } from "@/lib/types";
import { generateDataFlowDiagram } from "@/lib/mermaid";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface DataFlowDiagramProps {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  mermaidDiagram?: MermaidDiagram;
}

const NODE_CONFIG = {
  source: { icon: Circle, label: "Sources" },
  process: { icon: Square, label: "Processes" },
  store: { icon: Database, label: "Storage" },
  output: { icon: ArrowRightCircle, label: "Outputs" },
} as const;

const NODE_ORDER = ["source", "process", "store", "output"] as const;

const getMermaidThemeVariables = (isDark: boolean) =>
  isDark
    ? {
        primaryColor: "#3b82f6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#2563eb",
        lineColor: "#6b7280",
        secondaryColor: "#1e293b",
        tertiaryColor: "#0f172a",
        background: "#09090b",
        mainBkg: "#18181b",
        nodeBorder: "#3f3f46",
        clusterBkg: "#27272a",
        titleColor: "#fafafa",
        edgeLabelBackground: "#27272a",
        textColor: "#e4e4e7",
        nodeTextColor: "#fafafa",
      }
    : {
        primaryColor: "#3b82f6",
        primaryTextColor: "#1e293b",
        primaryBorderColor: "#2563eb",
        lineColor: "#94a3b8",
        secondaryColor: "#f1f5f9",
        tertiaryColor: "#e2e8f0",
        background: "#ffffff",
        mainBkg: "#f8fafc",
        nodeBorder: "#cbd5e1",
        clusterBkg: "#f1f5f9",
        titleColor: "#0f172a",
        edgeLabelBackground: "#f1f5f9",
        textColor: "#334155",
        nodeTextColor: "#0f172a",
      };

const optimizeSvg = (svgString: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, "image/svg+xml");
    const svg = doc.querySelector("svg");

    if (!svg) return svgString;

    const gElement = svg.querySelector("g.output");
    if (
      gElement &&
      typeof (gElement as SVGGraphicsElement).getBBox === "function"
    ) {
      try {
        const bbox = (gElement as SVGGraphicsElement).getBBox();
        if (bbox.width > 0 && bbox.height > 0) {
          const padding = 20;
          svg.setAttribute(
            "viewBox",
            `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`,
          );
        }
      } catch {
        // getBBox can fail if element is not rendered
      }
    }

    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxHeight = "500px";

    return new XMLSerializer().serializeToString(svg);
  } catch {
    return svgString;
  }
};

const downloadAsPng = async (
  svgString: string,
  isDark: boolean,
): Promise<void> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");

  if (!svg) throw new Error("Invalid SVG");

  const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [];
  const width = Math.max(viewBox[2] || 800, 800);
  const height = Math.max(viewBox[3] || 400, 400);
  const scale = 2;

  svg.setAttribute("width", String(width));
  svg.setAttribute("height", String(height));

  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", isDark ? "#09090b" : "#ffffff");
  svg.insertBefore(bg, svg.firstChild);

  const svgData = new XMLSerializer().serializeToString(svg);
  const base64 = btoa(unescape(encodeURIComponent(svgData)));
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        return;
      }

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Blob creation failed"));
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `data-flow-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          resolve();
        },
        "image/png",
        1.0,
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
};

export function DataFlowDiagram({
  nodes,
  edges,
  mermaidDiagram,
}: DataFlowDiagramProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const diagram = useMemo(() => {
    if (mermaidDiagram) return mermaidDiagram;
    if (nodes.length > 0) return generateDataFlowDiagram(nodes, edges);
    return null;
  }, [mermaidDiagram, nodes, edges]);

  const [activeTab, setActiveTab] = useState<"visual" | "mermaid">("mermaid");
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [svgData, setSvgData] = useState<{
    optimized: string;
    raw: string;
  } | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  const lastRenderRef = useRef<{ theme: string; code: string } | null>(null);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const groupedNodes = useMemo(() => {
    const groups: Record<string, DataFlowNode[]> = {
      source: [],
      process: [],
      store: [],
      output: [],
    };
    nodes.forEach((node) => {
      if (groups[node.type]) groups[node.type].push(node);
    });
    return groups;
  }, [nodes]);

  const activeTypes = useMemo(
    () => NODE_ORDER.filter((type) => groupedNodes[type]?.length > 0),
    [groupedNodes],
  );

  // Mermaid rendering effect
  useEffect(() => {
    if (!diagram) return;

    // Skip if already rendered with same theme and code
    if (
      lastRenderRef.current?.theme === resolvedTheme &&
      lastRenderRef.current?.code === diagram.code &&
      svgData
    ) {
      return;
    }

    let cancelled = false;
    setIsRendering(true);
    setRenderError(null);

    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: getMermaidThemeVariables(isDark),
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            rankSpacing: 60,
            nodeSpacing: 40,
            padding: 20,
            useMaxWidth: false,
          },
          securityLevel: "loose",
        });

        const id = `mermaid-dataflow-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagram.code);

        if (cancelled) return;

        lastRenderRef.current = {
          theme: resolvedTheme || "light",
          code: diagram.code,
        };
        setSvgData({
          raw: svg,
          optimized: optimizeSvg(svg),
        });
        setRenderError(null);
      } catch (error) {
        console.error("Mermaid render failed:", error);
        if (!cancelled) {
          setSvgData(null);
          setRenderError(
            error instanceof Error ? error.message : "Failed to render diagram",
          );
          // Auto-switch to visual view on error
          setActiveTab("visual");
        }
      } finally {
        if (!cancelled) {
          setIsRendering(false);
        }
      }
    };

    render();

    return () => {
      cancelled = true;
    };
  }, [diagram, resolvedTheme, isDark, svgData]);

  const handleCopy = useCallback(async () => {
    if (!diagram) return;
    await navigator.clipboard.writeText(diagram.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [diagram]);

  const handleDownload = useCallback(async () => {
    if (!svgData?.raw) return;
    setDownloading(true);
    try {
      await downloadAsPng(svgData.raw, isDark);
    } catch (error) {
      console.error("Download failed:", error);
      const blob = new Blob([svgData.raw], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data-flow-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [svgData, isDark]);

  if (nodes.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <Workflow className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              No data flow information available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/60 bg-background">
        <CardHeader className="p-4 border-b border-border/50">
          <div className="flex lg:items-center lg:flex-row flex-col items-start gap-2 justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Workflow className="w-4 h-4 text-primary" />
              Data Flow
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {nodes.length} nodes · {edges.length} edges
              </span>
              {diagram && (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "visual" | "mermaid")}
                >
                  <TabsList className="h-7">
                    <TabsTrigger value="visual" className="text-xs h-6 px-2">
                      Visual
                    </TabsTrigger>
                    <TabsTrigger
                      value="mermaid"
                      className="text-xs h-6 px-2"
                      disabled={!!renderError}
                    >
                      Diagram
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {activeTab === "mermaid" && !renderError ? (
            <MermaidContent
              svgData={svgData}
              isRendering={isRendering}
              diagram={diagram}
              isDark={isDark}
              downloading={downloading}
              copied={copied}
              onDownload={handleDownload}
              onCopy={handleCopy}
              onFullscreen={() => setFullscreen(true)}
            />
          ) : (
            <VisualView
              activeTypes={activeTypes}
              groupedNodes={groupedNodes}
              edges={edges}
              nodeMap={nodeMap}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          className="max-w-6xl max-h-[90vh] p-0"
          showCloseButton={false}
        >
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base font-medium">
                <Workflow className="w-5 h-5 text-primary" />
                Data Flow Diagram
              </DialogTitle>
              <DiagramActions
                size="default"
                downloading={downloading}
                copied={copied}
                canDownload={!!svgData?.raw}
                onDownload={handleDownload}
                onCopy={handleCopy}
              />
            </div>
          </DialogHeader>
          <div
            className={cn(
              "p-6 overflow-auto",
              isDark ? "bg-zinc-950" : "bg-white",
            )}
          >
            <MermaidView
              svgData={svgData}
              isRendering={isRendering}
              isDark={isDark}
              isFullscreen
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Sub-components
interface DiagramActionsProps {
  size?: "sm" | "default";
  downloading: boolean;
  copied: boolean;
  canDownload: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onFullscreen?: () => void;
}

function DiagramActions({
  size = "sm",
  downloading,
  copied,
  canDownload,
  onDownload,
  onCopy,
  onFullscreen,
}: DiagramActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={onDownload}
        disabled={!canDownload || downloading}
        className={cn(size === "sm" && "h-7 text-xs gap-1.5")}
      >
        {downloading ? (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {downloading ? "Saving..." : "PNG"}
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={onCopy}
        className={cn(size === "sm" && "h-7 text-xs gap-1.5")}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Code className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied" : "Code"}
      </Button>
      {onFullscreen && (
        <Button
          variant="outline"
          size={size}
          onClick={onFullscreen}
          className={cn(size === "sm" && "h-7 text-xs gap-1.5")}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

interface MermaidViewProps {
  svgData: { optimized: string; raw: string } | null;
  isRendering: boolean;
  isDark: boolean;
  isFullscreen?: boolean;
}

function MermaidView({
  svgData,
  isRendering,
  isDark,
  isFullscreen = false,
}: MermaidViewProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 overflow-hidden",
        isDark ? "bg-zinc-950" : "bg-white",
      )}
    >
      {svgData?.optimized && !isRendering ? (
        <div
          className={cn(
            "w-full flex items-center justify-center p-4",
            isFullscreen ? "min-h-[40vh]" : "min-h-75 max-h-125",
          )}
          dangerouslySetInnerHTML={{ __html: svgData.optimized }}
        />
      ) : (
        <div
          className={cn(
            "flex items-center justify-center",
            isFullscreen ? "min-h-[40vh]" : "min-h-75",
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">
              Rendering diagram...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface MermaidContentProps {
  svgData: { optimized: string; raw: string } | null;
  isRendering: boolean;
  diagram: MermaidDiagram | null;
  isDark: boolean;
  downloading: boolean;
  copied: boolean;
  onDownload: () => void;
  onCopy: () => void;
  onFullscreen: () => void;
}

function MermaidContent({
  svgData,
  isRendering,
  diagram,
  isDark,
  downloading,
  copied,
  onDownload,
  onCopy,
  onFullscreen,
}: MermaidContentProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <DiagramActions
          downloading={downloading}
          copied={copied}
          canDownload={!!svgData?.raw}
          onDownload={onDownload}
          onCopy={onCopy}
          onFullscreen={onFullscreen}
        />
      </div>
      <MermaidView
        svgData={svgData}
        isRendering={isRendering}
        isDark={isDark}
      />
      {diagram && (
        <details className="group">
          <summary className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            <Code className="w-3.5 h-3.5" />
            <span>View Mermaid Code</span>
          </summary>
          <pre className="mt-2 p-3 rounded-md bg-muted/50 border border-border/50 text-xs font-mono overflow-auto max-h-40">
            {diagram.code}
          </pre>
        </details>
      )}
    </div>
  );
}

interface VisualViewProps {
  activeTypes: readonly ("source" | "process" | "store" | "output")[];
  groupedNodes: Record<string, DataFlowNode[]>;
  edges: DataFlowEdge[];
  nodeMap: Map<string, DataFlowNode>;
}

function VisualView({
  activeTypes,
  groupedNodes,
  edges,
  nodeMap,
}: VisualViewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {activeTypes.map((type, typeIndex) => {
          const config = NODE_CONFIG[type];
          const Icon = config.icon;
          const typeNodes = groupedNodes[type];

          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: typeIndex * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider">
                  {config.label}
                </span>
                <span className="text-[10px] text-muted-foreground/60 ml-auto">
                  {typeNodes.length}
                </span>
              </div>

              <div className="space-y-1.5">
                {typeNodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-2.5 rounded-md border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors"
                  >
                    <h4 className="text-sm font-medium truncate">
                      {node.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {node.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {edges.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border/40">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Connections
            </span>
          </div>

          <div className="grid gap-1.5 grid-cols-1 md:grid-cols-2">
            {edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;

              return (
                <div
                  key={`${edge.from}-${edge.to}`}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors text-xs"
                >
                  <span className="font-medium truncate">{from.name}</span>
                  <ArrowRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                  <span className="font-medium truncate">{to.name}</span>
                  {edge.label && (
                    <span className="ml-auto text-[10px] text-muted-foreground/70 px-1.5 py-0.5 rounded bg-muted/50 truncate max-w-20">
                      {edge.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
