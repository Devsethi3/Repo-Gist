import { CodeMetrics } from "./code-analyzer";

export interface GeneratedAutomation {
  id: string;
  type: "issue" | "workflow";
  title: string;
  description: string;
  body: string;
  labels: string[];
  priority: "low" | "medium" | "high";
  category: string;
  estimatedEffort: string;
  files?: string[];
}

export function generateAutomations(
  metrics: CodeMetrics,
  _repoName: string,
  _primaryLanguage: string | null,
): GeneratedAutomation[] {
  const automations: GeneratedAutomation[] = [];
  let id = 1;

  if (!metrics.hasCI) {
    automations.push({
      id: `auto-${id++}`,
      type: "workflow",
      title: "Add CI/CD Pipeline",
      description: "Set up automated testing on push/PR",
      body: "Add GitHub Actions workflow for CI",
      labels: ["ci", "automation"],
      priority: "high",
      category: "DevOps",
      estimatedEffort: "30 min",
      files: [".github/workflows/ci.yml"],
    });
  }

  if (metrics.exposedSecrets.length > 0) {
    automations.push({
      id: `auto-${id++}`,
      type: "issue",
      title: "Remove Exposed Secrets",
      description: `${metrics.exposedSecrets.length} potential secret(s) detected`,
      body: `Files: ${metrics.exposedSecrets.join(", ")}`,
      labels: ["security", "critical"],
      priority: "high",
      category: "Security",
      estimatedEffort: "1 hour",
    });
  }

  if (!metrics.hasSecurityConfig) {
    automations.push({
      id: `auto-${id++}`,
      type: "workflow",
      title: "Add Dependabot",
      description: "Automated dependency updates",
      body: "Configure Dependabot for security updates",
      labels: ["security"],
      priority: "medium",
      category: "Security",
      estimatedEffort: "15 min",
      files: [".github/dependabot.yml"],
    });
  }

  if (!metrics.hasTests) {
    automations.push({
      id: `auto-${id++}`,
      type: "issue",
      title: "Add Tests",
      description: "Set up testing framework",
      body: "Add Vitest or Jest for unit testing",
      labels: ["testing"],
      priority: "high",
      category: "Testing",
      estimatedEffort: "2 hours",
    });
  }

  if (!metrics.hasEnvExample) {
    automations.push({
      id: `auto-${id++}`,
      type: "issue",
      title: "Add .env.example",
      description: "Document environment variables",
      body: "Create .env.example file",
      labels: ["documentation"],
      priority: "medium",
      category: "Documentation",
      estimatedEffort: "15 min",
    });
  }

  return automations.slice(0, 5);
}
