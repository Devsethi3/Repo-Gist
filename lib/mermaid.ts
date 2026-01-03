// lib/mermaid.ts

import { ArchitectureComponent, DataFlowNode, DataFlowEdge } from "./types";

export interface MermaidDiagram {
  type: "flowchart" | "sequenceDiagram" | "classDiagram" | "graph";
  title: string;
  code: string;
}

export interface DiagramsData {
  architecture?: MermaidDiagram;
  dataFlow?: MermaidDiagram;
  components?: MermaidDiagram;
}

/**
 * Generate architecture diagram from components
 */
export function generateArchitectureDiagram(
  components: ArchitectureComponent[]
): MermaidDiagram {
  if (!components || components.length === 0) {
    return {
      type: "flowchart",
      title: "System Architecture",
      code: "flowchart TD\n    A[No architecture data available]",
    };
  }

  const lines: string[] = ["flowchart TD"];

  // Define subgraphs by type
  const typeGroups: Record<string, ArchitectureComponent[]> = {};

  for (const component of components) {
    if (!typeGroups[component.type]) {
      typeGroups[component.type] = [];
    }
    typeGroups[component.type].push(component);
  }

  // Define node styles based on type
  // const typeStyles: Record<string, string> = {
  //   frontend: ":::frontend",
  //   backend: ":::backend",
  //   database: ":::database",
  //   service: ":::service",
  //   external: ":::external",
  //   middleware: ":::middleware",
  // };

  // Add nodes with their types
  for (const component of components) {
    const nodeShape = getNodeShape(component.type);
    const label = escapeLabel(component.name);
    const tech = component.technologies.slice(0, 2).join(", ");
    const fullLabel = tech ? `${label}<br/><small>${tech}</small>` : label;

    lines.push(
      `    ${component.id}${nodeShape.open}${fullLabel}${nodeShape.close}`
    );
  }

  // Add connections
  const addedConnections = new Set<string>();
  for (const component of components) {
    for (const targetId of component.connections) {
      const connectionKey = `${component.id}-${targetId}`;
      const reverseKey = `${targetId}-${component.id}`;

      if (
        !addedConnections.has(connectionKey) &&
        !addedConnections.has(reverseKey)
      ) {
        const target = components.find((c) => c.id === targetId);
        if (target) {
          lines.push(`    ${component.id} --> ${targetId}`);
          addedConnections.add(connectionKey);
        }
      }
    }
  }

  // Add styles
  lines.push("");
  lines.push("    classDef frontend fill:#3b82f6,stroke:#1d4ed8,color:#fff");
  lines.push("    classDef backend fill:#10b981,stroke:#059669,color:#fff");
  lines.push("    classDef database fill:#8b5cf6,stroke:#6d28d9,color:#fff");
  lines.push("    classDef service fill:#f59e0b,stroke:#d97706,color:#fff");
  lines.push("    classDef external fill:#6b7280,stroke:#4b5563,color:#fff");
  lines.push("    classDef middleware fill:#ec4899,stroke:#db2777,color:#fff");

  // Apply styles to nodes
  for (const [type, comps] of Object.entries(typeGroups)) {
    if (comps.length > 0) {
      const ids = comps.map((c) => c.id).join(",");
      lines.push(`    class ${ids} ${type}`);
    }
  }

  return {
    type: "flowchart",
    title: "System Architecture",
    code: lines.join("\n"),
  };
}

/**
 * Generate data flow diagram
 */
export function generateDataFlowDiagram(
  nodes: DataFlowNode[],
  edges: DataFlowEdge[]
): MermaidDiagram {
  if (!nodes || nodes.length === 0) {
    return {
      type: "flowchart",
      title: "Data Flow",
      code: "flowchart LR\n    A[No data flow available]",
    };
  }

  const lines: string[] = ["flowchart LR"];

  // Define node styles based on type
  const nodeStyles: Record<string, { open: string; close: string }> = {
    source: { open: "([", close: "])" },
    process: { open: "[", close: "]" },
    store: { open: "[(", close: ")]" },
    output: { open: "[[", close: "]]" },
  };

  // Add nodes
  for (const node of nodes) {
    const style = nodeStyles[node.type] || nodeStyles.process;
    const label = escapeLabel(node.name);
    lines.push(`    ${node.id}${style.open}${label}${style.close}`);
  }

  // Add edges with labels
  for (const edge of edges) {
    const label = edge.label ? `|${escapeLabel(edge.label)}|` : "";
    lines.push(`    ${edge.from} -->${label} ${edge.to}`);
  }

  // Add styles
  lines.push("");
  lines.push("    classDef source fill:#22c55e,stroke:#16a34a,color:#fff");
  lines.push("    classDef process fill:#3b82f6,stroke:#2563eb,color:#fff");
  lines.push("    classDef store fill:#8b5cf6,stroke:#7c3aed,color:#fff");
  lines.push("    classDef output fill:#f97316,stroke:#ea580c,color:#fff");

  // Apply styles
  const typeGroups: Record<string, string[]> = {};
  for (const node of nodes) {
    if (!typeGroups[node.type]) {
      typeGroups[node.type] = [];
    }
    typeGroups[node.type].push(node.id);
  }

  for (const [type, ids] of Object.entries(typeGroups)) {
    if (ids.length > 0) {
      lines.push(`    class ${ids.join(",")} ${type}`);
    }
  }

  return {
    type: "flowchart",
    title: "Data Flow",
    code: lines.join("\n"),
  };
}

/**
 * Generate a sequence diagram from data flow
 */
export function generateSequenceDiagram(
  nodes: DataFlowNode[],
  edges: DataFlowEdge[]
): MermaidDiagram {
  if (!nodes || nodes.length === 0 || !edges || edges.length === 0) {
    return {
      type: "sequenceDiagram",
      title: "Sequence Diagram",
      code: "sequenceDiagram\n    Note over System: No sequence data available",
    };
  }

  const lines: string[] = ["sequenceDiagram"];

  // Add participants
  for (const node of nodes) {
    const alias = node.id.replace(/[^a-zA-Z0-9]/g, "");
    lines.push(`    participant ${alias} as ${escapeLabel(node.name)}`);
  }

  lines.push("");

  // Add interactions
  for (const edge of edges) {
    const fromAlias = edge.from.replace(/[^a-zA-Z0-9]/g, "");
    const toAlias = edge.to.replace(/[^a-zA-Z0-9]/g, "");
    const label = edge.label || edge.dataType || "data";
    lines.push(`    ${fromAlias}->>+${toAlias}: ${escapeLabel(label)}`);
  }

  return {
    type: "sequenceDiagram",
    title: "Sequence Diagram",
    code: lines.join("\n"),
  };
}

// Helper functions
function getNodeShape(type: string): { open: string; close: string } {
  const shapes: Record<string, { open: string; close: string }> = {
    frontend: { open: "[", close: "]" },
    backend: { open: "[[", close: "]]" },
    database: { open: "[(", close: ")]" },
    service: { open: "{{", close: "}}" },
    external: { open: ">", close: "]" },
    middleware: { open: "(", close: ")" },
  };
  return shapes[type] || shapes.backend;
}

function escapeLabel(text: string): string {
  return text
    .replace(/"/g, "'")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/[<>]/g, "")
    .slice(0, 50);
}

/**
 * Validate Mermaid diagram syntax
 */
export function validateMermaidSyntax(code: string): boolean {
  if (!code || typeof code !== "string") return false;

  const validStarts = [
    "flowchart",
    "graph",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "erDiagram",
    "gantt",
    "pie",
    "mindmap",
  ];

  const trimmed = code.trim().toLowerCase();
  return validStarts.some((start) => trimmed.startsWith(start));
}

/**
 * Parse AI-generated diagrams or generate from data
 */
export function processDiagrams(
  aiDiagrams: DiagramsData | undefined,
  architecture: ArchitectureComponent[] | undefined,
  dataFlow: { nodes: DataFlowNode[]; edges: DataFlowEdge[] } | undefined
): DiagramsData {
  const result: DiagramsData = {};

  // Try AI-generated diagrams first
  if (
    aiDiagrams?.architecture &&
    validateMermaidSyntax(aiDiagrams.architecture.code)
  ) {
    result.architecture = aiDiagrams.architecture;
  } else if (architecture && architecture.length > 0) {
    result.architecture = generateArchitectureDiagram(architecture);
  }

  if (aiDiagrams?.dataFlow && validateMermaidSyntax(aiDiagrams.dataFlow.code)) {
    result.dataFlow = aiDiagrams.dataFlow;
  } else if (dataFlow?.nodes && dataFlow.nodes.length > 0) {
    result.dataFlow = generateDataFlowDiagram(dataFlow.nodes, dataFlow.edges);
  }

  if (
    aiDiagrams?.components &&
    validateMermaidSyntax(aiDiagrams.components.code)
  ) {
    result.components = aiDiagrams.components;
  } else if (dataFlow?.nodes && dataFlow.nodes.length > 0) {
    result.components = generateSequenceDiagram(dataFlow.nodes, dataFlow.edges);
  }

  return result;
}
