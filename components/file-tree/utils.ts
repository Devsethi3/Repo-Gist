import { FileNode } from "@/lib/types";

export function calculateTotalSize(nodes: FileNode[]): number {
  return nodes.reduce((acc, node) => {
    if (node.type === "directory" && node.children) {
      return acc + calculateTotalSize(node.children);
    }
    return acc + (node.size || 0);
  }, 0);
}

export function nodeMatchesSearch(
  node: FileNode,
  searchQuery: string
): boolean {
  if (!searchQuery) return true;

  const query = searchQuery.toLowerCase();

  if (node.name.toLowerCase().includes(query)) {
    return true;
  }

  if (node.children) {
    return node.children.some((child) => nodeMatchesSearch(child, query));
  }

  return false;
}

export function nameMatchesSearch(name: string, searchQuery: string): boolean {
  if (!searchQuery) return false;
  return name.toLowerCase().includes(searchQuery.toLowerCase());
}

export function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

export function sortFileNodes(nodes: FileNode[]): FileNode[] {
  return [...nodes].sort((a, b) => {
    // Directories come first
    if (a.type === "directory" && b.type !== "directory") return -1;
    if (a.type !== "directory" && b.type === "directory") return 1;
    // Then sort alphabetically
    return a.name.localeCompare(b.name);
  });
}
