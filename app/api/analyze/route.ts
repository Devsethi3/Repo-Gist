import { streamText } from "ai";
import {
  fetchRepoMetadata,
  fetchRepoTree,
  fetchImportantFiles,
  fetchRepoBranches,
  calculateFileStats,
  createCompactTreeString,
} from "@/lib/github";
import {
  getOpenRouterClient,
  isConfigured,
  hasGitHubToken,
  MODEL_ID,
  AI_CONFIG,
} from "./config";
import { checkRateLimit, getClientIP } from "./rate-limit";
import { parseRequestBody, validateAndParseUrl } from "./validators";
import { buildPrompt, prepareFilesContent } from "./prompt-builder";
import { createAnalysisStream, getStreamHeaders } from "./stream-handler";
import { analyzeCodeMetrics, calculateScores } from "./code-analyzer";
import { generateAutomations } from "./automation-generator";
import { generateRefactors } from "./refactor-generator";
import { HealthCheckResponse, ErrorResponse } from "./types";

const MAX_BODY_SIZE = 10 * 1024;

export async function POST(request: Request) {
  if (!isConfigured()) {
    return Response.json(
      { error: "Server is not properly configured." } satisfies ErrorResponse,
      { status: 503 },
    );
  }

  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many requests. Please try again later.",
      } satisfies ErrorResponse,
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return Response.json(
        { error: "Request body too large" } satisfies ErrorResponse,
        { status: 413 },
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return Response.json(
        { error: "Request body too large" } satisfies ErrorResponse,
        { status: 413 },
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    const parsedBody = parseRequestBody(body);
    const { owner, repo } = validateAndParseUrl(parsedBody.url);
    const openrouter = getOpenRouterClient();
    const model = openrouter.chat(MODEL_ID);

    const metadata = await fetchRepoMetadata(owner, repo);
    const targetBranch = parsedBody.branch || metadata.defaultBranch;

    // Parallel fetch
    const [tree, importantFiles, branches] = await Promise.all([
      fetchRepoTree(owner, repo, targetBranch),
      fetchImportantFiles(owner, repo, targetBranch),
      fetchRepoBranches(owner, repo, metadata.defaultBranch),
    ]);

    // Fast metrics computation
    const codeMetrics = analyzeCodeMetrics(tree, importantFiles);
    const calculatedScores = calculateScores(codeMetrics);

    // Generate only essential suggestions (no PR generation)
    const generatedAutomations = generateAutomations(
      codeMetrics,
      metadata.name,
      metadata.language,
    );
    const generatedRefactors = generateRefactors(
      codeMetrics,
      metadata.name,
      metadata.language,
    );

    const fileStats = calculateFileStats(tree);
    const compactTree = createCompactTreeString(tree, 40); // Reduced from 50
    const filesContent = prepareFilesContent(importantFiles, 6, 2500); // Reduced limits

    const prompt = buildPrompt(
      { metadata, fileStats, compactTree, filesContent, branch: targetBranch },
      codeMetrics,
      calculatedScores,
    );

    const result = await streamText({
      model,
      prompt,
      temperature: 0.4, // Lower for faster, more consistent output
      maxOutputTokens: 3000, // Reduced from 4000
    });

    const stream = createAnalysisStream(
      metadata,
      tree,
      fileStats,
      targetBranch,
      branches,
      result.textStream,
      {
        scores: calculatedScores,
        automations: generatedAutomations,
        refactors: generatedRefactors,
        metrics: codeMetrics,
      },
    );

    return new Response(stream, {
      headers: getStreamHeaders(rateLimit.remaining),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const isOperational =
      error instanceof Error &&
      (error.message.includes("not found") ||
        error.message.includes("rate limit") ||
        error.message.includes("Invalid"));

    const message =
      isOperational && error instanceof Error
        ? error.message
        : "Analysis failed. Please try again.";

    return Response.json({ error: message } satisfies ErrorResponse, {
      status: 500,
    });
  }
}

export async function GET() {
  const response: HealthCheckResponse = {
    status: isConfigured() ? "ok" : "misconfigured",
    timestamp: new Date().toISOString(),
    services: {
      openrouter: isConfigured() ? "configured" : "missing",
      github: hasGitHubToken() ? "configured" : "optional",
    },
  };
  return Response.json(response);
}
