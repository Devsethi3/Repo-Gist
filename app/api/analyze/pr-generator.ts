import { CodeMetrics } from "./code-analyzer";

export interface GeneratedPR {
  id: string;
  title: string;
  description: string;
  body: string;
  branch: string;
  baseBranch: string;
  labels: string[];
  priority: "low" | "medium" | "high";
  category: string;
  estimatedEffort: string;
  files: PRFileChange[];
}

export interface PRFileChange {
  path: string;
  action: "create" | "modify" | "delete";
  content?: string;
  description: string;
}

export function generatePRSuggestions(
  metrics: CodeMetrics,
  repoName: string,
  primaryLanguage: string | null,
  defaultBranch: string = "main",
): GeneratedPR[] {
  const prs: GeneratedPR[] = [];
  let id = 1;

  // Only generate PRs that are actually needed
  if (!metrics.hasCI) {
    prs.push(createCIPR(id++, metrics, defaultBranch));
  }

  if (!metrics.hasLinting || !metrics.hasPrettier) {
    prs.push(createLintingPR(id++, metrics, defaultBranch));
  }

  if (metrics.hasTypeScript && !metrics.strictMode) {
    prs.push(createStrictModePR(id++, defaultBranch));
  }

  if (!metrics.hasTests) {
    prs.push(createTestingPR(id++, metrics.hasTypeScript, defaultBranch));
  }

  if (!metrics.hasEnvExample) {
    prs.push(createEnvExamplePR(id++, repoName, defaultBranch));
  }

  if (!metrics.hasSecurityConfig) {
    prs.push(createDependabotPR(id++, primaryLanguage, defaultBranch));
  }

  // Sort by priority and limit
  return prs
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 };
      return order[a.priority] - order[b.priority];
    })
    .slice(0, 6);
}

function createCIPR(
  id: number,
  metrics: CodeMetrics,
  base: string,
): GeneratedPR {
  const isTS = metrics.hasTypeScript;
  return {
    id: `pr-${id}`,
    title: "ci: Add GitHub Actions CI pipeline",
    description: "Set up continuous integration",
    branch: "feat/add-ci",
    baseBranch: base,
    labels: ["ci", "automation"],
    priority: "high",
    category: "DevOps",
    estimatedEffort: "30 min",
    body: `Add CI workflow with:
- Automated testing on push/PR
${isTS ? "- TypeScript type checking" : ""}
${metrics.hasLinting ? "- ESLint validation" : ""}`,
    files: [
      {
        path: ".github/workflows/ci.yml",
        action: "create",
        description: "CI workflow",
        content: `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      ${metrics.hasLinting ? "- run: npm run lint" : ""}
      ${isTS ? "- run: npx tsc --noEmit" : ""}
      - run: npm run build --if-present`,
      },
    ],
  };
}

function createLintingPR(
  id: number,
  metrics: CodeMetrics,
  base: string,
): GeneratedPR {
  const files: PRFileChange[] = [];
  const missing = [
    !metrics.hasLinting && "ESLint",
    !metrics.hasPrettier && "Prettier",
  ].filter(Boolean);

  if (!metrics.hasLinting) {
    files.push({
      path: "eslint.config.js",
      action: "create",
      description: "ESLint config",
    });
  }
  if (!metrics.hasPrettier) {
    files.push({
      path: ".prettierrc",
      action: "create",
      description: "Prettier config",
    });
  }

  return {
    id: `pr-${id}`,
    title: `chore: Add ${missing.join(" and ")}`,
    description: "Set up code quality tools",
    branch: "chore/add-linting",
    baseBranch: base,
    labels: ["code-quality"],
    priority: "medium",
    category: "Code Quality",
    estimatedEffort: "20 min",
    body: `Add ${missing.join(" and ")} for consistent code style.`,
    files,
  };
}

function createStrictModePR(id: number, base: string): GeneratedPR {
  return {
    id: `pr-${id}`,
    title: "chore: Enable TypeScript strict mode",
    description: "Improve type safety",
    branch: "chore/ts-strict",
    baseBranch: base,
    labels: ["typescript"],
    priority: "medium",
    category: "Type Safety",
    estimatedEffort: "1-3 hours",
    body: `Enable \`"strict": true\` in tsconfig.json.`,
    files: [
      {
        path: "tsconfig.json",
        action: "modify",
        description: "Enable strict mode",
      },
    ],
  };
}

function createTestingPR(id: number, isTS: boolean, base: string): GeneratedPR {
  return {
    id: `pr-${id}`,
    title: "test: Add Vitest testing",
    description: "Set up unit testing",
    branch: "feat/add-testing",
    baseBranch: base,
    labels: ["testing"],
    priority: "high",
    category: "Testing",
    estimatedEffort: "1-2 hours",
    body: `Add Vitest for unit testing with coverage.`,
    files: [
      {
        path: isTS ? "vitest.config.ts" : "vitest.config.js",
        action: "create",
        description: "Vitest config",
      },
      {
        path: "src/__tests__/example.test.ts",
        action: "create",
        description: "Example test",
      },
    ],
  };
}

function createEnvExamplePR(
  id: number,
  repoName: string,
  base: string,
): GeneratedPR {
  return {
    id: `pr-${id}`,
    title: "docs: Add .env.example",
    description: "Document environment variables",
    branch: "docs/env-example",
    baseBranch: base,
    labels: ["documentation"],
    priority: "medium",
    category: "Documentation",
    estimatedEffort: "15 min",
    body: "Document required environment variables.",
    files: [
      { path: ".env.example", action: "create", description: "Env template" },
    ],
  };
}

function createDependabotPR(
  id: number,
  lang: string | null,
  base: string,
): GeneratedPR {
  return {
    id: `pr-${id}`,
    title: "ci: Add Dependabot",
    description: "Automated dependency updates",
    branch: "chore/add-dependabot",
    baseBranch: base,
    labels: ["dependencies", "security"],
    priority: "medium",
    category: "Security",
    estimatedEffort: "10 min",
    body: "Configure Dependabot for weekly updates.",
    files: [
      {
        path: ".github/dependabot.yml",
        action: "create",
        description: "Dependabot config",
      },
    ],
  };
}
