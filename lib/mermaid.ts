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
 * Sanitize text for Mermaid labels - escape/remove problematic characters
 */
function sanitizeLabel(text: string): string {
  if (!text) return "Unknown";

  return (
    text
      // Replace parentheses - these break Mermaid node parsing
      .replace(/\(/g, "[")
      .replace(/\)/g, "]")
      // Replace brackets that might conflict with node syntax
      .replace(/\[/g, "[")
      .replace(/\]/g, "]")
      // Remove or replace other problematic characters
      .replace(/"/g, "'")
      .replace(/</g, "‹")
      .replace(/>/g, "›")
      .replace(/\|/g, "¦")
      .replace(/\{/g, "[")
      .replace(/\}/g, "]")
      // Remove newlines and extra whitespace
      .replace(/\n/g, " ")
      .replace(/\r/g, "")
      .replace(/\s+/g, " ")
      // Trim and limit length
      .trim()
      .slice(0, 40)
  );
}

/**
 * Sanitize node ID - only alphanumeric and underscores allowed
 */
function sanitizeId(id: string): string {
  if (!id)
    return `node_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  return id
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/^[^a-zA-Z]/, "n") // Ensure starts with letter
    .slice(0, 30);
}

/**
 * Get node shape brackets based on component type
 */
function getNodeShape(type: string): { open: string; close: string } {
  const shapes: Record<string, { open: string; close: string }> = {
    frontend: { open: "[", close: "]" },
    backend: { open: "[[", close: "]]" },
    database: { open: "[(", close: ")]" },
    service: { open: "{{", close: "}}" },
    external: { open: "[/", close: "/]" },
    middleware: { open: "[", close: "]" },
  };
  return shapes[type] || shapes.backend;
}

/**
 * Generate architecture diagram from components
 */
export function generateArchitectureDiagram(
  components: ArchitectureComponent[],
): MermaidDiagram {
  if (!components || components.length === 0) {
    return {
      type: "flowchart",
      title: "System Architecture",
      code: "flowchart TD\n    empty[No architecture data available]",
    };
  }

  const lines: string[] = ["flowchart TD"];

  // Track type groups for styling
  const typeGroups: Record<string, string[]> = {};

  // Add nodes with their types
  for (const component of components) {
    const safeId = sanitizeId(component.id);
    const nodeShape = getNodeShape(component.type);
    const label = sanitizeLabel(component.name);
    const tech = component.technologies
      ?.slice(0, 2)
      .map(sanitizeLabel)
      .join(", ");
    const fullLabel = tech ? `${label}<br/><small>${tech}</small>` : label;

    lines.push(
      `    ${safeId}${nodeShape.open}"${fullLabel}"${nodeShape.close}`,
    );

    // Group by type for styling
    if (!typeGroups[component.type]) {
      typeGroups[component.type] = [];
    }
    typeGroups[component.type].push(safeId);
  }

  // Create ID mapping for connections
  const idMap = new Map(components.map((c) => [c.id, sanitizeId(c.id)]));

  // Add connections
  const addedConnections = new Set<string>();
  for (const component of components) {
    const fromId = idMap.get(component.id);
    if (!fromId) continue;

    for (const targetId of component.connections || []) {
      const toId = idMap.get(targetId);
      if (!toId) continue;

      const connectionKey = `${fromId}-${toId}`;
      const reverseKey = `${toId}-${fromId}`;

      if (
        !addedConnections.has(connectionKey) &&
        !addedConnections.has(reverseKey)
      ) {
        lines.push(`    ${fromId} --> ${toId}`);
        addedConnections.add(connectionKey);
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
  for (const [type, ids] of Object.entries(typeGroups)) {
    if (ids.length > 0) {
      lines.push(`    class ${ids.join(",")} ${type}`);
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
  edges: DataFlowEdge[],
): MermaidDiagram {
  if (!nodes || nodes.length === 0) {
    return {
      type: "flowchart",
      title: "Data Flow",
      code: "flowchart LR\n    empty[No data flow available]",
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

  // Track type groups for styling
  const typeGroups: Record<string, string[]> = {};

  // Create ID mapping
  const idMap = new Map<string, string>();

  // Add nodes
  for (const node of nodes) {
    const safeId = sanitizeId(node.id);
    idMap.set(node.id, safeId);

    const style = nodeStyles[node.type] || nodeStyles.process;
    const label = sanitizeLabel(node.name);

    // Use quotes around label to handle special characters
    lines.push(`    ${safeId}${style.open}"${label}"${style.close}`);

    // Group by type for styling
    if (!typeGroups[node.type]) {
      typeGroups[node.type] = [];
    }
    typeGroups[node.type].push(safeId);
  }

  // Add edges with labels
  for (const edge of edges) {
    const fromId = idMap.get(edge.from);
    const toId = idMap.get(edge.to);

    if (!fromId || !toId) continue;

    if (edge.label) {
      const safeLabel = sanitizeLabel(edge.label);
      lines.push(`    ${fromId} -->|"${safeLabel}"| ${toId}`);
    } else {
      lines.push(`    ${fromId} --> ${toId}`);
    }
  }

  // Add styles
  lines.push("");
  lines.push("    classDef source fill:#22c55e,stroke:#16a34a,color:#fff");
  lines.push("    classDef process fill:#3b82f6,stroke:#2563eb,color:#fff");
  lines.push("    classDef store fill:#8b5cf6,stroke:#7c3aed,color:#fff");
  lines.push("    classDef output fill:#f97316,stroke:#ea580c,color:#fff");

  // Apply styles
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
  edges: DataFlowEdge[],
): MermaidDiagram {
  if (!nodes || nodes.length === 0 || !edges || edges.length === 0) {
    return {
      type: "sequenceDiagram",
      title: "Sequence Diagram",
      code: "sequenceDiagram\n    Note over System: No sequence data available",
    };
  }

  const lines: string[] = ["sequenceDiagram"];

  // Create ID mapping and add participants
  const idMap = new Map<string, string>();

  for (const node of nodes) {
    const safeId = sanitizeId(node.id);
    idMap.set(node.id, safeId);

    const safeLabel = sanitizeLabel(node.name);
    lines.push(`    participant ${safeId} as ${safeLabel}`);
  }

  lines.push("");

  // Add interactions
  for (const edge of edges) {
    const fromId = idMap.get(edge.from);
    const toId = idMap.get(edge.to);

    if (!fromId || !toId) continue;

    const label = sanitizeLabel(edge.label || edge.dataType || "data");
    lines.push(`    ${fromId}->>+${toId}: ${label}`);
  }

  return {
    type: "sequenceDiagram",
    title: "Sequence Diagram",
    code: lines.join("\n"),
  };
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
  dataFlow: { nodes: DataFlowNode[]; edges: DataFlowEdge[] } | undefined,
): DiagramsData {
  const result: DiagramsData = {};

  // Try AI-generated diagrams first, but validate them
  if (
    aiDiagrams?.architecture &&
    validateMermaidSyntax(aiDiagrams.architecture.code)
  ) {
    // Try to use AI diagram, but fall back to generated if it has issues
    result.architecture = aiDiagrams.architecture;
  } else if (architecture && architecture.length > 0) {
    result.architecture = generateArchitectureDiagram(architecture);
  }

  if (aiDiagrams?.dataFlow && validateMermaidSyntax(aiDiagrams.dataFlow.code)) {
    result.dataFlow = aiDiagrams.dataFlow;
  } else if (dataFlow?.nodes && dataFlow.nodes.length > 0) {
    result.dataFlow = generateDataFlowDiagram(
      dataFlow.nodes,
      dataFlow.edges || [],
    );
  }

  if (
    aiDiagrams?.components &&
    validateMermaidSyntax(aiDiagrams.components.code)
  ) {
    result.components = aiDiagrams.components;
  } else if (
    dataFlow?.nodes &&
    dataFlow.nodes.length > 0 &&
    dataFlow.edges &&
    dataFlow.edges.length > 0
  ) {
    result.components = generateSequenceDiagram(dataFlow.nodes, dataFlow.edges);
  }

  return result;
}
