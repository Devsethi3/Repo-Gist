import { CodeMetrics } from "./code-analyzer";

export interface GeneratedRefactor {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  category: string;
  files: string[];
}

export function generateRefactors(
  metrics: CodeMetrics,
  _repoName: string,
  _primaryLanguage: string | null,
): GeneratedRefactor[] {
  const refactors: GeneratedRefactor[] = [];
  let id = 1;

  if (metrics.hasTypeScript && !metrics.strictMode) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Enable TypeScript strict mode",
      description: "Better type safety with strict: true",
      impact: "high",
      effort: "medium",
      category: "Type Safety",
      files: ["tsconfig.json"],
    });
  }

  if (!metrics.hasLinting) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add ESLint",
      description: "Enforce code style and catch errors",
      impact: "medium",
      effort: "low",
      category: "Code Quality",
      files: ["eslint.config.js"],
    });
  }

  if (!metrics.hasTests) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add testing",
      description: "Set up Vitest for unit testing",
      impact: "high",
      effort: "medium",
      category: "Testing",
      files: ["vitest.config.ts"],
    });
  }

  if (!metrics.codePatterns.hasErrorHandling) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add error handling",
      description: "Implement try/catch patterns",
      impact: "high",
      effort: "medium",
      category: "Reliability",
      files: ["src/lib/errors.ts"],
    });
  }

  if (!metrics.codePatterns.hasValidation) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add input validation",
      description: "Use Zod for type validation",
      impact: "high",
      effort: "low",
      category: "Security",
      files: ["src/lib/validations.ts"],
    });
  }

  if (metrics.largeFiles.length > 0) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Split large files",
      description: `${metrics.largeFiles.length} file(s) exceed 10KB`,
      impact: "medium",
      effort: "high",
      category: "Maintainability",
      files: metrics.largeFiles.slice(0, 3),
    });
  }

  return refactors.slice(0, 5);
}
