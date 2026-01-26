import { PromptContext } from "./types";
import { CodeMetrics } from "./code-analyzer";

export function buildPrompt(
  context: PromptContext,
  metrics: CodeMetrics,
  calculatedScores: {
    overall: number;
    codeQuality: number;
    documentation: number;
    security: number;
    maintainability: number;
    testCoverage: number;
    dependencies: number;
    breakdown: Record<string, { score: number; factors: string[] }>;
  },
): string {
  const { metadata, fileStats, compactTree, filesContent, branch } = context;

  const languagesInfo = formatLanguagesInfo(fileStats.languages);
  const metricsContext = formatMetricsContext(metrics);

  return `# GitHub Repository Analysis: ${metadata.fullName}
## Branch: ${branch}

## Repository Overview
| Property | Value |
|----------|-------|
| **Name** | ${metadata.name} |
| **Owner** | ${metadata.owner.login} |
| **Branch** | ${branch} |
| **Description** | ${metadata.description || "No description"} |
| **Primary Language** | ${metadata.language || "Not specified"} |
| **Stars** | ${metadata.stars.toLocaleString()} |
| **Forks** | ${metadata.forks.toLocaleString()} |
| **Open Issues** | ${metadata.openIssues.toLocaleString()} |
| **Total Files** | ${fileStats.totalFiles.toLocaleString()} |
| **Languages** | ${languagesInfo} |

## Code Metrics
${metricsContext}

## Pre-Calculated Scores (USE THESE EXACT VALUES)
\`\`\`json
{
  "overall": ${calculatedScores.overall},
  "codeQuality": ${calculatedScores.codeQuality},
  "documentation": ${calculatedScores.documentation},
  "security": ${calculatedScores.security},
  "maintainability": ${calculatedScores.maintainability},
  "testCoverage": ${calculatedScores.testCoverage},
  "dependencies": ${calculatedScores.dependencies}
}
\`\`\`

## Directory Structure
\`\`\`
${compactTree}
\`\`\`

## Key Source Files
${filesContent}

---

## Your Task
Analyze this repository. Scores, refactors, and automations are pre-generated. Focus on:

1. **Summary** - 2-3 sentence technical overview
2. **What It Does** - Plain English explanation
3. **Target Audience** - Who benefits from this project
4. **Tech Stack** - All detected technologies
5. **How To Run** - Setup commands based on detected package manager
6. **Key Folders** - Purpose of 4-6 main directories
7. **Insights** - 4-6 actionable insights (strengths, weaknesses, suggestions)
8. **Architecture** - System component mapping
9. **Data Flow** - How data moves through the system
10. **Diagrams** - Mermaid.js diagrams

## Response Format
Return ONLY valid JSON:

\`\`\`json
{
  "summary": "2-3 sentence technical summary",
  "whatItDoes": "Plain English explanation",
  "targetAudience": "Who benefits from this project",
  "techStack": ["Tech1", "Tech2", "Framework1"],
  "howToRun": [
    "git clone https://github.com/${metadata.fullName}.git",
    "cd ${metadata.name}",
    "npm install",
    "npm run dev"
  ],
  "keyFolders": [
    { "name": "src/", "description": "Main source code" }
  ],
  "insights": [
    {
      "type": "strength",
      "category": "Architecture",
      "title": "Well-organized structure",
      "description": "Clear separation of concerns.",
      "priority": "medium",
      "affectedFiles": ["src/"]
    }
  ],
  "architecture": [
    {
      "id": "arch-1",
      "name": "Frontend",
      "type": "frontend",
      "description": "User interface",
      "technologies": ["React", "TypeScript"],
      "connections": ["arch-2"]
    }
  ],
  "dataFlow": {
    "nodes": [
      { "id": "df-1", "name": "User Input", "type": "source", "description": "User interactions" }
    ],
    "edges": [
      { "from": "df-1", "to": "df-2", "label": "Request", "dataType": "JSON" }
    ]
  },
  "diagrams": {
    "architecture": {
      "type": "flowchart",
      "title": "System Architecture",
      "code": "flowchart TD\\n    A[Client] --> B[Server]"
    },
    "dataFlow": {
      "type": "sequenceDiagram",
      "title": "Request Flow",
      "code": "sequenceDiagram\\n    U->>S: Request\\n    S-->>U: Response"
    }
  }
}
\`\`\`

## Requirements
1. Return ONLY valid JSON - no markdown outside JSON
2. Do NOT include "scores", "refactors", or "automations"
3. Reference SPECIFIC files from the directory structure
4. Mermaid code must use \\\\n for newlines
5. "type" in insights: "strength", "weakness", "suggestion", "warning"
6. "priority": "low", "medium", "high", "critical"
7. "type" in architecture: "frontend", "backend", "database", "service", "external", "middleware"
8. "type" in dataFlow nodes: "source", "process", "store", "output"`;
}

function formatMetricsContext(metrics: CodeMetrics): string {
  const lines: string[] = [];

  // Testing
  lines.push("### Testing");
  lines.push(
    `- Has Tests: ${metrics.hasTests ? `Yes (${metrics.testFileCount} files)` : "No"}`,
  );

  // CI/CD
  lines.push("\n### CI/CD");
  lines.push(
    `- Has CI: ${metrics.hasCI ? `Yes (${metrics.ciProvider})` : "No"}`,
  );

  // Code Quality
  lines.push("\n### Code Quality");
  lines.push(
    `- TypeScript: ${metrics.hasTypeScript ? (metrics.strictMode ? "Yes (strict)" : "Yes") : "No"}`,
  );
  lines.push(`- Linting: ${metrics.hasLinting ? "Yes" : "No"}`);
  lines.push(`- Prettier: ${metrics.hasPrettier ? "Yes" : "No"}`);

  // Security
  lines.push("\n### Security");
  lines.push(`- Security Config: ${metrics.hasSecurityConfig ? "Yes" : "No"}`);
  lines.push(`- .env.example: ${metrics.hasEnvExample ? "Yes" : "No"}`);
  if (metrics.exposedSecrets?.length > 0) {
    lines.push(
      `- ⚠️ Potential Secrets: ${metrics.exposedSecrets.length} detected`,
    );
  }
  if (metrics.vulnerablePatterns?.length > 0) {
    lines.push(
      `- ⚠️ Deprecated Deps: ${metrics.vulnerablePatterns.join(", ")}`,
    );
  }

  // Documentation
  lines.push("\n### Documentation");
  lines.push(`- README: ${metrics.readmeQuality}`);
  lines.push(`- CHANGELOG: ${metrics.hasChangelog ? "Yes" : "No"}`);
  lines.push(`- CONTRIBUTING: ${metrics.hasContributing ? "Yes" : "No"}`);
  lines.push(`- LICENSE: ${metrics.hasLicense ? "Yes" : "No"}`);

  // Dependencies
  lines.push("\n### Dependencies");
  lines.push(
    `- Count: ${metrics.dependencyCount} production, ${metrics.devDependencyCount} dev`,
  );

  // Issues
  if (metrics.largeFiles?.length > 0) {
    lines.push("\n### Issues");
    lines.push(`- Large Files: ${metrics.largeFiles.slice(0, 3).join(", ")}`);
  }
  if (metrics.missingEssentials?.length > 0) {
    lines.push(`- Missing: ${metrics.missingEssentials.join(", ")}`);
  }

  // Automations
  if (metrics.existingAutomations?.length > 0) {
    lines.push("\n### Existing Automations");
    lines.push(metrics.existingAutomations.join(", "));
  }

  return lines.join("\n");
}

function formatLanguagesInfo(languages: Record<string, number>): string {
  const entries = Object.entries(languages).slice(0, 5);
  if (entries.length === 0) return "Unknown";
  return entries.map(([lang, count]) => `${lang} (${count})`).join(", ");
}

export function prepareFilesContent(
  importantFiles: Record<string, string>,
  maxFiles: number = 6,
  maxContentLength: number = 2500,
): string {
  return Object.entries(importantFiles)
    .slice(0, maxFiles)
    .map(
      ([file, content]) =>
        `### ${file}\n\`\`\`\n${content.slice(0, maxContentLength)}\n\`\`\``,
    )
    .join("\n\n");
}
