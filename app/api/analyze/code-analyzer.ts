import { FileNode } from "@/lib/types";

export interface CodeMetrics {
  hasTests: boolean;
  testFileCount: number;
  hasCI: boolean;
  ciProvider: string | null;
  hasLinting: boolean;
  hasTypeScript: boolean;
  strictMode: boolean;
  hasPrettier: boolean;
  hasSecurityConfig: boolean;
  hasEnvExample: boolean;
  exposedSecrets: string[];
  hasChangelog: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
  readmeQuality: "missing" | "minimal" | "basic" | "good" | "excellent";
  dependencyCount: number;
  devDependencyCount: number;
  vulnerablePatterns: string[];
  largeFiles: string[];
  codePatterns: {
    hasErrorHandling: boolean;
    hasLogging: boolean;
    hasValidation: boolean;
  };
  missingEssentials: string[];
  existingAutomations: string[];
}

// Pre-compiled patterns
const TEST_PATTERN =
  /\.(test|spec)\.(js|ts|jsx|tsx)$|__tests__|_test\.(go|py)$/;
const CI_PATTERNS: [RegExp, string][] = [
  [/\.github\/workflows/, "GitHub Actions"],
  [/\.gitlab-ci\.yml$/, "GitLab CI"],
  [/Jenkinsfile$/, "Jenkins"],
];
const SECRET_PATTERN =
  /(?:API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['"]?[A-Za-z0-9+/=_-]{8,}/i;
const VULNERABLE_DEPS: [RegExp, string][] = [
  [/"moment"/, "moment.js → date-fns"],
  [/"request"/, "request → axios"],
];

export function analyzeCodeMetrics(
  tree: FileNode[],
  fileContents: Record<string, string>,
): CodeMetrics {
  const paths = flattenPaths(tree);

  // Single-pass path analysis
  let testFileCount = 0;
  let ciProvider: string | null = null;
  let hasSecurityConfig = false;
  let hasEnvExample = false;
  let hasChangelog = false;
  let hasContributing = false;
  let hasLicense = false;
  let hasLinting = false;
  let hasPrettier = false;

  for (const path of paths) {
    if (TEST_PATTERN.test(path)) testFileCount++;

    if (!ciProvider) {
      for (const [pattern, provider] of CI_PATTERNS) {
        if (pattern.test(path)) {
          ciProvider = provider;
          break;
        }
      }
    }

    if (/dependabot\.yml|\.snyk$/.test(path)) hasSecurityConfig = true;
    if (/\.env\.example$/.test(path)) hasEnvExample = true;
    if (/changelog\.md$/i.test(path)) hasChangelog = true;
    if (/contributing\.md$/i.test(path)) hasContributing = true;
    if (/^license/i.test(path)) hasLicense = true;
    if (/\.eslintrc|eslint\.config|biome\.json/.test(path)) hasLinting = true;
    if (/\.prettierrc/.test(path)) hasPrettier = true;
  }

  // Package.json analysis
  const pkg = fileContents["package.json"];
  let deps: Record<string, string> = {};
  let devDeps: Record<string, string> = {};

  if (pkg) {
    try {
      const parsed = JSON.parse(pkg);
      deps = parsed.dependencies || {};
      devDeps = parsed.devDependencies || {};
      if (!hasLinting) hasLinting = !!devDeps["eslint"] || !!devDeps["biome"];
      if (!hasPrettier) hasPrettier = !!devDeps["prettier"];
    } catch {}
  }

  // TypeScript check
  const tsConfig = fileContents["tsconfig.json"];
  const hasTypeScript = paths.some((p) => /\.tsx?$/.test(p));
  let strictMode = false;
  if (tsConfig) {
    try {
      strictMode = JSON.parse(tsConfig)?.compilerOptions?.strict === true;
    } catch {}
  }

  // README quality
  const readme = fileContents["README.md"] || fileContents["readme.md"] || "";
  const readmeQuality = assessReadme(readme);

  // Quick content analysis
  const exposedSecrets: string[] = [];
  const largeFiles: string[] = [];
  let hasErrorHandling = false;
  let hasLogging = false;
  let hasValidation = false;

  for (const [file, content] of Object.entries(fileContents)) {
    if (content.length > 10000) largeFiles.push(file);
    if (!file.endsWith(".example") && SECRET_PATTERN.test(content)) {
      exposedSecrets.push(file);
    }
    if (!hasErrorHandling && /try\s*\{|\.catch\(/.test(content))
      hasErrorHandling = true;
    if (!hasLogging && /console\.|logger\.|winston|pino/.test(content))
      hasLogging = true;
    if (!hasValidation && /zod|yup|joi|validator/.test(content))
      hasValidation = true;
  }

  // Vulnerable deps
  const vulnerablePatterns: string[] = [];
  if (pkg) {
    for (const [pattern, msg] of VULNERABLE_DEPS) {
      if (pattern.test(pkg)) vulnerablePatterns.push(msg);
    }
  }

  // Missing essentials
  const missingEssentials: string[] = [];
  if (!paths.some((p) => /readme\.md$/i.test(p)))
    missingEssentials.push("README.md");
  if (!hasLicense) missingEssentials.push("LICENSE");
  if (!hasEnvExample && paths.some((p) => /\.env$/.test(p)))
    missingEssentials.push(".env.example");

  // Existing automations
  const existingAutomations: string[] = [];
  if (ciProvider) existingAutomations.push(ciProvider);
  if (hasSecurityConfig) existingAutomations.push("Dependabot");
  if (paths.some((p) => /\.husky\//.test(p))) existingAutomations.push("Husky");

  return {
    hasTests: testFileCount > 0,
    testFileCount,
    hasCI: !!ciProvider,
    ciProvider,
    hasLinting,
    hasTypeScript,
    strictMode,
    hasPrettier,
    hasSecurityConfig,
    hasEnvExample,
    exposedSecrets,
    hasChangelog,
    hasContributing,
    hasLicense,
    readmeQuality,
    dependencyCount: Object.keys(deps).length,
    devDependencyCount: Object.keys(devDeps).length,
    vulnerablePatterns,
    largeFiles,
    codePatterns: { hasErrorHandling, hasLogging, hasValidation },
    missingEssentials,
    existingAutomations,
  };
}

function flattenPaths(tree: FileNode[]): string[] {
  const paths: string[] = [];
  const stack = [...tree];
  while (stack.length) {
    const node = stack.pop()!;
    paths.push(node.path);
    if (node.children) stack.push(...node.children);
  }
  return paths;
}

function assessReadme(
  readme: string,
): "missing" | "minimal" | "basic" | "good" | "excellent" {
  if (readme.length < 100) return "missing";
  if (readme.length < 300) return "minimal";
  let score = 0;
  if (/install|setup/i.test(readme)) score++;
  if (/usage|example/i.test(readme)) score++;
  if (/```/.test(readme)) score++;
  if (score >= 3) return "excellent";
  if (score >= 2) return "good";
  return "basic";
}

export function calculateScores(metrics: CodeMetrics) {
  const breakdown: Record<string, { score: number; factors: string[] }> = {};

  // Code Quality (simplified)
  let cq = 50;
  const cqf: string[] = [];
  if (metrics.hasTypeScript) {
    cq += 20;
    cqf.push("+20: TypeScript");
  }
  if (metrics.strictMode) {
    cq += 10;
    cqf.push("+10: Strict");
  }
  if (metrics.hasLinting) {
    cq += 10;
    cqf.push("+10: Linting");
  }
  if (metrics.hasPrettier) {
    cq += 5;
    cqf.push("+5: Prettier");
  }
  if (metrics.codePatterns.hasErrorHandling) {
    cq += 5;
    cqf.push("+5: Error handling");
  }
  breakdown.codeQuality = { score: Math.min(100, cq), factors: cqf };

  // Documentation
  let doc = 30;
  const docf: string[] = [];
  const rmScore = {
    missing: 0,
    minimal: 10,
    basic: 25,
    good: 40,
    excellent: 50,
  };
  doc += rmScore[metrics.readmeQuality];
  docf.push(`README: ${metrics.readmeQuality}`);
  if (metrics.hasChangelog) {
    doc += 10;
    docf.push("+10: CHANGELOG");
  }
  if (!metrics.hasLicense) {
    doc -= 15;
    docf.push("-15: No LICENSE");
  }
  breakdown.documentation = {
    score: Math.max(0, Math.min(100, doc)),
    factors: docf,
  };

  // Security
  let sec = 70;
  const secf: string[] = [];
  if (metrics.hasSecurityConfig) {
    sec += 15;
    secf.push("+15: Security config");
  }
  if (metrics.exposedSecrets.length > 0) {
    sec -= 30;
    secf.push("-30: Secrets exposed");
  }
  if (metrics.vulnerablePatterns.length > 0) {
    sec -= 15;
    secf.push("-15: Deprecated deps");
  }
  breakdown.security = {
    score: Math.max(0, Math.min(100, sec)),
    factors: secf,
  };

  // Maintainability
  let maint = 50;
  const mf: string[] = [];
  if (metrics.hasCI) {
    maint += 25;
    mf.push(`+25: ${metrics.ciProvider}`);
  }
  if (metrics.hasTypeScript) {
    maint += 15;
    mf.push("+15: Types");
  }
  if (metrics.hasLinting) {
    maint += 10;
    mf.push("+10: Linting");
  }
  breakdown.maintainability = { score: Math.min(100, maint), factors: mf };

  // Test Coverage
  let test = 20;
  const tf: string[] = [];
  if (metrics.hasTests) {
    test += 50;
    tf.push("+50: Tests exist");
  }
  if (metrics.hasCI) {
    test += 10;
    tf.push("+10: CI");
  }
  breakdown.testCoverage = { score: Math.min(100, test), factors: tf };

  // Dependencies
  let dep = 80;
  const df: string[] = [];
  if (metrics.vulnerablePatterns.length > 0) {
    dep -= 20;
    df.push("-20: Deprecated");
  }
  if (metrics.dependencyCount > 50) {
    dep -= 10;
    df.push("-10: Heavy");
  }
  breakdown.dependencies = { score: Math.max(0, dep), factors: df };

  const overall = Math.round(
    breakdown.codeQuality.score * 0.2 +
      breakdown.documentation.score * 0.15 +
      breakdown.security.score * 0.2 +
      breakdown.maintainability.score * 0.2 +
      breakdown.testCoverage.score * 0.15 +
      breakdown.dependencies.score * 0.1,
  );

  return {
    overall,
    codeQuality: breakdown.codeQuality.score,
    documentation: breakdown.documentation.score,
    security: breakdown.security.score,
    maintainability: breakdown.maintainability.score,
    testCoverage: breakdown.testCoverage.score,
    dependencies: breakdown.dependencies.score,
    breakdown,
  };
}
