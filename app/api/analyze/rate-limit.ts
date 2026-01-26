import { RateLimitRecord, RateLimitResult } from "./types";
import { RATE_LIMIT } from "./config";

const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup interval - runs every minute
let cleanupInterval: NodeJS.Timeout | null = null;

function ensureCleanupRunning() {
  if (!cleanupInterval) {
    cleanupInterval = setInterval(cleanupExpiredRecords, 60 * 1000);
    // Don't prevent process exit
    if (cleanupInterval.unref) {
      cleanupInterval.unref();
    }
  }
}

export function checkRateLimit(ip: string): RateLimitResult {
  ensureCleanupRunning();

  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT.MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - record.count };
}

export function getClientIP(request: Request): string {
  // Prefer trusted proxy headers (Cloudflare, Vercel)
  const cfIP = request.headers.get("cf-connecting-ip");
  if (cfIP) return cfIP;

  const vercelIP = request.headers.get("x-vercel-forwarded-for");
  if (vercelIP) return vercelIP.split(",")[0].trim();

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIP = request.headers.get("x-real-ip");
  if (realIP) return realIP;

  return "unknown";
}

export function cleanupExpiredRecords(): void {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}
